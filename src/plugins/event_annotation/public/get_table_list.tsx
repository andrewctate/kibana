/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { FC } from 'react';
import { toMountPoint } from '@kbn/kibana-react-plugin/public';
import { FormattedRelative } from '@kbn/i18n-react';
import {
  TableListTabParentProps,
  TableListViewKibanaProvider,
} from '@kbn/content-management-table-list';
import { CoreStart } from '@kbn/core-lifecycle-browser';
import type { SavedObjectsTaggingApi } from '@kbn/saved-objects-tagging-oss-plugin/public';
import { EventAnnotationGroupTableList } from './components/table_list';
import { EventAnnotationServiceType } from './event_annotation_service/types';

export interface EventAnnotationListingPageServices {
  core: CoreStart;
  savedObjectsTagging: SavedObjectsTaggingApi;
  eventAnnotationService: EventAnnotationServiceType;
  PresentationUtilContextProvider: FC;
}

export const getTableList = (
  parentProps: TableListTabParentProps,
  services: EventAnnotationListingPageServices
) => {
  return (
    <TableListViewKibanaProvider
      {...{
        core: services.core,
        toMountPoint,
        savedObjectsTagging: services.savedObjectsTagging,
        FormattedRelative,
      }}
    >
      <EventAnnotationGroupTableList
        savedObjectsTagging={services.savedObjectsTagging}
        uiSettings={services.core.uiSettings}
        eventAnnotationService={services.eventAnnotationService}
        visualizeCapabilities={services.core.application.capabilities.visualize}
        parentProps={parentProps}
      />
    </TableListViewKibanaProvider>
  );
};
