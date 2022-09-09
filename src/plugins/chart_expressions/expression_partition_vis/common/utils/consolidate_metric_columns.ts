/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Datatable, DatatableColumn, DatatableRow } from '@kbn/expressions-plugin/common';
import { getColumnByAccessor, getFormatByAccessor } from '@kbn/visualizations-plugin/common/utils';
import type { ExpressionValueVisDimension } from '@kbn/visualizations-plugin/common';
import type { FieldFormatsStart } from '@kbn/field-formats-plugin/public';

export const consolidateMetricColumns = (
  table: Datatable,
  bucketAccessors: Array<string | ExpressionValueVisDimension> = [],
  metricAccessors: Array<string | ExpressionValueVisDimension>,
  formatService: FieldFormatsStart
): {
  table: Datatable;
  metricAccessor: string | ExpressionValueVisDimension | undefined;
  bucketAccessors: Array<string | ExpressionValueVisDimension>;
} => {
  if (metricAccessors.length < 2) {
    return {
      table,
      metricAccessor: metricAccessors[0],
      bucketAccessors,
    };
  }

  const bucketColumns = bucketAccessors
    ?.map((accessor) => getColumnByAccessor(accessor, table.columns))
    .filter(Boolean) as DatatableColumn[];

  const metricColumns = metricAccessors
    ?.map((accessor) => getColumnByAccessor(accessor, table.columns))
    .filter(Boolean) as DatatableColumn[];

  const transposedRows: DatatableRow[] = [];

  const [priorBucketColumns, finalBucketColumn] = [
    bucketColumns.slice(0, bucketColumns.length - 1),
    bucketColumns[bucketColumns.length - 1],
  ];

  const finalBucketFormatter = finalBucketColumn
    ? formatService
        .deserialize(getFormatByAccessor(finalBucketColumn.id, table.columns))
        .getConverterFor('text')
    : undefined;

  const nameColumnId = 'metric-name';
  const valueColumnId = 'value';

  table.rows.forEach((row) => {
    metricColumns.forEach((metricCol) => {
      const newRow: DatatableRow = {};

      priorBucketColumns.forEach(({ id }) => {
        newRow[id] = row[id];
      });

      newRow[nameColumnId] = finalBucketColumn
        ? `${finalBucketFormatter!(row[finalBucketColumn.id])} - ${metricCol.name}`
        : metricCol.name;
      newRow[valueColumnId] = row[metricCol.id];

      transposedRows.push(newRow);
    });
  });

  const transposedColumns: DatatableColumn[] = [
    ...priorBucketColumns,
    {
      id: nameColumnId,
      name: nameColumnId,
      meta: {
        type: 'string',
        sourceParams: {
          consolidatedMetricsColumn: true,
          combinedWithBucketColumn: Boolean(finalBucketColumn),
        },
      },
    },
    {
      id: valueColumnId,
      name: valueColumnId,
      meta: {
        type: 'number',
      },
    },
  ];

  return {
    metricAccessor: valueColumnId,
    bucketAccessors: [...priorBucketColumns.map(({ id }) => id), nameColumnId],
    table: {
      type: 'datatable',
      columns: transposedColumns,
      rows: transposedRows,
    },
  };
};
