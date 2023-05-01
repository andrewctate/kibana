/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { transparentize } from '@elastic/eui';
import Color from 'color';
import { pick } from 'lodash';
import { euiLightVars } from '@kbn/ui-theme';
import { i18n } from '@kbn/i18n';
import { isQueryAnnotationConfig, isRangeAnnotationConfig } from '../..';
import type {
  EventAnnotationConfig,
  RangeEventAnnotationConfig,
  PointInTimeEventAnnotationConfig,
  QueryPointEventAnnotationConfig,
} from '../../../common';

export const defaultAnnotationColor = euiLightVars.euiColorAccent;
// Do not compute it live as dependencies will add tens of Kbs to the plugin
export const defaultAnnotationRangeColor = `#F04E981A`; // defaultAnnotationColor with opacity 0.1

export const defaultAnnotationLabel = i18n.translate('xpack.lens.xyChart.defaultAnnotationLabel', {
  defaultMessage: 'Event',
});

export const defaultRangeAnnotationLabel = i18n.translate(
  'xpack.lens.xyChart.defaultRangeAnnotationLabel',
  {
    defaultMessage: 'Event range',
  }
);

export const toRangeAnnotationColor = (color = defaultAnnotationColor) => {
  return new Color(transparentize(color, 0.1)).hexa();
};

export const toLineAnnotationColor = (color = defaultAnnotationRangeColor) => {
  return new Color(transparentize(color, 1)).hex();
};

export const sanitizeProperties = (annotation: EventAnnotationConfig) => {
  if (isRangeAnnotationConfig(annotation)) {
    const rangeAnnotation: RangeEventAnnotationConfig = pick(annotation, [
      'type',
      'label',
      'key',
      'id',
      'isHidden',
      'color',
      'outside',
    ]);
    return rangeAnnotation;
  }
  if (isQueryAnnotationConfig(annotation)) {
    const lineAnnotation: QueryPointEventAnnotationConfig = pick(annotation, [
      'type',
      'id',
      'label',
      'key',
      'timeField',
      'isHidden',
      'lineStyle',
      'lineWidth',
      'color',
      'icon',
      'textVisibility',
      'textField',
      'filter',
      'extraFields',
    ]);
    return lineAnnotation;
  }
  const lineAnnotation: PointInTimeEventAnnotationConfig = pick(annotation, [
    'type',
    'id',
    'label',
    'key',
    'isHidden',
    'lineStyle',
    'lineWidth',
    'color',
    'icon',
    'textVisibility',
  ]);
  return lineAnnotation;
};
