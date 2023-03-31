/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { CoreStart } from '@kbn/core/public';
import { EventAnnotationServiceType } from '@kbn/event-annotation-plugin/public';
import { SavedObjectTaggingPluginStart } from '@kbn/saved-objects-tagging-plugin/public';
import { DataViewsContract } from '@kbn/data-views-plugin/public';
import { ANNOTATION_LIBRARY_APP_ID } from '@kbn/event-annotation-plugin/common';
import type { LayerAction, StateSetter } from '../../../../types';
import { XYState, XYAnnotationLayerConfig } from '../../types';
import { getUnlinkLayerAction } from './unlink_action';
import { getIgnoreFilterAction } from './ignore_filters_action';
import { getSaveLayerAction } from './save_action';
import { isByReferenceAnnotationsLayer } from '../../visualization_helpers';
import { annotationLayerHasUnsavedChanges } from '../../state_helpers';
import { getRevertChangesAction } from './revert_changes_action';

// TODO add unit test to verify that the correct actions are shown
export const createAnnotationActions = ({
  state,
  layer,
  setState,
  core,
  isSaveable,
  eventAnnotationService,
  savedObjectsTagging,
  dataViews,
}: {
  state: XYState;
  layer: XYAnnotationLayerConfig;
  setState: StateSetter<XYState, unknown>;
  core: CoreStart;
  isSaveable?: boolean;
  eventAnnotationService: EventAnnotationServiceType;
  savedObjectsTagging?: SavedObjectTaggingPluginStart;
  dataViews: DataViewsContract;
}): LayerAction[] => {
  const actions = [];

  const savingToLibraryPermitted = Boolean(
    core.application.capabilities.visualize.save && isSaveable
  );

  if (savingToLibraryPermitted) {
    actions.push(
      getSaveLayerAction({
        state,
        layer,
        setState,
        eventAnnotationService,
        toasts: core.notifications.toasts,
        savedObjectsTagging,
        dataViews,
        goToAnnotationLibrary: () => core.application.navigateToApp(ANNOTATION_LIBRARY_APP_ID),
      })
    );
  }

  if (isByReferenceAnnotationsLayer(layer)) {
    actions.push(
      getUnlinkLayerAction({
        state,
        layer,
        setState,
        toasts: core.notifications.toasts,
      })
    );
  }

  if (isByReferenceAnnotationsLayer(layer) && annotationLayerHasUnsavedChanges(layer)) {
    actions.push(getRevertChangesAction({ state, layer, setState, core }));
  }

  actions.push(getIgnoreFilterAction({ state, layer, setState }));

  return actions;
};
