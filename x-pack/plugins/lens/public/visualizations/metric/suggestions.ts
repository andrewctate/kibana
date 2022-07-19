/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { TableSuggestion, Visualization } from '../../types';
import { layerTypes } from '../../../common';
import { metricLabel, MetricVisualizationState, supportedDataTypes } from './visualization';

const MAX_BUCKETED_COLUMNS = 1;
const MAX_METRIC_COLUMNS = 1;

const hasLayerMismatch = (keptLayerIds: string[], table: TableSuggestion) =>
  keptLayerIds.length > 1 || (keptLayerIds.length && table.layerId !== keptLayerIds[0]);

export const getSuggestions: Visualization<MetricVisualizationState>['getSuggestions'] = ({
  table,
  state,
  keptLayerIds,
}) => {
  const isActive = Boolean(state);

  const metricColumns = table.columns.filter(
    ({ operation }) => supportedDataTypes.has(operation.dataType) && !operation.isBucketed
  );

  const bucketedColumns = table.columns.filter(({ operation }) => operation.isBucketed);

  const unsupportedColumns = table.columns.filter(
    ({ operation }) => !supportedDataTypes.has(operation.dataType) && !operation.isBucketed
  );

  if (
    !table.columns.length ||
    hasLayerMismatch(keptLayerIds, table) ||
    unsupportedColumns.length ||
    bucketedColumns.length > MAX_BUCKETED_COLUMNS ||
    metricColumns.length > MAX_METRIC_COLUMNS ||
    (isActive && table.changeType === 'unchanged')
  ) {
    return [];
  }

  const baseSuggestion = {
    state: {
      ...state,
      layerId: table.layerId,
      layerType: layerTypes.DATA,
    },
    title: metricLabel,
    previewIcon: 'empty',
    score: 0.5,
    // don't show suggestions since we're in tech preview
    hide: true,
  };

  const accessorMappings: Pick<MetricVisualizationState, 'metricAccessor' | 'breakdownByAccessor'> =
    {
      metricAccessor: state?.metricAccessor,
      breakdownByAccessor: state?.breakdownByAccessor,
    };

  if (isActive) {
    if (table.changeType === 'initial') {
      if (metricColumns.length) {
        accessorMappings.metricAccessor = metricColumns[0].columnId;
      } else {
        accessorMappings.breakdownByAccessor = bucketedColumns[0].columnId;
      }
    }

    if (table.changeType === 'extended') {
      accessorMappings.metricAccessor =
        accessorMappings.metricAccessor ?? metricColumns[0]?.columnId;
      accessorMappings.breakdownByAccessor =
        accessorMappings.breakdownByAccessor ?? bucketedColumns[0]?.columnId;
    }
  } else {
    accessorMappings.metricAccessor = metricColumns[0]?.columnId;
    accessorMappings.breakdownByAccessor = bucketedColumns[0]?.columnId;
  }

  const suggestion = {
    ...baseSuggestion,
    state: {
      ...baseSuggestion.state,
      ...accessorMappings,
    },
  };

  return [suggestion];
};
