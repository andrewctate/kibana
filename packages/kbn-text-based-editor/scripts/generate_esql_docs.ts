/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import * as recast from 'recast';
const n = recast.types.namedTypes;
import fs from 'fs';
import path from 'path';
import { functions } from '../src/esql_documentation_sections';

(function () {
  const pathToElasticsearch = process.argv[2];
  const functionDocs = loadFunctionDocs(pathToElasticsearch);
  writeFunctionDocs(functionDocs);
})();

function loadFunctionDocs(pathToElasticsearch: string) {
  // Define the directory path
  const dirPath = path.join(pathToElasticsearch, '/docs/reference/esql/functions/kibana/docs');

  // Read the directory
  const files = fs.readdirSync(dirPath);

  // Initialize an empty map
  const functionMap = new Map<string, string>();

  // Iterate over each file in the directory
  for (const file of files) {
    // Ensure we only process .md files
    if (path.extname(file) === '.md') {
      // Read the file content
      const content = fs.readFileSync(path.join(dirPath, file), 'utf-8');

      // Get the function name from the file name by removing the .md extension
      const functionName = path.basename(file, '.md');

      // Add the function name and content to the map
      functionMap.set(functionName, content);
    }
  }

  return functionMap;
}

function writeFunctionDocs(functionDocs: Map<string, string>) {
  const codeStrings = Array.from(functionDocs.entries()).map(([name, doc]) => {
    const docWithoutLinks = removeAsciiDocInternalCrossReferences(
      doc,
      Array.from(functionDocs.keys())
    );
    return `
  const foo = {
    label: i18n.translate(
      'textBasedEditor.query.textBasedLanguagesEditor.documentationESQL.${name}',
      {
        defaultMessage: '${name.toUpperCase()}',
      }
    ),
    description: (
      <Markdown
        markdownContent={i18n.translate(
          'textBasedEditor.query.textBasedLanguagesEditor.documentationESQL.${name}.markdown',
          {
            defaultMessage: \`${docWithoutLinks.replaceAll('`', '\\`')}\`,
            description:
              'Text is in markdown. Do not translate function names, special characters, or field names like sum(bytes)',
          }
        )}
      />
    ),
  };`;
  });

  const pathToDocsFile = path.join(__dirname, '../src/esql_documentation_sections.tsx');

  const ast = recast.parse(fs.readFileSync(pathToDocsFile, 'utf-8'), {
    parser: require('recast/parsers/babel'),
  });

  const functionsList = findFunctionsList(ast);

  functionsList.elements = codeStrings.map(
    (codeString) => recast.parse(codeString).program.body[0].declarations[0].init
  );

  const newFileContents = recast.print(ast);

  fs.writeFileSync(pathToDocsFile, newFileContents.code);
}

/**
 * Deals with asciidoc internal cross-references in the function descriptions
 *
 * Examples:
 * <<esql-mv_max>> -> `MV_MAX`
 * <<esql-st_intersects,ST_INTERSECTS>> -> `ST_INTERSECTS`
 * <<esql-multivalued-fields, multivalued fields>> -> multivalued fields
 */
function removeAsciiDocInternalCrossReferences(asciidocString: string, functionNames: string[]) {
  const internalCrossReferenceRegex = /<<(.+?)(,.+?)?>>/g;

  const extractPossibleFunctionName = (id: string) => id.replace('esql-', '');

  return asciidocString.replace(internalCrossReferenceRegex, (_match, anchorId, linkText) => {
    const ret = linkText ? linkText.slice(1) : anchorId;

    const matchingFunction = functionNames.find(
      (name) =>
        extractPossibleFunctionName(ret) === name.toLowerCase() ||
        extractPossibleFunctionName(ret) === name.toUpperCase()
    );
    return matchingFunction ? `\`${matchingFunction.toUpperCase()}\`` : ret;
  });
}

/**
 * This function searches the AST for the functions list
 */
function findFunctionsList(ast: any): recast.types.namedTypes.ArrayExpression {
  let foundArray: recast.types.namedTypes.ArrayExpression | null = null;

  const functionsArrayIdentifier = Object.keys({ functions })[0];

  recast.visit(ast, {
    visitVariableDeclarator(astPath) {
      if (
        n.Identifier.check(astPath.node.id) &&
        astPath.node.id.name === functionsArrayIdentifier
      ) {
        this.traverse(astPath);
      }
      return false;
    },
    visitObjectProperty(astPath) {
      if (
        n.Identifier.check(astPath.node.key) &&
        astPath.node.key.name === 'items' &&
        n.ArrayExpression.check(astPath.node.value)
      ) {
        foundArray = astPath.node.value;
        this.abort();
      }
      return false;
    },
  });

  if (!foundArray) {
    throw new Error('Could not find the functions array in the AST');
  }

  return foundArray;
}
