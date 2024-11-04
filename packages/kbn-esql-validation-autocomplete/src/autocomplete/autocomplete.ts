/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { uniq, uniqBy } from 'lodash';
import type {
  AstProviderFn,
  ESQLAstItem,
  ESQLCommand,
  ESQLCommandOption,
  ESQLFunction,
  ESQLSingleAstItem,
} from '@kbn/esql-ast';
import { ESQL_NUMBER_TYPES, isNumericType } from '../shared/esql_types';
import type { EditorContext, ItemKind, SuggestionRawDefinition, GetColumnsByTypeFn } from './types';
import {
  getColumnForASTNode,
  getCommandDefinition,
  getCommandOption,
  getFunctionDefinition,
  getLastNonWhitespaceChar,
  isArrayType,
  isAssignment,
  isAssignmentComplete,
  isColumnItem,
  isFunctionItem,
  isIncompleteItem,
  isLiteralItem,
  isOptionItem,
  isRestartingExpression,
  isSourceCommand,
  isSettingItem,
  isSourceItem,
  isTimeIntervalItem,
  getAllFunctions,
  isSingleItem,
  nonNullable,
  getColumnExists,
  findPreviousWord,
  noCaseCompare,
  correctQuerySyntax,
  getColumnByName,
  sourceExists,
  findFinalWord,
  getAllCommands,
  getExpressionType,
} from '../shared/helpers';
import { collectVariables, excludeVariablesFromCurrentCommand } from '../shared/variables';
import type { ESQLPolicy, ESQLRealField, ESQLVariable, ReferenceMaps } from '../validation/types';
import {
  allStarConstant,
  colonCompleteItem,
  commaCompleteItem,
  getAssignmentDefinitionCompletitionItem,
  getCommandAutocompleteDefinitions,
  getNextTokenForNot,
  listCompleteItem,
  pipeCompleteItem,
  semiColonCompleteItem,
} from './complete_items';
import {
  buildFieldsDefinitions,
  buildPoliciesDefinitions,
  buildSourcesDefinitions,
  getNewVariableSuggestion,
  buildNoPoliciesAvailableDefinition,
  getFunctionSuggestions,
  buildMatchingFieldsDefinition,
  getCompatibleLiterals,
  buildConstantsDefinitions,
  buildVariablesDefinitions,
  buildOptionDefinition,
  buildSettingDefinitions,
  buildValueDefinitions,
  getDateLiterals,
  buildFieldsDefinitionsWithMetadata,
  TRIGGER_SUGGESTION_COMMAND,
  getOperatorSuggestions,
} from './factories';
import { EDITOR_MARKER, METADATA_FIELDS } from '../shared/constants';
import { getAstContext, removeMarkerArgFromArgsList } from '../shared/context';
import {
  buildQueryUntilPreviousCommand,
  getFieldsByTypeHelper,
  getPolicyHelper,
  getSourcesHelper,
} from '../shared/resources_helpers';
import { ESQLCallbacks, ESQLSourceResult } from '../shared/types';
import {
  getFunctionsToIgnoreForStats,
  getOverlapRange,
  getQueryForFields,
  getSourcesFromCommands,
  getSupportedTypesForBinaryOperators,
  isAggFunctionUsedAlready,
  removeQuoteForSuggestedSources,
  getValidSignaturesAndTypesToSuggestNext,
  handleFragment,
  getFieldsOrFunctionsSuggestions,
  pushItUpInTheList,
  extractTypeFromASTArg,
} from './helper';
import { FunctionParameter, isParameterType, isReturnType } from '../definitions/types';
import { metadataOption } from '../definitions/options';
import { comparisonFunctions } from '../definitions/builtin';
import { getRecommendedQueriesSuggestions } from './recommended_queries/suggestions';

type GetFieldsMapFn = () => Promise<Map<string, ESQLRealField>>;
type GetPoliciesFn = () => Promise<SuggestionRawDefinition[]>;
type GetPolicyMetadataFn = (name: string) => Promise<ESQLPolicy | undefined>;

function hasSameArgBothSides(assignFn: ESQLFunction) {
  if (assignFn.name === '=' && isColumnItem(assignFn.args[0]) && assignFn.args[1]) {
    const assignValue = assignFn.args[1];
    if (Array.isArray(assignValue) && isColumnItem(assignValue[0])) {
      return assignFn.args[0].name === assignValue[0].name;
    }
  }
}

function appendEnrichFields(
  fieldsMap: Map<string, ESQLRealField>,
  policyMetadata: ESQLPolicy | undefined
) {
  if (!policyMetadata) {
    return fieldsMap;
  }
  // @TODO: improve this
  const newMap: Map<string, ESQLRealField> = new Map(fieldsMap);
  for (const field of policyMetadata.enrichFields) {
    newMap.set(field, { name: field, type: 'double' });
  }
  return newMap;
}

function getFinalSuggestions({ comma }: { comma?: boolean } = { comma: true }) {
  const finalSuggestions = [pipeCompleteItem];
  if (comma) {
    finalSuggestions.push(commaCompleteItem);
  }
  return finalSuggestions;
}

export async function suggest(
  fullText: string,
  offset: number,
  context: EditorContext,
  astProvider: AstProviderFn,
  resourceRetriever?: ESQLCallbacks
): Promise<SuggestionRawDefinition[]> {
  const innerText = fullText.substring(0, offset);

  const correctedQuery = correctQuerySyntax(innerText, context);

  const { ast } = await astProvider(correctedQuery);

  const astContext = getAstContext(innerText, ast, offset);
  // build the correct query to fetch the list of fields
  const queryForFields = getQueryForFields(
    buildQueryUntilPreviousCommand(ast, correctedQuery),
    ast
  );

  const { getFieldsByType, getFieldsMap } = getFieldsByTypeRetriever(
    queryForFields.replace(EDITOR_MARKER, ''),
    resourceRetriever
  );
  const getSources = getSourcesHelper(resourceRetriever);
  const { getPolicies, getPolicyMetadata } = getPolicyRetriever(resourceRetriever);

  if (astContext.type === 'newCommand') {
    // propose main commands here
    // filter source commands if already defined
    const suggestions = getCommandAutocompleteDefinitions(getAllCommands());
    if (!ast.length) {
      // Display the recommended queries if there are no commands (empty state)
      const recommendedQueriesSuggestions: SuggestionRawDefinition[] = [];
      if (getSources) {
        let fromCommand = '';
        const sources = await getSources();
        const visibleSources = sources.filter((source) => !source.hidden);
        if (visibleSources.find((source) => source.name.startsWith('logs'))) {
          fromCommand = 'FROM logs*';
        } else fromCommand = `FROM ${visibleSources[0].name}`;

        const { getFieldsByType: getFieldsByTypeEmptyState } = getFieldsByTypeRetriever(
          fromCommand,
          resourceRetriever
        );
        recommendedQueriesSuggestions.push(
          ...(await getRecommendedQueriesSuggestions(getFieldsByTypeEmptyState, fromCommand))
        );
      }
      const sourceCommandsSuggestions = suggestions.filter(isSourceCommand);
      return [...sourceCommandsSuggestions, ...recommendedQueriesSuggestions];
    }

    return suggestions.filter((def) => !isSourceCommand(def));
  }

  if (astContext.type === 'expression') {
    return getSuggestionsWithinCommandExpression(
      innerText,
      ast,
      astContext,
      getSources,
      getFieldsByType,
      getFieldsMap,
      getPolicies,
      getPolicyMetadata,
      resourceRetriever?.getPreferences
    );
  }
  if (astContext.type === 'setting') {
    return getSettingArgsSuggestions(
      innerText,
      ast,
      astContext,
      getFieldsByType,
      getFieldsMap,
      getPolicyMetadata
    );
  }
  if (astContext.type === 'option') {
    // need this wrap/unwrap thing to make TS happy
    const { option, ...rest } = astContext;
    if (option && isOptionItem(option)) {
      return getOptionArgsSuggestions(
        innerText,
        ast,
        { option, ...rest },
        getFieldsByType,
        getFieldsMap,
        getPolicyMetadata
      );
    }
  }
  if (astContext.type === 'function') {
    return getFunctionArgsSuggestions(
      innerText,
      ast,
      astContext,
      getFieldsByType,
      getFieldsMap,
      getPolicyMetadata,
      fullText,
      offset
    );
  }
  if (astContext.type === 'list') {
    return getListArgsSuggestions(
      innerText,
      ast,
      astContext,
      getFieldsByType,
      getFieldsMap,
      getPolicyMetadata
    );
  }
  return [];
}

