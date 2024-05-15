/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { readFileSync, writeFileSync } from 'fs';
import { camelCase } from 'lodash';
import { join } from 'path';
import * as recast from 'recast';
const b = recast.types.builders;
const n = recast.types.namedTypes;
import { statsAggregationFunctionDefinitions } from '../definitions/aggs';
import { evalFunctionsDefinitions } from '../definitions/functions';
import { groupingFunctionDefinitions } from '../definitions/grouping';
import { getFunctionSignatures } from '../definitions/helpers';
import { chronoLiterals, timeLiterals } from '../definitions/literals';
import { FunctionDefinition } from '../definitions/types';
import { nonNullable } from '../shared/helpers';
import { FUNCTION_DESCRIBE_BLOCK_NAME } from './function_describe_block_name';

function main() {
  const testCasesByFunction: Map<string, Map<string, string[]>> = new Map();

  for (const definition of evalFunctionsDefinitions) {
    testCasesByFunction.set(definition.name, generateTestsForEvalFunction(definition));
  }

  for (const definition of statsAggregationFunctionDefinitions) {
    testCasesByFunction.set(definition.name, generateTestsForAggFunction(definition));
  }

  for (const definition of groupingFunctionDefinitions) {
    testCasesByFunction.set(definition.name, generateTestsForGroupingFunction(definition));
  }

  writeTestsToFile(testCasesByFunction);
}

function generateTestsForEvalFunction(definition: FunctionDefinition) {
  const testCases: Map<string, string[]> = new Map();
  generateRowCommandTestsForEvalFunction(definition, testCases);
  generateWhereCommandTestsForEvalFunction(definition, testCases);
  generateEvalCommandTestsForEvalFunction(definition, testCases);
  generateSortCommandTestsForEvalFunction(definition, testCases);
  return testCases;
}

function generateTestsForAggFunction(definition: FunctionDefinition) {
  const testCases: Map<string, string[]> = new Map();
  generateStatsCommandTestsForAggFunction(definition, testCases);
  generateSortCommandTestsForAggFunction(definition, testCases);
  generateWhereCommandTestsForAggFunction(definition, testCases);
  generateEvalCommandTestsForAggFunction(definition, testCases);
  return testCases;
}

function generateTestsForGroupingFunction(definition: FunctionDefinition) {
  const testCases: Map<string, string[]> = new Map();
  generateStatsCommandTestsForGroupingFunction(definition, testCases);
  generateSortCommandTestsForGroupingFunction(definition, testCases);
  return testCases;
}

function generateRowCommandTestsForEvalFunction(
  { name, alias, signatures, ...defRest }: FunctionDefinition,
  testCases: Map<string, string[]>
) {
  if (name === 'date_diff') return;
  for (const { params, ...signRest } of signatures) {
    // ROW command stuff
    const fieldMapping = getFieldMapping(params);
    const signatureStringCorrect = tweakSignatureForRowCommand(
      getFunctionSignatures(
        { name, ...defRest, signatures: [{ params: fieldMapping, ...signRest }] },
        { withTypes: false }
      )[0].declaration
    );

    testCases.set(`row var = ${signatureStringCorrect}`, []);
    testCases.set(`row ${signatureStringCorrect}`, []);

    if (alias) {
      for (const otherName of alias) {
        const signatureStringWithAlias = tweakSignatureForRowCommand(
          getFunctionSignatures(
            {
              name: otherName,
              ...defRest,
              signatures: [{ params: fieldMapping, ...signRest }],
            },
            { withTypes: false }
          )[0].declaration
        );

        testCases.set(`row var = ${signatureStringWithAlias}`, []);
      }
    }

    // Skip functions that have only arguments of type "any", as it is not possible to pass "the wrong type".
    // to_version functions are a bit harder to test exactly a combination of argument and predict the
    // the right error message
    if (
      params.every(({ type }) => type !== 'any') &&
      ![
        'to_version',
        'mv_sort',
        // skip the date functions because the row tests always throw in
        // a string literal and expect it to be invalid for the date functions
        // but it's always valid because ES will parse it as a date
        'date_diff',
        'date_extract',
        'date_format',
        'date_trunc',
      ].includes(name)
    ) {
      // now test nested functions
      const fieldMappingWithNestedFunctions = getFieldMapping(params, {
        useNestedFunction: true,
        useLiterals: true,
      });
      const signatureString = tweakSignatureForRowCommand(
        getFunctionSignatures(
          {
            name,
            ...defRest,
            signatures: [{ params: fieldMappingWithNestedFunctions, ...signRest }],
          },
          { withTypes: false }
        )[0].declaration
      );

      testCases.set(`row var = ${signatureString}`, []);

      const { wrongFieldMapping, expectedErrors } = generateIncorrectlyTypedParameters(
        name,
        signatures,
        params,
        {
          stringField: '"a"',
          numberField: '5',
          booleanField: 'true',
        }
      );
      const wrongSignatureString = tweakSignatureForRowCommand(
        getFunctionSignatures(
          { name, ...defRest, signatures: [{ params: wrongFieldMapping, ...signRest }] },
          { withTypes: false }
        )[0].declaration
      );
      testCases.set(`row var = ${wrongSignatureString}`, expectedErrors);
    }
  }
}

