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
import { EmptySizeRatios, LegendDisplay, PartitionVisParams } from '../types/expression_renderers';
import { ChartTypes, PieVisExpressionFunctionDefinition } from '../types';
import {
  PARTITION_LABELS_FUNCTION,
  PARTITION_LABELS_VALUE,
  PIE_VIS_EXPRESSION_NAME,
  PARTITION_VIS_RENDERER_NAME,
} from '../constants';
import { errors, strings } from './i18n';
import { collapseMetricColumns } from '../utils';

export const pieVisFunction = (): PieVisExpressionFunctionDefinition => ({
  name: PIE_VIS_EXPRESSION_NAME,
  type: 'render',
  inputTypes: ['datatable'],
  help: strings.getPieVisFunctionName(),
  args: {
    metrics: {
      types: ['vis_dimension', 'string'],
      help: strings.getMetricArgHelp(),
      multi: true,
    },
    buckets: {
      types: ['vis_dimension', 'string'],
      help: strings.getBucketsArgHelp(),
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

    args.metrics.forEach((accessor) => validateAccessor(accessor, context.columns));

    if (args.buckets) {
      args.buckets.forEach((accessor) => validateAccessor(accessor, context.columns));
    }
    if (args.splitColumn) {
      args.splitColumn.forEach((splitColumn) => validateAccessor(splitColumn, context.columns));
    }
    if (args.splitRow) {
      args.splitRow.forEach((splitRow) => validateAccessor(splitRow, context.columns));
    }

    const { table, metricAccessor, bucketAccessors } = collapseMetricColumns(
      context,
      args.buckets,
      args.metrics
    );

    const visConfig: PartitionVisParams = {
      ...args,
      ariaLabel:
        args.ariaLabel ??
        (handlers.variables?.embeddableTitle as string) ??
        handlers.getExecutionContext?.()?.description,
      palette: args.palette,
      dimensions: {
        metric: metricAccessor,
        buckets: bucketAccessors,
        splitColumn: args.splitColumn,
        splitRow: args.splitRow,
      },
    };

    // // TODO fix inspector
    // if (handlers?.inspectorAdapters?.tables) {
    //   handlers.inspectorAdapters.tables.reset();
    //   handlers.inspectorAdapters.tables.allowCsvExport = true;

    //   const logTable = prepareLogTable(
    //     context,
    //     [
    //       [[transposedMetricAccessor ?? args.metric], strings.getSliceSizeHelp()],
    //       [
    //         transposedBucketAccessor ? [transposedBucketAccessor] : args.buckets,
    //         strings.getSliceHelp(),
    //       ],
    //       [args.splitColumn, strings.getColumnSplitHelp()],
    //       [args.splitRow, strings.getRowSplitHelp()],
    //     ],
    //     true
    //   );
    //   handlers.inspectorAdapters.tables.logDatatable('default', logTable);
    // }

    return {
      type: 'render',
      as: PARTITION_VIS_RENDERER_NAME,
      value: {
        visData: table,
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
