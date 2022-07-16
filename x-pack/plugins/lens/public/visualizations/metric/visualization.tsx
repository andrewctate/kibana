/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { i18n } from '@kbn/i18n';
import { I18nProvider } from '@kbn/i18n-react';
import { render } from 'react-dom';
import { Ast, AstFunction } from '@kbn/interpreter';
import { PaletteOutput, PaletteRegistry, CUSTOM_PALETTE, CustomPaletteParams } from '@kbn/coloring';
import { VIS_EVENT_TO_TRIGGER } from '@kbn/visualizations-plugin/public';
import { LayoutDirection } from '@elastic/charts';
import { LayerType } from '../../../common';
import { getSuggestions } from './metric_suggestions';
import { LensIconChartMetric } from '../../assets/chart_metric';
import { Visualization, OperationMetadata, DatasourceLayers } from '../../types';
import { layerTypes } from '../../../common';
import { GROUP_ID, LENS_METRIC_ID } from './constants';
import { MetricDimensionEditor } from './dimension_editor';
import { MetricToolbar } from './toolbar';

export interface MetricVisualizationState {
  layerId: string;
  layerType: LayerType;
  metricAccessor?: string;
  secondaryMetricAccessor?: string;
  maxAccessor?: string;
  breakdownByAccessor?: string;
  // the dimensions can optionally be single numbers
  // computed by collapsing all rows
  collapseFn?: string;
  subtitle?: string;
  extraText?: string;
  progressDirection?: LayoutDirection;
  palette?: PaletteOutput<CustomPaletteParams>;
  maxCols?: number;
}

// TODO - consider relaxing?
export const supportedTypes = new Set(['number']);

// TODO - do we need this?
function computePaletteParams(params: CustomPaletteParams) {
  return {
    ...params,
    // rewrite colors and stops as two distinct arguments
    colors: (params?.stops || []).map(({ color }) => color),
    stops: params?.name === 'custom' ? (params?.stops || []).map(({ stop }) => stop) : [],
    reverse: false, // managed at UI level
  };
}

const toExpression = (
  paletteService: PaletteRegistry,
  state: MetricVisualizationState,
  datasourceLayers: DatasourceLayers,
  datasourceExpressionsByLayers: Record<string, Ast> | undefined = {},
  isSuggestion: boolean = false
): Ast | null => {
  if (!state.metricAccessor) {
    return null;
  }

  const datasource = datasourceLayers[state.layerId];
  const datasourceExpression = datasourceExpressionsByLayers[state.layerId];

  // we constrain the tile sizes in the lens editor for aesthetic reasons
  const sideLength = state.breakdownByAccessor ? 200 : 300;

  const maxPossibleTiles =
    // if there's a collapse function, no need to calculate since we're dealing with a single tile
    state.breakdownByAccessor && !isSuggestion && !state.collapseFn
      ? datasource.getMaxPossibleNumValues(state.breakdownByAccessor)
      : null;

  const getCollapseFnArguments = () => {
    const metric = [state.metricAccessor, state.secondaryMetricAccessor, state.maxAccessor].filter(
      Boolean
    );

    const fn = metric.map((accessor) => {
      if (accessor !== state.maxAccessor) {
        return state.collapseFn;
      } else {
        const isMaxStatic = Boolean(
          datasource.getOperationForColumnId(state.maxAccessor!)?.isStaticValue
        );
        // we do this because the user expects the static value they set to be the same
        // even if they define a collapse on the breakdown by
        return isMaxStatic ? 'max' : state.collapseFn;
      }
    });

    return {
      by: [],
      metric,
      fn,
    };
  };

  return {
    type: 'expression',
    chain: [
      ...(datasourceExpression?.chain ?? []),
      ...(state.collapseFn
        ? [
            {
              type: 'function',
              function: 'lens_collapse',
              arguments: getCollapseFnArguments(),
            } as AstFunction,
          ]
        : []),
      {
        type: 'function',
        function: 'metricVis', // TODO import from plugin
        arguments: {
          metric: state.metricAccessor ? [state.metricAccessor] : [],
          secondaryMetric: state.secondaryMetricAccessor ? [state.secondaryMetricAccessor] : [],
          max: state.maxAccessor ? [state.maxAccessor] : [],
          breakdownBy: state.breakdownByAccessor ? [state.breakdownByAccessor] : [],
          subtitle: state.subtitle ? [state.subtitle] : [],
          extraText: state.extraText ? [state.extraText] : [],
          progressDirection: state.progressDirection ? [state.progressDirection] : [],
          palette: state.palette?.params
            ? [
                paletteService
                  .get(CUSTOM_PALETTE)
                  .toExpression(computePaletteParams(state.palette.params as CustomPaletteParams)),
              ]
            : [],
          maxCols: state.maxCols ? [state.maxCols] : [],
          minTiles: maxPossibleTiles ? [maxPossibleTiles] : [],
          maxTileWidth: !isSuggestion ? [sideLength] : [],
          maxTileHeight: !isSuggestion ? [sideLength] : [],
        },
      },
    ],
  };
};