function generateWhereCommandTestsForEvalFunction(
  { name, signatures, ...rest }: FunctionDefinition,
  testCases: Map<string, string[]>
) {
  const supportedSignatures = signatures.filter(({ returnType }) =>
    // TODO — not sure why the tests have this limitation... seems like any type
    // that can be part of a boolean expression should be allowed in a where clause
    ['number', 'string'].includes(returnType)
  );
  for (const { params, returnType, ...restSign } of supportedSignatures) {
    const correctMapping = getFieldMapping(params);
    testCases.set(
      `from a_index | where ${returnType !== 'number' ? 'length(' : ''}${
        // hijacking a bit this function to produce a function call
        getFunctionSignatures(
          {
            name,
            ...rest,
            signatures: [{ params: correctMapping, returnType, ...restSign }],
          },
          { withTypes: false }
        )[0].declaration
      }${returnType !== 'number' ? ')' : ''} > 0`,
      []
    );

    const { wrongFieldMapping, expectedErrors } = generateIncorrectlyTypedParameters(
      name,
      signatures,
      params,
      { stringField: 'stringField', numberField: 'numberField', booleanField: 'booleanField' }
    );
    testCases.set(
      `from a_index | where ${returnType !== 'number' ? 'length(' : ''}${
        // hijacking a bit this function to produce a function call
        getFunctionSignatures(
          {
            name,
            ...rest,
            signatures: [{ params: wrongFieldMapping, returnType, ...restSign }],
          },
          { withTypes: false }
        )[0].declaration
      }${returnType !== 'number' ? ')' : ''} > 0`,
      expectedErrors
    );
  }
}

function generateWhereCommandTestsForAggFunction(
  { name, alias, signatures, ...defRest }: FunctionDefinition,
  testCases: Map<string, string[]>
) {
  // statsSignatures.some(({ returnType, params }) => ['number'].includes(returnType))
  for (const { params, ...signRest } of signatures) {
    const fieldMapping = getFieldMapping(params);

    testCases.set(
      `from a_index | where ${
        getFunctionSignatures(
          {
            name,
            ...defRest,
            signatures: [{ params: fieldMapping, ...signRest }],
          },
          { withTypes: false }
        )[0].declaration
      }`,
      [`WHERE does not support function ${name}`]
    );

    testCases.set(
      `from a_index | where ${
        getFunctionSignatures(
          {
            name,
            ...defRest,
            signatures: [{ params: fieldMapping, ...signRest }],
          },
          { withTypes: false }
        )[0].declaration
      } > 0`,
      [`WHERE does not support function ${name}`]
    );
  }
}

