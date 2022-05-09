/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { IUiSettingsClient } from '@kbn/core/public';
import { partition } from 'lodash';
import {
  AggFunctionsMapping,
  EsaggsExpressionFunctionDefinition,
  IndexPatternLoadExpressionFunctionDefinition,
  METRIC_TYPES,
} from '@kbn/data-plugin/public';
import { AggExpressionFunctionArgs, queryToAst } from '@kbn/data-plugin/common';
import {
  buildExpression,
  buildExpressionFunction,
  ExpressionAstExpression,
  ExpressionAstExpressionBuilder,
  ExpressionAstFunction,
} from '@kbn/expressions-plugin/public';
import { GenericIndexPatternColumn } from './indexpattern';
import { operationDefinitionMap } from './operations';
import { IndexPattern, IndexPatternPrivateState, IndexPatternLayer } from './types';
import { DateHistogramIndexPatternColumn, RangeIndexPatternColumn } from './operations/definitions';
import { FormattedIndexPatternColumn } from './operations/definitions/column_types';
import { isColumnFormatted, isColumnOfType } from './operations/definitions/helpers';

type OriginalColumn = { id: string } & GenericIndexPatternColumn;

declare global {
  interface Window {
    /**
     * Debug setting to make requests complete slower than normal. data.search.aggs.shardDelay.enabled has to be set via settings for this to work
     */
    ELASTIC_LENS_DELAY_SECONDS?: number;
  }
}

