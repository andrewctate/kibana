/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import './index.scss';
import React, { useCallback, useEffect } from 'react';
import { i18n } from '@kbn/i18n';
import { EuiFormRow, EuiSwitch, EuiSwitchEvent, EuiButtonGroup } from '@elastic/eui';
import {
  IconSelectSetting,
  DimensionEditorSection,
  NameInput,
  ColorPicker,
  LineStyleSettings,
} from '@kbn/visualization-ui-components/public';
import { isQueryAnnotationConfig, isRangeAnnotationConfig } from '../..';
import { AvailableAnnotationIcon, EventAnnotationConfig } from '../../../common';
// import { isHorizontalChart } from '../../state_helpers';
import {
  defaultAnnotationColor,
  defaultAnnotationLabel,
  defaultAnnotationRangeColor,
} from './helpers';
import { annotationsIconSet } from './icon_set';
import { sanitizeProperties } from './helpers';

export const AnnotationsPanel = ({
  annotation: currentAnnotation,
  onAnnotationChange,
}: {
  annotation: EventAnnotationConfig;
  onAnnotationChange: (annotation: EventAnnotationConfig) => void;
  // dataView: DataView;
  // datatableUtilities: DatatableUtilitiesService;
  // formatFactory: FormatFactory;
  // paletteService: PaletteRegistry;
}) => {
  // const { hasFieldData } = useExistingFieldsReader();

  const isQueryBased = isQueryAnnotationConfig(currentAnnotation);
  const isRange = isRangeAnnotationConfig(currentAnnotation);

  const [queryInputShouldOpen, setQueryInputShouldOpen] = React.useState(false);
  useEffect(() => {
    setQueryInputShouldOpen(!isQueryBased);
  }, [isQueryBased]);

  const update = useCallback(
    <T extends EventAnnotationConfig>(newAnnotation: Partial<T> | undefined) =>
      newAnnotation &&
      onAnnotationChange(sanitizeProperties({ ...currentAnnotation, ...newAnnotation })),
    [currentAnnotation, onAnnotationChange]
  );

  return (
    <>
      {/* <DimensionEditorSection
        title={i18n.translate('xpack.lens.xyChart.placement', {
          defaultMessage: 'Placement',
        })}
      >
        <EuiFormRow
          label={i18n.translate('xpack.lens.xyChart.annotationDate.placementType', {
            defaultMessage: 'Placement type',
          })}
          display="rowCompressed"
          fullWidth
        >
          <EuiButtonGroup
            legend={i18n.translate('xpack.lens.xyChart.annotationDate.placementType', {
              defaultMessage: 'Placement type',
            })}
            data-test-subj="lns-xyAnnotation-placementType"
            name="placementType"
            buttonSize="compressed"
            options={[
              {
                id: `lens_xyChart_annotation_manual`,
                label: i18n.translate('xpack.lens.xyChart.annotation.manual', {
                  defaultMessage: 'Static date',
                }),
                'data-test-subj': 'lnsXY_annotation_manual',
              },
              {
                id: `lens_xyChart_annotation_query`,
                label: i18n.translate('xpack.lens.xyChart.annotation.query', {
                  defaultMessage: 'Custom query',
                }),
                'data-test-subj': 'lnsXY_annotation_query',
              },
            ]}
            idSelected={`lens_xyChart_annotation_${currentAnnotation?.type}`}
            onChange={(id) => {
              const typeFromId = id.replace(
                'lens_xyChart_annotation_',
                ''
              ) as EventAnnotationConfig['type'];
              if (currentAnnotation?.type === typeFromId) {
                return;
              }
              if (typeFromId === 'query') {
                // If coming from a range type, it requires some additional resets
                const additionalRangeResets = isRangeAnnotationConfig(currentAnnotation)
                  ? {
                      label:
                        currentAnnotation.label === defaultRangeAnnotationLabel
                          ? defaultAnnotationLabel
                          : currentAnnotation.label,
                      color: toLineAnnotationColor(currentAnnotation.color),
                    }
                  : {};
                return update({
                  type: typeFromId,
                  timeField:
                    (dataView.timeFieldName ||
                      // fallback to the first avaiable date field in the dataView
                      dataView.fields.find(({ type: fieldType }) => fieldType === 'date')
                        ?.displayName) ??
                    '',
                  key: { type: 'point_in_time' },
                  ...additionalRangeResets,
                });
              }
              // From query to manual annotation
              return update<PointInTimeEventAnnotationConfig>({
                type: typeFromId,
                key: { type: 'point_in_time', timestamp: moment().toISOString() },
              });
            }}
            isFullWidth
          />
        </EuiFormRow>
        {isQueryBased ? (
          <ConfigPanelQueryAnnotation
            annotation={currentAnnotation}
            onChange={setAnnotations}
            frame={frame}
            state={state}
            layer={localLayer}
            queryInputShouldOpen={queryInputShouldOpen}
          />
        ) : (
          <ConfigPanelManualAnnotation
            annotation={currentAnnotation}
            onChange={setAnnotations}
            datatableUtilities={props.datatableUtilities}
            frame={frame}
            state={state}
          />
        )}
      </DimensionEditorSection> */}
      <DimensionEditorSection
        title={i18n.translate('xpack.lens.xyChart.appearance', {
          defaultMessage: 'Appearance',
        })}
      >
        <NameInput
          value={currentAnnotation?.label || defaultAnnotationLabel}
          defaultValue={defaultAnnotationLabel}
          onChange={(value) => {
            update({ label: value });
          }}
        />
        {!isRange && (
          <>
            <IconSelectSetting<AvailableAnnotationIcon>
              currentIcon={currentAnnotation.icon}
              setIcon={(icon) => update({ icon })}
              defaultIcon="triangle"
              customIconSet={annotationsIconSet}
            />
            {/* <TextDecorationSetting
              setConfig={setAnnotations}
              currentConfig={{
                axisMode: 'bottom',
                ...currentAnnotation,
              }}
              isQueryBased={isQueryBased}
            >
              {(textDecorationSelected) => {
                if (textDecorationSelected !== 'field') {
                  return null;
                }
                const options = dataView.fields
                  .filter(({ displayName, type }) => displayName && type !== 'document')
                  .map(
                    (field) =>
                      ({
                        label: field.displayName,
                        value: {
                          type: 'field',
                          field: field.name,
                          dataType: field.type,
                        },
                        exists: hasFieldData(dataView.id!, field.name),
                        compatible: true,
                        'data-test-subj': `lnsXY-annotation-fieldOption-${field.name}`,
                      } as FieldOption<FieldOptionValue>)
                  );
                const selectedField = (currentAnnotation as QueryPointEventAnnotationConfig)
                  .textField;

                const fieldIsValid = selectedField
                  ? Boolean(dataView.getFieldByName(selectedField))
                  : true;
                return (
                  <>
                    <EuiSpacer size="xs" />
                    <FieldPicker
                      selectedOptions={
                        selectedField
                          ? [
                              {
                                label: selectedField,
                                value: { type: 'field', field: selectedField },
                              },
                            ]
                          : []
                      }
                      options={options}
                      onChoose={function (choice: FieldOptionValue | undefined): void {
                        if (choice) {
                          setAnnotations({ textField: choice.field, textVisibility: true });
                        }
                      }}
                      fieldIsInvalid={!fieldIsValid}
                      data-test-subj="lnsXY-annotation-query-based-text-decoration-field-picker"
                      autoFocus={!selectedField}
                    />
                  </>
                );
              }}
            </TextDecorationSetting> */}
            <LineStyleSettings
              idPrefix=""
              setConfig={update}
              currentConfig={{
                lineStyle: currentAnnotation.lineStyle,
                lineWidth: currentAnnotation.lineWidth,
              }}
            />
          </>
        )}
        {isRange && (
          <EuiFormRow
            label={i18n.translate('xpack.lens.xyChart.fillStyle', {
              defaultMessage: 'Fill',
            })}
            display="columnCompressed"
            fullWidth
          >
            <EuiButtonGroup
              legend={i18n.translate('xpack.lens.xyChart.fillStyle', {
                defaultMessage: 'Fill',
              })}
              data-test-subj="lns-xyAnnotation-fillStyle"
              name="fillStyle"
              buttonSize="compressed"
              options={[
                {
                  id: `lens_xyChart_fillStyle_inside`,
                  label: i18n.translate('xpack.lens.xyChart.fillStyle.inside', {
                    defaultMessage: 'Inside',
                  }),
                  'data-test-subj': 'lnsXY_fillStyle_inside',
                },
                {
                  id: `lens_xyChart_fillStyle_outside`,
                  label: i18n.translate('xpack.lens.xyChart.fillStyle.outside', {
                    defaultMessage: 'Outside',
                  }),
                  'data-test-subj': 'lnsXY_fillStyle_inside',
                },
              ]}
              idSelected={`lens_xyChart_fillStyle_${
                Boolean(currentAnnotation?.outside) ? 'outside' : 'inside'
              }`}
              onChange={(id) => {
                update({
                  outside: id === `lens_xyChart_fillStyle_outside`,
                });
              }}
              isFullWidth
            />
          </EuiFormRow>
        )}

        <ColorPicker
          overwriteColor={currentAnnotation.color}
          defaultColor={isRange ? defaultAnnotationRangeColor : defaultAnnotationColor}
          showAlpha={isRange}
          setConfig={update}
          disableHelpTooltip
          label={i18n.translate('xpack.lens.xyChart.lineColor.label', {
            defaultMessage: 'Color',
          })}
        />
        <ConfigPanelGenericSwitch
          label={i18n.translate('xpack.lens.xyChart.annotation.hide', {
            defaultMessage: 'Hide annotation',
          })}
          data-test-subj="lns-annotations-hide-annotation"
          value={Boolean(currentAnnotation.isHidden)}
          onChange={(ev) => update({ isHidden: ev.target.checked })}
        />
        {/* {isQueryBased && currentAnnotation && (
        <DimensionEditorSection
          title={i18n.translate('xpack.lens.xyChart.tooltip', {
            defaultMessage: 'Tooltip',
          })}
        >
          <EuiFormRow
            display="rowCompressed"
            className="lnsRowCompressedMargin"
            fullWidth
            label={i18n.translate('xpack.lens.xyChart.annotation.tooltip', {
              defaultMessage: 'Show additional fields',
            })}
          >
            <TooltipSection
              currentConfig={currentAnnotation}
              setConfig={setAnnotations}
              indexPattern={frame.dataViews.indexPatterns[localLayer.indexPatternId]}
            />
          </EuiFormRow>
          */}
      </DimensionEditorSection>
    </>
  );
};

const ConfigPanelGenericSwitch = ({
  label,
  ['data-test-subj']: dataTestSubj,
  value,
  onChange,
}: {
  label: string;
  'data-test-subj': string;
  value: boolean;
  onChange: (event: EuiSwitchEvent) => void;
}) => (
  <EuiFormRow label={label} display="columnCompressedSwitch" fullWidth>
    <EuiSwitch
      compressed
      label={label}
      showLabel={false}
      data-test-subj={dataTestSubj}
      checked={value}
      onChange={onChange}
    />
  </EuiFormRow>
);
