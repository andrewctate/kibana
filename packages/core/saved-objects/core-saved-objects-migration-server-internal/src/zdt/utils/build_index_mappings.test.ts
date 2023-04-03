/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { buildIndexMappings, buildIndexMeta } from './build_index_mappings';
import { createType } from '../test_helpers';

const getTestTypes = () => {
  const foo = createType({
    name: 'foo',
    switchToModelVersionAt: '8.7.0',
    modelVersions: {
      1: { modelChange: { type: 'expansion' } },
      2: { modelChange: { type: 'expansion' } },
    },
    mappings: { properties: { fooField: { type: 'text' } } },
  });
  const bar = createType({
    name: 'bar',
    switchToModelVersionAt: '8.7.0',
    modelVersions: {
      1: { modelChange: { type: 'expansion' } },
    },
    mappings: { properties: { barField: { type: 'text' } } },
  });
  const dolly = createType({
    name: 'dolly',
    switchToModelVersionAt: '8.7.0',
    modelVersions: () => ({
      1: { modelChange: { type: 'expansion' } },
      2: { modelChange: { type: 'expansion' } },
      3: { modelChange: { type: 'expansion' } },
    }),
    mappings: { properties: { dollyField: { type: 'text' } } },
  });

  return { foo, bar, dolly };
};

describe('buildIndexMappings', () => {
  it('builds the mappings used when creating a new index', () => {
    const { foo, bar, dolly } = getTestTypes();
    const mappings = buildIndexMappings({
      types: [foo, bar, dolly],
    });

    expect(mappings).toEqual({
      dynamic: 'strict',
      properties: expect.objectContaining({
        foo: foo.mappings,
        bar: bar.mappings,
        dolly: dolly.mappings,
      }),
      _meta: buildIndexMeta({ types: [foo, bar, dolly] }),
    });
  });
});

describe('buildIndexMeta', () => {
  it('builds the _meta field value of the mapping', () => {
    const { foo, bar, dolly } = getTestTypes();
    const meta = buildIndexMeta({
      types: [foo, bar, dolly],
    });

    expect(meta).toEqual({
      mappingVersions: {
        foo: 2,
        bar: 1,
        dolly: 3,
      },
      docVersions: {
        foo: 2,
        bar: 1,
        dolly: 3,
      },
      migrationState: {
        convertingDocuments: false,
      },
    });
  });
});
