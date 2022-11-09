/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { getPieVisualization } from './visualization';
import {
  PieVisualizationState,
  PieChartTypes,
  CategoryDisplay,
  NumberDisplay,
  LegendDisplay,
} from '../../../common';
import { LayerTypes } from '@kbn/expression-xy-plugin/public';
import { chartPluginMock } from '@kbn/charts-plugin/public/mocks';
import { createMockDatasource, createMockFramePublicAPI } from '../../mocks';
import { AccessorConfig, FramePublicAPI } from '../../types';
import { themeServiceMock } from '@kbn/core/public/mocks';
import { cloneDeep } from 'lodash';
import { PartitionChartsMeta } from './partition_charts_meta';
import { PaletteOutput } from '@kbn/coloring';

jest.mock('../../id_generator');

const LAYER_ID = 'l1';

const pieVisualization = getPieVisualization({
  paletteService: chartPluginMock.createPaletteRegistry(),
  kibanaTheme: themeServiceMock.createStartContract(),
});

function getExampleState(): PieVisualizationState {
  return {
    shape: PieChartTypes.PIE,
    layers: [
      {
        layerId: LAYER_ID,
        layerType: LayerTypes.DATA,
        primaryGroups: [],
        metrics: [],
        numberDisplay: NumberDisplay.PERCENT,
        categoryDisplay: CategoryDisplay.DEFAULT,
        legendDisplay: LegendDisplay.DEFAULT,
        nestedLegend: false,
      },
    ],
  };
}

function mockFrame(): FramePublicAPI {
  return {
    ...createMockFramePublicAPI(),
    datasourceLayers: {
      l1: createMockDatasource('l1').publicAPIMock,
      l42: createMockDatasource('l42').publicAPIMock,
    },
  };
}