export function getFieldsByTypeRetriever(
  queryString: string,
  resourceRetriever?: ESQLCallbacks
): { getFieldsByType: GetColumnsByTypeFn; getFieldsMap: GetFieldsMapFn } {
  const helpers = getFieldsByTypeHelper(queryString, resourceRetriever);
  return {
    getFieldsByType: async (
      expectedType: string | string[] = 'any',
      ignored: string[] = [],
      options
    ) => {
      const fields = await helpers.getFieldsByType(expectedType, ignored);
      return buildFieldsDefinitionsWithMetadata(fields, options);
    },
    getFieldsMap: helpers.getFieldsMap,
  };
}

function getPolicyRetriever(resourceRetriever?: ESQLCallbacks) {
  const helpers = getPolicyHelper(resourceRetriever);
  return {
    getPolicies: async () => {
      const policies = await helpers.getPolicies();
      return buildPoliciesDefinitions(policies);
    },
    getPolicyMetadata: helpers.getPolicyMetadata,
  };
}

function getSourceSuggestions(sources: ESQLSourceResult[]) {
  // hide indexes that start with .
  return buildSourcesDefinitions(
    sources
      .filter(({ hidden }) => !hidden)
      .map(({ name, dataStreams, title, type }) => {
        return { name, isIntegration: Boolean(dataStreams && dataStreams.length), title, type };
      })
  );
}

function findNewVariable(variables: Map<string, ESQLVariable[]>) {
  let autoGeneratedVariableCounter = 0;
  let name = `var${autoGeneratedVariableCounter++}`;
  while (variables.has(name)) {
    name = `var${autoGeneratedVariableCounter++}`;
  }
  return name;
}

function workoutBuiltinOptions(
  nodeArg: ESQLAstItem,
  references: Pick<ReferenceMaps, 'fields' | 'variables'>
): { ignored?: string[] } {
  // skip assign operator if it's a function or an existing field to avoid promoting shadowing
  return {
    ignored: Boolean(!isColumnItem(nodeArg) || getColumnForASTNode(nodeArg, references))
      ? ['=']
      : undefined,
  };
}

function areCurrentArgsValid(
  command: ESQLCommand,
  node: ESQLAstItem,
  references: Pick<ReferenceMaps, 'fields' | 'variables'>
) {
  // unfortunately here we need to bake some command-specific logic
  if (command.name === 'stats') {
    if (node) {
      // consider the following expressions not complete yet
      // ... | stats a
      // ... | stats a =
      if (isColumnItem(node) || (isAssignment(node) && !isAssignmentComplete(node))) {
        return false;
      }
    }
  }
  if (command.name === 'eval') {
    if (node) {
      if (isFunctionItem(node)) {
        if (isAssignment(node)) {
          return isAssignmentComplete(node);
        } else {
          return isFunctionArgComplete(node, references).complete;
        }
      }
    }
  }
  if (command.name === 'where') {
    if (node) {
      if (
        isColumnItem(node) ||
        (isFunctionItem(node) && !isFunctionArgComplete(node, references).complete)
      ) {
        return false;
      } else {
        return (
          extractTypeFromASTArg(node, references) ===
          getCommandDefinition(command.name).signature.params[0].type
        );
      }
    }
  }
  if (command.name === 'rename') {
    if (node) {
      if (isColumnItem(node)) {
        return true;
      }
    }
  }
  return true;
}

// @TODO: refactor this to be shared with validation
function isFunctionArgComplete(
  arg: ESQLFunction,
  references: Pick<ReferenceMaps, 'fields' | 'variables'>
) {
  const fnDefinition = getFunctionDefinition(arg.name);
  if (!fnDefinition) {
    return { complete: false };
  }
  const cleanedArgs = removeMarkerArgFromArgsList(arg)!.args;
  const argLengthCheck = fnDefinition.signatures.some((def) => {
    if (def.minParams && cleanedArgs.length >= def.minParams) {
      return true;
    }
    if (cleanedArgs.length === def.params.length) {
      return true;
    }
    return cleanedArgs.length >= def.params.filter(({ optional }) => !optional).length;
  });
  if (!argLengthCheck) {
    return { complete: false, reason: 'fewArgs' };
  }
  if (fnDefinition.name === 'in' && Array.isArray(arg.args[1]) && !arg.args[1].length) {
    return { complete: false, reason: 'fewArgs' };
  }
  const hasCorrectTypes = fnDefinition.signatures.some((def) => {
    return arg.args.every((a, index) => {
      return (
        (fnDefinition.name.endsWith('null') && def.params[index].type === 'any') ||
        def.params[index].type === extractTypeFromASTArg(a, references)
      );
    });
  });
  if (!hasCorrectTypes) {
    return { complete: false, reason: 'wrongTypes' };
  }
  return { complete: true };
}

function extractArgMeta(
  commandOrOption: ESQLCommand | ESQLCommandOption,
  node: ESQLSingleAstItem | undefined
) {
  let argIndex = commandOrOption.args.length;
  const prevIndex = Math.max(argIndex - 1, 0);
  const lastArg = removeMarkerArgFromArgsList(commandOrOption)!.args[prevIndex];
  if (isIncompleteItem(lastArg)) {
    argIndex = prevIndex;
  }

  // if a node is not specified use the lastArg
  // mind to give priority to node as lastArg might be a function root
  // => "a > b and c == d" gets translated into and( gt(a, b) , eq(c, d) ) => hence "and" is lastArg
  const nodeArg = node || lastArg;

  return { argIndex, prevIndex, lastArg, nodeArg };
}

