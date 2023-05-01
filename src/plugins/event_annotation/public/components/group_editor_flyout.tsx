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
} from '@elastic/eui';
import React, { useMemo, useState } from 'react';
import { FormattedMessage } from '@kbn/i18n-react';
import { SavedObjectsTaggingApi } from '@kbn/saved-objects-tagging-oss-plugin/public';
import { DataView, DataViewSpec } from '@kbn/data-views-plugin/common';
import { EventAnnotationConfig, EventAnnotationGroupConfig } from '../../common';
import { GroupEditorControls } from './group_editor_controls';

export const GroupEditorFlyout = ({
  group,
  updateGroup,
  onClose,
  onSave,
  savedObjectsTagging,
  dataViews,
  createDataView,
}: {
  group: EventAnnotationGroupConfig;
  updateGroup: (newGroup: EventAnnotationGroupConfig) => void;
  onClose: () => void;
  onSave: () => void;
  savedObjectsTagging: SavedObjectsTaggingApi;
  dataViews: DataView[];
  createDataView: (spec: DataViewSpec) => Promise<DataView>;
}) => {
  const flyoutHeadingId = useMemo(() => htmlIdGenerator()(), []);

  const [selectedAnnotation, setSelectedAnnotation] = useState<EventAnnotationConfig>();

  return (
    <EuiFlyout onClose={onClose} size={'s'}>
      <EuiFlyoutHeader hasBorder aria-labelledby={flyoutHeadingId}>
        <EuiTitle>
          <h2 id={flyoutHeadingId}>
            <FormattedMessage
              id="eventAnnotation.groupEditor.title"
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
        />
      </EuiFlyoutBody>

      <EuiFlyoutFooter>
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty data-test-subj="cancelGroupEdit" onClick={onClose}>
              <FormattedMessage id="eventAnnotation.edit.cancel" defaultMessage="Cancel" />
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton iconType="save" data-test-subj="saveAnnotationGroup" fill onClick={onSave}>
              <FormattedMessage
                id="eventAnnotation.edit.save"
                defaultMessage="Save annotation group"
              />
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutFooter>
    </EuiFlyout>
  );
};
