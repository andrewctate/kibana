/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { i18n } from '@kbn/i18n';
import type { LayerAction, StateSetter } from '../../../../types';
import type { XYState, XYAnnotationLayerConfig } from '../../types';

export const getIgnoreFilterAction = ({
  state,
  layer,
  setState,
}: {
  state: XYState;
  layer: XYAnnotationLayerConfig;
  setState: StateSetter<XYState, unknown>;
}): LayerAction => {
  return {
    displayName: !layer.ignoreGlobalFilters
      ? i18n.translate('xpack.lens.xyChart.annotations.ignoreGlobalFiltersLabel', {
          defaultMessage: 'Ignore global filters',
        })
      : i18n.translate('xpack.lens.xyChart.annotations.keepGlobalFiltersLabel', {
          defaultMessage: 'Keep global filters',
        }),
    description: !layer.ignoreGlobalFilters
      ? i18n.translate('xpack.lens.xyChart.annotations.ignoreGlobalFiltersDescription', {
          defaultMessage:
            'All the dimensions configured in this layer ignore filters defined at kibana level.',
        })
      : i18n.translate('xpack.lens.xyChart.annotations.keepGlobalFiltersDescription', {
          defaultMessage:
            'All the dimensions configured in this layer respect filters defined at kibana level.',
        }),
    execute: () => {
      const newLayer = { ...layer, ignoreGlobalFilters: !layer.ignoreGlobalFilters };
      const newLayers = state.layers.map((layerToCheck) =>
        layerToCheck.layerId === layer.layerId ? newLayer : layerToCheck
      );
      return setState({ ...state, layers: newLayers });
    },
    icon: !layer.ignoreGlobalFilters ? 'filterIgnore' : 'filter',
    isCompatible: true,
    'data-test-subj': !layer.ignoreGlobalFilters
      ? 'lnsXY_annotationLayer_ignoreFilters'
      : 'lnsXY_annotationLayer_keepFilters',
  };
};