const metricLabel = i18n.translate('xpack.lens.metric.label', {
  defaultMessage: 'Metric',
});
const metricGroupLabel = i18n.translate('xpack.lens.metric.groupLabel', {
  defaultMessage: 'Goal and single value',
});

export const getMetricVisualization = ({
  paletteService,
}: {
  paletteService: PaletteRegistry;
}): Visualization<MetricVisualizationState> => ({
  id: LENS_METRIC_ID,

  visualizationTypes: [
    {
      id: LENS_METRIC_ID,
      icon: LensIconChartMetric,
      label: metricLabel,
      groupLabel: metricGroupLabel,
      sortPriority: 3,
    },
  ],

  getVisualizationTypeId() {
    return LENS_METRIC_ID;
  },

  clearLayer(state) {
    const newState = { ...state };
    delete newState.metricAccessor;
    delete newState.secondaryMetricAccessor;
    delete newState.breakdownByAccessor;
    delete newState.collapseFn;
    delete newState.maxAccessor;
    delete newState.palette;
    // TODO - clear more?
    return newState;
  },

  getLayerIds(state) {
    return [state.layerId];
  },

  getDescription() {
    return {
      icon: LensIconChartMetric,
      label: metricLabel,
    };
  },

  getSuggestions,

  initialize(addNewLayer, state, mainPalette) {
    return (
      state ?? {
        layerId: addNewLayer(),
        layerType: layerTypes.DATA,
        palette: mainPalette,
      }
    );
  },
  triggers: [VIS_EVENT_TO_TRIGGER.filter],

  getConfiguration(props) {
    const hasColoring = props.state.palette != null;
    const stops = props.state.palette?.params?.stops || [];
    const isSupportedMetricOperation = (op: OperationMetadata) =>
      !op.isBucketed && supportedTypes.has(op.dataType);
    const isBucketed = (op: OperationMetadata) => op.isBucketed;
    return {
      groups: [
        {
          groupId: GROUP_ID.METRIC,
          groupLabel: i18n.translate('xpack.lens.metric.label', { defaultMessage: 'Metric' }),
          layerId: props.state.layerId,
          accessors: props.state.metricAccessor
            ? [
                {
                  columnId: props.state.metricAccessor,
                  triggerIcon: hasColoring ? 'colorBy' : undefined,
                  palette: hasColoring ? stops.map(({ color }) => color) : undefined,
                },
              ]
            : [],
          supportsMoreColumns: !props.state.metricAccessor,
          filterOperations: isSupportedMetricOperation,
          enableDimensionEditor: true,
          required: true,
        },
        {
          groupId: GROUP_ID.SECONDARY_METRIC,
          groupLabel: i18n.translate('xpack.lens.metric.secondaryMetric', {
            defaultMessage: 'Secondary metric',
          }),
          layerId: props.state.layerId,
          accessors: props.state.secondaryMetricAccessor
            ? [
                {
                  columnId: props.state.secondaryMetricAccessor,
                },
              ]
            : [],
          supportsMoreColumns: !props.state.secondaryMetricAccessor,
          filterOperations: isSupportedMetricOperation,
          enableDimensionEditor: false,
          required: false,
        },
        {
          groupId: GROUP_ID.MAX,
          groupLabel: i18n.translate('xpack.lens.metric.max', { defaultMessage: 'Maximum' }),
          layerId: props.state.layerId,
          accessors: props.state.maxAccessor
            ? [
                {
                  columnId: props.state.maxAccessor,
                },
              ]
            : [],
          supportsMoreColumns: !props.state.maxAccessor,
          filterOperations: isSupportedMetricOperation,
          enableDimensionEditor: false,
          supportStaticValue: true,
          required: false,
        },
        {
          groupId: GROUP_ID.BREAKDOWN_BY,
          groupLabel: i18n.translate('xpack.lens.metric.breakdownBy', {
            defaultMessage: 'Break down by',
          }),
          layerId: props.state.layerId,
          accessors: props.state.breakdownByAccessor
            ? [
                {
                  columnId: props.state.breakdownByAccessor,
                },
              ]
            : [],
          supportsMoreColumns: !props.state.breakdownByAccessor,
          filterOperations: isBucketed,
          enableDimensionEditor: true,
          required: false,
        },
      ],
    };
  },

  getSupportedLayers() {
    return [
      {
        type: layerTypes.DATA,
        label: i18n.translate('xpack.lens.metric.addLayer', {
          defaultMessage: 'Visualization',
        }),
      },
    ];
  },

  getLayerType(layerId, state) {
    if (state?.layerId === layerId) {
      return state.layerType;
    }
  },

  toExpression: (state, datasourceLayers, attributes, datasourceExpressionsByLayers) =>
    toExpression(paletteService, state, datasourceLayers, datasourceExpressionsByLayers),

  toPreviewExpression: (state, datasourceLayers, datasourceExpressionsByLayers) =>
    toExpression(paletteService, state, datasourceLayers, datasourceExpressionsByLayers, true),

  setDimension({ prevState, columnId, groupId }) {
    const updated = { ...prevState };

    switch (groupId) {
      case GROUP_ID.METRIC:
        updated.metricAccessor = columnId;
        break;
      case GROUP_ID.SECONDARY_METRIC:
        updated.secondaryMetricAccessor = columnId;
        break;
      case GROUP_ID.MAX:
        updated.maxAccessor = columnId;
        break;
      case GROUP_ID.BREAKDOWN_BY:
        updated.breakdownByAccessor = columnId;
        break;
    }

    return updated;
  },

  removeDimension({ prevState, layerId, columnId }) {
    const updated = { ...prevState };

    if (prevState.metricAccessor === columnId) {
      delete updated.metricAccessor;
      delete updated.palette;
    }
    if (prevState.secondaryMetricAccessor === columnId) {
      delete updated.secondaryMetricAccessor;
    }
    if (prevState.maxAccessor === columnId) {
      delete updated.maxAccessor;
    }
    if (prevState.breakdownByAccessor === columnId) {
      delete updated.breakdownByAccessor;
      delete updated.collapseFn;
    }

    return updated;
  },

  renderToolbar(domElement, props) {
    render(
      <I18nProvider>
        <MetricToolbar {...props} />
      </I18nProvider>,
      domElement
    );
  },

  renderDimensionEditor(domElement, props) {
    render(
      <I18nProvider>
        <MetricDimensionEditor {...props} paletteService={paletteService} />
      </I18nProvider>,
      domElement
    );
  },

  getErrorMessages(state) {
    // Is it possible to break it?
    return undefined;
  },
});
