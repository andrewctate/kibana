/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const writeFile = require('fs/promises').writeFile;
const join = require('path').join;

const showFunctionsOutput = {
  columns: [
    {
      name: 'name',
      type: 'keyword',
    },
    {
      name: 'synopsis',
      type: 'keyword',
    },
    {
      name: 'argNames',
      type: 'keyword',
    },
    {
      name: 'argTypes',
      type: 'keyword',
    },
    {
      name: 'argDescriptions',
      type: 'keyword',
    },
    {
      name: 'returnType',
      type: 'keyword',
    },
    {
      name: 'description',
      type: 'keyword',
    },
    {
      name: 'optionalArgs',
      type: 'boolean',
    },
    {
      name: 'variadic',
      type: 'boolean',
    },
    {
      name: 'isAggregation',
      type: 'boolean',
    },
  ],
  values: [
    [
      'abs',
      'double|integer|long|unsigned_long abs(n:double|integer|long|unsigned_long)',
      'n',
      'double|integer|long|unsigned_long',
      '',
      'double|integer|long|unsigned_long',
      'Returns the absolute value.',
      false,
      false,
      false,
    ],
    [
      'acos',
      'double acos(n:double|integer|long|unsigned_long)',
      'n',
      'double|integer|long|unsigned_long',
      '',
      'double',
      'The arccosine of an angle, expressed in radians.',
      false,
      false,
      false,
    ],
    [
      'asin',
      'double asin(n:double|integer|long|unsigned_long)',
      'n',
      'double|integer|long|unsigned_long',
      '',
      'double',
      'Inverse sine trigonometric function.',
      false,
      false,
      false,
    ],
    [
      'atan',
      'double atan(n:double|integer|long|unsigned_long)',
      'n',
      'double|integer|long|unsigned_long',
      '',
      'double',
      'Inverse tangent trigonometric function.',
      false,
      false,
      false,
    ],
    [
      'atan2',
      'double atan2(y:double|integer|long|unsigned_long, x:double|integer|long|unsigned_long)',
      ['y', 'x'],
      ['double|integer|long|unsigned_long', 'double|integer|long|unsigned_long'],
      ['', ''],
      'double',
      'The angle between the positive x-axis and the ray from the origin to the point (x , y) in the Cartesian plane.',
      [false, false],
      false,
      false,
    ],
    [
      'auto_bucket',
      'double|date auto_bucket(field:integer|long|double|date, buckets:integer, from:integer|long|double|date|string, to:integer|long|double|date|string)',
      ['field', 'buckets', 'from', 'to'],
      [
        'integer|long|double|date',
        'integer',
        'integer|long|double|date|string',
        'integer|long|double|date|string',
      ],
      ['', '', '', ''],
      'double|date',
      'Creates human-friendly buckets and returns a datetime value for each row that corresponds to the resulting bucket the row falls into.',
      [false, false, false, false],
      false,
      false,
    ],
    [
      'avg',
      'double avg(field:double|integer|long)',
      'field',
      'double|integer|long',
      '',
      'double',
      'The average of a numeric field.',
      false,
      false,
      true,
    ],
    [
      'case',
      'boolean|cartesian_point|date|double|geo_point|integer|ip|keyword|long|text|unsigned_long|version case(condition:boolean, rest...:boolean|cartesian_point|date|double|geo_point|integer|ip|keyword|long|text|unsigned_long|version)',
      ['condition', 'rest'],
      [
        'boolean',
        'boolean|cartesian_point|date|double|geo_point|integer|ip|keyword|long|text|unsigned_long|version',
      ],
      ['', ''],
      'boolean|cartesian_point|date|double|geo_point|integer|ip|keyword|long|text|unsigned_long|version',
      'Accepts pairs of conditions and values. The function returns the value that belongs to the first condition that evaluates to true.',
      [false, false],
      true,
      false,
    ],
    [
      'ceil',
      'double|integer|long|unsigned_long ceil(n:double|integer|long|unsigned_long)',
      'n',
      'double|integer|long|unsigned_long',
      '',
      'double|integer|long|unsigned_long',
      'Round a number up to the nearest integer.',
      false,
      false,
      false,
    ],
    [
      'cidr_match',
      'boolean cidr_match(ip:ip, blockX...:keyword)',
      ['ip', 'blockX'],
      ['ip', 'keyword'],
      ['', 'CIDR block to test the IP against.'],
      'boolean',
      'Returns true if the provided IP is contained in one of the provided CIDR blocks.',
      [false, false],
      true,
      false,
    ],
    [
      'coalesce',
      'boolean|text|integer|keyword|long coalesce(expression:boolean|text|integer|keyword|long, expressionX...:boolean|text|integer|keyword|long)',
      ['expression', 'expressionX'],
      ['boolean|text|integer|keyword|long', 'boolean|text|integer|keyword|long'],
      ['Expression to evaluate', 'Other expression to evaluate'],
      'boolean|text|integer|keyword|long',
      'Returns the first of its arguments that is not null.',
      [false, false],
      true,
      false,
    ],
    [
      'concat',
      'keyword concat(first:keyword|text, rest...:keyword|text)',
      ['first', 'rest'],
      ['keyword|text', 'keyword|text'],
      ['', ''],
      'keyword',
      'Concatenates two or more strings.',
      [false, false],
      true,
      false,
    ],
    [
      'cos',
      'double cos(n:double|integer|long|unsigned_long)',
      'n',
      'double|integer|long|unsigned_long',
      'An angle, in radians',
      'double',
      'Returns the trigonometric cosine of an angle',
      false,
      false,
      false,
    ],
    [
      'cosh',
      'double cosh(n:double|integer|long|unsigned_long)',
      'n',
      'double|integer|long|unsigned_long',
      "The number who's hyperbolic cosine is to be returned",
      'double',
      'Returns the hyperbolic cosine of a number',
      false,
      false,
      false,
    ],
    [
      'count',
      'long count(?field:boolean|cartesian_point|date|double|geo_point|integer|ip|keyword|long|text|unsigned_long|version)',
      'field',
      'boolean|cartesian_point|date|double|geo_point|integer|ip|keyword|long|text|unsigned_long|version',
      'Column or literal for which to count the number of values.',
      'long',
      'Returns the total number (count) of input values.',
      true,
      false,
      true,
    ],
    [
      'count_distinct',
      'long count_distinct(field:boolean|cartesian_point|date|double|geo_point|integer|ip|keyword|long|text|version, ?precision:integer)',
      ['field', 'precision'],
      [
        'boolean|cartesian_point|date|double|geo_point|integer|ip|keyword|long|text|version',
        'integer',
      ],
      ['Column or literal for which to count the number of distinct values.', ''],
      'long',
      'Returns the approximate number of distinct values.',
      [false, true],
      false,
      true,
    ],
    [
      'date_diff',
      'integer date_diff(unit:keyword|text, startTimestamp:date, endTimestamp:date)',
      ['unit', 'startTimestamp', 'endTimestamp'],
      ['keyword|text', 'date', 'date'],
      [
        'A valid date unit',
        'A string representing a start timestamp',
        'A string representing an end timestamp',
      ],
      'integer',
      'Subtract 2 dates and return their difference in multiples of a unit specified in the 1st argument',
      [false, false, false],
      false,
      false,
    ],
    [
      'date_extract',
      'long date_extract(date_part:keyword, field:date)',
      ['date_part', 'field'],
      ['keyword', 'date'],
      [
        'Part of the date to extract. Can be: aligned_day_of_week_in_month; aligned_day_of_week_in_year; aligned_week_of_month; aligned_week_of_year; ampm_of_day; clock_hour_of_ampm; clock_hour_of_day; day_of_month; day_of_week; day_of_year; epoch_day; era; hour_of_ampm; hour_of_day; instant_seconds; micro_of_day; micro_of_second; milli_of_day; milli_of_second; minute_of_day; minute_of_hour; month_of_year; nano_of_day; nano_of_second; offset_seconds; proleptic_month; second_of_day; second_of_minute; year; or year_of_era.',
        'Date expression',
      ],
      'long',
      'Extracts parts of a date, like year, month, day, hour.',
      [false, false],
      false,
      false,
    ],
    [
      'date_format',
      'keyword date_format(?format:keyword, date:date)',
      ['format', 'date'],
      ['keyword', 'date'],
      ['A valid date pattern', 'Date expression'],
      'keyword',
      'Returns a string representation of a date, in the provided format.',
      [true, false],
      false,
      false,
    ],
    [
      'date_parse',
      'date date_parse(?datePattern:keyword, dateString:keyword|text)',
      ['datePattern', 'dateString'],
      ['keyword', 'keyword|text'],
      ['A valid date pattern', 'A string representing a date'],
      'date',
      'Parses a string into a date value',
      [true, false],
      false,
      false,
    ],
    [
      'date_trunc',
      'date date_trunc(interval:keyword, date:date)',
      ['interval', 'date'],
      ['keyword', 'date'],
      ['Interval; expressed using the timespan literal syntax.', 'Date expression'],
      'date',
      'Rounds down a date to the closest interval.',
      [false, false],
      false,
      false,
    ],
    ['e', 'double e()', null, null, null, 'double', 'Euler’s number.', null, false, false],
    [
      'ends_with',
      'boolean ends_with(str:keyword|text, suffix:keyword|text)',
      ['str', 'suffix'],
      ['keyword|text', 'keyword|text'],
      ['', ''],
      'boolean',
      'Returns a boolean that indicates whether a keyword string ends with another string',
      [false, false],
      false,
      false,
    ],
    [
      'floor',
      'double|integer|long|unsigned_long floor(n:double|integer|long|unsigned_long)',
      'n',
      'double|integer|long|unsigned_long',
      '',
      'double|integer|long|unsigned_long',
      'Round a number down to the nearest integer.',
      false,
      false,
      false,
    ],
    [
      'greatest',
      'integer|long|double|boolean|keyword|text|ip|version greatest(first:integer|long|double|boolean|keyword|text|ip|version, rest...:integer|long|double|boolean|keyword|text|ip|version)',
      ['first', 'rest'],
      [
        'integer|long|double|boolean|keyword|text|ip|version',
        'integer|long|double|boolean|keyword|text|ip|version',
      ],
      ['', ''],
      'integer|long|double|boolean|keyword|text|ip|version',
      'Returns the maximum value from many columns.',
      [false, false],
      true,
      false,
    ],
    [
      'least',
      'integer|long|double|boolean|keyword|text|ip|version least(first:integer|long|double|boolean|keyword|text|ip|version, rest...:integer|long|double|boolean|keyword|text|ip|version)',
      ['first', 'rest'],
      [
        'integer|long|double|boolean|keyword|text|ip|version',
        'integer|long|double|boolean|keyword|text|ip|version',
      ],
      ['', ''],
      'integer|long|double|boolean|keyword|text|ip|version',
      'Returns the minimum value from many columns.',
      [false, false],
      true,
      false,
    ],
    [
      'left',
      'keyword left(str:keyword|text, length:integer)',
      ['str', 'length'],
      ['keyword|text', 'integer'],
      ['', ''],
      'keyword',
      'Return the substring that extracts length chars from the string starting from the left.',
      [false, false],
      false,
      false,
    ],
    [
      'length',
      'integer length(str:keyword|text)',
      'str',
      'keyword|text',
      '',
      'integer',
      'Returns the character length of a string.',
      false,
      false,
      false,
    ],
    [
      'log',
      'double log(?base:integer|unsigned_long|long|double, value:integer|unsigned_long|long|double)',
      ['base', 'value'],
      ['integer|unsigned_long|long|double', 'integer|unsigned_long|long|double'],
      ['', ''],
      'double',
      'Returns the logarithm of a value to a base.',
      [true, false],
      false,
      false,
    ],
    [
      'log10',
      'double log10(n:double|integer|long|unsigned_long)',
      'n',
      'double|integer|long|unsigned_long',
      '',
      'double',
      'Returns the log base 10.',
      false,
      false,
      false,
    ],
    [
      'ltrim',
      'keyword|text ltrim(str:keyword|text)',
      'str',
      'keyword|text',
      '',
      'keyword|text',
      'Removes leading whitespaces from a string.',
      false,
      false,
      false,
    ],
    [
      'max',
      'double|integer|long max(field:double|integer|long)',
      'field',
      'double|integer|long',
      '',
      'double|integer|long',
      'The maximum value of a numeric field.',
      false,
      false,
      true,
    ],
    [
      'median',
      'double|integer|long median(field:double|integer|long)',
      'field',
      'double|integer|long',
      '',
      'double|integer|long',
      'The value that is greater than half of all values and less than half of all values.',
      false,
      false,
      true,
    ],
    [
      'median_absolute_deviation',
      'double|integer|long median_absolute_deviation(field:double|integer|long)',
      'field',
      'double|integer|long',
      '',
      'double|integer|long',
      'The median absolute deviation, a measure of variability.',
      false,
      false,
      true,
    ],
    [
      'min',
      'double|integer|long min(field:double|integer|long)',
      'field',
      'double|integer|long',
      '',
      'double|integer|long',
      'The minimum value of a numeric field.',
      false,
      false,
      true,
    ],
    [
      'mv_avg',
      'double mv_avg(field:double|integer|long|unsigned_long)',
      'field',
      'double|integer|long|unsigned_long',
      '',
      'double',
      'Converts a multivalued field into a single valued field containing the average of all of the values.',
      false,
      false,
      false,
    ],
    [
      'mv_concat',
      'keyword mv_concat(v:text|keyword, delim:text|keyword)',
      ['v', 'delim'],
      ['text|keyword', 'text|keyword'],
      ['values to join', 'delimiter'],
      'keyword',
      'Reduce a multivalued string field to a single valued field by concatenating all values.',
      [false, false],
      false,
      false,
    ],
    [
      'mv_count',
      'integer mv_count(v:boolean|cartesian_point|cartesian_shape|date|double|geo_point|geo_shape|integer|ip|keyword|long|text|unsigned_long|version)',
      'v',
      'boolean|cartesian_point|cartesian_shape|date|double|geo_point|geo_shape|integer|ip|keyword|long|text|unsigned_long|version',
      '',
      'integer',
      'Reduce a multivalued field to a single valued field containing the count of values.',
      false,
      false,
      false,
    ],
    [
      'mv_dedupe',
      'boolean|date|double|integer|ip|keyword|long|text|version mv_dedupe(v:boolean|date|double|integer|ip|keyword|long|text|version)',
      'v',
      'boolean|date|double|integer|ip|keyword|long|text|version',
      '',
      'boolean|date|double|integer|ip|keyword|long|text|version',
      'Remove duplicate values from a multivalued field.',
      false,
      false,
      false,
    ],
    [
      'mv_first',
      'boolean|cartesian_point|cartesian_shape|date|double|geo_point|geo_shape|integer|ip|keyword|long|text|unsigned_long|version mv_first(v:boolean|cartesian_point|cartesian_shape|date|double|geo_point|geo_shape|integer|ip|keyword|long|text|unsigned_long|version)',
      'v',
      'boolean|cartesian_point|cartesian_shape|date|double|geo_point|geo_shape|integer|ip|keyword|long|text|unsigned_long|version',
      '',
      'boolean|cartesian_point|cartesian_shape|date|double|geo_point|geo_shape|integer|ip|keyword|long|text|unsigned_long|version',
      'Reduce a multivalued field to a single valued field containing the first value.',
      false,
      false,
      false,
    ],
    [
      'mv_last',
      'boolean|cartesian_point|cartesian_shape|date|double|geo_point|geo_shape|integer|ip|keyword|long|text|unsigned_long|version mv_last(v:boolean|cartesian_point|cartesian_shape|date|double|geo_point|geo_shape|integer|ip|keyword|long|text|unsigned_long|version)',
      'v',
      'boolean|cartesian_point|cartesian_shape|date|double|geo_point|geo_shape|integer|ip|keyword|long|text|unsigned_long|version',
      '',
      'boolean|cartesian_point|cartesian_shape|date|double|geo_point|geo_shape|integer|ip|keyword|long|text|unsigned_long|version',
      'Reduce a multivalued field to a single valued field containing the last value.',
      false,
      false,
      false,
    ],
    [
      'mv_max',
      'boolean|date|double|integer|ip|keyword|long|text|unsigned_long|version mv_max(v:boolean|date|double|integer|ip|keyword|long|text|unsigned_long|version)',
      'v',
      'boolean|date|double|integer|ip|keyword|long|text|unsigned_long|version',
      '',
      'boolean|date|double|integer|ip|keyword|long|text|unsigned_long|version',
      'Reduce a multivalued field to a single valued field containing the maximum value.',
      false,
      false,
      false,
    ],
    [
      'mv_median',
      'double|integer|long|unsigned_long mv_median(v:double|integer|long|unsigned_long)',
      'v',
      'double|integer|long|unsigned_long',
      '',
      'double|integer|long|unsigned_long',
      'Converts a multivalued field into a single valued field containing the median value.',
      false,
      false,
      false,
    ],
    [
      'mv_min',
      'boolean|date|double|integer|ip|keyword|long|text|unsigned_long|version mv_min(v:boolean|date|double|integer|ip|keyword|long|text|unsigned_long|version)',
      'v',
      'boolean|date|double|integer|ip|keyword|long|text|unsigned_long|version',
      '',
      'boolean|date|double|integer|ip|keyword|long|text|unsigned_long|version',
      'Reduce a multivalued field to a single valued field containing the minimum value.',
      false,
      false,
      false,
    ],
    [
      'mv_sum',
      'double|integer|long|unsigned_long mv_sum(v:double|integer|long|unsigned_long)',
      'v',
      'double|integer|long|unsigned_long',
      '',
      'double|integer|long|unsigned_long',
      'Converts a multivalued field into a single valued field containing the sum of all of the values.',
      false,
      false,
      false,
    ],
    [
      'now',
      'date now()',
      null,
      null,
      null,
      'date',
      'Returns current date and time.',
      null,
      false,
      false,
    ],
    [
      'percentile',
      'double|integer|long percentile(field:double|integer|long, percentile:double|integer|long)',
      ['field', 'percentile'],
      ['double|integer|long', 'double|integer|long'],
      ['', ''],
      'double|integer|long',
      'The value at which a certain percentage of observed values occur.',
      [false, false],
      false,
      true,
    ],
    [
      'pi',
      'double pi()',
      null,
      null,
      null,
      'double',
      'The ratio of a circle’s circumference to its diameter.',
      null,
      false,
      false,
    ],
    [
      'pow',
      'double pow(base:double|integer|long|unsigned_long, exponent:double|integer|long|unsigned_long)',
      ['base', 'exponent'],
      ['double|integer|long|unsigned_long', 'double|integer|long|unsigned_long'],
      ['', ''],
      'double',
      'Returns the value of a base raised to the power of an exponent.',
      [false, false],
      false,
      false,
    ],
    [
      'replace',
      'keyword replace(str:keyword|text, regex:keyword|text, newStr:keyword|text)',
      ['str', 'regex', 'newStr'],
      ['keyword|text', 'keyword|text', 'keyword|text'],
      ['', '', ''],
      'keyword',
      'The function substitutes in the string any match of the regular expression with the replacement string.',
      [false, false, false],
      false,
      false,
    ],
    [
      'right',
      'keyword right(str:keyword|text, length:integer)',
      ['str', 'length'],
      ['keyword|text', 'integer'],
      ['', ''],
      'keyword',
      'Return the substring that extracts length chars from the string starting from the right.',
      [false, false],
      false,
      false,
    ],
    [
      'round',
      'double round(value:double, ?decimals:integer)',
      ['value', 'decimals'],
      ['double', 'integer'],
      ['The numeric value to round', 'The number of decimal places to round to. Defaults to 0.'],
      'double',
      'Rounds a number to the closest number with the specified number of digits.',
      [false, true],
      false,
      false,
    ],
    [
      'rtrim',
      'keyword|text rtrim(str:keyword|text)',
      'str',
      'keyword|text',
      '',
      'keyword|text',
      'Removes trailing whitespaces from a string.',
      false,
      false,
      false,
    ],
    [
      'sin',
      'double sin(n:double|integer|long|unsigned_long)',
      'n',
      'double|integer|long|unsigned_long',
      'An angle, in radians',
      'double',
      'Returns the trigonometric sine of an angle',
      false,
      false,
      false,
    ],
    [
      'sinh',
      'double sinh(n:double|integer|long|unsigned_long)',
      'n',
      'double|integer|long|unsigned_long',
      'The number to return the hyperbolic sine of',
      'double',
      'Returns the hyperbolic sine of a number',
      false,
      false,
      false,
    ],
    [
      'split',
      'keyword split(str:keyword|text, delim:keyword|text)',
      ['str', 'delim'],
      ['keyword|text', 'keyword|text'],
      ['', ''],
      'keyword',
      'Split a single valued string into multiple strings.',
      [false, false],
      false,
      false,
    ],
    [
      'sqrt',
      'double sqrt(n:double|integer|long|unsigned_long)',
      'n',
      'double|integer|long|unsigned_long',
      '',
      'double',
      'Returns the square root of a number.',
      false,
      false,
      false,
    ],
    [
      'st_centroid',
      'geo_point|cartesian_point st_centroid(field:geo_point|cartesian_point)',
      'field',
      'geo_point|cartesian_point',
      '',
      'geo_point|cartesian_point',
      'The centroid of a spatial field.',
      false,
      false,
      true,
    ],
    [
      'starts_with',
      'boolean starts_with(str:keyword|text, prefix:keyword|text)',
      ['str', 'prefix'],
      ['keyword|text', 'keyword|text'],
      ['', ''],
      'boolean',
      'Returns a boolean that indicates whether a keyword string starts with another string',
      [false, false],
      false,
      false,
    ],
    [
      'substring',
      'keyword substring(str:keyword|text, start:integer, ?length:integer)',
      ['str', 'start', 'length'],
      ['keyword|text', 'integer', 'integer'],
      ['', '', ''],
      'keyword',
      'Returns a substring of a string, specified by a start position and an optional length',
      [false, false, true],
      false,
      false,
    ],
    [
      'sum',
      'long sum(field:double|integer|long)',
      'field',
      'double|integer|long',
      '',
      'long',
      'The sum of a numeric field.',
      false,
      false,
      true,
    ],
    [
      'tan',
      'double tan(n:double|integer|long|unsigned_long)',
      'n',
      'double|integer|long|unsigned_long',
      'An angle, in radians',
      'double',
      'Returns the trigonometric tangent of an angle',
      false,
      false,
      false,
    ],
    [
      'tanh',
      'double tanh(n:double|integer|long|unsigned_long)',
      'n',
      'double|integer|long|unsigned_long',
      'The number to return the hyperbolic tangent of',
      'double',
      'Returns the hyperbolic tangent of a number',
      false,
      false,
      false,
    ],
    [
      'tau',
      'double tau()',
      null,
      null,
      null,
      'double',
      'The ratio of a circle’s circumference to its radius.',
      null,
      false,
      false,
    ],
    [
      'to_bool',
      'boolean to_bool(v:boolean|keyword|text|double|long|unsigned_long|integer)',
      'v',
      'boolean|keyword|text|double|long|unsigned_long|integer',
      '',
      'boolean',
      'Converts an input value to a boolean value.',
      false,
      false,
      false,
    ],
    [
      'to_boolean',
      'boolean to_boolean(v:boolean|keyword|text|double|long|unsigned_long|integer)',
      'v',
      'boolean|keyword|text|double|long|unsigned_long|integer',
      '',
      'boolean',
      'Converts an input value to a boolean value.',
      false,
      false,
      false,
    ],
    [
      'to_cartesianpoint',
      'cartesian_point to_cartesianpoint(v:cartesian_point|keyword|text)',
      'v',
      'cartesian_point|keyword|text',
      '',
      'cartesian_point',
      'Converts an input value to a point value.',
      false,
      false,
      false,
    ],
    [
      'to_cartesianshape',
      'cartesian_shape to_cartesianshape(v:cartesian_point|cartesian_shape|keyword|text)',
      'v',
      'cartesian_point|cartesian_shape|keyword|text',
      '',
      'cartesian_shape',
      'Converts an input value to a shape value.',
      false,
      false,
      false,
    ],
    [
      'to_datetime',
      'date to_datetime(v:date|keyword|text|double|long|unsigned_long|integer)',
      'v',
      'date|keyword|text|double|long|unsigned_long|integer',
      '',
      'date',
      'Converts an input value to a date value.',
      false,
      false,
      false,
    ],
    [
      'to_dbl',
      'double to_dbl(v:boolean|date|keyword|text|double|long|unsigned_long|integer)',
      'v',
      'boolean|date|keyword|text|double|long|unsigned_long|integer',
      '',
      'double',
      'Converts an input value to a double value.',
      false,
      false,
      false,
    ],
    [
      'to_degrees',
      'double to_degrees(v:double|integer|long|unsigned_long)',
      'v',
      'double|integer|long|unsigned_long',
      '',
      'double',
      'Converts a number in radians to degrees.',
      false,
      false,
      false,
    ],
    [
      'to_double',
      'double to_double(v:boolean|date|keyword|text|double|long|unsigned_long|integer)',
      'v',
      'boolean|date|keyword|text|double|long|unsigned_long|integer',
      '',
      'double',
      'Converts an input value to a double value.',
      false,
      false,
      false,
    ],
    [
      'to_dt',
      'date to_dt(v:date|keyword|text|double|long|unsigned_long|integer)',
      'v',
      'date|keyword|text|double|long|unsigned_long|integer',
      '',
      'date',
      'Converts an input value to a date value.',
      false,
      false,
      false,
    ],
    [
      'to_geopoint',
      'geo_point to_geopoint(v:geo_point|keyword|text)',
      'v',
      'geo_point|keyword|text',
      '',
      'geo_point',
      'Converts an input value to a geo_point value.',
      false,
      false,
      false,
    ],
    [
      'to_geoshape',
      'geo_shape to_geoshape(v:geo_point|geo_shape|keyword|text)',
      'v',
      'geo_point|geo_shape|keyword|text',
      '',
      'geo_shape',
      'Converts an input value to a geo_shape value.',
      false,
      false,
      false,
    ],
    [
      'to_int',
      'integer to_int(v:boolean|date|keyword|text|double|long|unsigned_long|integer)',
      'v',
      'boolean|date|keyword|text|double|long|unsigned_long|integer',
      '',
      'integer',
      'Converts an input value to an integer value.',
      false,
      false,
      false,
    ],
    [
      'to_integer',
      'integer to_integer(v:boolean|date|keyword|text|double|long|unsigned_long|integer)',
      'v',
      'boolean|date|keyword|text|double|long|unsigned_long|integer',
      '',
      'integer',
      'Converts an input value to an integer value.',
      false,
      false,
      false,
    ],
    [
      'to_ip',
      'ip to_ip(v:ip|keyword|text)',
      'v',
      'ip|keyword|text',
      '',
      'ip',
      'Converts an input string to an IP value.',
      false,
      false,
      false,
    ],
    [
      'to_long',
      'long to_long(v:boolean|date|keyword|text|double|long|unsigned_long|integer)',
      'v',
      'boolean|date|keyword|text|double|long|unsigned_long|integer',
      '',
      'long',
      'Converts an input value to a long value.',
      false,
      false,
      false,
    ],
    [
      'to_lower',
      'keyword|text to_lower(str:keyword|text)',
      'str',
      'keyword|text',
      'The input string',
      'keyword|text',
      'Returns a new string representing the input string converted to lower case.',
      false,
      false,
      false,
    ],
    [
      'to_radians',
      'double to_radians(v:double|integer|long|unsigned_long)',
      'v',
      'double|integer|long|unsigned_long',
      '',
      'double',
      'Converts a number in degrees to radians.',
      false,
      false,
      false,
    ],
    [
      'to_str',
      'keyword to_str(v:boolean|cartesian_point|cartesian_shape|date|double|geo_point|geo_shape|integer|ip|keyword|long|text|unsigned_long|version)',
      'v',
      'boolean|cartesian_point|cartesian_shape|date|double|geo_point|geo_shape|integer|ip|keyword|long|text|unsigned_long|version',
      '',
      'keyword',
      'Converts a field into a string.',
      false,
      false,
      false,
    ],
    [
      'to_string',
      'keyword to_string(v:boolean|cartesian_point|cartesian_shape|date|double|geo_point|geo_shape|integer|ip|keyword|long|text|unsigned_long|version)',
      'v',
      'boolean|cartesian_point|cartesian_shape|date|double|geo_point|geo_shape|integer|ip|keyword|long|text|unsigned_long|version',
      '',
      'keyword',
      'Converts a field into a string.',
      false,
      false,
      false,
    ],
    [
      'to_ul',
      'unsigned_long to_ul(v:boolean|date|keyword|text|double|long|unsigned_long|integer)',
      'v',
      'boolean|date|keyword|text|double|long|unsigned_long|integer',
      '',
      'unsigned_long',
      'Converts an input value to an unsigned long value.',
      false,
      false,
      false,
    ],
    [
      'to_ulong',
      'unsigned_long to_ulong(v:boolean|date|keyword|text|double|long|unsigned_long|integer)',
      'v',
      'boolean|date|keyword|text|double|long|unsigned_long|integer',
      '',
      'unsigned_long',
      'Converts an input value to an unsigned long value.',
      false,
      false,
      false,
    ],
    [
      'to_unsigned_long',
      'unsigned_long to_unsigned_long(v:boolean|date|keyword|text|double|long|unsigned_long|integer)',
      'v',
      'boolean|date|keyword|text|double|long|unsigned_long|integer',
      '',
      'unsigned_long',
      'Converts an input value to an unsigned long value.',
      false,
      false,
      false,
    ],
    [
      'to_upper',
      'keyword|text to_upper(str:keyword|text)',
      'str',
      'keyword|text',
      'The input string',
      'keyword|text',
      'Returns a new string representing the input string converted to upper case.',
      false,
      false,
      false,
    ],
    [
      'to_ver',
      'version to_ver(v:keyword|text|version)',
      'v',
      'keyword|text|version',
      '',
      'version',
      'Converts an input string to a version value.',
      false,
      false,
      false,
    ],
    [
      'to_version',
      'version to_version(v:keyword|text|version)',
      'v',
      'keyword|text|version',
      '',
      'version',
      'Converts an input string to a version value.',
      false,
      false,
      false,
    ],
    [
      'trim',
      'keyword|text trim(str:keyword|text)',
      'str',
      'keyword|text',
      '',
      'keyword|text',
      'Removes leading and trailing whitespaces from a string.',
      false,
      false,
      false,
    ],
  ],
};

