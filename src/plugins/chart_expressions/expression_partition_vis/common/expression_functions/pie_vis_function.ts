/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Position } from '@elastic/charts';
import { prepareLogTable, validateAccessor } from '@kbn/visualizations-plugin/common/utils';
import { DEFAULT_LEGEND_SIZE, LegendSize } from '@kbn/visualizations-plugin/common/constants';
import { ExpressionValueVisDimension } from '@kbn/visualizations-plugin/common';
import { EmptySizeRatios, LegendDisplay, PartitionVisParams } from '../types/expression_renderers';
import {
  ChartTypes,
  PartitionLayerBucketExpressionFunctionDefinition,
  PartitionLayerFieldsExpressionFunctionDefinition,
  PieVisExpressionFunctionDefinition,
} from '../types';
import {
  PARTITION_LABELS_FUNCTION,
  PARTITION_LABELS_VALUE,
  PIE_VIS_EXPRESSION_NAME,
  PARTITION_VIS_RENDERER_NAME,
  PARTITION_LAYER_BUCKET_NAME,
  PARTITION_LAYER_FIELDS_NAME,
} from '../constants';
import { errors, strings } from './i18n';

export const partitionLayerBucket = (): PartitionLayerBucketExpressionFunctionDefinition => ({
  name: PARTITION_LAYER_BUCKET_NAME,
  inputTypes: [],
  help: strings.getPieVisFunctionName(),
  args: {
    metric: {
      types: ['vis_dimension', 'string'],
      help: strings.getMetricArgHelp(),
      required: true,
    },
    bucket: {
      types: ['vis_dimension', 'string'],
      help: strings.getBucketsArgHelp(),
    },
  },
  fn(_context, args, _handlers) {
    return { type: 'partition_layer_bucket', ...args };
  },
});

export const partitionLayerFields = (): PartitionLayerFieldsExpressionFunctionDefinition => ({
  name: PARTITION_LAYER_FIELDS_NAME,
  inputTypes: [],
  help: strings.getPieVisFunctionName(),
  args: {
    fields: {
      types: ['vis_dimension', 'string'],
      help: '',
      required: true,
      multi: true,
    },
  },
  fn(_context, args, _handlers) {
    return { type: 'partition_layer_fields', ...args };
  },
});

