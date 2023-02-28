/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { CoreStart } from '@kbn/core/public';
import { coreMock } from '@kbn/core/public/mocks';
import { EventAnnotationConfig } from '../../common';
import { getEventAnnotationService } from './service';
import { EventAnnotationServiceType } from './types';

const annotationGroupResolveMocks = {
  nonExistingGroup: {
    saved_object: {
      attributes: {},
      references: [],
      id: 'nonExistingGroup',
    },
    outcome: 'exactMatch',
  },
  noAnnotations: {
    saved_object: {
      attributes: {
        title: 'groupTitle',
      },
      type: 'event-annotation-group',
      references: [
        {
          id: 'ipid',
          name: 'ipid',
          type: 'index-pattern',
        },
      ],
    },
    outcome: 'exactMatch',
  },
  multiAnnotations: {
    saved_object: {
      attributes: {
        title: 'groupTitle',
      },
      id: 'multiAnnotations',
      type: 'event-annotation-group',
      references: [
        {
          id: 'ipid',
          name: 'ipid',
          type: 'index-pattern',
        },
      ],
    },
    outcome: 'exactMatch',
  },
};

const annotationResolveMocks = {
  nonExistingGroup: { savedObjects: [] },
  noAnnotations: { savedObjects: [] },
  multiAnnotations: {
    savedObjects: [
      {
        id: 'annotation1',
        attributes: {
          id: 'annotation1',
          type: 'manual',
          key: { type: 'point_in_time' as const, timestamp: '2022-03-18T08:25:00.000Z' },
          label: 'Event',
          icon: 'triangle' as const,
          color: 'red',
          lineStyle: 'dashed' as const,
          lineWidth: 3,
        } as EventAnnotationConfig,
        type: 'event-annotation',
        references: [
          {
            id: 'multiAnnotations',
            name: 'event_annotation_group_ref',
            type: 'event-annotation-group',
          },
        ],
      },
      {
        id: 'annotation2',
        attributes: {
          id: 'ann2',
          label: 'Query based event',
          icon: 'triangle',
          color: 'red',
          type: 'query',
          timeField: 'timestamp',
          key: {
            type: 'point_in_time',
          },
          lineStyle: 'dashed',
          lineWidth: 3,
          filter: { type: 'kibana_query', query: '', language: 'kuery' },
        } as EventAnnotationConfig,
        type: 'event-annotation',
        references: [
          {
            id: 'multiAnnotations',
            name: 'event_annotation_group_ref',
            type: 'event-annotation-group',
          },
        ],
      },
    ],
  },
};

let core: CoreStart;