function generateEvalCommandTestsForEvalFunction(
  { name, signatures, alias, ...defRest }: FunctionDefinition,
  testCases: Map<string, string[]>
) {
  for (const { params, ...signRest } of signatures) {
    const fieldMapping = getFieldMapping(params);
    testCases.set(
      `from a_index | eval var = ${
        getFunctionSignatures(
          {
            name,
            ...defRest,
            signatures: [{ params: fieldMapping, ...signRest }],
          },
          { withTypes: false }
        )[0].declaration
      }`,
      []
    );
    testCases.set(
      `from a_index | eval ${
        getFunctionSignatures(
          { name, ...defRest, signatures: [{ params: fieldMapping, ...signRest }] },
          { withTypes: false }
        )[0].declaration
      }`,
      []
    );
    if (params.some(({ constantOnly }) => constantOnly)) {
      const fieldReplacedType = params
        .filter(({ constantOnly }) => constantOnly)
        .map(({ type }) => type);
      // create the mapping without the literal flag
      // this will make the signature wrong on purpose where in place on constants
      // the arg will be a column of the same type
      const fieldMappingWithoutLiterals = getFieldMapping(
        params.map(({ constantOnly, ...rest }) => rest)
      );
      testCases.set(
        `from a_index | eval ${
          getFunctionSignatures(
            {
              name,
              ...defRest,
              signatures: [{ params: fieldMappingWithoutLiterals, ...signRest }],
            },
            { withTypes: false }
          )[0].declaration
        }`,
        fieldReplacedType.map(
          (type) => `Argument of [${name}] must be a constant, received [${type}Field]`
        )
      );
    }

    if (alias) {
      for (const otherName of alias) {
        const signatureStringWithAlias = getFunctionSignatures(
          {
            name: otherName,
            ...defRest,
            signatures: [{ params: fieldMapping, ...signRest }],
          },
          { withTypes: false }
        )[0].declaration;

        testCases.set(`from a_index | eval var = ${signatureStringWithAlias}`, []);
      }
    }

    // Skip functions that have only arguments of type "any", as it is not possible to pass "the wrong type".
    // to_version functions are a bit harder to test exactly a combination of argument and predict the
    // the right error message
    if (params.every(({ type }) => type !== 'any') && !['to_version', 'mv_sort'].includes(name)) {
      // now test nested functions
      const fieldMappingWithNestedFunctions = getFieldMapping(params, {
        useNestedFunction: true,
        useLiterals: true,
      });
      testCases.set(
        `from a_index | eval var = ${
          getFunctionSignatures(
            {
              name,
              ...defRest,
              signatures: [{ params: fieldMappingWithNestedFunctions, ...signRest }],
            },
            { withTypes: false }
          )[0].declaration
        }`,
        []
      );

      const { wrongFieldMapping, expectedErrors } = generateIncorrectlyTypedParameters(
        name,
        signatures,
        params,
        {
          stringField: 'stringField',
          numberField: 'numberField',
          booleanField: 'booleanField',
        }
      );
      testCases.set(
        `from a_index | eval ${
          getFunctionSignatures(
            { name, ...defRest, signatures: [{ params: wrongFieldMapping, ...signRest }] },
            { withTypes: false }
          )[0].declaration
        }`,
        expectedErrors
      );

      if (!signRest.minParams) {
        // test that additional args are spotted
        const fieldMappingWithOneExtraArg = getFieldMapping(params).concat({
          name: 'extraArg',
          type: 'number',
        });
        const refSignature = signatures[0];
        // get the expected args from the first signature in case of errors
        const minNumberOfArgs = refSignature.params.filter(({ optional }) => !optional).length;
        const fullNumberOfArgs = refSignature.params.length;
        const hasOptionalArgs = minNumberOfArgs < fullNumberOfArgs;
        const hasTooManyArgs = fieldMappingWithOneExtraArg.length > fullNumberOfArgs;

        // the validation engine tries to be smart about signatures with optional args
        let messageQuantifier = 'exactly ';
        if (hasOptionalArgs && hasTooManyArgs) {
          messageQuantifier = 'no more than ';
        }
        if (!hasOptionalArgs && !hasTooManyArgs) {
          messageQuantifier = 'at least ';
        }
        testCases.set(
          `from a_index | eval ${
            getFunctionSignatures(
              {
                name,
                ...defRest,
                signatures: [{ params: fieldMappingWithOneExtraArg, ...signRest }],
              },
              { withTypes: false }
            )[0].declaration
          }`,
          [
            `Error: [${name}] function expects ${messageQuantifier}${
              fullNumberOfArgs === 1
                ? 'one argument'
                : fullNumberOfArgs === 0
                ? '0 arguments'
                : `${fullNumberOfArgs} arguments`
            }, got ${fieldMappingWithOneExtraArg.length}.`,
          ]
        );
      }
    }

    // test that wildcard won't work as arg
    if (fieldMapping.length === 1 && !signRest.minParams) {
      const fieldMappingWithWildcard = [...fieldMapping];
      fieldMappingWithWildcard[0].name = '*';

      testCases.set(
        `from a_index | eval var = ${
          getFunctionSignatures(
            {
              name,
              ...defRest,
              signatures: [{ params: fieldMappingWithWildcard, ...signRest }],
            },
            { withTypes: false }
          )[0].declaration
        }`,
        [`Using wildcards (*) in ${name} is not allowed`]
      );
    }
  }
}

function generateEvalCommandTestsForAggFunction(
  { name, signatures, alias, ...defRest }: FunctionDefinition,
  testCases: Map<string, string[]>
) {
  for (const { params, ...signRest } of signatures) {
    const fieldMapping = getFieldMapping(params);
    testCases.set(
      `from a_index | eval var = ${
        getFunctionSignatures(
          {
            name,
            ...defRest,
            signatures: [{ params: fieldMapping, ...signRest }],
          },
          { withTypes: false }
        )[0].declaration
      }`,
      [`EVAL does not support function ${name}`]
    );

    testCases.set(
      `from a_index | eval var = ${
        getFunctionSignatures(
          {
            name,
            ...defRest,
            signatures: [{ params: fieldMapping, ...signRest }],
          },
          { withTypes: false }
        )[0].declaration
      } > 0`,
      [`EVAL does not support function ${name}`]
    );

    testCases.set(
      `from a_index | eval ${
        getFunctionSignatures(
          {
            name,
            ...defRest,
            signatures: [{ params: fieldMapping, ...signRest }],
          },
          { withTypes: false }
        )[0].declaration
      }`,
      [`EVAL does not support function ${name}`]
    );

    testCases.set(
      `from a_index | eval ${
        getFunctionSignatures(
          {
            name,
            ...defRest,
            signatures: [{ params: fieldMapping, ...signRest }],
          },
          { withTypes: false }
        )[0].declaration
      } > 0`,
      [`EVAL does not support function ${name}`]
    );
  }
}

