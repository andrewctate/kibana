/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { MappingRuntimeFieldType } from '@elastic/elasticsearch/lib/api/typesWithBodyKey';
import { flatten } from 'lodash';
import type { BrowserFields } from '../../../../common/search_strategy/index_fields';

export const mocksSource = {
  indexFields: [
    {
      name: 'bytes',
      type: 'number',
      esTypes: ['long'],
      aggregatable: true,
      searchable: true,
      count: 10,
      readFromDocValues: true,
      scripted: false,
      isMapped: true,
    },
    {
      name: 'ssl',
      type: 'boolean',
      esTypes: ['boolean'],
      aggregatable: true,
      searchable: true,
      count: 20,
      readFromDocValues: true,
      scripted: false,
      isMapped: true,
    },
    {
      name: '@timestamp',
      type: 'date',
      esTypes: ['date'],
      aggregatable: true,
      searchable: true,
      count: 30,
      readFromDocValues: true,
      scripted: false,
      isMapped: true,
    },
  ],
};

export const mockBrowserFields: BrowserFields = {
  agent: {
    fields: {
      'agent.ephemeral_id': {
        aggregatable: true,
        format: '',
        name: 'agent.ephemeral_id',
        searchable: true,
        type: 'string',
        esTypes: ['keyword'],
      },
      'agent.hostname': {
        aggregatable: true,
        format: '',
        name: 'agent.hostname',
        searchable: true,
        type: 'string',
        esTypes: ['keyword'],
      },
      'agent.id': {
        aggregatable: true,
        format: '',
        name: 'agent.id',
        searchable: true,
        type: 'string',
        esTypes: ['keyword'],
      },
      'agent.name': {
        aggregatable: true,
        format: '',
        name: 'agent.name',
        searchable: true,
        type: 'string',
        esTypes: ['keyword'],
      },
    },
  },
  auditd: {
    fields: {
      'auditd.data.a0': {
        aggregatable: true,
        format: '',
        name: 'auditd.data.a0',
        searchable: true,
        type: 'string',
        esTypes: ['keyword'],
      },
      'auditd.data.a1': {
        aggregatable: true,
        format: '',
        name: 'auditd.data.a1',
        searchable: true,
        type: 'string',
        esTypes: ['keyword'],
      },
      'auditd.data.a2': {
        aggregatable: true,
        format: '',
        name: 'auditd.data.a2',
        searchable: true,
        type: 'string',
        esTypes: ['keyword'],
      },
    },
  },
  base: {
    fields: {
      '@timestamp': {
        aggregatable: true,
        format: '',
        name: '@timestamp',
        searchable: true,
        type: 'date',
        esTypes: ['date'],
        readFromDocValues: true,
      },
      _id: {
        name: '_id',
        type: 'string',
        esTypes: [],
        searchable: true,
        aggregatable: false,
      },
      message: {
        name: 'message',
        type: 'string',
        esTypes: ['text'],
        searchable: true,
        aggregatable: false,
        format: 'string',
      },
    },
  },
  client: {
    fields: {
      'client.address': {
        aggregatable: true,
        format: '',
        name: 'client.address',
        searchable: true,
        type: 'string',
        esTypes: ['keyword'],
      },
      'client.bytes': {
        aggregatable: true,
        format: '',
        name: 'client.bytes',
        searchable: true,
        type: 'number',
        esTypes: ['long'],
      },
      'client.domain': {
        aggregatable: true,
        format: '',
        name: 'client.domain',
        searchable: true,
        type: 'string',
        esTypes: ['keyword'],
      },
      'client.geo.country_iso_code': {
        aggregatable: true,
        format: '',
        name: 'client.geo.country_iso_code',
        searchable: true,
        type: 'string',
        esTypes: ['keyword'],
      },
    },
  },
  cloud: {
    fields: {
      'cloud.account.id': {
        aggregatable: true,
        format: '',
        name: 'cloud.account.id',
        searchable: true,
        type: 'string',
        esTypes: ['keyword'],
      },
      'cloud.availability_zone': {
        aggregatable: true,
        format: '',
        name: 'cloud.availability_zone',
        searchable: true,
        type: 'string',
        esTypes: ['keyword'],
      },
    },
  },
  container: {
    fields: {
      'container.id': {
        aggregatable: true,
        format: '',
        name: 'container.id',
        searchable: true,
        type: 'string',
        esTypes: ['keyword'],
      },
      'container.image.name': {
        aggregatable: true,
        format: '',
        name: 'container.image.name',
        searchable: true,
        type: 'string',
        esTypes: ['keyword'],
      },
      'container.image.tag': {
        aggregatable: true,
        format: '',
        name: 'container.image.tag',
        searchable: true,
        type: 'string',
        esTypes: ['keyword'],
      },
    },
  },
  destination: {
    fields: {
      'destination.address': {
        aggregatable: true,
        format: '',
        name: 'destination.address',
        searchable: true,
        type: 'string',
        esTypes: ['keyword'],
      },
      'destination.bytes': {
        aggregatable: true,
        format: '',
        name: 'destination.bytes',
        searchable: true,
        type: 'number',
        esTypes: ['long'],
      },
      'destination.domain': {
        aggregatable: true,
        format: '',
        name: 'destination.domain',
        searchable: true,
        type: 'string',
        esTypes: ['keyword'],
      },
      'destination.ip': {
        aggregatable: true,
        format: '',
        name: 'destination.ip',
        searchable: true,
        type: 'ip',
        esTypes: ['ip'],
      },
      'destination.port': {
        aggregatable: true,
        format: '',
        name: 'destination.port',
        searchable: true,
        type: 'number',
        esTypes: ['long'],
      },
    },
  },
  event: {
    fields: {
      'event.end': {
        format: '',
        name: 'event.end',
        searchable: true,
        type: 'date',
        esTypes: ['date'],
        aggregatable: true,
      },
      'event.action': {
        name: 'event.action',
        type: 'string',
        esTypes: ['keyword'],
        searchable: true,
        aggregatable: true,
        format: 'string',
      },
      'event.category': {
        name: 'event.category',
        type: 'string',
        esTypes: ['keyword'],
        searchable: true,
        aggregatable: true,
        format: 'string',
      },
      'event.severity': {
        name: 'event.severity',
        type: 'number',
        esTypes: ['long'],
        format: 'number',
        searchable: true,
        aggregatable: true,
      },
      'event.kind': {
        name: 'event.kind',
        type: 'string',
        esTypes: ['keyword'],
        format: 'string',
        searchable: true,
        aggregatable: true,
      },
    },
  },
  host: {
    fields: {
      'host.name': {
        name: 'host.name',
        type: 'string',
        esTypes: ['keyword'],
        searchable: true,
        aggregatable: true,
        format: 'string',
      },
    },
  },
  source: {
    fields: {
      'source.ip': {
        aggregatable: true,
        format: '',
        name: 'source.ip',
        searchable: true,
        type: 'ip',
        esTypes: ['ip'],
      },
      'source.port': {
        aggregatable: true,
        format: '',
        name: 'source.port',
        searchable: true,
        type: 'number',
        esTypes: ['long'],
      },
    },
  },
  user: {
    fields: {
      'user.name': {
        name: 'user.name',
        type: 'string',
        esTypes: ['keyword'],
        searchable: true,
        aggregatable: true,
        format: 'string',
      },
    },
  },
  nestedField: {
    fields: {
      'nestedField.firstAttributes': {
        aggregatable: false,
        format: '',
        name: 'nestedField.firstAttributes',
        searchable: true,
        type: 'string',
        subType: {
          nested: {
            path: 'nestedField',
          },
        },
      },
      'nestedField.secondAttributes': {
        aggregatable: false,
        format: '',
        name: 'nestedField.secondAttributes',
        searchable: true,
        type: 'string',
        subType: {
          nested: {
            path: 'nestedField',
          },
        },
      },
      'nestedField.thirdAttributes': {
        aggregatable: false,
        format: '',
        name: 'nestedField.thirdAttributes',
        searchable: true,
        type: 'date',
        subType: {
          nested: {
            path: 'nestedField',
          },
        },
      },
    },
  },

  process: {
    fields: {
      'process.args': {
        name: 'process.args',
        type: 'string',
        esTypes: ['keyword'],
        searchable: true,
        aggregatable: true,
        readFromDocValues: true,
        format: '',
      },
    },
  },
};

export const mockIndexFields = flatten(
  Object.values(mockBrowserFields).map((fieldItem) => Object.values(fieldItem.fields ?? {}))
);

const runTimeType: MappingRuntimeFieldType = 'keyword' as const;

export const mockRuntimeMappings = {
  '@a.runtime.field': {
    script: {
      source: 'emit("Radical dude: " + doc[\'host.name\'].value)',
    },
    type: runTimeType,
  },
};