describe('Event Annotation Service', () => {
  let eventAnnotationService: EventAnnotationServiceType;
  beforeEach(() => {
    core = coreMock.createStart();
    (core.savedObjects.client.resolve as jest.Mock).mockImplementation(
      (_type, id: 'multiAnnotations' | 'noAnnotations' | 'nonExistingGroup') => {
        return annotationGroupResolveMocks[id];
      }
    );
    (core.savedObjects.client.create as jest.Mock).mockImplementation(() => {
      return annotationGroupResolveMocks.multiAnnotations.saved_object;
    });
    (core.savedObjects.client.bulkCreate as jest.Mock).mockImplementation(() => {
      return annotationResolveMocks.multiAnnotations;
    });
    (core.savedObjects.client.find as jest.Mock).mockImplementation(({ hasReference: { id } }) => {
      const typedId = id as 'multiAnnotations' | 'noAnnotations' | 'nonExistingGroup';
      return annotationResolveMocks[typedId];
    });
    eventAnnotationService = getEventAnnotationService(core);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('toExpression', () => {
    it('should work for an empty list', () => {
      expect(eventAnnotationService.toExpression([])).toEqual([]);
    });

    it('should process manual point annotations', () => {
      expect(
        eventAnnotationService.toExpression([
          {
            id: 'myEvent',
            type: 'manual',
            key: {
              type: 'point_in_time',
              timestamp: '2022',
            },
            label: 'Hello',
          },
        ])
      ).toEqual([
        {
          type: 'expression',
          chain: [
            {
              type: 'function',
              function: 'manual_point_event_annotation',
              arguments: {
                id: ['myEvent'],
                isHidden: [false],
                time: ['2022'],
                label: ['Hello'],
                color: ['#f04e98'],
                lineWidth: [1],
                lineStyle: ['solid'],
                icon: ['triangle'],
                textVisibility: [false],
              },
            },
          ],
        },
      ]);
    });
    it('should process manual range annotations', () => {
      expect(
        eventAnnotationService.toExpression([
          {
            id: 'myEvent',
            type: 'manual',
            key: {
              type: 'range',
              timestamp: '2021',
              endTimestamp: '2022',
            },
            label: 'Hello',
          },
        ])
      ).toEqual([
        {
          type: 'expression',
          chain: [
            {
              type: 'function',
              function: 'manual_range_event_annotation',
              arguments: {
                id: ['myEvent'],
                isHidden: [false],
                time: ['2021'],
                endTime: ['2022'],
                label: ['Hello'],
                color: ['#F04E981A'],
                outside: [false],
              },
            },
          ],
        },
      ]);
    });
    it('should process query based annotations', () => {
      expect(
        eventAnnotationService.toExpression([
          {
            id: 'myEvent',
            type: 'query',
            timeField: '@timestamp',
            key: {
              type: 'point_in_time',
            },
            label: 'Hello',
            filter: { type: 'kibana_query', query: '', language: 'kuery' },
          },
        ])
      ).toEqual([
        {
          type: 'expression',
          chain: [
            {
              type: 'function',
              function: 'query_point_event_annotation',
              arguments: {
                id: ['myEvent'],
                isHidden: [false],
                timeField: ['@timestamp'],
                label: ['Hello'],
                color: ['#f04e98'],
                lineWidth: [1],
                lineStyle: ['solid'],
                icon: ['triangle'],
                textVisibility: [false],
                textField: [],
                filter: [
                  {
                    chain: [
                      {
                        arguments: {
                          q: [''],
                        },
                        function: 'kql',
                        type: 'function',
                      },
                    ],
                    type: 'expression',
                  },
                ],
                extraFields: [],
              },
            },
          ],
        },
      ]);
    });
    it('should process mixed annotations', () => {
      expect(
        eventAnnotationService.toExpression([
          {
            id: 'myEvent',
            type: 'manual',
            key: {
              type: 'point_in_time',
              timestamp: '2022',
            },
            label: 'Hello',
          },
          {
            id: 'myRangeEvent',
            type: 'manual',
            key: {
              type: 'range',
              timestamp: '2021',
              endTimestamp: '2022',
            },
            label: 'Hello Range',
          },
          {
            id: 'myEvent',
            type: 'query',
            timeField: '@timestamp',
            key: {
              type: 'point_in_time',
            },
            label: 'Hello',
            filter: { type: 'kibana_query', query: '', language: 'kuery' },
          },
        ])
      ).toEqual([
        {
          type: 'expression',
          chain: [
            {
              type: 'function',
              function: 'manual_point_event_annotation',
              arguments: {
                id: ['myEvent'],
                isHidden: [false],
                time: ['2022'],
                label: ['Hello'],
                color: ['#f04e98'],
                lineWidth: [1],
                lineStyle: ['solid'],
                icon: ['triangle'],
                textVisibility: [false],
              },
            },
          ],
        },
        {
          type: 'expression',
          chain: [
            {
              type: 'function',
              function: 'manual_range_event_annotation',
              arguments: {
                id: ['myRangeEvent'],
                isHidden: [false],
                time: ['2021'],
                endTime: ['2022'],
                label: ['Hello Range'],
                color: ['#F04E981A'],
                outside: [false],
              },
            },
          ],
        },
        {
          type: 'expression',
          chain: [
            {
              type: 'function',
              function: 'query_point_event_annotation',
              arguments: {
                id: ['myEvent'],
                isHidden: [false],
                timeField: ['@timestamp'],
                label: ['Hello'],
                color: ['#f04e98'],
                lineWidth: [1],
                lineStyle: ['solid'],
                icon: ['triangle'],
                textVisibility: [false],
                textField: [],
                filter: [
                  {
                    chain: [
                      {
                        arguments: {
                          q: [''],
                        },
                        function: 'kql',
                        type: 'function',
                      },
                    ],
                    type: 'expression',
                  },
                ],
                extraFields: [],
              },
            },
          ],
        },
      ]);
    });
    it.each`
      textVisibility | textField    | expected
      ${'true'}      | ${''}        | ${''}
      ${'false'}     | ${''}        | ${''}
      ${'true'}      | ${'myField'} | ${'myField'}
      ${'false'}     | ${''}        | ${''}
    `(
      "should handle correctly textVisibility when set to '$textVisibility' and textField to '$textField'",
      ({ textVisibility, textField, expected }) => {
        expect(
          eventAnnotationService.toExpression([
            {
              id: 'myEvent',
              type: 'query',
              timeField: '@timestamp',
              key: {
                type: 'point_in_time',
              },
              label: 'Hello',
              filter: { type: 'kibana_query', query: '', language: 'kuery' },
              textVisibility,
              textField,
            },
          ])
        ).toEqual([
          {
            type: 'expression',
            chain: [
              {
                type: 'function',
                function: 'query_point_event_annotation',
                arguments: {
                  id: ['myEvent'],
                  isHidden: [false],
                  timeField: ['@timestamp'],
                  label: ['Hello'],
                  color: ['#f04e98'],
                  lineWidth: [1],
                  lineStyle: ['solid'],
                  icon: ['triangle'],
                  textVisibility: [textVisibility],
                  textField: expected ? [expected] : [],
                  filter: [
                    {
                      chain: [
                        {
                          arguments: {
                            q: [''],
                          },
                          function: 'kql',
                          type: 'function',
                        },
                      ],
                      type: 'expression',
                    },
                  ],
                  extraFields: [],
                },
              },
            ],
          },
        ]);
      }
    );
  });
  describe.skip('loadAnnotationGroup', () => {
    it('should not error when loading group doesnt exit', async () => {
      expect(await eventAnnotationService.loadAnnotationGroup('nonExistingGroup')).toEqual({
        annotations: [],
        indexPatternId: undefined,
        title: undefined,
      });
    });
    it('should properly load an annotation group with no annotation', async () => {
      expect(await eventAnnotationService.loadAnnotationGroup('noAnnotations')).toEqual({
        annotations: [],
        indexPatternId: 'ipid',
        title: 'groupTitle',
      });
    });
    it('should properly load an annotation group with a multiple annotation', async () => {
      expect(await eventAnnotationService.loadAnnotationGroup('multiAnnotations')).toEqual({
        annotations: [
          annotationResolveMocks.multiAnnotations.savedObjects[0].attributes,
          annotationResolveMocks.multiAnnotations.savedObjects[1].attributes,
        ],
        indexPatternId: 'ipid',
        title: 'groupTitle',
      });
    });
  });
  describe.skip('deleteAnnotationGroup', () => {
    it('deletes annotation group along with annotations that reference them', async () => {
      await eventAnnotationService.deleteAnnotationGroup('multiAnnotations');
      expect(core.savedObjects.client.bulkDelete).toHaveBeenCalledWith([
        { id: 'multiAnnotations', type: 'event-annotation-group' },
        { id: 'annotation1', type: 'event-annotation' },
        { id: 'annotation2', type: 'event-annotation' },
      ]);
    });
  });
  describe('createAnnotationGroup', () => {
    it('creates annotation group along with annotations', async () => {
      const annotations = [
        annotationResolveMocks.multiAnnotations.savedObjects[0].attributes,
        annotationResolveMocks.multiAnnotations.savedObjects[1].attributes,
      ];
      await eventAnnotationService.createAnnotationGroup({
        title: 'newGroupTitle',
        indexPatternId: 'ipid',
        annotations,
      });
      expect(core.savedObjects.client.create).toHaveBeenCalledWith(
        'event-annotation-group',
        { title: 'newGroupTitle', annotations },
        {
          references: [
            {
              id: 'ipid',
              name: 'event-annotation-group_dataView-ref-ipid',
              type: 'index-pattern',
            },
          ],
        }
      );
    });
  });
  describe.skip('updateAnnotationGroupAttributes', () => {
    it('updates annotation group attributes', async () => {
      await eventAnnotationService.updateAnnotationGroup(
        { title: 'newTitle', indexPatternId: 'newId', annotations: [] },
        'multiAnnotations'
      );
      expect(core.savedObjects.client.update).toHaveBeenCalledWith(
        'event-annotation-group',
        'multiAnnotations',
        { title: 'newTitle' },
        {
          references: [
            {
              id: 'newId',
              name: 'event-annotation-group_dataView-ref-newId',
              type: 'index-pattern',
            },
          ],
        }
      );
    });
  });
  describe.skip('updateAnnotations', () => {
    const upsert = [
      {
        id: 'annotation2',
        label: 'Query based event',
        icon: 'triangle',
        color: 'red',
        type: 'query',
        timeField: 'timestamp',
        key: {
          type: 'point_in_time',
        },
        lineStyle: 'dashed',
        lineWidth: 3,
        filter: { type: 'kibana_query', query: '', language: 'kuery' },
      },
      {
        id: 'annotation4',
        label: 'Query based event',
        type: 'query',
        timeField: 'timestamp',
        key: {
          type: 'point_in_time',
        },
        filter: { type: 'kibana_query', query: '', language: 'kuery' },
      },
    ] as EventAnnotationConfig[];
    it('updates annotations - deletes annotations', async () => {
      await eventAnnotationService.updateAnnotations('multiAnnotations', {
        delete: ['annotation1', 'annotation2'],
      });
      expect(core.savedObjects.client.bulkDelete).toHaveBeenCalledWith([
        { id: 'annotation1', type: 'event-annotation' },
        { id: 'annotation2', type: 'event-annotation' },
      ]);
    });
    it('updates annotations - inserts new annotations', async () => {
      await eventAnnotationService.updateAnnotations('multiAnnotations', { upsert });
      expect(core.savedObjects.client.bulkCreate).toHaveBeenCalledWith([
        {
          id: 'annotation2',
          type: 'event-annotation',
          attributes: upsert[0],
          overwrite: true,
          references: [
            {
              id: 'multiAnnotations',
              name: 'event-annotation-group-ref-annotation2',
              type: 'event-annotation-group',
            },
          ],
        },
        {
          id: 'annotation4',
          type: 'event-annotation',
          attributes: upsert[1],
          overwrite: true,
          references: [
            {
              id: 'multiAnnotations',
              name: 'event-annotation-group-ref-annotation4',
              type: 'event-annotation-group',
            },
          ],
        },
      ]);
    });
  });
});