function generateStatsCommandTestsForAggFunction(
  { name, signatures, alias, ...defRest }: FunctionDefinition,
  testCases: Map<string, string[]>
) {
  for (const { params, ...signRest } of signatures) {
    const fieldMapping = getFieldMapping(params);

    const correctSignature = getFunctionSignatures(
      { name, ...defRest, signatures: [{ params: fieldMapping, ...signRest }] },
      { withTypes: false }
    )[0].declaration;
    testCases.set(`from a_index | stats var = ${correctSignature}`, []);
    testCases.set(`from a_index | stats ${correctSignature}`, []);

    if (signRest.returnType === 'number') {
      testCases.set(`from a_index | stats var = round(${correctSignature})`, []);
      testCases.set(`from a_index | stats round(${correctSignature})`, []);
      testCases.set(
        `from a_index | stats var = round(${correctSignature}) + ${correctSignature}`,
        []
      );
      testCases.set(`from a_index | stats round(${correctSignature}) + ${correctSignature}`, []);
    }

    if (params.some(({ constantOnly }) => constantOnly)) {
      const fieldReplacedType = params
        .filter(({ constantOnly }) => constantOnly)
        .map(({ type }) => type);
      // create the mapping without the literal flag
      // this will make the signature wrong on purpose where in place on constants
      // the arg will be a column of the same type
      const fieldMappingWithoutLiterals = getFieldMapping(
        params.map(({ constantOnly, ...rest }) => rest)
      );
      testCases.set(
        `from a_index | stats ${
          getFunctionSignatures(
            {
              name,
              ...defRest,
              signatures: [{ params: fieldMappingWithoutLiterals, ...signRest }],
            },
            { withTypes: false }
          )[0].declaration
        }`,
        fieldReplacedType.map(
          (type) => `Argument of [${name}] must be a constant, received [${type}Field]`
        )
      );
    }

    if (alias) {
      for (const otherName of alias) {
        const signatureStringWithAlias = getFunctionSignatures(
          {
            name: otherName,
            ...defRest,
            signatures: [{ params: fieldMapping, ...signRest }],
          },
          { withTypes: false }
        )[0].declaration;

        testCases.set(`from a_index | stats var = ${signatureStringWithAlias}`, []);
      }
    }

    // test only numeric functions for now
    if (params[0].type === 'number') {
      const nestedBuiltin = 'numberField / 2';
      const fieldMappingWithNestedBuiltinFunctions = getFieldMapping(params);
      fieldMappingWithNestedBuiltinFunctions[0].name = nestedBuiltin;

      const fnSignatureWithBuiltinString = getFunctionSignatures(
        {
          name,
          ...defRest,
          signatures: [{ params: fieldMappingWithNestedBuiltinFunctions, ...signRest }],
        },
        { withTypes: false }
      )[0].declaration;
      // from a_index | STATS aggFn( numberField / 2 )
      testCases.set(`from a_index | stats ${fnSignatureWithBuiltinString}`, []);
      testCases.set(`from a_index | stats var0 = ${fnSignatureWithBuiltinString}`, []);
      testCases.set(`from a_index | stats avg(numberField), ${fnSignatureWithBuiltinString}`, []);
      testCases.set(
        `from a_index | stats avg(numberField), var0 = ${fnSignatureWithBuiltinString}`,
        []
      );

      const nestedEvalAndBuiltin = 'round(numberField / 2)';
      const fieldMappingWithNestedEvalAndBuiltinFunctions = getFieldMapping(params);
      fieldMappingWithNestedBuiltinFunctions[0].name = nestedEvalAndBuiltin;

      const fnSignatureWithEvalAndBuiltinString = getFunctionSignatures(
        {
          name,
          ...defRest,
          signatures: [{ params: fieldMappingWithNestedEvalAndBuiltinFunctions, ...signRest }],
        },
        { withTypes: false }
      )[0].declaration;
      // from a_index | STATS aggFn( round(numberField / 2) )
      testCases.set(`from a_index | stats ${fnSignatureWithEvalAndBuiltinString}`, []);
      testCases.set(`from a_index | stats var0 = ${fnSignatureWithEvalAndBuiltinString}`, []);
      testCases.set(
        `from a_index | stats avg(numberField), ${fnSignatureWithEvalAndBuiltinString}`,
        []
      );
      testCases.set(
        `from a_index | stats avg(numberField), var0 = ${fnSignatureWithEvalAndBuiltinString}`,
        []
      );
      // from a_index | STATS aggFn(round(numberField / 2) ) BY round(numberField / 2)
      testCases.set(
        `from a_index | stats ${fnSignatureWithEvalAndBuiltinString} by ${nestedEvalAndBuiltin}`,
        []
      );
      testCases.set(
        `from a_index | stats var0 = ${fnSignatureWithEvalAndBuiltinString} by var1 = ${nestedEvalAndBuiltin}`,
        []
      );
      testCases.set(
        `from a_index | stats avg(numberField), ${fnSignatureWithEvalAndBuiltinString} by ${nestedEvalAndBuiltin}, ipField`,
        []
      );
      testCases.set(
        `from a_index | stats avg(numberField), var0 = ${fnSignatureWithEvalAndBuiltinString} by var1 = ${nestedEvalAndBuiltin}, ipField`,
        []
      );
      testCases.set(
        `from a_index | stats avg(numberField), ${fnSignatureWithEvalAndBuiltinString} by ${nestedEvalAndBuiltin}, ${nestedBuiltin}`,
        []
      );
      testCases.set(
        `from a_index | stats avg(numberField), var0 = ${fnSignatureWithEvalAndBuiltinString} by var1 = ${nestedEvalAndBuiltin}, ${nestedBuiltin}`,
        []
      );
    }

    // Skip functions that have only arguments of type "any", as it is not possible to pass "the wrong type".
    // to_version is a bit harder to test exactly a combination of argument and predict the
    // the right error message
    if (params.every(({ type }) => type !== 'any') && !['to_version', 'mv_sort'].includes(name)) {
      // now test nested functions
      const fieldMappingWithNestedAggsFunctions = getFieldMapping(params, {
        useNestedFunction: true,
        useLiterals: false,
      });
      const nestedAggsExpectedErrors = params
        .filter(({ constantOnly }) => !constantOnly)
        .map(
          (_) =>
            `Aggregate function's parameters must be an attribute, literal or a non-aggregation function; found [avg(numberField)] of type [number]`
        );
      testCases.set(
        `from a_index | stats var = ${
          getFunctionSignatures(
            {
              name,
              ...defRest,
              signatures: [{ params: fieldMappingWithNestedAggsFunctions, ...signRest }],
            },
            { withTypes: false }
          )[0].declaration
        }`,
        nestedAggsExpectedErrors
      );
      testCases.set(
        `from a_index | stats ${
          getFunctionSignatures(
            {
              name,
              ...defRest,
              signatures: [{ params: fieldMappingWithNestedAggsFunctions, ...signRest }],
            },
            { withTypes: false }
          )[0].declaration
        }`,
        nestedAggsExpectedErrors
      );
      const { wrongFieldMapping, expectedErrors } = generateIncorrectlyTypedParameters(
        name,
        signatures,
        params,
        {
          stringField: 'stringField',
          numberField: 'numberField',
          booleanField: 'booleanField',
        }
      );
      // and the message is case of wrong argument type is passed
      testCases.set(
        `from a_index | stats ${
          getFunctionSignatures(
            { name, ...defRest, signatures: [{ params: wrongFieldMapping, ...signRest }] },
            { withTypes: false }
          )[0].declaration
        }`,
        expectedErrors
      );

      // test that only count() accepts wildcard as arg
      // just check that the function accepts only 1 arg as the parser cannot handle multiple args with * as start arg
      if (fieldMapping.length === 1) {
        const fieldMappingWithWildcard = [...fieldMapping];
        fieldMappingWithWildcard[0].name = '*';

        testCases.set(
          `from a_index | stats var = ${
            getFunctionSignatures(
              {
                name,
                ...defRest,
                signatures: [{ params: fieldMappingWithWildcard, ...signRest }],
              },
              { withTypes: false }
            )[0].declaration
          }`,
          name === 'count' ? [] : [`Using wildcards (*) in ${name} is not allowed`]
        );
      }
    }
  }
}

