/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */
import { type ESQLSource } from '@kbn/esql-ast';

const DEFAULT_ESQL_LIMIT = 500;

// retrieves the index pattern from the aggregate query for SQL
export function getIndexPatternFromSQLQuery(sqlQuery?: string): string {
  let sql = sqlQuery?.replaceAll('"', '').replaceAll("'", '');
  const splitFroms = sql?.split(new RegExp(/FROM\s/, 'ig'));
  const fromsLength = splitFroms?.length ?? 0;
  if (splitFroms && splitFroms?.length > 2) {
    sql = `${splitFroms[fromsLength - 2]} FROM ${splitFroms[fromsLength - 1]}`;
  }
  // case insensitive match for the index pattern
  const regex = new RegExp(/FROM\s+([(\w*:)?\w*-.!@$^()~;]+)/, 'i');
  const matches = sql?.match(regex);
  if (matches) {
    return matches[1];
  }
  return '';
}

// retrieves the index pattern from the aggregate query for ES|QL using ast parsing
export async function getIndexPatternFromESQLQuery(esql?: string) {
  // While from the general async bundle global prospective the math doesn't change
  // this async import isolate it a new bundle for those app who use this function but
  // ES|QL is not their main usage preventing to load this (big) dependency when not using it
  const { getAstAndSyntaxErrors } = await import('@kbn/esql-ast');
  const { ast } = await getAstAndSyntaxErrors(esql);
  const fromCommand = ast.find(({ name }) => name === 'from');
  const args = (fromCommand?.args ?? []) as ESQLSource[];
  const indices = args.filter((arg) => arg.sourceType === 'index');
  return indices?.map((index) => index.text).join(',');
}

// retrieves the index pattern from the aggregate query for ES|QL
// this can fail if from is mentioned in comments etc
export function getIndexPatternFromESQLQueryDeprecated(esql?: string): string {
  let fromPipe = (esql || '').split('|')[0];
  const splitFroms = fromPipe?.split(new RegExp(/FROM\s/, 'ig'));
  const fromsLength = splitFroms?.length ?? 0;
  if (splitFroms && splitFroms?.length > 2) {
    fromPipe = `${splitFroms[fromsLength - 2]} FROM ${splitFroms[fromsLength - 1]}`;
  }
  const parsedString = fromPipe?.replaceAll('`', '');
  // case insensitive match for the index pattern
  const regex = new RegExp(/FROM\s+([(\w*:)?\w*-.!@$^()~;\s]+)/, 'i');
  const matches = parsedString?.match(regex);
  if (matches) {
    return matches[1]?.trim();
  }
  return '';
}

export function getLimitFromESQLQuery(esql: string): number {
  const limitCommands = esql.match(new RegExp(/LIMIT\s[0-9]+/, 'ig'));
  if (!limitCommands) {
    return DEFAULT_ESQL_LIMIT;
  }

  const lastIndex = limitCommands.length - 1;
  const split = limitCommands[lastIndex].split(' ');
  return parseInt(split[1], 10);
}

export function removeDropCommandsFromESQLQuery(esql?: string): string {
  const pipes = (esql || '').split('|');
  return pipes.filter((statement) => !/DROP\s/i.test(statement)).join('|');
}