export const pieVisFunction = (): PieVisExpressionFunctionDefinition => ({
  name: PIE_VIS_EXPRESSION_NAME,
  type: 'render',
  inputTypes: ['datatable'],
  help: strings.getPieVisFunctionName(),
  args: {
    partitionLayers: {
      types: ['partition_layer_bucket'],
      help: '',
      multi: true,
    },
    splitColumn: {
      types: ['vis_dimension', 'string'],
      help: strings.getSplitColumnArgHelp(),
      multi: true,
    },
    splitRow: {
      types: ['vis_dimension', 'string'],
      help: strings.getSplitRowArgHelp(),
      multi: true,
    },
    addTooltip: {
      types: ['boolean'],
      help: strings.getAddTooltipArgHelp(),
      default: true,
    },
    legendDisplay: {
      types: ['string'],
      help: strings.getLegendDisplayArgHelp(),
      options: [LegendDisplay.SHOW, LegendDisplay.HIDE, LegendDisplay.DEFAULT],
      default: LegendDisplay.HIDE,
      strict: true,
    },
    legendPosition: {
      types: ['string'],
      default: Position.Right,
      help: strings.getLegendPositionArgHelp(),
      options: [Position.Top, Position.Right, Position.Bottom, Position.Left],
      strict: true,
    },
    legendSize: {
      types: ['string'],
      default: DEFAULT_LEGEND_SIZE,
      help: strings.getLegendSizeArgHelp(),
      options: [
        LegendSize.AUTO,
        LegendSize.SMALL,
        LegendSize.MEDIUM,
        LegendSize.LARGE,
        LegendSize.EXTRA_LARGE,
      ],
      strict: true,
    },
    nestedLegend: {
      types: ['boolean'],
      help: strings.getNestedLegendArgHelp(),
      default: false,
    },
    truncateLegend: {
      types: ['boolean'],
      help: strings.getTruncateLegendArgHelp(),
      default: true,
    },
    maxLegendLines: {
      types: ['number'],
      help: strings.getMaxLegendLinesArgHelp(),
    },
    distinctColors: {
      types: ['boolean'],
      help: strings.getDistinctColorsArgHelp(),
      default: false,
    },
    respectSourceOrder: {
      types: ['boolean'],
      help: strings.getRespectSourceOrderArgHelp(),
      default: true,
    },
    isDonut: {
      types: ['boolean'],
      help: strings.getIsDonutArgHelp(),
      default: false,
    },
    emptySizeRatio: {
      types: ['number'],
      help: strings.getEmptySizeRatioArgHelp(),
      default: EmptySizeRatios.SMALL,
    },
    palette: {
      types: ['palette', 'system_palette'],
      help: strings.getPaletteArgHelp(),
      default: '{palette}',
    },
    labels: {
      types: [PARTITION_LABELS_VALUE],
      help: strings.getLabelsArgHelp(),
      default: `{${PARTITION_LABELS_FUNCTION}}`,
    },
    startFromSecondLargestSlice: {
      types: ['boolean'],
      help: strings.getStartFromSecondLargestSliceArgHelp(),
      default: true,
    },
    ariaLabel: {
      types: ['string'],
      help: strings.getAriaLabelHelp(),
      required: false,
    },
  },
  fn(context, args, handlers) {
    if (args.splitColumn && args.splitRow) {
      throw new Error(errors.splitRowAndSplitColumnAreSpecifiedError());
    }

    args.partitionLayers.forEach((partitionLayer) => {
      validateAccessor(partitionLayer.metric, context.columns);
      if (partitionLayer.bucket) {
        validateAccessor(partitionLayer.bucket, context.columns);
      }
    });

    if (args.splitColumn) {
      args.splitColumn.forEach((splitColumn) => validateAccessor(splitColumn, context.columns));
    }
    if (args.splitRow) {
      args.splitRow.forEach((splitRow) => validateAccessor(splitRow, context.columns));
    }

    const visConfig: PartitionVisParams = {
      ...args,
      ariaLabel:
        args.ariaLabel ??
        (handlers.variables?.embeddableTitle as string) ??
        handlers.getExecutionContext?.()?.description,
      palette: args.palette,
      dimensions: {
        partitionLayers: args.partitionLayers,
        splitColumn: args.splitColumn,
        splitRow: args.splitRow,
      },
    };

    if (handlers?.inspectorAdapters?.tables) {
      handlers.inspectorAdapters.tables.reset();
      handlers.inspectorAdapters.tables.allowCsvExport = true;

      const metric = args.partitionLayers[0].metric; // TODO support more than one metric?
      const buckets = args.partitionLayers
        .map(({ bucket }) => bucket)
        .filter((bucket) => typeof bucket !== 'undefined') as Array<
        string | ExpressionValueVisDimension
      >;

      const logTable = prepareLogTable(
        context,
        [
          [[metric], strings.getSliceSizeHelp()],
          [buckets, strings.getSliceHelp()],
          [args.splitColumn, strings.getColumnSplitHelp()],
          [args.splitRow, strings.getRowSplitHelp()],
        ],
        true
      );
      handlers.inspectorAdapters.tables.logDatatable('default', logTable);
    }

    return {
      type: 'render',
      as: PARTITION_VIS_RENDERER_NAME,
      value: {
        visData: context,
        visConfig,
        syncColors: handlers?.isSyncColorsEnabled?.() ?? false,
        visType: args.isDonut ? ChartTypes.DONUT : ChartTypes.PIE,
        params: {
          listenOnChange: true,
        },
      },
    };
  },
});