function generateStatsCommandTestsForGroupingFunction(
  { name, signatures, alias, ...defRest }: FunctionDefinition,
  testCases: Map<string, string[]>
) {
  for (const { params, ...signRest } of signatures) {
    const fieldMapping = getFieldMapping(params);

    const correctSignature = getFunctionSignatures(
      { name, ...defRest, signatures: [{ params: fieldMapping, ...signRest }] },
      { withTypes: false }
    )[0].declaration;
    testCases.set(`from a_index | stats by ${correctSignature}`, []);

    if (params.some(({ constantOnly }) => constantOnly)) {
      const fieldReplacedType = params
        .filter(({ constantOnly }) => constantOnly)
        .map(({ type }) => type);
      // create the mapping without the literal flag
      // this will make the signature wrong on purpose where in place on constants
      // the arg will be a column of the same type
      const fieldMappingWithoutLiterals = getFieldMapping(
        params.map(({ constantOnly, ...rest }) => rest)
      );
      testCases.set(
        `from a_index | stats by ${
          getFunctionSignatures(
            {
              name,
              ...defRest,
              signatures: [{ params: fieldMappingWithoutLiterals, ...signRest }],
            },
            { withTypes: false }
          )[0].declaration
        }`,
        fieldReplacedType
          // if a param of type time_literal or chrono_literal it will always be a literal
          // so no way to test the constantOnly thing
          .filter((type) => !['time_literal', 'chrono_literal'].includes(type))
          .map((type) => `Argument of [${name}] must be a constant, received [${type}Field]`)
      );
    }

    if (alias) {
      for (const otherName of alias) {
        const signatureStringWithAlias = getFunctionSignatures(
          {
            name: otherName,
            ...defRest,
            signatures: [{ params: fieldMapping, ...signRest }],
          },
          { withTypes: false }
        )[0].declaration;

        testCases.set(`from a_index | stats by ${signatureStringWithAlias}`, []);
      }
    }
  }
}