async function getSuggestionsWithinCommandExpression(
  innerText: string,
  commands: ESQLCommand[],
  {
    command,
    option,
    node,
  }: {
    command: ESQLCommand;
    option: ESQLCommandOption | undefined;
    node: ESQLSingleAstItem | undefined;
  },
  getSources: () => Promise<ESQLSourceResult[]>,
  getColumnsByType: GetColumnsByTypeFn,
  getFieldsMap: GetFieldsMapFn,
  getPolicies: GetPoliciesFn,
  getPolicyMetadata: GetPolicyMetadataFn,
  getPreferences?: () => Promise<{ histogramBarTarget: number } | undefined>
) {
  const commandDef = getCommandDefinition(command.name);

  // collect all fields + variables to suggest
  const fieldsMap: Map<string, ESQLRealField> = await getFieldsMap();
  const anyVariables = collectVariables(commands, fieldsMap, innerText);

  const references = { fields: fieldsMap, variables: anyVariables };
  if (commandDef.suggest) {
    // The new path.
    return commandDef.suggest(
      innerText,
      command,
      getColumnsByType,
      (col: string) => Boolean(getColumnByName(col, references)),
      () => findNewVariable(anyVariables),
      (expression: ESQLAstItem) =>
        getExpressionType(expression, references.fields, references.variables),
      getPreferences
    );
  } else {
    // The deprecated path.
    return getExpressionSuggestionsByType(
      innerText,
      commands,
      { command, option, node },
      getSources,
      getColumnsByType,
      getFieldsMap,
      getPolicies,
      getPolicyMetadata
    );
  }
}

/**
 * @deprecated — this generic logic will be replaced with the command-specific suggest functions
 * from each command definition.
 */
