/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { i18n } from '@kbn/i18n';
import { RedirectAppLinks } from '@kbn/shared-ux-link-redirect-app';
import { FormattedMessage } from '@kbn/i18n-react';
import type { CoreStart } from '@kbn/core-lifecycle-browser';
import { css } from '@emotion/react';
import type { DataViewsState, VisualizationState } from '../state_management';
import type { Datasource, UserMessage, VisualizationMap } from '../types';
import { getMissingIndexPattern } from '../editor_frame_service/editor_frame/state_helpers';

/**
 * Provides a place to register general user messages that don't belong in the datasource or visualization objects
 */
export const getApplicationUserMessages = ({
  visualization,
  visualizationMap,
  activeDatasource,
  activeDatasourceState,
  dataViews,
  core,
}: {
  visualization: VisualizationState;
  visualizationMap: VisualizationMap;
  activeDatasource: Datasource | null;
  activeDatasourceState: { state: unknown } | null;
  dataViews: DataViewsState;
  core: CoreStart;
}): UserMessage[] => {
  const messages: UserMessage[] = [];

  if (visualization.activeId && !visualizationMap[visualization.activeId]) {
    messages.push(getUnknownVisualizationTypeError(visualization.activeId));
  }

  const missingIndexPatterns = getMissingIndexPattern(
    activeDatasource,
    activeDatasourceState,
    dataViews.indexPatterns
  );

  if (missingIndexPatterns.length) {
    messages.push(getMissingIndexPatternsError(core, missingIndexPatterns));
  }

  return messages;
};

function getUnknownVisualizationTypeError(visType: string): UserMessage {
  return {
    severity: 'error',
    fixableInEditor: false,
    displayLocations: [{ id: 'workspace' }, { id: 'suggestionPanel' }],
    shortMessage: i18n.translate('xpack.lens.unknownVisType.shortMessage', {
      defaultMessage: `Unknown visualization type`,
    }),
    longMessage: i18n.translate('xpack.lens.unknownVisType.longMessage', {
      defaultMessage: `The visualization type {visType} could not be resolved.`,
      values: {
        visType,
      },
    }),
  };
}

function getMissingIndexPatternsError(
  core: CoreStart,
  missingIndexPatterns: string[]
): UserMessage {
  // Check for access to both Management app && specific indexPattern section
  const { management: isManagementEnabled } = core.application.capabilities.navLinks;
  const isIndexPatternManagementEnabled =
    core.application.capabilities.management.kibana.indexPatterns;
  return {
    severity: 'error',
    fixableInEditor: true,
    displayLocations: [{ id: 'workspace' }, { id: 'suggestionPanel' }],
    shortMessage: '',
    longMessage: (
      <>
        <p className="eui-textBreakWord" data-test-subj="missing-refs-failure">
          <FormattedMessage
            id="xpack.lens.editorFrame.dataViewNotFound"
            defaultMessage="Data view not found"
          />
        </p>
        <p
          className="eui-textBreakWord"
          css={css`
            user-select: text;
          `}
        >
          <FormattedMessage
            id="xpack.lens.indexPattern.missingDataView"
            defaultMessage="The {count, plural, one {data view} other {data views}} ({count, plural, one {id} other {ids}}: {indexpatterns}) cannot be found."
            values={{
              count: missingIndexPatterns.length,
              indexpatterns: missingIndexPatterns.join(', '),
            }}
          />
          {isManagementEnabled && isIndexPatternManagementEnabled && (
            <RedirectAppLinks coreStart={core}>
              <a
                href={core.application.getUrlForApp('management', {
                  path: '/kibana/indexPatterns/create',
                })}
                style={{ width: '100%', textAlign: 'center' }}
                data-test-subj="configuration-failure-reconfigure-indexpatterns"
              >
                {i18n.translate('xpack.lens.editorFrame.dataViewReconfigure', {
                  defaultMessage: `Recreate it in the data view management page.`,
                })}
              </a>
            </RedirectAppLinks>
          )}
        </p>
      </>
    ),
  };
}
