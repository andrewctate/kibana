/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Plugin, CoreSetup, CoreStart } from '@kbn/core/public';
import type { PresentationUtilPluginStart } from '@kbn/presentation-util-plugin/public';
import type { SavedObjectTaggingPluginStart } from '@kbn/saved-objects-tagging-plugin/public';
import { ExpressionsSetup } from '@kbn/expressions-plugin/public';
import { Storage } from '@kbn/kibana-utils-plugin/public';
import type { SavedObjectsManagementPluginStart } from '@kbn/saved-objects-management-plugin/public';
import type { DataViewsPublicPluginStart } from '@kbn/data-views-plugin/public/types';
import { DataPublicPluginStart } from '@kbn/data-plugin/public';
import type { VisualizationsSetup } from '@kbn/visualizations-plugin/public';
import type { UnifiedSearchPublicPluginStart } from '@kbn/unified-search-plugin/public';
import { EventAnnotationService } from './event_annotation_service';
import {
  manualPointEventAnnotation,
  manualRangeEventAnnotation,
  queryPointEventAnnotation,
  eventAnnotationGroup,
} from '../common';
import { getFetchEventAnnotations } from './fetch_event_annotations';
import { EventAnnotationListingPageServices, getTableList } from './get_table_list';
import { ANNOTATIONS_LISTING_VIEW_ID } from '../common/constants';

export interface EventAnnotationStartDependencies {
  savedObjectsManagement: SavedObjectsManagementPluginStart;
  data: DataPublicPluginStart;
  savedObjectsTagging: SavedObjectTaggingPluginStart;
  presentationUtil: PresentationUtilPluginStart;
  dataViews: DataViewsPublicPluginStart;
  unifiedSearch: UnifiedSearchPublicPluginStart;
}

interface SetupDependencies {
  expressions: ExpressionsSetup;
  visualizations: VisualizationsSetup;
}

/** @public */
export type EventAnnotationPluginStart = EventAnnotationService;
export type EventAnnotationPluginSetup = void;

/** @public */
export class EventAnnotationPlugin
  implements Plugin<EventAnnotationPluginSetup, EventAnnotationService>
{
  public setup(
    core: CoreSetup<EventAnnotationStartDependencies, EventAnnotationService>,
    dependencies: SetupDependencies
  ) {
    dependencies.expressions.registerFunction(manualPointEventAnnotation);
    dependencies.expressions.registerFunction(manualRangeEventAnnotation);
    dependencies.expressions.registerFunction(queryPointEventAnnotation);
    dependencies.expressions.registerFunction(eventAnnotationGroup);
    dependencies.expressions.registerFunction(
      getFetchEventAnnotations({ getStartServices: core.getStartServices })
    );

    dependencies.visualizations.listingViewRegistry.add({
      title: 'Annotation Groups',
      id: ANNOTATIONS_LISTING_VIEW_ID,
      getTableList: async (props) => {
        const [coreStart, pluginsStart] = await core.getStartServices();

        const eventAnnotationService = await new EventAnnotationService(
          coreStart,
          pluginsStart.savedObjectsManagement
        ).getService();

        const ids = await pluginsStart.dataViews.getIds();
        const dataViews = await Promise.all(ids.map((id) => pluginsStart.dataViews.get(id)));

        const services: EventAnnotationListingPageServices = {
          core: coreStart,
          savedObjectsTagging: pluginsStart.savedObjectsTagging,
          eventAnnotationService,
          PresentationUtilContextProvider: pluginsStart.presentationUtil.ContextProvider,
          dataViews,
          createDataView: pluginsStart.dataViews.create.bind(pluginsStart.dataViews),
          queryInputServices: {
            http: coreStart.http,
            docLinks: coreStart.docLinks,
            notifications: coreStart.notifications,
            uiSettings: coreStart.uiSettings,
            dataViews: pluginsStart.dataViews,
            unifiedSearch: pluginsStart.unifiedSearch,
            data: pluginsStart.data,
            storage: new Storage(localStorage),
          },
        };

        return getTableList(props, services);
      },
    });
  }

  public start(
    core: CoreStart,
    startDependencies: EventAnnotationStartDependencies
  ): EventAnnotationService {
    return new EventAnnotationService(core, startDependencies.savedObjectsManagement);
  }
}
