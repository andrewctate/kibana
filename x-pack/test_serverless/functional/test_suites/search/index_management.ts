/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { FtrProviderContext } from '../../ftr_provider_context';

import { testHasEmbeddedConsole } from './embedded_console';

export default function ({ getPageObjects, getService }: FtrProviderContext) {
  const pageObjects = getPageObjects([
    'svlCommonPage',
    'embeddedConsole',
    'common',
    'header',
    'indexManagement',
  ]);
  const security = getService('security');
  const esDeleteAllIndices = getService('esDeleteAllIndices');

  const testIndexName = `test-index-ftr-${Math.random()}`;
  describe('index management', function () {
    before(async () => {
      await security.testUser.setRoles(['index_management_user']);
      // Navigate to the index management page
      await pageObjects.svlCommonPage.loginWithRole('developer');
      await pageObjects.common.navigateToApp('indexManagement');
      // Navigate to the indices tab
      await pageObjects.indexManagement.changeTabs('indicesTab');
      await pageObjects.header.waitUntilLoadingHasFinished();
    });
    after(async () => {
      await esDeleteAllIndices(testIndexName);
    });

    it('has embedded dev console', async () => {
      await testHasEmbeddedConsole(pageObjects);
    });

    it('can create an index', async () => {
      await pageObjects.indexManagement.clickCreateIndexButton();
      await pageObjects.indexManagement.setCreateIndexName(testIndexName);
      await pageObjects.indexManagement.clickCreateIndexSaveButton();
      await pageObjects.indexManagement.expectIndexToExist(testIndexName);
    });

    it('can view index details - index with no documents', async () => {
      await pageObjects.indexManagement.indexDetailsPage.openIndexDetailsPage(0);
      await pageObjects.indexManagement.indexDetailsPage.expectIndexDetailsPageIsLoaded();
    });
  });
}