// Just a basic bootstrap here to kickstart the tests
describe('pie_visualization', () => {
  describe('#getErrorMessages', () => {
    it('should return no errors', () => {
      expect(pieVisualization.getErrorMessages(getExampleState(), mockFrame())).toHaveLength(0);
    });
  });

  describe('#getSupportedLayers', () => {
    it('should return a single layer type', () => {
      expect(pieVisualization.getSupportedLayers()).toHaveLength(1);
    });
  });

  describe('#getLayerType', () => {
    it('should return the type only if the layer is in the state', () => {
      expect(pieVisualization.getLayerType(LAYER_ID, getExampleState())).toEqual(LayerTypes.DATA);
      expect(pieVisualization.getLayerType('foo', getExampleState())).toBeUndefined();
    });
  });

  describe('#setDimension', () => {
    it('returns expected state', () => {
      const prevState: PieVisualizationState = {
        layers: [
          {
            primaryGroups: ['a'],
            layerId: LAYER_ID,
            layerType: LayerTypes.DATA,
            numberDisplay: NumberDisplay.PERCENT,
            categoryDisplay: CategoryDisplay.DEFAULT,
            legendDisplay: LegendDisplay.DEFAULT,
            nestedLegend: false,
            metrics: [],
          },
        ],
        shape: PieChartTypes.DONUT,
      };
      const setDimensionResult = pieVisualization.setDimension({
        prevState,
        columnId: 'x',
        layerId: LAYER_ID,
        groupId: 'a',
        frame: mockFrame(),
      });

      expect(setDimensionResult).toEqual(
        expect.objectContaining({
          shape: PieChartTypes.DONUT,
        })
      );
    });
  });

  describe('#removeDimension', () => {
    it('removes corresponding collapse function if exists', () => {
      const state = getExampleState();

      const colIds = ['1', '2', '3', '4'];

      state.layers[0].primaryGroups = colIds;

      state.layers[0].collapseFns = {
        '1': 'sum',
        '3': 'max',
      };

      const newState = pieVisualization.removeDimension({
        layerId: LAYER_ID,
        columnId: '3',
        prevState: state,
        frame: mockFrame(),
      });

      expect(newState.layers[0].collapseFns).not.toHaveProperty('3');
    });
    it('removes custom palette if removing final slice-by dimension in multi-metric chart', () => {
      const state = getExampleState();

      state.layers[0].primaryGroups = ['1', '2'];
      state.layers[0].allowMultipleMetrics = true;
      state.layers[0].metrics = ['3', '4'];
      state.palette = {} as PaletteOutput;

      let newState = pieVisualization.removeDimension({
        layerId: LAYER_ID,
        columnId: '1',
        prevState: state,
        frame: mockFrame(),
      });

      expect(newState.layers[0].primaryGroups).toEqual(['2']);
      expect(newState.palette).toBeDefined();

      newState = pieVisualization.removeDimension({
        layerId: LAYER_ID,
        columnId: '2',
        prevState: newState,
        frame: mockFrame(),
      });

      expect(newState.layers[0].primaryGroups).toEqual([]);
      expect(newState.palette).toBeUndefined();
    });
  });

  describe('#getConfiguration', () => {
    it('assigns correct icons to accessors', () => {
      const colIds = ['1', '2', '3', '4'];

      const frame = mockFrame();
      frame.datasourceLayers[LAYER_ID]!.getTableSpec = () =>
        colIds.map((id) => ({ columnId: id, fields: [] }));

      const state = getExampleState();
      state.layers[0].primaryGroups = colIds;
      state.layers[0].collapseFns = {
        '1': 'sum',
        '3': 'max',
      };
      const configuration = pieVisualization.getConfiguration({
        state,
        frame,
        layerId: state.layers[0].layerId,
      });

      // palette should be assigned to the first non-collapsed dimension
      expect(configuration.groups[0].accessors).toMatchInlineSnapshot(`Array []`);

      const mosaicState = getExampleState();
      mosaicState.shape = PieChartTypes.MOSAIC;
      mosaicState.layers[0].primaryGroups = colIds.slice(0, 2);
      mosaicState.layers[0].secondaryGroups = colIds.slice(2);
      mosaicState.layers[0].collapseFns = {
        '1': 'sum',
        '3': 'max',
      };
      const mosaicConfiguration = pieVisualization.getConfiguration({
        state: mosaicState,
        frame,
        layerId: mosaicState.layers[0].layerId,
      });

      expect(mosaicConfiguration.groups.map(({ accessors }) => accessors)).toMatchInlineSnapshot(`
        Array [
          Array [],
          Array [
            Object {
              "columnId": "1",
              "triggerIcon": "aggregate",
            },
            Object {
              "columnId": "2",
              "palette": Array [
                "red",
                "black",
              ],
              "triggerIcon": "colorBy",
            },
          ],
          Array [
            Object {
              "columnId": "3",
              "triggerIcon": "aggregate",
            },
            Object {
              "columnId": "4",
              "triggerIcon": undefined,
            },
          ],
        ]
      `);
    });

    it("doesn't count collapsed columns toward the dimension limits", () => {
      const colIds = new Array(PartitionChartsMeta.pie.maxBuckets)
        .fill(undefined)
        .map((_, i) => String(i + 1));

      const frame = mockFrame();
      frame.datasourceLayers[LAYER_ID]!.getTableSpec = () =>
        colIds.map((id) => ({ columnId: id, fields: [] }));

      const state = getExampleState();
      state.layers[0].primaryGroups = colIds;

      const getConfig = (_state: PieVisualizationState) =>
        pieVisualization.getConfiguration({
          state: _state,
          frame,
          layerId: state.layers[0].layerId,
        });

      expect(getConfig(state).groups[1].supportsMoreColumns).toBeFalsy();

      const stateWithCollapsed = cloneDeep(state);
      stateWithCollapsed.layers[0].collapseFns = { '1': 'sum' };

      expect(getConfig(stateWithCollapsed).groups[1].supportsMoreColumns).toBeTruthy();
    });

    it('marks extra bucket columns as invalid', () => {
      const colIds = new Array(PartitionChartsMeta.pie.maxBuckets + 1)
        .fill(undefined)
        .map((_, i) => String(i + 1));

      const frame = mockFrame();
      frame.datasourceLayers[LAYER_ID]!.getTableSpec = () =>
        colIds.map((id) => ({ columnId: id, fields: [] }));

      const state = getExampleState();
      state.layers[0].primaryGroups = colIds;

      const bucketAccessors = pieVisualization.getConfiguration({
        state,
        frame,
        layerId: state.layers[0].layerId,
      }).groups[1].accessors;

      expect(bucketAccessors[bucketAccessors.length - 1].invalid).toBeTruthy();
      expect(bucketAccessors[bucketAccessors.length - 1]).toEqual(
        expect.objectContaining<Partial<AccessorConfig>>({
          invalid: true,
          invalidMessage: expect.any(String),
        })
      );
    });

    it('counts multiple metrics toward the dimension limits when not mosaic', () => {
      const colIds = new Array(PartitionChartsMeta.pie.maxBuckets - 1)
        .fill(undefined)
        .map((_, i) => String(i + 1));

      const frame = mockFrame();
      frame.datasourceLayers[LAYER_ID]!.getTableSpec = () =>
        colIds.map((id) => ({ columnId: id, fields: [] }));

      const state = getExampleState();
      state.layers[0].primaryGroups = colIds;
      state.layers[0].allowMultipleMetrics = true;

      const getConfig = (_state: PieVisualizationState) =>
        pieVisualization.getConfiguration({
          state: _state,
          frame,
          layerId: state.layers[0].layerId,
        });

      expect(getConfig(state).groups[1].supportsMoreColumns).toBeTruthy();

      const stateWithMultipleMetrics = cloneDeep(state);
      stateWithMultipleMetrics.layers[0].metrics.push('1', '2');

      expect(getConfig(stateWithMultipleMetrics).groups[1].supportsMoreColumns).toBeFalsy();
    });

    it('does NOT count multiple metrics toward the dimension limits when multi-metric mode is disabled', () => {
      const frame = mockFrame();
      frame.datasourceLayers[LAYER_ID]!.getTableSpec = () => [];

      const state = getExampleState();
      state.shape = 'mosaic';
      state.layers[0].primaryGroups = [];
      state.layers[0].allowMultipleMetrics = false; // always true for mosaic

      const getConfig = (_state: PieVisualizationState) =>
        pieVisualization.getConfiguration({
          state: _state,
          frame,
          layerId: state.layers[0].layerId,
        });

      expect(getConfig(state).groups[1].supportsMoreColumns).toBeTruthy();

      const stateWithMultipleMetrics = cloneDeep(state);
      stateWithMultipleMetrics.layers[0].metrics.push('1', '2');

      expect(getConfig(stateWithMultipleMetrics).groups[1].supportsMoreColumns).toBeTruthy();
    });

    it('marks extra metric dimensions as invalid if multiple not enabled', () => {
      const colIds = ['1', '2', '3', '4'];

      const frame = mockFrame();
      frame.datasourceLayers[LAYER_ID]!.getTableSpec = () =>
        colIds.map((id) => ({ columnId: id, fields: [] }));

      const state = getExampleState();
      state.layers[0].metrics = colIds;
      state.layers[0].allowMultipleMetrics = false;
      expect(
        pieVisualization.getConfiguration({
          state,
          frame,
          layerId: state.layers[0].layerId,
        }).groups[0].accessors
      ).toMatchInlineSnapshot(`
        Array [
          Object {
            "columnId": "1",
          },
          Object {
            "columnId": "2",
            "invalid": true,
            "invalidMessage": "Only one metric is allowed.",
          },
          Object {
            "columnId": "3",
            "invalid": true,
            "invalidMessage": "Only one metric is allowed.",
          },
          Object {
            "columnId": "4",
            "invalid": true,
            "invalidMessage": "Only one metric is allowed.",
          },
        ]
      `);

      state.layers[0].allowMultipleMetrics = true;
      expect(
        pieVisualization.getConfiguration({
          state,
          frame,
          layerId: state.layers[0].layerId,
        }).groups[0].accessors
      ).toMatchInlineSnapshot(`
        Array [
          Object {
            "columnId": "1",
          },
          Object {
            "columnId": "2",
          },
          Object {
            "columnId": "3",
          },
          Object {
            "columnId": "4",
          },
        ]
      `);
    });

    it.each(Object.values(PieChartTypes).filter((type) => type !== 'mosaic'))(
      '%s adds fake dimension',
      (type) => {
        const state = { ...getExampleState(), type };
        state.layers[0].metrics.push('1', '2');
        state.layers[0].allowMultipleMetrics = true;
        expect(
          pieVisualization.getConfiguration({
            state,
            frame: mockFrame(),
            layerId: state.layers[0].layerId,
          }).groups[1].fakeFinalAccessor
        ).toEqual({ label: '2 metrics' });

        // but not when multiple metrics aren't allowed
        state.layers[0].allowMultipleMetrics = false;
        expect(
          pieVisualization.getConfiguration({
            state,
            frame: mockFrame(),
            layerId: state.layers[0].layerId,
          }).groups[1].fakeFinalAccessor
        ).toBeUndefined();
      }
    );
  });
});