function generateSortCommandTestsForEvalFunction(
  definition: FunctionDefinition,
  testCases: Map<string, string[]>
) {
  // should accept eval functions
  const {
    signatures: [firstSignature],
  } = definition;
  const fieldMapping = getFieldMapping(firstSignature.params);
  const printedInvocation = getFunctionSignatures(
    { ...definition, signatures: [{ ...firstSignature, params: fieldMapping }] },
    { withTypes: false }
  )[0].declaration;

  testCases.set(`from a_index | sort ${printedInvocation}`, []);
}

function generateSortCommandTestsForAggFunction(
  definition: FunctionDefinition,
  testCases: Map<string, string[]>
) {
  const {
    name,
    signatures: [firstSignature],
  } = definition;
  const fieldMapping = getFieldMapping(firstSignature.params);
  const printedInvocation = getFunctionSignatures(
    { ...definition, signatures: [{ ...firstSignature, params: fieldMapping }] },
    { withTypes: false }
  )[0].declaration;

  testCases.set(`from a_index | sort ${printedInvocation}`, [
    `SORT does not support function ${name}`,
  ]);
}

const generateSortCommandTestsForGroupingFunction = generateSortCommandTestsForAggFunction;

const fieldTypes = [
  'number',
  'date',
  'boolean',
  'version',
  'ip',
  'string',
  'cartesian_point',
  'cartesian_shape',
  'geo_point',
  'geo_shape',
];

function prepareNestedFunction(fnSignature: FunctionDefinition): string {
  return getFunctionSignatures(
    {
      ...fnSignature,
      signatures: [
        {
          ...fnSignature?.signatures[0]!,
          params: getFieldMapping(fnSignature?.signatures[0]!.params),
        },
      ],
    },
    { withTypes: false }
  )[0].declaration;
}

const toAvgSignature = statsAggregationFunctionDefinitions.find(({ name }) => name === 'avg')!;

const toInteger = evalFunctionsDefinitions.find(({ name }) => name === 'to_integer')!;
const toStringSignature = evalFunctionsDefinitions.find(({ name }) => name === 'to_string')!;
const toDateSignature = evalFunctionsDefinitions.find(({ name }) => name === 'to_datetime')!;
const toBooleanSignature = evalFunctionsDefinitions.find(({ name }) => name === 'to_boolean')!;
const toIpSignature = evalFunctionsDefinitions.find(({ name }) => name === 'to_ip')!;
const toGeoPointSignature = evalFunctionsDefinitions.find(({ name }) => name === 'to_geopoint')!;
const toCartesianPointSignature = evalFunctionsDefinitions.find(
  ({ name }) => name === 'to_cartesianpoint'
)!;

const nestedFunctions = {
  number: prepareNestedFunction(toInteger),
  string: prepareNestedFunction(toStringSignature),
  date: prepareNestedFunction(toDateSignature),
  boolean: prepareNestedFunction(toBooleanSignature),
  ip: prepareNestedFunction(toIpSignature),
  geo_point: prepareNestedFunction(toGeoPointSignature),
  cartesian_point: prepareNestedFunction(toCartesianPointSignature),
};

function getFieldName(
  typeString: string,
  { useNestedFunction, isStats }: { useNestedFunction: boolean; isStats: boolean }
) {
  if (useNestedFunction && isStats) {
    return prepareNestedFunction(toAvgSignature);
  }
  return useNestedFunction && typeString in nestedFunctions
    ? nestedFunctions[typeString as keyof typeof nestedFunctions]
    : `${camelCase(typeString)}Field`;
}

const literals = {
  chrono_literal: chronoLiterals[0].name,
  time_literal: timeLiterals[0].name,
};

function getLiteralType(typeString: 'chrono_literal' | 'time_literal') {
  if (typeString === 'chrono_literal') {
    return literals[typeString];
  }
  return `1 ${literals[typeString]}`;
}

function getMultiValue(type: string) {
  if (/string|any/.test(type)) {
    return `["a", "b", "c"]`;
  }
  if (/number/.test(type)) {
    return `[1, 2, 3]`;
  }
  return `[true, false]`;
}

function tweakSignatureForRowCommand(signature: string) {
  /**
   * row has no access to any field, so replace it with literal
   * or functions (for dates)
   */
  return signature
    .replace(/numberField/g, '5')
    .replace(/stringField/g, '"a"')
    .replace(/dateField/g, 'now()')
    .replace(/booleanField/g, 'true')
    .replace(/ipField/g, 'to_ip("127.0.0.1")')
    .replace(/geoPointField/g, 'to_geopoint("POINT (30 10)")')
    .replace(/geoShapeField/g, 'to_geoshape("POINT (30 10)")')
    .replace(/cartesianPointField/g, 'to_cartesianpoint("POINT (30 10)")')
    .replace(/cartesianShapeField/g, 'to_cartesianshape("POINT (30 10)")');
}