async function getExpressionSuggestionsByType(
  innerText: string,
  commands: ESQLCommand[],
  {
    command,
    option,
    node,
  }: {
    command: ESQLCommand;
    option: ESQLCommandOption | undefined;
    node: ESQLSingleAstItem | undefined;
  },
  getSources: () => Promise<ESQLSourceResult[]>,
  getFieldsByType: GetColumnsByTypeFn,
  getFieldsMap: GetFieldsMapFn,
  getPolicies: GetPoliciesFn,
  getPolicyMetadata: GetPolicyMetadataFn
) {
  const commandDef = getCommandDefinition(command.name);
  const { argIndex, prevIndex, lastArg, nodeArg } = extractArgMeta(command, node);

  // collect all fields + variables to suggest
  const fieldsMap: Map<string, ESQLRealField> = await getFieldsMap();
  const anyVariables = collectVariables(commands, fieldsMap, innerText);

  const references = { fields: fieldsMap, variables: anyVariables };
  if (!commandDef.signature || !commandDef.options) {
    return [];
  }

  // TODO - this is a workaround because it was too difficult to handle this case in a generic way :(
  if (commandDef.name === 'from' && node && isSourceItem(node) && /\s/.test(node.name)) {
    // FROM " <suggest>"
    return [];
  }

  // A new expression is considered either
  // * just after a command name => i.e. ... | STATS <here>
  // * or after a comma => i.e. STATS fieldA, <here>
  const isNewExpression =
    isRestartingExpression(innerText) ||
    (argIndex === 0 && (!isFunctionItem(nodeArg) || !nodeArg?.args.length));

  // the not function is a special operator that can be used in different ways,
  // and not all these are mapped within the AST data structure: in particular
  // <COMMAND> <field> NOT <here>
  // is an incomplete statement and it results in a missing AST node, so we need to detect
  // from the query string itself
  const endsWithNot =
    / not$/i.test(innerText.trimEnd()) &&
    !command.args.some((arg) => isFunctionItem(arg) && arg.name === 'not');

  // early exit in case of a missing function
  if (isFunctionItem(lastArg) && !getFunctionDefinition(lastArg.name)) {
    return [];
  }

  // Are options already declared? This is useful to suggest only new ones
  const optionsAlreadyDeclared = (
    command.args.filter((arg) => isOptionItem(arg)) as ESQLCommandOption[]
  ).map(({ name }) => ({
    name,
    index: commandDef.options!.findIndex(({ name: defName }) => defName === name),
  }));
  const optionsAvailable = commandDef.options.filter(({ name }, index) => {
    const optArg = optionsAlreadyDeclared.find(({ name: optionName }) => optionName === name);
    return (!optArg && !optionsAlreadyDeclared.length) || (optArg && index > optArg.index);
  });
  const hasRecommendedQueries = Boolean(commandDef?.hasRecommendedQueries);
  // get the next definition for the given command
  let argDef = commandDef.signature.params[argIndex];
  // tune it for the variadic case
  if (!argDef) {
    // this is the case of a comma argument
    if (commandDef.signature.multipleParams) {
      if (isNewExpression || (isAssignment(lastArg) && !isAssignmentComplete(lastArg))) {
        // i.e. ... | <COMMAND> a, <here>
        // i.e. ... | <COMMAND> a = ..., b = <here>
        argDef = commandDef.signature.params[0];
      }
    }

    // this is the case where there's an argument, but it's of the wrong type
    // i.e. ... | WHERE numberField <here> (WHERE wants a boolean expression!)
    // i.e. ... | STATS numberfield <here> (STATS wants a function expression!)
    if (!isNewExpression && nodeArg && !Array.isArray(nodeArg)) {
      const prevArg = commandDef.signature.params[prevIndex];
      // in some cases we do not want to go back as the command only accepts a literal
      // i.e. LIMIT 5 <suggest> -> that's it, so no argDef should be assigned

      // make an exception for STATS (STATS is the only command who accept a function type as arg)
      if (
        prevArg &&
        (prevArg.type === 'function' || (!Array.isArray(nodeArg) && prevArg.type !== nodeArg.type))
      ) {
        if (!isLiteralItem(nodeArg) || !prevArg.constantOnly) {
          argDef = prevArg;
        }
      }
    }
  }

  const previousWord = findPreviousWord(innerText);
  // enrich with assignment has some special rules who are handled somewhere else
  const canHaveAssignments =
    ['eval', 'stats', 'row'].includes(command.name) &&
    !comparisonFunctions.map((fn) => fn.name).includes(previousWord);

  const suggestions: SuggestionRawDefinition[] = [];

  // When user types and accepts autocomplete suggestion, and cursor is placed at the end of a valid field
  // we should not show irrelevant functions that might have words matching
  const columnWithActiveCursor = commands.find(
    (c) =>
      c.name === command.name &&
      command.name === 'eval' &&
      c.args.some((arg) => isColumnItem(arg) && arg.name.includes(EDITOR_MARKER))
  );

  const shouldShowFunctions = !columnWithActiveCursor;

  // in this flow there's a clear plan here from argument definitions so try to follow it
  if (argDef) {
    if (argDef.type === 'column' || argDef.type === 'any' || argDef.type === 'function') {
      if (isNewExpression && canHaveAssignments) {
        if (endsWithNot) {
          // i.e.
          // ... | ROW field NOT <suggest>
          // ... | EVAL field NOT <suggest>
          // there's not way to know the type of the field here, so suggest anything
          suggestions.push(...getNextTokenForNot(command.name, option?.name, 'any'));
        } else {
          // i.e.
          // ... | ROW <suggest>
          // ... | STATS <suggest>
          // ... | STATS ..., <suggest>
          // ... | EVAL <suggest>
          // ... | EVAL ..., <suggest>
          suggestions.push(getNewVariableSuggestion(findNewVariable(anyVariables)));
        }
      }
    }
    // Suggest fields or variables
    if (argDef.type === 'column' || argDef.type === 'any') {
      if ((!nodeArg || isNewExpression) && !endsWithNot) {
        const fieldSuggestions = await getFieldsOrFunctionsSuggestions(
          argDef.innerTypes || ['any'],
          command.name,
          option?.name,
          getFieldsByType,
          {
            // TODO instead of relying on canHaveAssignments and other command name checks
            // we should have a more generic way to determine if a command can have functions.
            // I think it comes down to the definition of 'column' since 'any' should always
            // include functions.
            functions: canHaveAssignments || command.name === 'sort',
            fields: !argDef.constantOnly,
            variables: anyVariables,
            literals: argDef.constantOnly,
          },
          {
            ignoreColumns: isNewExpression
              ? command.args.filter(isColumnItem).map(({ name }) => name)
              : [],
          }
        );

        const fieldFragmentSuggestions = await handleFragment(
          innerText,
          (fragment) => Boolean(getColumnByName(fragment, references)),
          (_fragment: string, rangeToReplace?: { start: number; end: number }) => {
            // COMMAND fie<suggest>
            return fieldSuggestions.map((suggestion) => ({
              ...suggestion,
              text: suggestion.text + (['grok', 'dissect'].includes(command.name) ? ' ' : ''),
              command: TRIGGER_SUGGESTION_COMMAND,
              rangeToReplace,
            }));
          },
          (fragment: string, rangeToReplace: { start: number; end: number }) => {
            // COMMAND field<suggest>
            if (['grok', 'dissect'].includes(command.name)) {
              return fieldSuggestions.map((suggestion) => ({
                ...suggestion,
                text: suggestion.text + ' ',
                command: TRIGGER_SUGGESTION_COMMAND,
                rangeToReplace,
              }));
            }

            const finalSuggestions = [{ ...pipeCompleteItem, text: ' | ' }];
            if (fieldSuggestions.length > 1)
              // when we fix the editor marker, this should probably be checked against 0 instead of 1
              // this is because the last field in the AST is currently getting removed (because it contains
              // the editor marker) so it is not included in the ignored list which is used to filter out
              // existing fields above.
              finalSuggestions.push({ ...commaCompleteItem, text: ', ' });

            return finalSuggestions.map<SuggestionRawDefinition>((s) => ({
              ...s,
              filterText: fragment,
              text: fragment + s.text,
              command: TRIGGER_SUGGESTION_COMMAND,
              rangeToReplace,
            }));
          }
        );

        suggestions.push(...fieldFragmentSuggestions);
      }
    }
    if (argDef.type === 'function' || argDef.type === 'any') {
      if (isColumnItem(nodeArg)) {
        // ... | STATS a <suggest>
        // ... | EVAL a <suggest>
        const nodeArgType = extractTypeFromASTArg(nodeArg, references);
        if (isParameterType(nodeArgType)) {
          suggestions.push(
            ...getOperatorSuggestions({
              command: command.name,
              leftParamType: nodeArgType,
              ignored: workoutBuiltinOptions(nodeArg, references).ignored,
            })
          );
        } else {
          suggestions.push(getAssignmentDefinitionCompletitionItem());
        }
      }
      if (
        (isNewExpression && !endsWithNot) ||
        (isAssignment(nodeArg) && !isAssignmentComplete(nodeArg))
      ) {
        // ... | STATS a = <suggest>
        // ... | EVAL a = <suggest>
        // ... | STATS a = ..., <suggest>
        // ... | EVAL a = ..., <suggest>
        // ... | STATS a = ..., b = <suggest>
        // ... | EVAL a = ..., b = <suggest>
        suggestions.push(
          ...(await getFieldsOrFunctionsSuggestions(
            ['any'],
            command.name,
            option?.name,
            getFieldsByType,
            {
              functions: shouldShowFunctions,
              fields: false,
              variables: nodeArg ? undefined : anyVariables,
              literals: argDef.constantOnly,
            }
          ))
        );
        if (['show', 'meta'].includes(command.name)) {
          suggestions.push(...getOperatorSuggestions({ command: command.name }));
        }
      }
    }

    if (argDef.type === 'any') {
      // ... | EVAL var = field <suggest>
      // ... | EVAL var = fn(field) <suggest>
      // make sure we're still in the same assignment context and there's no comma (newExpression ensures that)
      if (!isNewExpression) {
        if (isAssignment(nodeArg) && isAssignmentComplete(nodeArg)) {
          const [rightArg] = nodeArg.args[1] as [ESQLSingleAstItem];
          const nodeArgType = extractTypeFromASTArg(rightArg, references);
          suggestions.push(
            ...getOperatorSuggestions({
              command: command.name,
              leftParamType: isParameterType(nodeArgType) ? nodeArgType : 'any',
              ignored: workoutBuiltinOptions(nodeArg, references).ignored,
            })
          );
          if (isNumericType(nodeArgType) && isLiteralItem(rightArg)) {
            // ... EVAL var = 1 <suggest>
            suggestions.push(...getCompatibleLiterals(command.name, ['time_literal_unit']));
          }
          if (isFunctionItem(rightArg)) {
            if (rightArg.args.some(isTimeIntervalItem)) {
              const lastFnArg = rightArg.args[rightArg.args.length - 1];
              const lastFnArgType = extractTypeFromASTArg(lastFnArg, references);
              if (isNumericType(lastFnArgType) && isLiteralItem(lastFnArg))
                // ... EVAL var = 1 year + 2 <suggest>
                suggestions.push(...getCompatibleLiterals(command.name, ['time_literal_unit']));
            }
          }
        } else {
          if (isFunctionItem(nodeArg)) {
            if (nodeArg.name === 'not') {
              suggestions.push(
                ...(await getFieldsOrFunctionsSuggestions(
                  ['boolean'],
                  command.name,
                  option?.name,
                  getFieldsByType,
                  {
                    functions: true,
                    fields: true,
                    variables: anyVariables,
                  }
                ))
              );
            } else {
              const nodeArgType = extractTypeFromASTArg(nodeArg, references);
              suggestions.push(
                ...(await getBuiltinFunctionNextArgument(
                  innerText,
                  command,
                  option,
                  argDef,
                  nodeArg,
                  (nodeArgType as string) || 'any',
                  references,
                  getFieldsByType
                ))
              );
              if (nodeArg.args.some(isTimeIntervalItem)) {
                const lastFnArg = nodeArg.args[nodeArg.args.length - 1];
                const lastFnArgType = extractTypeFromASTArg(lastFnArg, references);
                if (isNumericType(lastFnArgType) && isLiteralItem(lastFnArg))
                  // ... EVAL var = 1 year + 2 <suggest>
                  suggestions.push(...getCompatibleLiterals(command.name, ['time_literal_unit']));
              }
            }
          }
        }
      }
    }

    // if the definition includes a list of constants, suggest them
    if (argDef.values) {
      // ... | <COMMAND> ... <suggest enums>
      suggestions.push(
        ...buildConstantsDefinitions(argDef.values, undefined, undefined, {
          advanceCursorAndOpenSuggestions: true,
        })
      );
    }
    // If the type is specified try to dig deeper in the definition to suggest the best candidate
    if (
      ['string', 'text', 'keyword', 'boolean', ...ESQL_NUMBER_TYPES].includes(argDef.type) &&
      !argDef.values
    ) {
      // it can be just literal values (i.e. "string")
      if (argDef.constantOnly) {
        // ... | <COMMAND> ... <suggest>
        suggestions.push(...getCompatibleLiterals(command.name, [argDef.type], [argDef.name]));
      } else {
        // or it can be anything else as long as it is of the right type and the end (i.e. column or function)
        if (!nodeArg) {
          if (endsWithNot) {
            // i.e.
            // ... | WHERE field NOT <suggest>
            // there's not way to know the type of the field here, so suggest anything
            suggestions.push(...getNextTokenForNot(command.name, option?.name, 'any'));
          } else {
            // ... | <COMMAND> <suggest>
            // In this case start suggesting something not strictly based on type
            suggestions.push(
              ...(await getFieldsByType('any', [], { advanceCursor: true, openSuggestions: true })),
              ...(await getFieldsOrFunctionsSuggestions(
                ['any'],
                command.name,
                option?.name,
                getFieldsByType,
                {
                  functions: true,
                  fields: false,
                  variables: anyVariables,
                }
              ))
            );
          }
        } else {
          // if something is already present, leverage its type to suggest something in context
          const nodeArgType = extractTypeFromASTArg(nodeArg, references);
          // These cases can happen here, so need to identify each and provide the right suggestion
          // i.e. ... | <COMMAND> field <suggest>
          // i.e. ... | <COMMAND> field + <suggest>
          // i.e. ... | <COMMAND> field >= <suggest>
          // i.e. ... | <COMMAND> field > 0 <suggest>
          // i.e. ... | <COMMAND> field + otherN <suggest>
          // "FROM a | WHERE doubleField IS NOT N"
          if (nodeArgType) {
            if (isFunctionItem(nodeArg)) {
              if (nodeArg.name === 'not') {
                suggestions.push(
                  ...(await getFieldsOrFunctionsSuggestions(
                    ['boolean'],
                    command.name,
                    option?.name,
                    getFieldsByType,
                    {
                      functions: true,
                      fields: true,
                      variables: anyVariables,
                    }
                  ))
                );
              } else {
                suggestions.push(
                  ...(await getBuiltinFunctionNextArgument(
                    innerText,
                    command,
                    option,
                    argDef,
                    nodeArg,
                    nodeArgType as string,
                    references,
                    getFieldsByType
                  ))
                );
              }
            } else if (isParameterType(nodeArgType)) {
              // i.e. ... | <COMMAND> field <suggest>
              suggestions.push(
                ...getOperatorSuggestions({
                  command: command.name,
                  leftParamType: nodeArgType,
                  ignored: workoutBuiltinOptions(nodeArg, references).ignored,
                })
              );
            }
          }
        }
      }
    }
    if (argDef.type === 'source') {
      if (argDef.innerTypes?.includes('policy')) {
        // ... | ENRICH <suggest>
        const policies = await getPolicies();
        const lastWord = findFinalWord(innerText);
        if (lastWord !== '') {
          policies.forEach((suggestion) => {
            suggestions.push({
              ...suggestion,
              rangeToReplace: {
                start: innerText.length - lastWord.length + 1,
                end: innerText.length + 1,
              },
            });
          });
        }
        suggestions.push(...(policies.length ? policies : [buildNoPoliciesAvailableDefinition()]));
      } else {
        const indexes = getSourcesFromCommands(commands, 'index');
        const lastIndex = indexes[indexes.length - 1];
        const canRemoveQuote = isNewExpression && innerText.includes('"');
        // Function to add suggestions based on canRemoveQuote
        const addSuggestionsBasedOnQuote = async (definitions: SuggestionRawDefinition[]) => {
          suggestions.push(
            ...(canRemoveQuote ? removeQuoteForSuggestedSources(definitions) : definitions)
          );
        };

        if (lastIndex && lastIndex.text && lastIndex.text !== EDITOR_MARKER) {
          const sources = await getSources();

          const recommendedQueriesSuggestions = hasRecommendedQueries
            ? await getRecommendedQueriesSuggestions(getFieldsByType)
            : [];

          const suggestionsToAdd = await handleFragment(
            innerText,
            (fragment) =>
              sourceExists(fragment, new Set(sources.map(({ name: sourceName }) => sourceName))),
            (_fragment, rangeToReplace) => {
              return getSourceSuggestions(sources).map((suggestion) => ({
                ...suggestion,
                rangeToReplace,
              }));
            },
            (fragment, rangeToReplace) => {
              const exactMatch = sources.find(({ name: _name }) => _name === fragment);
              if (exactMatch?.dataStreams) {
                // this is an integration name, suggest the datastreams
                const definitions = buildSourcesDefinitions(
                  exactMatch.dataStreams.map(({ name }) => ({ name, isIntegration: false }))
                );

                return canRemoveQuote ? removeQuoteForSuggestedSources(definitions) : definitions;
              } else {
                const _suggestions: SuggestionRawDefinition[] = [
                  {
                    ...pipeCompleteItem,
                    filterText: fragment,
                    text: fragment + ' | ',
                    command: TRIGGER_SUGGESTION_COMMAND,
                    rangeToReplace,
                  },
                  {
                    ...commaCompleteItem,
                    filterText: fragment,
                    text: fragment + ', ',
                    command: TRIGGER_SUGGESTION_COMMAND,
                    rangeToReplace,
                  },
                  {
                    ...buildOptionDefinition(metadataOption),
                    filterText: fragment,
                    text: fragment + ' METADATA ',
                    asSnippet: false, // turn this off because $ could be contained within the source name
                    rangeToReplace,
                  },
                  ...recommendedQueriesSuggestions.map((suggestion) => ({
                    ...suggestion,
                    rangeToReplace,
                    filterText: fragment,
                    text: fragment + suggestion.text,
                  })),
                ];
                return _suggestions;
              }
            }
          );
          addSuggestionsBasedOnQuote(suggestionsToAdd);
        } else {
          // FROM <suggest> or no index/text
          await addSuggestionsBasedOnQuote(getSourceSuggestions(await getSources()));
        }
      }
    }
  }

  const nonOptionArgs = command.args.filter(
    (arg) => !isOptionItem(arg) && !isSettingItem(arg) && !Array.isArray(arg) && !arg.incomplete
  );
  // Perform some checks on mandatory arguments
  const mandatoryArgsAlreadyPresent =
    (commandDef.signature.multipleParams && nonOptionArgs.length > 1) ||
    nonOptionArgs.length >=
      commandDef.signature.params.filter(({ optional }) => !optional).length ||
    argDef?.type === 'function';

  // check if declared args are fully valid for the given command
  const currentArgsAreValidForCommand = areCurrentArgsValid(command, nodeArg, references);

  // latest suggestions: options and final ones
  if (
    (!isNewExpression && mandatoryArgsAlreadyPresent && currentArgsAreValidForCommand) ||
    optionsAlreadyDeclared.length
  ) {
    // suggest some command options
    if (optionsAvailable.length) {
      suggestions.push(
        ...optionsAvailable.map((opt) => buildOptionDefinition(opt, command.name === 'dissect'))
      );
    }

    if (!optionsAvailable.length || optionsAvailable.every(({ optional }) => optional)) {
      const shouldPushItDown = command.name === 'eval' && !command.args.some(isFunctionItem);
      // now suggest pipe or comma
      const finalSuggestions = getFinalSuggestions({
        comma:
          commandDef.signature.multipleParams &&
          optionsAvailable.length === commandDef.options.length,
      }).map(({ sortText, ...rest }) => ({
        ...rest,
        sortText: shouldPushItDown ? `Z${sortText}` : sortText,
      }));
      suggestions.push(...finalSuggestions);
    }

    // handle recommended queries for from
    if (hasRecommendedQueries) {
      suggestions.push(...(await getRecommendedQueriesSuggestions(getFieldsByType)));
    }
  }
  // Due to some logic overlapping functions can be repeated
  // so dedupe here based on text string (it can differ from name)
  return uniqBy(suggestions, (suggestion) => suggestion.text);
}

