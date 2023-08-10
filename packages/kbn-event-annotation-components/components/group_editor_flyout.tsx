/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  EuiFlyout,
  EuiFlyoutHeader,
  EuiTitle,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButtonEmpty,
  EuiButton,
  htmlIdGenerator,
  EuiSuperDatePicker,
  EuiSuperDatePickerProps,
  EuiSelect,
} from '@elastic/eui';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage } from '@kbn/i18n-react';
import type { SavedObjectsTaggingApi } from '@kbn/saved-objects-tagging-oss-plugin/public';
import { DataView, DataViewSpec } from '@kbn/data-views-plugin/common';
import type { QueryInputServices } from '@kbn/visualization-ui-components';
import type {
  EventAnnotationConfig,
  EventAnnotationGroupConfig,
} from '@kbn/event-annotation-common';
import { css } from '@emotion/react';
import type {
  EmbeddableComponent as LensEmbeddableComponent,
  TypedLensByValueInput,
} from '@kbn/lens-plugin/public';
import { TimeRange } from '@kbn/es-query';
import useDebounce from 'react-use/lib/useDebounce';
import { i18n } from '@kbn/i18n';
import { GroupEditorControls, isGroupValid } from './group_editor_controls';
import { getLensAttributes } from './lens_attributes';

export const GroupEditorFlyout = ({
  group,
  updateGroup,
  onClose: parentOnClose,
  onSave,
  savedObjectsTagging,
  dataViews,
  createDataView,
  LensEmbeddableComponent,
  queryInputServices,
}: {
  group: EventAnnotationGroupConfig;
  updateGroup: (newGroup: EventAnnotationGroupConfig) => void;
  onClose: () => void;
  onSave: () => void;
  savedObjectsTagging: SavedObjectsTaggingApi;
  dataViews: DataView[];
  createDataView: (spec: DataViewSpec) => Promise<DataView>;
  LensEmbeddableComponent: LensEmbeddableComponent;
  queryInputServices: QueryInputServices;
}) => {
  const flyoutHeadingId = useMemo(() => htmlIdGenerator()(), []);
  const flyoutBodyOverflowRef = useRef<Element | null>(null);
  useEffect(() => {
    if (!flyoutBodyOverflowRef.current) {
      flyoutBodyOverflowRef.current = document.querySelector('.euiFlyoutBody__overflow');
    }
  }, []);

  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);

  const resetContentScroll = useCallback(
    () => flyoutBodyOverflowRef.current && flyoutBodyOverflowRef.current.scroll(0, 0),
    []
  );

  const [selectedAnnotation, _setSelectedAnnotation] = useState<EventAnnotationConfig>();
  const setSelectedAnnotation = useCallback(
    (newValue: EventAnnotationConfig | undefined) => {
      if ((!newValue && selectedAnnotation) || (newValue && !selectedAnnotation))
        resetContentScroll();
      _setSelectedAnnotation(newValue);
    },
    [resetContentScroll, selectedAnnotation]
  );

  const [chartTimeRange, setChartTimeRange] = useState<TimeRange>({ from: 'now-15m', to: 'now' });

  const onClose = () => (selectedAnnotation ? setSelectedAnnotation(undefined) : parentOnClose());

  const customQuickSelectRender = useCallback<
    Required<EuiSuperDatePickerProps>['customQuickSelectRender']
  >(
    ({ quickSelect, commonlyUsedRanges, customQuickSelectPanels }) =>
      (
        <>
          {customQuickSelectPanels}
          {quickSelect}
          {commonlyUsedRanges}
        </>
      ) as React.ReactNode,
    []
  );

  const currentDataView = useMemo(
    () => dataViews.find((dataView) => dataView.id === group.indexPatternId) || dataViews[0],
    [dataViews, group.indexPatternId]
  );

  const timeFieldNames = useMemo(
    () => currentDataView.fields.getByType('date').map((field) => field.name),
    [currentDataView.fields]
  );

  // We can assume that there is at least one time field because we don't allow annotation groups to be created without one
  const defaultTimeFieldName = useMemo(
    () => currentDataView.timeFieldName ?? timeFieldNames[0],
    [currentDataView.timeFieldName, timeFieldNames]
  );

  const [currentTimeFieldName, setCurrentTimeFieldName] = useState<string>(defaultTimeFieldName);

  const [lensAttributes, setLensAttributes] = useState<TypedLensByValueInput['attributes']>(
    getLensAttributes(group, currentTimeFieldName)
  );

  useDebounce(
    () => {
      setLensAttributes(getLensAttributes(group, currentTimeFieldName));
    },
    250,
    [group, currentTimeFieldName]
  );

  return (
    <EuiFlyout onClose={onClose} size="l">
      <EuiFlexGroup
        css={css`
          height: 100%;
        `}
        gutterSize="none"
      >
        <EuiFlexItem
          grow={false}
          css={css`
            width: 360px;
          `}
        >
          <EuiFlyoutHeader hasBorder aria-labelledby={flyoutHeadingId}>
            <EuiTitle size="s">
              <h2 id={flyoutHeadingId}>
                <FormattedMessage
                  id="eventAnnotationComponents.groupEditorFlyout.title"
                  defaultMessage="Edit annotation group"
                />
              </h2>
            </EuiTitle>
          </EuiFlyoutHeader>

          <EuiFlyoutBody>
            <GroupEditorControls
              group={group}
              update={updateGroup}
              selectedAnnotation={selectedAnnotation}
              setSelectedAnnotation={setSelectedAnnotation}
              TagSelector={savedObjectsTagging.ui.components.SavedObjectSaveModalTagSelector}
              dataViews={dataViews}
              createDataView={createDataView}
              queryInputServices={queryInputServices}
              showValidation={hasAttemptedSave}
            />
          </EuiFlyoutBody>

          <EuiFlyoutFooter>
            <EuiFlexGroup justifyContent="spaceBetween">
              {selectedAnnotation ? (
                <EuiFlexItem grow={false}>
                  <EuiButtonEmpty
                    iconType="arrowLeft"
                    data-test-subj="backToGroupSettings"
                    onClick={() => setSelectedAnnotation(undefined)}
                  >
                    <FormattedMessage
                      id="eventAnnotationComponents.edit.back"
                      defaultMessage="Back"
                    />
                  </EuiButtonEmpty>
                </EuiFlexItem>
              ) : (
                <>
                  <EuiFlexItem grow={false}>
                    <EuiButtonEmpty data-test-subj="cancelGroupEdit" onClick={onClose}>
                      <FormattedMessage
                        id="eventAnnotationComponents.edit.cancel"
                        defaultMessage="Cancel"
                      />
                    </EuiButtonEmpty>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiButton
                      iconType="save"
                      data-test-subj="saveAnnotationGroup"
                      fill
                      onClick={() => {
                        setHasAttemptedSave(true);

                        if (isGroupValid(group)) {
                          onSave();
                        }
                      }}
                    >
                      <FormattedMessage
                        id="eventAnnotationComponents.edit.save"
                        defaultMessage="Save annotation group"
                      />
                    </EuiButton>
                  </EuiFlexItem>
                </>
              )}
            </EuiFlexGroup>
          </EuiFlyoutFooter>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFlyoutHeader>
            <EuiFlexGroup justifyContent="flexEnd" alignItems="center">
              <EuiFlexItem>
                <EuiTitle size="s">
                  <h4>
                    <FormattedMessage
                      id="eventAnnotationComponents.groupEditor.preview"
                      defaultMessage="Preview"
                    />
                  </h4>
                </EuiTitle>
              </EuiFlexItem>
              <EuiFlexItem
                css={css`
                  width: 310px;
                `}
                grow={false}
              >
                <EuiSuperDatePicker
                  onTimeChange={({ start: from, end: to }) => {
                    setChartTimeRange({ from, to });
                  }}
                  start={chartTimeRange.from}
                  end={chartTimeRange.to}
                  showUpdateButton={false}
                  compressed={true}
                  customQuickSelectRender={customQuickSelectRender}
                  customQuickSelectPanels={[
                    {
                      title: i18n.translate('eventAnnotationComponents.timeField', {
                        defaultMessage: 'Time field',
                      }),
                      content: (
                        <EuiSelect
                          options={timeFieldNames.map((name) => ({
                            text: name,
                          }))}
                          value={currentTimeFieldName}
                          onChange={(e) => setCurrentTimeFieldName(e.target.value)}
                        />
                      ),
                    },
                  ]}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlyoutHeader>
          <EuiFlyoutBody>
            <div
              css={css`
                & > div {
                  height: 400px;
                  width: 100%;
                }
              `}
            >
              <LensEmbeddableComponent
                data-test-subj="chart"
                id="annotation-library-preview"
                timeRange={chartTimeRange}
                attributes={lensAttributes}
                onBrushEnd={({ range }) =>
                  setChartTimeRange({
                    from: new Date(range[0]).toISOString(),
                    to: new Date(range[1]).toISOString(),
                  })
                }
              />
            </div>
          </EuiFlyoutBody>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiFlyout>
  );
};