function getFieldMapping(
  params: FunctionDefinition['signatures'][number]['params'],
  { useNestedFunction, useLiterals }: { useNestedFunction: boolean; useLiterals: boolean } = {
    useNestedFunction: false,
    useLiterals: true,
  }
) {
  const literalValues = {
    string: `"a"`,
    number: '5',
    date: 'now()',
  };
  return params.map(({ name: _name, type, constantOnly, literalOptions, ...rest }) => {
    const typeString: string = type;
    if (fieldTypes.includes(typeString)) {
      if (useLiterals && literalOptions) {
        return {
          name: `"${literalOptions[0]}"`,
          type,
          ...rest,
        };
      }

      const fieldName =
        constantOnly && typeString in literalValues
          ? literalValues[typeString as keyof typeof literalValues]!
          : getFieldName(typeString, {
              useNestedFunction,
              isStats: !useLiterals,
            });
      return {
        name: fieldName,
        type,
        ...rest,
      };
    }
    if (/literal$/.test(typeString) && useLiterals) {
      return {
        name: getLiteralType(typeString as 'chrono_literal' | 'time_literal'),
        type,
        ...rest,
      };
    }
    if (/\[\]$/.test(typeString)) {
      return {
        name: getMultiValue(typeString),
        type,
        ...rest,
      };
    }
    return { name: 'stringField', type, ...rest };
  });
}

function generateIncorrectlyTypedParameters(
  name: string,
  signatures: FunctionDefinition['signatures'],
  currentParams: FunctionDefinition['signatures'][number]['params'],
  values: { stringField: string; numberField: string; booleanField: string }
) {
  const literalValues = {
    string: `"a"`,
    number: '5',
  };
  const wrongFieldMapping = currentParams.map(
    ({ name: _name, constantOnly, literalOptions, type, ...rest }, i) => {
      // this thing is complex enough, let's not make it harder for constants
      if (constantOnly) {
        return {
          name: literalValues[type as keyof typeof literalValues],
          type,
          wrong: false,
          ...rest,
        };
      }
      const canBeFieldButNotString = Boolean(
        fieldTypes.filter((t) => t !== 'string').includes(type) &&
          signatures.every(({ params: fnParams }) => fnParams[i].type !== 'string')
      );
      const canBeFieldButNotNumber =
        fieldTypes.filter((t) => t !== 'number').includes(type) &&
        signatures.every(({ params: fnParams }) => fnParams[i].type !== 'number');
      const isLiteralType = /literal$/.test(type);
      // pick a field name purposely wrong
      const nameValue =
        canBeFieldButNotString || isLiteralType
          ? values.stringField
          : canBeFieldButNotNumber
          ? values.numberField
          : values.booleanField;
      return { name: nameValue, type, wrong: true, ...rest };
    }
  );

  const generatedFieldTypes = {
    [values.stringField]: 'string',
    [values.numberField]: 'number',
    [values.booleanField]: 'boolean',
  };

  // Try to predict which signature will be used to generate the errors
  // in the validation engine. The validator currently uses the signature
  // which generates the fewest errors.
  //
  // Approximate this by finding the signature that best matches the INCORRECT field mapping
  //
  // This is not future-proof...
  const misMatchesBySignature = signatures.map(({ params: fnParams }) => {
    const typeMatches = fnParams.map(({ type }, i) => {
      if (wrongFieldMapping[i].wrong) {
        const typeFromIncorrectMapping = generatedFieldTypes[wrongFieldMapping[i].name];
        return type === typeFromIncorrectMapping;
      }
      return type === wrongFieldMapping[i].type;
    });
    return typeMatches.filter((t) => !t).length;
  })!;
  const signatureToUse =
    signatures[misMatchesBySignature.indexOf(Math.min(...misMatchesBySignature))]!;

  const expectedErrors = signatureToUse.params
    .filter(({ constantOnly }) => !constantOnly)
    .map(({ type }, i) => {
      const fieldName = wrongFieldMapping[i].name;
      if (
        fieldName === 'numberField' &&
        signatures.every(({ params: fnParams }) => fnParams[i].type !== 'string')
      ) {
        return;
      }
      return `Argument of [${name}] must be [${type}], found value [${fieldName}] type [${generatedFieldTypes[fieldName]}]`;
    })
    .filter(nonNullable);

  return { wrongFieldMapping, expectedErrors };
}

/**
 * This writes the test cases to the validation.test.ts file
 *
 * It will never overwrite existing test cases, only add new ones
 *
 * @param testCasesByFunction
 */
