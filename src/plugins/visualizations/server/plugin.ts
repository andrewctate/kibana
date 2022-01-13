/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { i18n } from '@kbn/i18n';
import { schema } from '@kbn/config-schema';

import { PluginSetup as DataPluginSetup } from 'src/plugins/data/server';
import { VISUALIZE_ENABLE_LABS_SETTING } from '../common/constants';
import { registerVisualizationsCollector } from './usage_collector';
import { capabilitiesProvider } from './capabilities_provider';

import type { VisualizationsPluginSetup, VisualizationsPluginStart } from './types';
import type {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  Logger,
} from '../../../core/server';
import type { UsageCollectionSetup } from '../../usage_collection/server';
import type { EmbeddableSetup } from '../../embeddable/server';
import { makeVisualizeEmbeddableFactory } from './embeddable/make_visualize_embeddable_factory';
import { getVisualizationSavedObjectType } from './saved_objects';

export class VisualizationsPlugin
  implements Plugin<VisualizationsPluginSetup, VisualizationsPluginStart>
{
  private readonly logger: Logger;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  public setup(
    core: CoreSetup,
    plugins: {
      usageCollection?: UsageCollectionSetup;
      embeddable: EmbeddableSetup;
      data: DataPluginSetup;
    }
  ) {
    this.logger.debug('visualizations: Setup');

    const searchSourceMigrations = plugins.data.search.searchSource.getAllMigrations();
    core.savedObjects.registerType(getVisualizationSavedObjectType(searchSourceMigrations));
    core.capabilities.registerProvider(capabilitiesProvider);

    core.uiSettings.register({
      [VISUALIZE_ENABLE_LABS_SETTING]: {
        name: i18n.translate('visualizations.advancedSettings.visualizeEnableLabsTitle', {
          defaultMessage: 'Enable experimental visualizations',
        }),
        value: true,
        description: i18n.translate('visualizations.advancedSettings.visualizeEnableLabsText', {
          defaultMessage: `Allows users to create, view, and edit experimental visualizations. If disabled,
            only visualizations that are considered production-ready are available to the user.`,
        }),
        category: ['visualization'],
        schema: schema.boolean(),
      },
    });

    if (plugins.usageCollection) {
      registerVisualizationsCollector(plugins.usageCollection);
    }

    plugins.embeddable.registerEmbeddableFactory(
      makeVisualizeEmbeddableFactory(searchSourceMigrations)()
    );

    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug('visualizations: Started');
    return {};
  }

  public stop() {}
}