async function getBuiltinFunctionNextArgument(
  queryText: string,
  command: ESQLCommand,
  option: ESQLCommandOption | undefined,
  argDef: { type: string },
  nodeArg: ESQLFunction,
  nodeArgType: string,
  references: Pick<ReferenceMaps, 'fields' | 'variables'>,
  getFieldsByType: GetColumnsByTypeFn
) {
  const suggestions = [];
  const isFnComplete = isFunctionArgComplete(nodeArg, references);

  if (isFnComplete.complete) {
    // i.e. ... | <COMMAND> field > 0 <suggest>
    // i.e. ... | <COMMAND> field + otherN <suggest>
    suggestions.push(
      ...getOperatorSuggestions({
        command: command.name,
        option: option?.name,
        leftParamType: isParameterType(nodeArgType) ? nodeArgType : 'any',
        ignored: workoutBuiltinOptions(nodeArg, references).ignored,
      })
    );
  } else {
    // i.e. ... | <COMMAND> field >= <suggest>
    // i.e. ... | <COMMAND> field + <suggest>
    // i.e. ... | <COMMAND> field and <suggest>

    // Because it's an incomplete function, need to extract the type of the current argument
    // and suggest the next argument based on types

    // pick the last arg and check its type to verify whether is incomplete for the given function
    const cleanedArgs = removeMarkerArgFromArgsList(nodeArg)!.args;
    const nestedType = extractTypeFromASTArg(nodeArg.args[cleanedArgs.length - 1], references);

    if (isFnComplete.reason === 'fewArgs') {
      const fnDef = getFunctionDefinition(nodeArg.name);
      if (
        fnDef?.signatures.every(({ params }) =>
          params.some(({ type }) => isArrayType(type as string))
        )
      ) {
        suggestions.push(listCompleteItem);
      } else {
        const finalType = nestedType || nodeArgType || 'any';
        const supportedTypes = getSupportedTypesForBinaryOperators(fnDef, finalType as string);

        suggestions.push(
          ...(await getFieldsOrFunctionsSuggestions(
            // this is a special case with AND/OR
            // <COMMAND> expression AND/OR <suggest>
            // technically another boolean value should be suggested, but it is a better experience
            // to actually suggest a wider set of fields/functions
            finalType === 'boolean' && getFunctionDefinition(nodeArg.name)?.type === 'builtin'
              ? ['any']
              : (supportedTypes as string[]),
            command.name,
            option?.name,
            getFieldsByType,
            {
              functions: true,
              fields: true,
              variables: references.variables,
            }
          ))
        );
      }
    }
    if (isFnComplete.reason === 'wrongTypes') {
      if (nestedType) {
        // suggest something to complete the builtin function
        if (
          nestedType !== argDef.type &&
          isParameterType(nestedType) &&
          isReturnType(argDef.type)
        ) {
          suggestions.push(
            ...getOperatorSuggestions({
              command: command.name,
              leftParamType: nestedType,
              returnTypes: [argDef.type],
              ignored: workoutBuiltinOptions(nodeArg, references).ignored,
            })
          );
        }
      }
    }
  }
  return suggestions.map<SuggestionRawDefinition>((s) => {
    const overlap = getOverlapRange(queryText, s.text);
    const offset = overlap.start === overlap.end ? 1 : 0;
    return {
      ...s,
      rangeToReplace: {
        start: overlap.start + offset,
        end: overlap.end + offset,
      },
    };
  });
}