function writeTestsToFile(testCasesByFunction: Map<string, Map<string, string[]>>) {
  const buildTestCase = (testQuery: string, expectedErrors: string[]) => {
    return b.expressionStatement(
      b.callExpression(b.identifier('testErrorsAndWarnings'), [
        b.stringLiteral(testQuery),
        b.arrayExpression(expectedErrors.map((error) => b.stringLiteral(error))),
      ])
    );
  };

  const buildDescribeBlockForFunction = (
    _functionName: string,
    testCases: Map<string, string[]>
  ) => {
    const testCasesInCode = Array.from(testCases.entries()).map(([testQuery, expectedErrors]) => {
      return buildTestCase(testQuery, expectedErrors);
    });

    return b.expressionStatement(
      b.callExpression(b.identifier('describe'), [
        b.stringLiteral(_functionName),
        b.arrowFunctionExpression([], b.blockStatement(testCasesInCode)),
      ])
    );
  };

  /**
   * Returns the string contents of a node whether or not it's a StringLiteral or a TemplateLiteral
   * @param node
   * @returns
   */
  function getValueFromStringOrTemplateLiteral(node: any): string {
    if (n.StringLiteral.check(node)) {
      return node.value;
    }

    if (n.TemplateLiteral.check(node)) {
      return node.quasis[0].value.raw;
    }

    return '';
  }

  /**
   * This function searches the AST for the describe block containing per-function tests
   * @param ast
   * @returns
   */
  function findFunctionsDescribeBlock(ast: any): recast.types.namedTypes.BlockStatement {
    let foundBlock: recast.types.namedTypes.CallExpression | null = null;

    recast.visit(ast, {
      visitCallExpression(path) {
        const node = path.node;
        if (
          n.Identifier.check(node.callee) &&
          node.callee.name === 'describe' &&
          n.StringLiteral.check(node.arguments[0]) &&
          node.arguments[0].value === FUNCTION_DESCRIBE_BLOCK_NAME
        ) {
          foundBlock = node;
          this.abort();
        }
        this.traverse(path);
      },
    });

    if (!foundBlock) {
      throw Error('couldn\'t find the "functions" describe block in the test file');
    }

    const functionsDescribeCallExpression = foundBlock as recast.types.namedTypes.CallExpression;

    if (!n.ArrowFunctionExpression.check(functionsDescribeCallExpression.arguments[1])) {
      throw Error('Expected an arrow function expression');
    }

    if (!n.BlockStatement.check(functionsDescribeCallExpression.arguments[1].body)) {
      throw Error('Expected a block statement');
    }

    return functionsDescribeCallExpression.arguments[1].body;
  }

  const testFilePath = join(__dirname, 'validation.test.ts');

  const ast = recast.parse(readFileSync(testFilePath).toString(), {
    parser: require('recast/parsers/typescript'),
  });

  const functionsDescribeBlock = findFunctionsDescribeBlock(ast);

  // check for existing describe blocks for functions and add any new
  // test cases to them
  for (const node of functionsDescribeBlock.body) {
    if (!n.ExpressionStatement.check(node)) {
      continue;
    }

    if (!n.CallExpression.check(node.expression)) {
      continue;
    }

    if (!n.StringLiteral.check(node.expression.arguments[0])) {
      continue;
    }

    const functionName = node.expression.arguments[0].value;

    if (!testCasesByFunction.has(functionName)) {
      // this will be a new describe block for a function that doesn't have any tests yet
      continue;
    }

    const generatedTestCasesForFunction = testCasesByFunction.get(functionName) as Map<
      string,
      string[]
    >;

    if (!n.ArrowFunctionExpression.check(node.expression.arguments[1])) {
      continue;
    }

    if (!n.BlockStatement.check(node.expression.arguments[1].body)) {
      continue;
    }

    for (const existingTestCaseAST of node.expression.arguments[1].body.body) {
      if (!n.ExpressionStatement.check(existingTestCaseAST)) {
        continue;
      }

      if (!n.CallExpression.check(existingTestCaseAST.expression)) {
        continue;
      }

      if (!n.Identifier.check(existingTestCaseAST.expression.callee)) {
        continue;
      }

      if (existingTestCaseAST.expression.callee.name !== 'testErrorsAndWarnings') {
        continue;
      }

      const testQuery = getValueFromStringOrTemplateLiteral(
        existingTestCaseAST.expression.arguments[0]
      );

      if (!testQuery) {
        continue;
      }

      if (generatedTestCasesForFunction.has(testQuery)) {
        // Remove the test case from the generated test cases to respect
        // what is already there in the test file... we don't want to overwrite
        // what already exists
        generatedTestCasesForFunction.delete(testQuery);
      }
    }

    // add new testCases
    for (const [testQuery, expectedErrors] of generatedTestCasesForFunction.entries()) {
      node.expression.arguments[1].body.body.push(buildTestCase(testQuery, expectedErrors));
    }

    // remove the function from the map so we don't add a duplicate describe block
    testCasesByFunction.delete(functionName);
  }

  // Add new describe blocks for functions that don't have any tests yet
  for (const [functionName, testCases] of testCasesByFunction) {
    functionsDescribeBlock.body.push(buildDescribeBlockForFunction(functionName, testCases));
  }

  writeFileSync(testFilePath, recast.print(ast).code, 'utf-8');
}

main();