(async function main() {
  const columnIndices = showFunctionsOutput.columns.reduce((acc, curr, index) => {
    acc[curr.name] = index;
    return acc;
  }, {});

  console.log(columnIndices);

  const ensureArray = (value) => (Array.isArray(value) ? value : value === null ? [] : [value]);

  const dedupe = (arr) => Array.from(new Set(arr));

  const elasticsearchToKibanaType = (elasticsearchType) => {
    const numberType = ['double', 'unsigned_long', 'long', 'integer'];
    const stringType = ['text', 'keyword'];

    if (numberType.includes(elasticsearchType)) {
      return 'number';
    }

    if (stringType.includes(elasticsearchType)) {
      return 'string';
    }

    return elasticsearchType;
  };

  const functionDefinitions = [];
  for (const value of showFunctionsOutput.values) {
    // console.log(value[columnIndices.name]);
    // console.log(value[columnIndices.argNames]);
    console.log(value[columnIndices.name]);
    console.log('----------------');
    console.log(value[columnIndices.argTypes]);
    // console.log(value[columnIndices.optionalArgs]);
    // console.log(value[columnIndices.variadic]);
    // console.log(value[columnIndices.returnType]);

    const kbnArgTypes = ensureArray(value[columnIndices.argTypes]).map((argType) =>
      dedupe(argType.split('|').map(elasticsearchToKibanaType))
    );

    const getMinParams = () =>
      value[columnIndices.variadic]
        ? ensureArray(value[columnIndices.optionalArgs]).length
        : undefined;

    const getReturnType = () => {
      const allReturnTypes = dedupe(
        value[columnIndices.returnType].split('|').map(elasticsearchToKibanaType)
      );

      // our client-side parser doesn't currently support multiple return types
      return allReturnTypes.length === 1 ? allReturnTypes[0] : 'any';
    };

    const functionDefinition = {
      name: value[columnIndices.name],
      description: value[columnIndices.description],
      signatures: [
        {
          params: ensureArray(value[columnIndices.argNames]).map((argName, i) => ({
            name: argName,
            type: kbnArgTypes[i],
            optional: ensureArray(value[columnIndices.optionalArgs])[i],
          })),
          returnType: getReturnType(),
          minParams: getMinParams(),
        },
      ],
    };

    functionDefinitions.push(functionDefinition);
  }

  await writeFile(join(__dirname, 'functions.json'), JSON.stringify(functionDefinitions, null, 2));
})();