const addCommaIf = (condition: boolean, text: string) => (condition ? `${text},` : text);

async function getFunctionArgsSuggestions(
  innerText: string,
  commands: ESQLCommand[],
  {
    command,
    option,
    node,
  }: {
    command: ESQLCommand;
    option: ESQLCommandOption | undefined;
    node: ESQLFunction;
  },
  getFieldsByType: GetColumnsByTypeFn,
  getFieldsMap: GetFieldsMapFn,
  getPolicyMetadata: GetPolicyMetadataFn,
  fullText: string,
  offset: number
): Promise<SuggestionRawDefinition[]> {
  const fnDefinition = getFunctionDefinition(node.name);
  // early exit on no hit
  if (!fnDefinition) {
    return [];
  }
  const fieldsMap: Map<string, ESQLRealField> = await getFieldsMap();
  const anyVariables = collectVariables(commands, fieldsMap, innerText);

  const references = {
    fields: fieldsMap,
    variables: anyVariables,
  };
  const variablesExcludingCurrentCommandOnes = excludeVariablesFromCurrentCommand(
    commands,
    command,
    fieldsMap,
    innerText
  );

  const { typesToSuggestNext, hasMoreMandatoryArgs, enrichedArgs, argIndex } =
    getValidSignaturesAndTypesToSuggestNext(node, references, fnDefinition, fullText, offset);
  const arg: ESQLAstItem = enrichedArgs[argIndex];

  // Whether to prepend comma to suggestion string
  // E.g. if true, "fieldName" -> "fieldName, "
  const isCursorFollowedByComma = fullText
    ? fullText.slice(offset, fullText.length).trimStart().startsWith(',')
    : false;
  const canBeBooleanCondition =
    // For `CASE()`, there can be multiple conditions, so keep suggesting fields and functions if possible
    fnDefinition.name === 'case' ||
    // If the type is explicitly a boolean condition
    typesToSuggestNext.some((t) => t && t.type === 'boolean' && t.name === 'condition');

  const shouldAddComma =
    hasMoreMandatoryArgs &&
    fnDefinition.type !== 'builtin' &&
    !isCursorFollowedByComma &&
    !canBeBooleanCondition;
  const shouldAdvanceCursor =
    hasMoreMandatoryArgs && fnDefinition.type !== 'builtin' && !isCursorFollowedByComma;

  const suggestedConstants = uniq(
    typesToSuggestNext
      .map((d) => d.literalSuggestions || d.acceptedValues)
      .filter((d) => d)
      .flat()
  ) as string[];

  if (suggestedConstants.length) {
    return buildValueDefinitions(suggestedConstants, {
      addComma: shouldAddComma,
      advanceCursorAndOpenSuggestions: hasMoreMandatoryArgs,
    });
  }

  const suggestions: SuggestionRawDefinition[] = [];
  const noArgDefined = !arg;
  const isUnknownColumn =
    arg &&
    isColumnItem(arg) &&
    !getColumnExists(arg, {
      fields: fieldsMap,
      variables: variablesExcludingCurrentCommandOnes,
    });
  if (noArgDefined || isUnknownColumn) {
    // ... | EVAL fn( <suggest>)
    // ... | EVAL fn( field, <suggest>)

    const commandArgIndex = command.args.findIndex(
      (cmdArg) => isSingleItem(cmdArg) && cmdArg.location.max >= node.location.max
    );
    const finalCommandArgIndex =
      command.name !== 'stats'
        ? -1
        : commandArgIndex < 0
        ? Math.max(command.args.length - 1, 0)
        : commandArgIndex;

    const finalCommandArg = command.args[finalCommandArgIndex];

    const fnToIgnore = [];
    // just ignore the current function
    if (
      command.name !== 'stats' ||
      (isOptionItem(finalCommandArg) && finalCommandArg.name === 'by')
    ) {
      fnToIgnore.push(node.name);
    } else {
      fnToIgnore.push(
        ...getFunctionsToIgnoreForStats(command, finalCommandArgIndex),
        ...(isAggFunctionUsedAlready(command, finalCommandArgIndex)
          ? getAllFunctions({ type: 'agg' }).map(({ name }) => name)
          : [])
      );
    }
    // Separate the param definitions into two groups:
    // fields should only be suggested if the param isn't constant-only,
    // and constant suggestions should only be given if it is.
    //
    // TODO - consider incorporating the literalOptions into this
    //
    // TODO — improve this to inherit the constant flag from the outer function
    // (e.g. if func1's first parameter is constant-only, any nested functions should
    // inherit that constraint: func1(func2(shouldBeConstantOnly)))
    //
    const constantOnlyParamDefs = typesToSuggestNext.filter(
      (p) => p.constantOnly || /_literal/.test(p.type as string)
    );

    const getTypesFromParamDefs = (paramDefs: FunctionParameter[]) => {
      return Array.from(new Set(paramDefs.map(({ type }) => type)));
    };

    // Literals
    suggestions.push(
      ...getCompatibleLiterals(
        command.name,
        getTypesFromParamDefs(constantOnlyParamDefs) as string[],
        undefined,
        { addComma: shouldAddComma, advanceCursorAndOpenSuggestions: hasMoreMandatoryArgs }
      )
    );

    // Fields

    suggestions.push(
      ...pushItUpInTheList(
        await getFieldsByType(
          // For example, in case() where we are expecting a boolean condition
          // we can accept any field types (field1 !== field2)
          canBeBooleanCondition
            ? ['any']
            : // @TODO: have a way to better suggest constant only params
              (getTypesFromParamDefs(
                typesToSuggestNext.filter((d) => !d.constantOnly)
              ) as string[]),
          [],
          {
            addComma: shouldAddComma,
            advanceCursor: shouldAdvanceCursor,
            openSuggestions: shouldAdvanceCursor,
          }
        ),
        true
      )
    );

    // Functions
    suggestions.push(
      ...getFunctionSuggestions({
        command: command.name,
        option: option?.name,
        returnTypes: canBeBooleanCondition
          ? ['any']
          : (getTypesFromParamDefs(typesToSuggestNext) as string[]),
        ignored: fnToIgnore,
      }).map((suggestion) => ({
        ...suggestion,
        text: addCommaIf(shouldAddComma, suggestion.text),
      }))
    );
    // could also be in stats (bucket) but our autocomplete is not great yet
    if (
      (getTypesFromParamDefs(typesToSuggestNext).includes('date') &&
        ['where', 'eval'].includes(command.name)) ||
      (command.name === 'stats' &&
        typesToSuggestNext.some((t) => t && t.type === 'date' && t.constantOnly === true))
    )
      suggestions.push(
        ...getDateLiterals({
          addComma: shouldAddComma,
          advanceCursorAndOpenSuggestions: hasMoreMandatoryArgs,
        })
      );
  }

  // for eval and row commands try also to complete numeric literals with time intervals where possible
  if (arg) {
    if (command.name !== 'stats') {
      if (isLiteralItem(arg) && isNumericType(arg.literalType)) {
        // ... | EVAL fn(2 <suggest>)
        suggestions.push(
          ...getCompatibleLiterals(command.name, ['time_literal_unit'], undefined, {
            addComma: shouldAddComma,
            advanceCursorAndOpenSuggestions: hasMoreMandatoryArgs,
          })
        );
      }
    }
    // Suggest comparison functions for boolean conditions
    if (canBeBooleanCondition) {
      suggestions.push(
        ...comparisonFunctions.map<SuggestionRawDefinition>(({ name, description }) => ({
          label: name,
          text: name,
          kind: 'Function' as ItemKind,
          detail: description,
        }))
      );
    }
    if (hasMoreMandatoryArgs) {
      // Suggest a comma if there's another argument for the function
      suggestions.push(commaCompleteItem);
    }
  }

  // For special case of COUNT, suggest * if cursor is in empty spot
  // e.g. count( / ) -> suggest `*`
  if (fnDefinition.name === 'count' && !arg) {
    suggestions.push(allStarConstant);
  }
  return suggestions;
}

