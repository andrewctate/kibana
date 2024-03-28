/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { i18n } from '@kbn/i18n';
import type { GeneratedFunctionDefinition } from './types';

export const generatedFunctions: GeneratedFunctionDefinition[] = [
  {
    type: 'eval',
    name: 'abs',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.abs', {
      defaultMessage: 'Returns the absolute value.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'number',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'number',
      },
    ],
  },
  {
    type: 'eval',
    name: 'acos',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.acos', {
      defaultMessage: 'Returns the arccosine of `n` as an angle, expressed in radians.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'number',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'number',
      },
    ],
  },
  {
    type: 'eval',
    name: 'asin',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.asin', {
      defaultMessage:
        'Returns the arcsine of the input numeric expression as an angle, expressed in radians.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'number',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'number',
      },
    ],
  },
  {
    type: 'eval',
    name: 'atan',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.atan', {
      defaultMessage:
        'Returns the arctangent of the input numeric expression as an angle, expressed in radians.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'number',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'number',
      },
    ],
  },
  {
    type: 'eval',
    name: 'atan2',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.atan2', {
      defaultMessage:
        'The angle between the positive x-axis and the ray from the origin to the point (x , y) in the Cartesian plane, expressed in radians.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'y_coordinate',
            type: 'number',
            optional: false,
          },
          {
            name: 'x_coordinate',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'number',
      },
    ],
  },
  {
    type: 'eval',
    name: 'auto_bucket',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.auto_bucket', {
      defaultMessage:
        'Creates human-friendly buckets and returns a datetime value for each row that corresponds to the resulting bucket the row falls into.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'field',
            type: 'number',
            optional: false,
          },
          {
            name: 'buckets',
            type: 'number',
            optional: false,
          },
          {
            name: 'from',
            type: 'number',
            optional: false,
          },
          {
            name: 'to',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'number',
            optional: false,
          },
          {
            name: 'buckets',
            type: 'number',
            optional: false,
          },
          {
            name: 'from',
            type: 'number',
            optional: false,
          },
          {
            name: 'to',
            type: 'date',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'number',
            optional: false,
          },
          {
            name: 'buckets',
            type: 'number',
            optional: false,
          },
          {
            name: 'from',
            type: 'number',
            optional: false,
          },
          {
            name: 'to',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'number',
            optional: false,
          },
          {
            name: 'buckets',
            type: 'number',
            optional: false,
          },
          {
            name: 'from',
            type: 'date',
            optional: false,
          },
          {
            name: 'to',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'number',
            optional: false,
          },
          {
            name: 'buckets',
            type: 'number',
            optional: false,
          },
          {
            name: 'from',
            type: 'date',
            optional: false,
          },
          {
            name: 'to',
            type: 'date',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'number',
            optional: false,
          },
          {
            name: 'buckets',
            type: 'number',
            optional: false,
          },
          {
            name: 'from',
            type: 'date',
            optional: false,
          },
          {
            name: 'to',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'number',
            optional: false,
          },
          {
            name: 'buckets',
            type: 'number',
            optional: false,
          },
          {
            name: 'from',
            type: 'string',
            optional: false,
          },
          {
            name: 'to',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'number',
            optional: false,
          },
          {
            name: 'buckets',
            type: 'number',
            optional: false,
          },
          {
            name: 'from',
            type: 'string',
            optional: false,
          },
          {
            name: 'to',
            type: 'date',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'number',
            optional: false,
          },
          {
            name: 'buckets',
            type: 'number',
            optional: false,
          },
          {
            name: 'from',
            type: 'string',
            optional: false,
          },
          {
            name: 'to',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'date',
            optional: false,
          },
          {
            name: 'buckets',
            type: 'number',
            optional: false,
          },
          {
            name: 'from',
            type: 'number',
            optional: false,
          },
          {
            name: 'to',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'date',
            optional: false,
          },
          {
            name: 'buckets',
            type: 'number',
            optional: false,
          },
          {
            name: 'from',
            type: 'number',
            optional: false,
          },
          {
            name: 'to',
            type: 'date',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'date',
            optional: false,
          },
          {
            name: 'buckets',
            type: 'number',
            optional: false,
          },
          {
            name: 'from',
            type: 'number',
            optional: false,
          },
          {
            name: 'to',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'date',
            optional: false,
          },
          {
            name: 'buckets',
            type: 'number',
            optional: false,
          },
          {
            name: 'from',
            type: 'date',
            optional: false,
          },
          {
            name: 'to',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'date',
            optional: false,
          },
          {
            name: 'buckets',
            type: 'number',
            optional: false,
          },
          {
            name: 'from',
            type: 'date',
            optional: false,
          },
          {
            name: 'to',
            type: 'date',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'date',
            optional: false,
          },
          {
            name: 'buckets',
            type: 'number',
            optional: false,
          },
          {
            name: 'from',
            type: 'date',
            optional: false,
          },
          {
            name: 'to',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'date',
            optional: false,
          },
          {
            name: 'buckets',
            type: 'number',
            optional: false,
          },
          {
            name: 'from',
            type: 'string',
            optional: false,
          },
          {
            name: 'to',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'date',
            optional: false,
          },
          {
            name: 'buckets',
            type: 'number',
            optional: false,
          },
          {
            name: 'from',
            type: 'string',
            optional: false,
          },
          {
            name: 'to',
            type: 'date',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'date',
            optional: false,
          },
          {
            name: 'buckets',
            type: 'number',
            optional: false,
          },
          {
            name: 'from',
            type: 'string',
            optional: false,
          },
          {
            name: 'to',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'any',
      },
    ],
  },
  {
    type: 'eval',
    name: 'case',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.case', {
      defaultMessage:
        'Accepts pairs of conditions and values. The function returns the value that belongs to the first condition that evaluates to true.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'condition',
            type: 'boolean',
            optional: false,
          },
          {
            name: 'trueValue',
            type: 'boolean',
            optional: false,
          },
        ],
        returnType: 'any',
        minParams: 2,
      },
      {
        params: [
          {
            name: 'condition',
            type: 'boolean',
            optional: false,
          },
          {
            name: 'trueValue',
            type: 'cartesian_point',
            optional: false,
          },
        ],
        returnType: 'any',
        minParams: 2,
      },
      {
        params: [
          {
            name: 'condition',
            type: 'boolean',
            optional: false,
          },
          {
            name: 'trueValue',
            type: 'date',
            optional: false,
          },
        ],
        returnType: 'any',
        minParams: 2,
      },
      {
        params: [
          {
            name: 'condition',
            type: 'boolean',
            optional: false,
          },
          {
            name: 'trueValue',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'any',
        minParams: 2,
      },
      {
        params: [
          {
            name: 'condition',
            type: 'boolean',
            optional: false,
          },
          {
            name: 'trueValue',
            type: 'geo_point',
            optional: false,
          },
        ],
        returnType: 'any',
        minParams: 2,
      },
      {
        params: [
          {
            name: 'condition',
            type: 'boolean',
            optional: false,
          },
          {
            name: 'trueValue',
            type: 'ip',
            optional: false,
          },
        ],
        returnType: 'any',
        minParams: 2,
      },
      {
        params: [
          {
            name: 'condition',
            type: 'boolean',
            optional: false,
          },
          {
            name: 'trueValue',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'any',
        minParams: 2,
      },
      {
        params: [
          {
            name: 'condition',
            type: 'boolean',
            optional: false,
          },
          {
            name: 'trueValue',
            type: 'version',
            optional: false,
          },
        ],
        returnType: 'any',
        minParams: 2,
      },
    ],
  },
  {
    type: 'eval',
    name: 'ceil',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.ceil', {
      defaultMessage: 'Round a number up to the nearest integer.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'number',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'number',
      },
    ],
  },
  {
    type: 'eval',
    name: 'cidr_match',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.cidr_match', {
      defaultMessage:
        'Returns true if the provided IP is contained in one of the provided CIDR blocks.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'ip',
            type: 'ip',
            optional: false,
          },
          {
            name: 'blockX',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'boolean',
        minParams: 2,
      },
    ],
  },
  {
    type: 'eval',
    name: 'coalesce',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.coalesce', {
      defaultMessage:
        'Returns the first of its arguments that is not null. If all arguments are null, it returns `null`.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'first',
            type: 'boolean',
            optional: false,
          },
        ],
        returnType: 'any',
        minParams: 1,
      },
      {
        params: [
          {
            name: 'first',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'any',
        minParams: 1,
      },
      {
        params: [
          {
            name: 'first',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'any',
        minParams: 1,
      },
    ],
  },
  {
    type: 'eval',
    name: 'concat',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.concat', {
      defaultMessage: 'Concatenates two or more strings.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'string1',
            type: 'string',
            optional: false,
          },
          {
            name: 'string2',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'string',
        minParams: 2,
      },
    ],
  },
  {
    type: 'eval',
    name: 'cos',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.cos', {
      defaultMessage: 'Returns the trigonometric cosine of an angle',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'number',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'number',
      },
    ],
  },
  {
    type: 'eval',
    name: 'cosh',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.cosh', {
      defaultMessage: 'Returns the hyperbolic cosine of a number',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'number',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'number',
      },
    ],
  },
  {
    type: 'eval',
    name: 'date_diff',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.date_diff', {
      defaultMessage:
        'Subtract 2 dates and return their difference in multiples of a unit specified in the 1st argument',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'unit',
            type: 'string',
            optional: false,
          },
          {
            name: 'startTimestamp',
            type: 'date',
            optional: false,
          },
          {
            name: 'endTimestamp',
            type: 'date',
            optional: false,
          },
        ],
        returnType: 'number',
      },
    ],
  },
  {
    type: 'eval',
    name: 'date_extract',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.date_extract', {
      defaultMessage: 'Extracts parts of a date, like year, month, day, hour.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'datePart',
            type: 'string',
            optional: false,
          },
          {
            name: 'date',
            type: 'date',
            optional: false,
          },
        ],
        returnType: 'number',
      },
    ],
  },
  {
    type: 'eval',
    name: 'date_format',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.date_format', {
      defaultMessage: 'Returns a string representation of a date, in the provided format.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'dateFormat',
            type: 'string',
            optional: true,
          },
          {
            name: 'date',
            type: 'date',
            optional: false,
          },
        ],
        returnType: 'string',
      },
    ],
  },
  {
    type: 'eval',
    name: 'date_parse',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.date_parse', {
      defaultMessage: 'Parses a string into a date value',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'datePattern',
            type: 'string',
            optional: true,
          },
          {
            name: 'dateString',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'date',
      },
    ],
  },
  {
    type: 'eval',
    name: 'date_trunc',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.date_trunc', {
      defaultMessage: 'Rounds down a date to the closest interval.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'interval',
            type: 'string',
            optional: false,
          },
          {
            name: 'date',
            type: 'date',
            optional: false,
          },
        ],
        returnType: 'date',
      },
    ],
  },
  {
    type: 'eval',
    name: 'e',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.e', {
      defaultMessage: 'Euler’s number.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [],
        returnType: 'number',
      },
    ],
  },
  {
    type: 'eval',
    name: 'ends_with',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.ends_with', {
      defaultMessage:
        'Returns a boolean that indicates whether a keyword string ends with another string',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'str',
            type: 'string',
            optional: false,
          },
          {
            name: 'suffix',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'boolean',
      },
    ],
  },
  {
    type: 'eval',
    name: 'floor',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.floor', {
      defaultMessage: 'Round a number down to the nearest integer.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'number',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'number',
      },
    ],
  },
  {
    type: 'eval',
    name: 'greatest',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.greatest', {
      defaultMessage: 'Returns the maximum value from many columns.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'first',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'any',
        minParams: 1,
      },
      {
        params: [
          {
            name: 'first',
            type: 'boolean',
            optional: false,
          },
        ],
        returnType: 'any',
        minParams: 1,
      },
      {
        params: [
          {
            name: 'first',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'any',
        minParams: 1,
      },
      {
        params: [
          {
            name: 'first',
            type: 'ip',
            optional: false,
          },
        ],
        returnType: 'any',
        minParams: 1,
      },
      {
        params: [
          {
            name: 'first',
            type: 'version',
            optional: false,
          },
        ],
        returnType: 'any',
        minParams: 1,
      },
    ],
  },
  {
    type: 'eval',
    name: 'least',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.least', {
      defaultMessage: 'Returns the minimum value from many columns.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'first',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'any',
        minParams: 1,
      },
      {
        params: [
          {
            name: 'first',
            type: 'boolean',
            optional: false,
          },
        ],
        returnType: 'any',
        minParams: 1,
      },
      {
        params: [
          {
            name: 'first',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'any',
        minParams: 1,
      },
      {
        params: [
          {
            name: 'first',
            type: 'ip',
            optional: false,
          },
        ],
        returnType: 'any',
        minParams: 1,
      },
      {
        params: [
          {
            name: 'first',
            type: 'version',
            optional: false,
          },
        ],
        returnType: 'any',
        minParams: 1,
      },
    ],
  },
  {
    type: 'eval',
    name: 'left',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.left', {
      defaultMessage:
        "Returns the substring that extracts 'length' chars from 'string' starting from the left.",
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'string',
            type: 'string',
            optional: false,
          },
          {
            name: 'length',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'string',
      },
    ],
  },
  {
    type: 'eval',
    name: 'length',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.length', {
      defaultMessage: 'Returns the character length of a string.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'string',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'number',
      },
    ],
  },
  {
    type: 'eval',
    name: 'log',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.log', {
      defaultMessage: 'Returns the logarithm of a number to a base.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'base',
            type: 'number',
            optional: true,
          },
          {
            name: 'number',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'number',
      },
    ],
  },
  {
    type: 'eval',
    name: 'log10',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.log10', {
      defaultMessage: 'Returns the log base 10.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'number',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'number',
      },
    ],
  },
  {
    type: 'eval',
    name: 'ltrim',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.ltrim', {
      defaultMessage: 'Removes leading whitespaces from a string.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'string',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'string',
      },
    ],
  },
  {
    type: 'eval',
    name: 'mv_avg',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.mv_avg', {
      defaultMessage:
        'Converts a multivalued field into a single valued field containing the average of all of the values.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'number',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'number',
      },
    ],
  },
  {
    type: 'eval',
    name: 'mv_concat',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.mv_concat', {
      defaultMessage:
        'Reduce a multivalued string field to a single valued field by concatenating all values.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'string',
            type: 'string',
            optional: false,
          },
          {
            name: 'delim',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'string',
      },
    ],
  },
  {
    type: 'eval',
    name: 'mv_count',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.mv_count', {
      defaultMessage:
        'Reduce a multivalued field to a single valued field containing the count of values.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'field',
            type: 'boolean',
            optional: false,
          },
        ],
        returnType: 'number',
      },
      {
        params: [
          {
            name: 'field',
            type: 'cartesian_point',
            optional: false,
          },
        ],
        returnType: 'number',
      },
      {
        params: [
          {
            name: 'field',
            type: 'cartesian_shape',
            optional: false,
          },
        ],
        returnType: 'number',
      },
      {
        params: [
          {
            name: 'field',
            type: 'date',
            optional: false,
          },
        ],
        returnType: 'number',
      },
      {
        params: [
          {
            name: 'field',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'number',
      },
      {
        params: [
          {
            name: 'field',
            type: 'geo_point',
            optional: false,
          },
        ],
        returnType: 'number',
      },
      {
        params: [
          {
            name: 'field',
            type: 'geo_shape',
            optional: false,
          },
        ],
        returnType: 'number',
      },
      {
        params: [
          {
            name: 'field',
            type: 'ip',
            optional: false,
          },
        ],
        returnType: 'number',
      },
      {
        params: [
          {
            name: 'field',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'number',
      },
      {
        params: [
          {
            name: 'field',
            type: 'version',
            optional: false,
          },
        ],
        returnType: 'number',
      },
    ],
  },
  {
    type: 'eval',
    name: 'mv_dedupe',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.mv_dedupe', {
      defaultMessage: 'Remove duplicate values from a multivalued field.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'field',
            type: 'boolean',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'date',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'ip',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'version',
            optional: false,
          },
        ],
        returnType: 'any',
      },
    ],
  },
  {
    type: 'eval',
    name: 'mv_first',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.mv_first', {
      defaultMessage:
        'Reduce a multivalued field to a single valued field containing the first value.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'field',
            type: 'boolean',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'cartesian_point',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'cartesian_shape',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'date',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'geo_point',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'geo_shape',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'ip',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'version',
            optional: false,
          },
        ],
        returnType: 'any',
      },
    ],
  },
  {
    type: 'eval',
    name: 'mv_last',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.mv_last', {
      defaultMessage:
        'Reduce a multivalued field to a single valued field containing the last value.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'field',
            type: 'boolean',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'cartesian_point',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'cartesian_shape',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'date',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'geo_point',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'geo_shape',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'ip',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'version',
            optional: false,
          },
        ],
        returnType: 'any',
      },
    ],
  },
  {
    type: 'eval',
    name: 'mv_max',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.mv_max', {
      defaultMessage:
        'Reduce a multivalued field to a single valued field containing the maximum value.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'field',
            type: 'boolean',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'date',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'ip',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'version',
            optional: false,
          },
        ],
        returnType: 'any',
      },
    ],
  },
  {
    type: 'eval',
    name: 'mv_median',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.mv_median', {
      defaultMessage:
        'Converts a multivalued field into a single valued field containing the median value.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'number',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'number',
      },
    ],
  },
  {
    type: 'eval',
    name: 'mv_min',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.mv_min', {
      defaultMessage:
        'Reduce a multivalued field to a single valued field containing the minimum value.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'field',
            type: 'boolean',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'date',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'ip',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'version',
            optional: false,
          },
        ],
        returnType: 'any',
      },
    ],
  },
  {
    type: 'eval',
    name: 'mv_slice',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.mv_slice', {
      defaultMessage:
        'Returns a subset of the multivalued field using the start and end index values.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'field',
            type: 'boolean',
            optional: false,
          },
          {
            name: 'start',
            type: 'number',
            optional: false,
          },
          {
            name: 'end',
            type: 'number',
            optional: true,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'cartesian_point',
            optional: false,
          },
          {
            name: 'start',
            type: 'number',
            optional: false,
          },
          {
            name: 'end',
            type: 'number',
            optional: true,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'cartesian_shape',
            optional: false,
          },
          {
            name: 'start',
            type: 'number',
            optional: false,
          },
          {
            name: 'end',
            type: 'number',
            optional: true,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'date',
            optional: false,
          },
          {
            name: 'start',
            type: 'number',
            optional: false,
          },
          {
            name: 'end',
            type: 'number',
            optional: true,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'number',
            optional: false,
          },
          {
            name: 'start',
            type: 'number',
            optional: false,
          },
          {
            name: 'end',
            type: 'number',
            optional: true,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'geo_point',
            optional: false,
          },
          {
            name: 'start',
            type: 'number',
            optional: false,
          },
          {
            name: 'end',
            type: 'number',
            optional: true,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'geo_shape',
            optional: false,
          },
          {
            name: 'start',
            type: 'number',
            optional: false,
          },
          {
            name: 'end',
            type: 'number',
            optional: true,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'ip',
            optional: false,
          },
          {
            name: 'start',
            type: 'number',
            optional: false,
          },
          {
            name: 'end',
            type: 'number',
            optional: true,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'string',
            optional: false,
          },
          {
            name: 'start',
            type: 'number',
            optional: false,
          },
          {
            name: 'end',
            type: 'number',
            optional: true,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'version',
            optional: false,
          },
          {
            name: 'start',
            type: 'number',
            optional: false,
          },
          {
            name: 'end',
            type: 'number',
            optional: true,
          },
        ],
        returnType: 'any',
      },
    ],
  },
  {
    type: 'eval',
    name: 'mv_sort',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.mv_sort', {
      defaultMessage: 'Sorts a multivalued field in lexicographical order.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'field',
            type: 'boolean',
            optional: false,
          },
          {
            name: 'order',
            type: 'string',
            optional: true,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'date',
            optional: false,
          },
          {
            name: 'order',
            type: 'string',
            optional: true,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'number',
            optional: false,
          },
          {
            name: 'order',
            type: 'string',
            optional: true,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'ip',
            optional: false,
          },
          {
            name: 'order',
            type: 'string',
            optional: true,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'string',
            optional: false,
          },
          {
            name: 'order',
            type: 'string',
            optional: true,
          },
        ],
        returnType: 'any',
      },
      {
        params: [
          {
            name: 'field',
            type: 'version',
            optional: false,
          },
          {
            name: 'order',
            type: 'string',
            optional: true,
          },
        ],
        returnType: 'any',
      },
    ],
  },
  {
    type: 'eval',
    name: 'mv_sum',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.mv_sum', {
      defaultMessage:
        'Converts a multivalued field into a single valued field containing the sum of all of the values.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'number',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'number',
      },
    ],
  },
  {
    type: 'eval',
    name: 'mv_zip',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.mv_zip', {
      defaultMessage:
        'Combines the values from two multivalued fields with a delimiter that joins them together.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'string1',
            type: 'string',
            optional: false,
          },
          {
            name: 'string2',
            type: 'string',
            optional: false,
          },
          {
            name: 'delim',
            type: 'string',
            optional: true,
          },
        ],
        returnType: 'string',
      },
    ],
  },
  {
    type: 'eval',
    name: 'now',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.now', {
      defaultMessage: 'Returns current date and time.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [],
        returnType: 'date',
      },
    ],
  },
  {
    type: 'eval',
    name: 'pi',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.pi', {
      defaultMessage: 'The ratio of a circle’s circumference to its diameter.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [],
        returnType: 'number',
      },
    ],
  },
  {
    type: 'eval',
    name: 'pow',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.pow', {
      defaultMessage: 'Returns the value of a base raised to the power of an exponent.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'base',
            type: 'number',
            optional: false,
          },
          {
            name: 'exponent',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'number',
      },
    ],
  },
  {
    type: 'eval',
    name: 'replace',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.replace', {
      defaultMessage:
        'The function substitutes in the string any match of the regular expression with the replacement string.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'string',
            type: 'string',
            optional: false,
          },
          {
            name: 'regex',
            type: 'string',
            optional: false,
          },
          {
            name: 'newString',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'string',
      },
    ],
  },
  {
    type: 'eval',
    name: 'right',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.right', {
      defaultMessage:
        'Return the substring that extracts length chars from the string starting from the right.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'string',
            type: 'string',
            optional: false,
          },
          {
            name: 'length',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'string',
      },
    ],
  },
  {
    type: 'eval',
    name: 'round',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.round', {
      defaultMessage: 'Rounds a number to the closest number with the specified number of digits.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'number',
            type: 'number',
            optional: false,
          },
          {
            name: 'decimals',
            type: 'number',
            optional: true,
          },
        ],
        returnType: 'number',
      },
    ],
  },
  {
    type: 'eval',
    name: 'rtrim',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.rtrim', {
      defaultMessage: 'Removes trailing whitespaces from a string.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'string',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'string',
      },
    ],
  },
  {
    type: 'eval',
    name: 'sin',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.sin', {
      defaultMessage: 'Returns the trigonometric sine of an angle',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'number',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'number',
      },
    ],
  },
  {
    type: 'eval',
    name: 'sinh',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.sinh', {
      defaultMessage: 'Returns the hyperbolic sine of a number',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'number',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'number',
      },
    ],
  },
  {
    type: 'eval',
    name: 'split',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.split', {
      defaultMessage: 'Split a single valued string into multiple strings.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'string',
            type: 'string',
            optional: false,
          },
          {
            name: 'delim',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'string',
      },
    ],
  },
  {
    type: 'eval',
    name: 'sqrt',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.sqrt', {
      defaultMessage: 'Returns the square root of a number.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'number',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'number',
      },
    ],
  },
  {
    type: 'eval',
    name: 'st_intersects',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.st_intersects', {
      defaultMessage: 'Returns whether the two geometries or geometry columns intersect.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'geomA',
            type: 'geo_point',
            optional: false,
          },
          {
            name: 'geomB',
            type: 'geo_point',
            optional: false,
          },
        ],
        returnType: 'boolean',
      },
      {
        params: [
          {
            name: 'geomA',
            type: 'geo_point',
            optional: false,
          },
          {
            name: 'geomB',
            type: 'cartesian_point',
            optional: false,
          },
        ],
        returnType: 'boolean',
      },
      {
        params: [
          {
            name: 'geomA',
            type: 'geo_point',
            optional: false,
          },
          {
            name: 'geomB',
            type: 'geo_shape',
            optional: false,
          },
        ],
        returnType: 'boolean',
      },
      {
        params: [
          {
            name: 'geomA',
            type: 'geo_point',
            optional: false,
          },
          {
            name: 'geomB',
            type: 'cartesian_shape',
            optional: false,
          },
        ],
        returnType: 'boolean',
      },
      {
        params: [
          {
            name: 'geomA',
            type: 'cartesian_point',
            optional: false,
          },
          {
            name: 'geomB',
            type: 'geo_point',
            optional: false,
          },
        ],
        returnType: 'boolean',
      },
      {
        params: [
          {
            name: 'geomA',
            type: 'cartesian_point',
            optional: false,
          },
          {
            name: 'geomB',
            type: 'cartesian_point',
            optional: false,
          },
        ],
        returnType: 'boolean',
      },
      {
        params: [
          {
            name: 'geomA',
            type: 'cartesian_point',
            optional: false,
          },
          {
            name: 'geomB',
            type: 'geo_shape',
            optional: false,
          },
        ],
        returnType: 'boolean',
      },
      {
        params: [
          {
            name: 'geomA',
            type: 'cartesian_point',
            optional: false,
          },
          {
            name: 'geomB',
            type: 'cartesian_shape',
            optional: false,
          },
        ],
        returnType: 'boolean',
      },
      {
        params: [
          {
            name: 'geomA',
            type: 'geo_shape',
            optional: false,
          },
          {
            name: 'geomB',
            type: 'geo_point',
            optional: false,
          },
        ],
        returnType: 'boolean',
      },
      {
        params: [
          {
            name: 'geomA',
            type: 'geo_shape',
            optional: false,
          },
          {
            name: 'geomB',
            type: 'cartesian_point',
            optional: false,
          },
        ],
        returnType: 'boolean',
      },
      {
        params: [
          {
            name: 'geomA',
            type: 'geo_shape',
            optional: false,
          },
          {
            name: 'geomB',
            type: 'geo_shape',
            optional: false,
          },
        ],
        returnType: 'boolean',
      },
      {
        params: [
          {
            name: 'geomA',
            type: 'geo_shape',
            optional: false,
          },
          {
            name: 'geomB',
            type: 'cartesian_shape',
            optional: false,
          },
        ],
        returnType: 'boolean',
      },
      {
        params: [
          {
            name: 'geomA',
            type: 'cartesian_shape',
            optional: false,
          },
          {
            name: 'geomB',
            type: 'geo_point',
            optional: false,
          },
        ],
        returnType: 'boolean',
      },
      {
        params: [
          {
            name: 'geomA',
            type: 'cartesian_shape',
            optional: false,
          },
          {
            name: 'geomB',
            type: 'cartesian_point',
            optional: false,
          },
        ],
        returnType: 'boolean',
      },
      {
        params: [
          {
            name: 'geomA',
            type: 'cartesian_shape',
            optional: false,
          },
          {
            name: 'geomB',
            type: 'geo_shape',
            optional: false,
          },
        ],
        returnType: 'boolean',
      },
      {
        params: [
          {
            name: 'geomA',
            type: 'cartesian_shape',
            optional: false,
          },
          {
            name: 'geomB',
            type: 'cartesian_shape',
            optional: false,
          },
        ],
        returnType: 'boolean',
      },
    ],
  },
  {
    type: 'eval',
    name: 'st_x',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.st_x', {
      defaultMessage: 'Extracts the x-coordinate from a point geometry.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'point',
            type: 'geo_point',
            optional: false,
          },
        ],
        returnType: 'number',
      },
      {
        params: [
          {
            name: 'point',
            type: 'cartesian_point',
            optional: false,
          },
        ],
        returnType: 'number',
      },
    ],
  },
  {
    type: 'eval',
    name: 'st_y',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.st_y', {
      defaultMessage: 'Extracts the y-coordinate from a point geometry.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'point',
            type: 'geo_point',
            optional: false,
          },
        ],
        returnType: 'number',
      },
      {
        params: [
          {
            name: 'point',
            type: 'cartesian_point',
            optional: false,
          },
        ],
        returnType: 'number',
      },
    ],
  },
  {
    type: 'eval',
    name: 'starts_with',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.starts_with', {
      defaultMessage:
        'Returns a boolean that indicates whether a keyword string starts with another string',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'str',
            type: 'string',
            optional: false,
          },
          {
            name: 'prefix',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'boolean',
      },
    ],
  },
  {
    type: 'eval',
    name: 'substring',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.substring', {
      defaultMessage:
        'Returns a substring of a string, specified by a start position and an optional length',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'string',
            type: 'string',
            optional: false,
          },
          {
            name: 'start',
            type: 'number',
            optional: false,
          },
          {
            name: 'length',
            type: 'number',
            optional: true,
          },
        ],
        returnType: 'string',
      },
    ],
  },
  {
    type: 'eval',
    name: 'tan',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.tan', {
      defaultMessage: 'Returns the trigonometric tangent of an angle',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'number',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'number',
      },
    ],
  },
  {
    type: 'eval',
    name: 'tanh',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.tanh', {
      defaultMessage: 'Returns the hyperbolic tangent of a number',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'number',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'number',
      },
    ],
  },
  {
    type: 'eval',
    name: 'tau',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.tau', {
      defaultMessage: 'The ratio of a circle’s circumference to its radius.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [],
        returnType: 'number',
      },
    ],
  },
  {
    type: 'eval',
    name: 'to_boolean',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.to_boolean', {
      defaultMessage: 'Converts an input value to a boolean value.',
    }),
    alias: ['to_bool'],
    signatures: [
      {
        params: [
          {
            name: 'field',
            type: 'boolean',
            optional: false,
          },
        ],
        returnType: 'boolean',
      },
      {
        params: [
          {
            name: 'field',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'boolean',
      },
      {
        params: [
          {
            name: 'field',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'boolean',
      },
    ],
  },
  {
    type: 'eval',
    name: 'to_cartesianpoint',
    description: i18n.translate(
      'kbn-esql-validation-autocomplete.esql.definitions.to_cartesianpoint',
      { defaultMessage: 'Converts an input value to a point value.' }
    ),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'field',
            type: 'cartesian_point',
            optional: false,
          },
        ],
        returnType: 'cartesian_point',
      },
      {
        params: [
          {
            name: 'field',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'cartesian_point',
      },
    ],
  },
  {
    type: 'eval',
    name: 'to_cartesianshape',
    description: i18n.translate(
      'kbn-esql-validation-autocomplete.esql.definitions.to_cartesianshape',
      { defaultMessage: 'Converts an input value to a shape value.' }
    ),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'field',
            type: 'cartesian_point',
            optional: false,
          },
        ],
        returnType: 'cartesian_shape',
      },
      {
        params: [
          {
            name: 'field',
            type: 'cartesian_shape',
            optional: false,
          },
        ],
        returnType: 'cartesian_shape',
      },
      {
        params: [
          {
            name: 'field',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'cartesian_shape',
      },
    ],
  },
  {
    type: 'eval',
    name: 'to_datetime',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.to_datetime', {
      defaultMessage: 'Converts an input value to a date value.',
    }),
    alias: ['to_dt'],
    signatures: [
      {
        params: [
          {
            name: 'field',
            type: 'date',
            optional: false,
          },
        ],
        returnType: 'date',
      },
      {
        params: [
          {
            name: 'field',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'date',
      },
      {
        params: [
          {
            name: 'field',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'date',
      },
    ],
  },
  {
    type: 'eval',
    name: 'to_degrees',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.to_degrees', {
      defaultMessage: 'Converts a number in radians to degrees.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'number',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'number',
      },
    ],
  },
  {
    type: 'eval',
    name: 'to_double',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.to_double', {
      defaultMessage: 'Converts an input value to a double value.',
    }),
    alias: ['to_dbl'],
    signatures: [
      {
        params: [
          {
            name: 'field',
            type: 'boolean',
            optional: false,
          },
        ],
        returnType: 'number',
      },
      {
        params: [
          {
            name: 'field',
            type: 'date',
            optional: false,
          },
        ],
        returnType: 'number',
      },
      {
        params: [
          {
            name: 'field',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'number',
      },
      {
        params: [
          {
            name: 'field',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'number',
      },
    ],
  },
  {
    type: 'eval',
    name: 'to_geopoint',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.to_geopoint', {
      defaultMessage: 'Converts an input value to a geo_point value.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'field',
            type: 'geo_point',
            optional: false,
          },
        ],
        returnType: 'geo_point',
      },
      {
        params: [
          {
            name: 'field',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'geo_point',
      },
    ],
  },
  {
    type: 'eval',
    name: 'to_geoshape',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.to_geoshape', {
      defaultMessage: 'Converts an input value to a geo_shape value.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'field',
            type: 'geo_point',
            optional: false,
          },
        ],
        returnType: 'geo_shape',
      },
      {
        params: [
          {
            name: 'field',
            type: 'geo_shape',
            optional: false,
          },
        ],
        returnType: 'geo_shape',
      },
      {
        params: [
          {
            name: 'field',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'geo_shape',
      },
    ],
  },
  {
    type: 'eval',
    name: 'to_integer',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.to_integer', {
      defaultMessage: 'Converts an input value to an integer value.',
    }),
    alias: ['to_int'],
    signatures: [
      {
        params: [
          {
            name: 'field',
            type: 'boolean',
            optional: false,
          },
        ],
        returnType: 'number',
      },
      {
        params: [
          {
            name: 'field',
            type: 'date',
            optional: false,
          },
        ],
        returnType: 'number',
      },
      {
        params: [
          {
            name: 'field',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'number',
      },
      {
        params: [
          {
            name: 'field',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'number',
      },
    ],
  },
  {
    type: 'eval',
    name: 'to_ip',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.to_ip', {
      defaultMessage: 'Converts an input string to an IP value.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'field',
            type: 'ip',
            optional: false,
          },
        ],
        returnType: 'ip',
      },
      {
        params: [
          {
            name: 'field',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'ip',
      },
    ],
  },
  {
    type: 'eval',
    name: 'to_long',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.to_long', {
      defaultMessage: 'Converts an input value to a long value.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'field',
            type: 'boolean',
            optional: false,
          },
        ],
        returnType: 'number',
      },
      {
        params: [
          {
            name: 'field',
            type: 'date',
            optional: false,
          },
        ],
        returnType: 'number',
      },
      {
        params: [
          {
            name: 'field',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'number',
      },
      {
        params: [
          {
            name: 'field',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'number',
      },
    ],
  },
  {
    type: 'eval',
    name: 'to_lower',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.to_lower', {
      defaultMessage: 'Returns a new string representing the input string converted to lower case.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'str',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'string',
      },
    ],
  },
  {
    type: 'eval',
    name: 'to_radians',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.to_radians', {
      defaultMessage: 'Converts a number in degrees to radians.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'number',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'number',
      },
    ],
  },
  {
    type: 'eval',
    name: 'to_string',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.to_string', {
      defaultMessage: 'Converts a field into a string.',
    }),
    alias: ['to_str'],
    signatures: [
      {
        params: [
          {
            name: 'field',
            type: 'boolean',
            optional: false,
          },
        ],
        returnType: 'string',
      },
      {
        params: [
          {
            name: 'field',
            type: 'cartesian_point',
            optional: false,
          },
        ],
        returnType: 'string',
      },
      {
        params: [
          {
            name: 'field',
            type: 'cartesian_shape',
            optional: false,
          },
        ],
        returnType: 'string',
      },
      {
        params: [
          {
            name: 'field',
            type: 'date',
            optional: false,
          },
        ],
        returnType: 'string',
      },
      {
        params: [
          {
            name: 'field',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'string',
      },
      {
        params: [
          {
            name: 'field',
            type: 'geo_point',
            optional: false,
          },
        ],
        returnType: 'string',
      },
      {
        params: [
          {
            name: 'field',
            type: 'geo_shape',
            optional: false,
          },
        ],
        returnType: 'string',
      },
      {
        params: [
          {
            name: 'field',
            type: 'ip',
            optional: false,
          },
        ],
        returnType: 'string',
      },
      {
        params: [
          {
            name: 'field',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'string',
      },
      {
        params: [
          {
            name: 'field',
            type: 'version',
            optional: false,
          },
        ],
        returnType: 'string',
      },
    ],
  },
  {
    type: 'eval',
    name: 'to_unsigned_long',
    description: i18n.translate(
      'kbn-esql-validation-autocomplete.esql.definitions.to_unsigned_long',
      { defaultMessage: 'Converts an input value to an unsigned long value.' }
    ),
    alias: ['to_ul', 'to_ulong'],
    signatures: [
      {
        params: [
          {
            name: 'field',
            type: 'boolean',
            optional: false,
          },
        ],
        returnType: 'number',
      },
      {
        params: [
          {
            name: 'field',
            type: 'date',
            optional: false,
          },
        ],
        returnType: 'number',
      },
      {
        params: [
          {
            name: 'field',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'number',
      },
      {
        params: [
          {
            name: 'field',
            type: 'number',
            optional: false,
          },
        ],
        returnType: 'number',
      },
    ],
  },
  {
    type: 'eval',
    name: 'to_upper',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.to_upper', {
      defaultMessage: 'Returns a new string representing the input string converted to upper case.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'str',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'string',
      },
    ],
  },
  {
    type: 'eval',
    name: 'to_version',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.to_version', {
      defaultMessage: 'Converts an input string to a version value.',
    }),
    alias: ['to_ver'],
    signatures: [
      {
        params: [
          {
            name: 'field',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'version',
      },
      {
        params: [
          {
            name: 'field',
            type: 'version',
            optional: false,
          },
        ],
        returnType: 'version',
      },
    ],
  },
  {
    type: 'eval',
    name: 'trim',
    description: i18n.translate('kbn-esql-validation-autocomplete.esql.definitions.trim', {
      defaultMessage: 'Removes leading and trailing whitespaces from a string.',
    }),
    alias: undefined,
    signatures: [
      {
        params: [
          {
            name: 'string',
            type: 'string',
            optional: false,
          },
        ],
        returnType: 'string',
      },
    ],
  },
];
