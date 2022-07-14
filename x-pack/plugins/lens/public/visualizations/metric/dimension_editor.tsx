/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiColorPaletteDisplay,
  EuiFormRow,
  EuiFlexItem,
  EuiSwitchEvent,
  EuiSwitch,
} from '@elastic/eui';
import React, { useState } from 'react';
import { i18n } from '@kbn/i18n';
import {
  PaletteRegistry,
  CustomizablePalette,
  CUSTOM_PALETTE,
  FIXED_PROGRESSION,
} from '@kbn/coloring';
import { css } from '@emotion/react';
import { isNumericFieldForDatatable } from '../../../common/expressions';
import { applyPaletteParams, PalettePanelContainer } from '../../shared_components';
import type { VisualizationDimensionEditorProps } from '../../types';
import { defaultPaletteParams, RANGE_MIN } from './palette_config';
import { MetricVisualizationState } from './visualization';

export function MetricDimensionEditor(
  props: VisualizationDimensionEditorProps<MetricVisualizationState> & {
    paletteService: PaletteRegistry;
  }
) {
  const { state, setState, frame, accessor } = props;
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  if (state?.metricAccessor !== accessor) return null;

  const currentData = frame.activeData?.[state.layerId];

  if (accessor == null || !isNumericFieldForDatatable(currentData, accessor)) {
    return null;
  }

  const hasDynamicColoring = Boolean(state?.palette);

  const canHavePercentPalette = Boolean(state.maxAccessor || state.breakdownByAccessor);

  const currentMax = 100;

  const activePalette = state?.palette || {
    type: 'palette',
    name: defaultPaletteParams.name,
    params: {
      ...defaultPaletteParams,
      continuity: 'all',
      colorStops: undefined,
      stops: undefined,
      rangeType: canHavePercentPalette ? 'percent' : 'number',
    },
  };

  const displayStops = applyPaletteParams(props.paletteService, activePalette, {
    min: activePalette.params?.rangeMin || RANGE_MIN,
    max: currentMax,
  });

  const togglePalette = () => setIsPaletteOpen(!isPaletteOpen);
  return (
    <>
      <EuiFormRow
        display="columnCompressed"
        fullWidth
        label={i18n.translate('xpack.lens.metric.dynamicColoring.label', {
          defaultMessage: 'Color by value',
        })}
        css={css`
          align-items: center;
        `}
      >
        <EuiSwitch
          data-test-subj="lnsDynamicColoringMetricSwitch"
          compressed
          label=""
          showLabel={false}
          checked={hasDynamicColoring}
          onChange={(e: EuiSwitchEvent) => {
            const { checked } = e.target;
            const params = checked
              ? {
                  palette: {
                    ...activePalette,
                    params: {
                      ...activePalette.params,
                      stops: displayStops,
                    },
                  },
                }
              : {};

            setState({
              ...state,
              ...params,
            });
          }}
        />
      </EuiFormRow>
      {hasDynamicColoring && (
        <>
          <EuiFormRow
            className="lnsDynamicColoringRow"
            display="columnCompressed"
            fullWidth
            label={i18n.translate('xpack.lens.paletteMetricGradient.label', {
              defaultMessage: 'Color',
            })}
          >
            <EuiFlexGroup
              alignItems="center"
              gutterSize="s"
              responsive={false}
              className="lnsDynamicColoringClickable"
            >
              <EuiFlexItem>
                <EuiColorPaletteDisplay
                  data-test-subj="lnsMetric_dynamicColoring_palette"
                  palette={displayStops.map(({ color }) => color)}
                  type={FIXED_PROGRESSION}
                  onClick={togglePalette}
                />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButtonEmpty
                  data-test-subj="lnsMetric_dynamicColoring_trigger"
                  iconType="controlsHorizontal"
                  onClick={togglePalette}
                  size="xs"
                  flush="both"
                >
                  {i18n.translate('xpack.lens.paletteTableGradient.customize', {
                    defaultMessage: 'Edit',
                  })}
                </EuiButtonEmpty>
                <PalettePanelContainer
                  siblingRef={props.panelRef}
                  isOpen={isPaletteOpen}
                  handleClose={togglePalette}
                >
                  <CustomizablePalette
                    palettes={props.paletteService}
                    activePalette={activePalette}
                    dataBounds={{ min: RANGE_MIN, max: currentMax }}
                    setPalette={(newPalette) => {
                      if (
                        newPalette.name !== CUSTOM_PALETTE &&
                        newPalette.params &&
                        newPalette.params.rangeMin !== RANGE_MIN
                      ) {
                        newPalette.params.rangeMin = RANGE_MIN;
                      }
                      setState({
                        ...state,
                        palette: newPalette,
                      });
                    }}
                  />
                </PalettePanelContainer>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFormRow>
        </>
      )}
    </>
  );
}