async function getListArgsSuggestions(
  innerText: string,
  commands: ESQLCommand[],
  {
    command,
    node,
  }: {
    command: ESQLCommand;
    node: ESQLSingleAstItem | undefined;
  },
  getFieldsByType: GetColumnsByTypeFn,
  getFieldsMaps: GetFieldsMapFn,
  getPolicyMetadata: GetPolicyMetadataFn
) {
  const suggestions = [];
  // node is supposed to be the function who support a list argument (like the "in" operator)
  // so extract the type of the first argument and suggest fields of that type
  if (node && isFunctionItem(node)) {
    const fieldsMap: Map<string, ESQLRealField> = await getFieldsMaps();
    const anyVariables = collectVariables(commands, fieldsMap, innerText);
    // extract the current node from the variables inferred
    anyVariables.forEach((values, key) => {
      if (values.some((v) => v.location === node.location)) {
        anyVariables.delete(key);
      }
    });
    const [firstArg] = node.args;
    if (isColumnItem(firstArg)) {
      const argType = extractTypeFromASTArg(firstArg, {
        fields: fieldsMap,
        variables: anyVariables,
      });
      if (argType) {
        // do not propose existing columns again
        const otherArgs = node.args.filter(Array.isArray).flat().filter(isColumnItem);
        suggestions.push(
          ...(await getFieldsOrFunctionsSuggestions(
            [argType as string],
            command.name,
            undefined,
            getFieldsByType,
            {
              functions: true,
              fields: true,
              variables: anyVariables,
            },
            { ignoreColumns: [firstArg.name, ...otherArgs.map(({ name }) => name)] }
          ))
        );
      }
    }
  }
  return suggestions;
}

async function getSettingArgsSuggestions(
  innerText: string,
  commands: ESQLCommand[],
  {
    command,
    node,
  }: {
    command: ESQLCommand;
    node: ESQLSingleAstItem | undefined;
  },
  getFieldsByType: GetColumnsByTypeFn,
  getFieldsMaps: GetFieldsMapFn,
  getPolicyMetadata: GetPolicyMetadataFn
) {
  const suggestions = [];

  const settingDefs = getCommandDefinition(command.name).modes || [];

  if (settingDefs.length) {
    const lastChar = getLastNonWhitespaceChar(innerText);
    const matchingSettingDefs = settingDefs.filter(({ prefix }) => lastChar === prefix);
    if (matchingSettingDefs.length) {
      // COMMAND _<here>
      suggestions.push(...matchingSettingDefs.flatMap(buildSettingDefinitions));
    }
  }
  return suggestions;
}