function getExpressionForLayer(
  layer: IndexPatternLayer,
  indexPattern: IndexPattern,
  uiSettings: IUiSettingsClient
): ExpressionAstExpression | null {
  const { columnOrder } = layer;
  if (columnOrder.length === 0 || !indexPattern) {
    return null;
  }

  const columns = { ...layer.columns };
  Object.keys(columns).forEach((columnId) => {
    const column = columns[columnId];
    const rootDef = operationDefinitionMap[column.operationType];
    if (
      'references' in column &&
      rootDef.filterable &&
      rootDef.input === 'fullReference' &&
      column.filter
    ) {
      // inherit filter to all referenced operations
      column.references.forEach((referenceColumnId) => {
        const referencedColumn = columns[referenceColumnId];
        const referenceDef = operationDefinitionMap[column.operationType];
        if (referenceDef.filterable) {
          columns[referenceColumnId] = { ...referencedColumn, filter: column.filter };
        }
      });
    }

    if (
      'references' in column &&
      rootDef.shiftable &&
      rootDef.input === 'fullReference' &&
      column.timeShift
    ) {
      // inherit time shift to all referenced operations
      column.references.forEach((referenceColumnId) => {
        const referencedColumn = columns[referenceColumnId];
        const referenceDef = operationDefinitionMap[column.operationType];
        if (referenceDef.shiftable) {
          columns[referenceColumnId] = { ...referencedColumn, timeShift: column.timeShift };
        }
      });
    }
  });

  const columnEntries = columnOrder.map((colId) => [colId, columns[colId]] as const);

  const [referenceEntries, esAggEntries] = partition(
    columnEntries,
    ([, col]) =>
      operationDefinitionMap[col.operationType]?.input === 'fullReference' ||
      operationDefinitionMap[col.operationType]?.input === 'managedReference'
  );

  if (referenceEntries.length || esAggEntries.length) {
    let aggs: ExpressionAstExpressionBuilder[] = [];
    const expressions: ExpressionAstFunction[] = [];

    sortedReferences(referenceEntries).forEach((colId) => {
      const col = columns[colId];
      const def = operationDefinitionMap[col.operationType];
      if (def.input === 'fullReference' || def.input === 'managedReference') {
        expressions.push(...def.toExpression(layer, colId, indexPattern));
      }
    });

    function makeid(length = 10) {
      let result = '';
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const charactersLength = characters.length;
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    }

    const orderedColumnIds = esAggEntries.map(([colId]) => colId);
    const esAggsToOriginalColumnIdMap: Record<string, OriginalColumn> = {};
    const expressionBuilderToEsAggsIdMap: Map<ExpressionAstExpressionBuilder, string> = new Map();
    esAggEntries.forEach(([colId, col], index) => {
      const def = operationDefinitionMap[col.operationType];
      if (def.input !== 'fullReference' && def.input !== 'managedReference') {
        const esAggsId = makeid();

        const wrapInFilter = Boolean(def.filterable && col.filter);
        let aggAst = def.toEsAggsFn(
          col,
          wrapInFilter ? `${esAggsId}-metric` : esAggsId,
          indexPattern,
          layer,
          uiSettings,
          orderedColumnIds
        );
        if (wrapInFilter) {
          aggAst = buildExpressionFunction<AggFunctionsMapping['aggFilteredMetric']>(
            'aggFilteredMetric',
            {
              id: String(index),
              enabled: true,
              schema: 'metric',
              customBucket: buildExpression([
                buildExpressionFunction<AggFunctionsMapping['aggFilter']>('aggFilter', {
                  id: `${index}-filter`,
                  enabled: true,
                  schema: 'bucket',
                  filter: col.filter && queryToAst(col.filter),
                }),
              ]),
              customMetric: buildExpression({ type: 'expression', chain: [aggAst] }),
              timeShift: col.timeShift,
            }
          ).toAst();
        }

        const expressionBuilder = buildExpression({
          type: 'expression',
          chain: [aggAst],
        });
        aggs.push(expressionBuilder);

        esAggsToOriginalColumnIdMap[esAggsId] = {
          ...col,
          id: colId,
        };

        expressionBuilderToEsAggsIdMap.set(expressionBuilder, esAggsId);
      }
    });

    if (window.ELASTIC_LENS_DELAY_SECONDS) {
      aggs.push(
        buildExpression({
          type: 'expression',
          chain: [
            buildExpressionFunction('aggShardDelay', {
              id: 'the-delay',
              enabled: true,
              schema: 'metric',
              delay: `${window.ELASTIC_LENS_DELAY_SECONDS}s`,
            }).toAst(),
          ],
        })
      );
    }

    const percentileExpressionsByArgs: Record<string, ExpressionAstExpressionBuilder[]> = {};

    aggs.forEach((expressionBuilder) => {
      const {
        functions: [fnBuilder],
      } = expressionBuilder;
      if (fnBuilder.name === 'aggSinglePercentile') {
        const field = fnBuilder.getArgument('field')?.[0];
        if (!(field in percentileExpressionsByArgs)) {
          percentileExpressionsByArgs[field] = [];
        }

        percentileExpressionsByArgs[field].push(expressionBuilder);
      }
    });

    Object.values(percentileExpressionsByArgs).forEach((expressionBuilders) => {
      const [first, ...rest] = expressionBuilders;

      if (!rest.length) {
        // don't need to optimize if there's only one
        return;
      }

      const {
        functions: [firstFnBuilder],
      } = first;

      const esAggsColumnId = makeid();

      const aggPercentilesConfig: AggExpressionFunctionArgs<typeof METRIC_TYPES.PERCENTILES> = {
        id: esAggsColumnId,
        enabled: firstFnBuilder.getArgument('enabled')?.[0],
        schema: firstFnBuilder.getArgument('schema')?.[0],
        field: firstFnBuilder.getArgument('field')?.[0],
        percents: firstFnBuilder.getArgument('percentile'),
        // time shift is added to wrapping aggFilteredMetric if filter is set
        timeShift: firstFnBuilder.getArgument('timeShift')?.[0],
      };

      const siblingPercentiles = rest.map(
        ({ functions: [fnBuilder] }) => fnBuilder.getArgument('percentile')![0]
      ) as number[];

      aggPercentilesConfig.percents = [
        ...(aggPercentilesConfig.percents ?? []),
        ...siblingPercentiles,
      ];

      const multiPercentilesAst = buildExpressionFunction<AggFunctionsMapping['aggPercentiles']>(
        'aggPercentiles',
        aggPercentilesConfig
      ).toAst();

      aggs = [
        ...aggs.filter((aggBuilder) => ![first, ...rest].includes(aggBuilder)),
        buildExpression({
          type: 'expression',
          chain: [multiPercentilesAst],
        }),
      ];

      expressionBuilders.forEach((expressionBuilder) => {
        const currentEsAggsId = expressionBuilderToEsAggsIdMap.get(expressionBuilder);
        if (currentEsAggsId === undefined) {
          throw new Error('Could not find current column ID for percentile agg expression builder');
        }
        // esAggs appends the percent number to the agg id. We're anticipating that here.
        const newEsAggsId = `${esAggsColumnId}.${
          expressionBuilder.functions[0].getArgument('percentile')![0]
        }`;

        esAggsToOriginalColumnIdMap[newEsAggsId] = esAggsToOriginalColumnIdMap[currentEsAggsId];

        delete esAggsToOriginalColumnIdMap[currentEsAggsId];
      });
    });

    const columnsWithFormatters = columnEntries.filter(
      ([, col]) =>
        (isColumnOfType<RangeIndexPatternColumn>('range', col) && col.params?.parentFormat) ||
        (isColumnFormatted(col) && col.params?.format)
    ) as Array<[string, RangeIndexPatternColumn | FormattedIndexPatternColumn]>;
    const formatterOverrides: ExpressionAstFunction[] = columnsWithFormatters.map(([id, col]) => {
      // TODO: improve the type handling here
      const parentFormat = 'parentFormat' in col.params! ? col.params!.parentFormat! : undefined;
      const format = col.params!.format;

      const base: ExpressionAstFunction = {
        type: 'function',
        function: 'lens_format_column',
        arguments: {
          format: format ? [format.id] : [''],
          columnId: [id],
          decimals: typeof format?.params?.decimals === 'number' ? [format.params.decimals] : [],
          suffix:
            format?.params && 'suffix' in format.params && format.params.suffix
              ? [format.params.suffix]
              : [],
          parentFormat: parentFormat ? [JSON.stringify(parentFormat)] : [],
        },
      };

      return base;
    });

    const firstDateHistogramColumn = columnEntries.find(
      ([, col]) => col.operationType === 'date_histogram'
    );

    const columnsWithTimeScale = firstDateHistogramColumn
      ? columnEntries.filter(
          ([, col]) =>
            col.timeScale &&
            operationDefinitionMap[col.operationType].timeScalingMode &&
            operationDefinitionMap[col.operationType].timeScalingMode !== 'disabled'
        )
      : [];
    const timeScaleFunctions: ExpressionAstFunction[] = columnsWithTimeScale.flatMap(
      ([id, col]) => {
        const scalingCall: ExpressionAstFunction = {
          type: 'function',
          function: 'lens_time_scale',
          arguments: {
            dateColumnId: [firstDateHistogramColumn![0]],
            inputColumnId: [id],
            outputColumnId: [id],
            outputColumnName: [col.label],
            targetUnit: [col.timeScale!],
          },
        };

        const formatCall: ExpressionAstFunction = {
          type: 'function',
          function: 'lens_format_column',
          arguments: {
            format: [''],
            columnId: [id],
            parentFormat: [JSON.stringify({ id: 'suffix', params: { unit: col.timeScale } })],
          },
        };

        return [scalingCall, formatCall];
      }
    );

    if (esAggEntries.length === 0) {
      return {
        type: 'expression',
        chain: [
          {
            type: 'function',
            function: 'createTable',
            arguments: {
              ids: [],
              names: [],
              rowCount: [1],
            },
          },
          ...expressions,
          ...formatterOverrides,
          ...timeScaleFunctions,
        ],
      };
    }

    const allDateHistogramFields = Object.values(columns)
      .map((column) =>
        isColumnOfType<DateHistogramIndexPatternColumn>('date_histogram', column) &&
        !column.params.ignoreTimeRange
          ? column.sourceField
          : null
      )
      .filter((field): field is string => Boolean(field));

    return {
      type: 'expression',
      chain: [
        buildExpressionFunction<EsaggsExpressionFunctionDefinition>('esaggs', {
          index: buildExpression([
            buildExpressionFunction<IndexPatternLoadExpressionFunctionDefinition>(
              'indexPatternLoad',
              { id: indexPattern.id }
            ),
          ]),
          aggs,
          metricsAtAllLevels: false,
          partialRows: false,
          timeFields: allDateHistogramFields,
        }).toAst(),
        {
          type: 'function',
          function: 'lens_restore_original_column_ids',
          arguments: {
            idMap: [JSON.stringify(esAggsToOriginalColumnIdMap)],
          },
        },
        ...expressions,
        ...formatterOverrides,
        ...timeScaleFunctions,
      ],
    };
  }

  return null;
}

// Topologically sorts references so that we can execute them in sequence
function sortedReferences(columns: Array<readonly [string, GenericIndexPatternColumn]>) {
  const allNodes: Record<string, string[]> = {};
  columns.forEach(([id, col]) => {
    allNodes[id] = 'references' in col ? col.references : [];
  });
  // remove real metric references
  columns.forEach(([id]) => {
    allNodes[id] = allNodes[id].filter((refId) => !!allNodes[refId]);
  });
  const ordered: string[] = [];

  while (ordered.length < columns.length) {
    Object.keys(allNodes).forEach((id) => {
      if (allNodes[id].length === 0) {
        ordered.push(id);
        delete allNodes[id];
        Object.keys(allNodes).forEach((k) => {
          allNodes[k] = allNodes[k].filter((i) => i !== id);
        });
      }
    });
  }

  return ordered;
}

export function toExpression(
  state: IndexPatternPrivateState,
  layerId: string,
  uiSettings: IUiSettingsClient
) {
  if (state.layers[layerId]) {
    return getExpressionForLayer(
      state.layers[layerId],
      state.indexPatterns[state.layers[layerId].indexPatternId],
      uiSettings
    );
  }

  return null;
}
