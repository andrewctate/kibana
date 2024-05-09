/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

export * from './legacy';

import { PluginServices } from '@kbn/presentation-util-plugin/public';

import { CanvasCustomElementService } from './custom_element';
import { CanvasDataViewsService } from './data_views';
import { CanvasEmbeddablesService } from './embeddables';
import { CanvasExpressionsService } from './expressions';
import { CanvasFiltersService } from './filters';
import { CanvasLabsService } from './labs';
import { CanvasNavLinkService } from './nav_link';
import { CanvasNotifyService } from './notify';
import { CanvasPlatformService } from './platform';
import { CanvasReportingService } from './reporting';
import { CanvasVisualizationsService } from './visualizations';
import { CanvasWorkpadService } from './workpad';
import { CanvasUiActionsService } from './ui_actions';

export interface CanvasPluginServices {
  customElement: CanvasCustomElementService;
  dataViews: CanvasDataViewsService;
  embeddables: CanvasEmbeddablesService;
  expressions: CanvasExpressionsService;
  filters: CanvasFiltersService;
  labs: CanvasLabsService;
  navLink: CanvasNavLinkService;
  notify: CanvasNotifyService;
  platform: CanvasPlatformService;
  reporting: CanvasReportingService;
  visualizations: CanvasVisualizationsService;
  workpad: CanvasWorkpadService;
  uiActions: CanvasUiActionsService;
}

export const pluginServices = new PluginServices<CanvasPluginServices>();

export const useCustomElementService = () =>
  (() => pluginServices.getHooks().customElement.useService())();
export const useDataViewsService = () => (() => pluginServices.getHooks().dataViews.useService())();
export const useEmbeddablesService = () =>
  (() => pluginServices.getHooks().embeddables.useService())();
export const useExpressionsService = () =>
  (() => pluginServices.getHooks().expressions.useService())();
export const useFiltersService = () => (() => pluginServices.getHooks().filters.useService())();
export const useLabsService = () => (() => pluginServices.getHooks().labs.useService())();
export const useNavLinkService = () => (() => pluginServices.getHooks().navLink.useService())();
export const useNotifyService = () => (() => pluginServices.getHooks().notify.useService())();
export const usePlatformService = () => (() => pluginServices.getHooks().platform.useService())();
export const useReportingService = () => (() => pluginServices.getHooks().reporting.useService())();
export const useVisualizationsService = () =>
  (() => pluginServices.getHooks().visualizations.useService())();
export const useWorkpadService = () => (() => pluginServices.getHooks().workpad.useService())();
export const useUiActionsService = () => (() => pluginServices.getHooks().uiActions.useService())();