/**
 * @deprecated — this will disappear when https://github.com/elastic/kibana/issues/195418 is complete
 * because "options" will be handled in imperative command-specific routines instead of being independent.
 */
async function getOptionArgsSuggestions(
  innerText: string,
  commands: ESQLCommand[],
  {
    command,
    option,
    node,
  }: {
    command: ESQLCommand;
    option: ESQLCommandOption;
    node: ESQLSingleAstItem | undefined;
  },
  getFieldsByType: GetColumnsByTypeFn,
  getFieldsMaps: GetFieldsMapFn,
  getPolicyMetadata: GetPolicyMetadataFn
) {
  const optionDef = getCommandOption(option.name);
  if (!optionDef || !optionDef.signature) {
    return [];
  }
  const { nodeArg, lastArg } = extractArgMeta(option, node);
  const suggestions = [];
  const isNewExpression = isRestartingExpression(innerText) || option.args.length === 0;

  const fieldsMap = await getFieldsMaps();
  const anyVariables = collectVariables(commands, fieldsMap, innerText);

  if (command.name === 'enrich') {
    if (option.name === 'on') {
      // if it's a new expression, suggest fields to match on
      if (
        isNewExpression ||
        noCaseCompare(findPreviousWord(innerText), 'ON') ||
        (option && isAssignment(option.args[0]) && !option.args[1])
      ) {
        const policyName = isSourceItem(command.args[0]) ? command.args[0].name : undefined;
        if (policyName) {
          const policyMetadata = await getPolicyMetadata(policyName);
          if (policyMetadata) {
            suggestions.push(
              ...buildMatchingFieldsDefinition(
                policyMetadata.matchField,
                Array.from(fieldsMap.keys())
              )
            );
          }
        }
      } else {
        // propose the with option
        suggestions.push(
          buildOptionDefinition(getCommandOption('with')!),
          ...getFinalSuggestions({
            comma: false,
          })
        );
      }
    }
    if (option.name === 'with') {
      const policyName = isSourceItem(command.args[0]) ? command.args[0].name : undefined;
      if (policyName) {
        const policyMetadata = await getPolicyMetadata(policyName);
        const anyEnhancedVariables = collectVariables(
          commands,
          appendEnrichFields(fieldsMap, policyMetadata),
          innerText
        );

        if (isNewExpression || noCaseCompare(findPreviousWord(innerText), 'WITH')) {
          suggestions.push(getNewVariableSuggestion(findNewVariable(anyEnhancedVariables)));
        }

        // make sure to remove the marker arg from the assign fn
        const assignFn = isAssignment(lastArg)
          ? (removeMarkerArgFromArgsList(lastArg) as ESQLFunction)
          : undefined;

        if (policyMetadata) {
          if (isNewExpression || (assignFn && !isAssignmentComplete(assignFn))) {
            // ... | ENRICH ... WITH a =
            // ... | ENRICH ... WITH b
            const fieldSuggestions = buildFieldsDefinitions(policyMetadata.enrichFields);
            // in this case, we don't want to open the suggestions menu when the field is accepted
            // because we're keeping the suggestions simple here for now. Could always revisit.
            fieldSuggestions.forEach((s) => (s.command = undefined));

            // attach the replacement range if needed
            const lastWord = findFinalWord(innerText);
            if (lastWord) {
              // ENRICH ... WITH a <suggest>
              const rangeToReplace = {
                start: innerText.length - lastWord.length + 1,
                end: innerText.length + 1,
              };
              fieldSuggestions.forEach((s) => (s.rangeToReplace = rangeToReplace));
            }
            suggestions.push(...fieldSuggestions);
          }
        }

        if (
          assignFn &&
          hasSameArgBothSides(assignFn) &&
          !isNewExpression &&
          !isIncompleteItem(assignFn)
        ) {
          // ... | ENRICH ... WITH a
          // effectively only assign will apper
          suggestions.push(
            ...pushItUpInTheList(getOperatorSuggestions({ command: command.name }), true)
          );
        }

        if (
          assignFn &&
          (isAssignmentComplete(assignFn) || hasSameArgBothSides(assignFn)) &&
          !isNewExpression
        ) {
          suggestions.push(
            ...getFinalSuggestions({
              comma: true,
            })
          );
        }
      }
    }
  }
  if (command.name === 'rename') {
    if (option.args.length < 2) {
      suggestions.push(...buildVariablesDefinitions([findNewVariable(anyVariables)]));
    }
  }

  if (command.name === 'dissect') {
    if (
      option.args.filter((arg) => !(isSingleItem(arg) && arg.type === 'unknown')).length < 1 &&
      optionDef
    ) {
      suggestions.push(colonCompleteItem, semiColonCompleteItem);
    }
  }

  if (option.name === 'metadata') {
    const existingFields = new Set(option.args.filter(isColumnItem).map(({ name }) => name));
    const filteredMetaFields = METADATA_FIELDS.filter((name) => !existingFields.has(name));
    if (isNewExpression) {
      suggestions.push(
        ...(await handleFragment(
          innerText,
          (fragment) => METADATA_FIELDS.includes(fragment),
          (_fragment, rangeToReplace) =>
            buildFieldsDefinitions(filteredMetaFields).map((suggestion) => ({
              ...suggestion,
              rangeToReplace,
            })),
          (fragment, rangeToReplace) => {
            const _suggestions = [
              {
                ...pipeCompleteItem,
                text: fragment + ' | ',
                filterText: fragment,
                command: TRIGGER_SUGGESTION_COMMAND,
                rangeToReplace,
              },
            ];
            if (filteredMetaFields.length > 1) {
              _suggestions.push({
                ...commaCompleteItem,
                text: fragment + ', ',
                filterText: fragment,
                command: TRIGGER_SUGGESTION_COMMAND,
                rangeToReplace,
              });
            }
            return _suggestions;
          }
        ))
      );
    } else {
      if (existingFields.size > 0) {
        // METADATA field <suggest>
        if (filteredMetaFields.length > 0) {
          suggestions.push(commaCompleteItem);
        }
        suggestions.push(pipeCompleteItem);
      }
    }
  }

  if (optionDef) {
    if (!suggestions.length) {
      const argDefIndex = optionDef.signature.multipleParams
        ? 0
        : Math.max(option.args.length - 1, 0);
      const types = [optionDef.signature.params[argDefIndex].type].filter(nonNullable);
      // If it's a complete expression then proposed some final suggestions
      // A complete expression is either a function or a column: <COMMAND> <OPTION> field <here>
      // Or an assignment complete: <COMMAND> <OPTION> field = ... <here>
      if (
        (option.args.length && !isNewExpression && !isAssignment(lastArg)) ||
        (isAssignment(lastArg) && isAssignmentComplete(lastArg))
      ) {
        suggestions.push(
          ...getFinalSuggestions({
            comma: optionDef.signature.multipleParams,
          })
        );
      } else if (isNewExpression || (isAssignment(nodeArg) && !isAssignmentComplete(nodeArg))) {
        suggestions.push(
          ...(await getFieldsByType(types[0] === 'column' ? ['any'] : types, [], {
            advanceCursor: true,
            openSuggestions: true,
          }))
        );
      }
    }
  }
  return suggestions;
}
