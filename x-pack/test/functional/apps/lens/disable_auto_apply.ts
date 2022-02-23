/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import expect from '@kbn/expect';
import { FtrProviderContext } from '../../ftr_provider_context';

export default function ({ getService, getPageObjects }: FtrProviderContext) {
  const PageObjects = getPageObjects(['lens', 'visualize']);
  const browser = getService('browser');
  const testSubjects = getService('testSubjects');
  const retry = getService('retry');

  describe('lens disable auto-apply tests', () => {
    it('should persist auto-apply setting across page refresh', async () => {
      await PageObjects.visualize.navigateToNewVisualization();
      await PageObjects.visualize.clickVisType('lens');

      expect(await PageObjects.lens.getAutoApplyEnabled()).to.be.ok();

      await PageObjects.lens.disableAutoApply();

      expect(await PageObjects.lens.getAutoApplyEnabled()).not.to.be.ok();

      await browser.refresh();
      PageObjects.lens.waitForEmptyWorkspace();

      expect(await PageObjects.lens.getAutoApplyEnabled()).not.to.be.ok();

      await PageObjects.lens.enableAutoApply();

      expect(await PageObjects.lens.getAutoApplyEnabled()).to.be.ok();

      await browser.refresh();
      PageObjects.lens.waitForEmptyWorkspace();

      expect(await PageObjects.lens.getAutoApplyEnabled()).to.be.ok();

      await PageObjects.lens.disableAutoApply();

      expect(await PageObjects.lens.getAutoApplyEnabled()).not.to.be.ok();
    });

    it('should preserve auto-apply controls with full-screen datasource', async () => {
      await PageObjects.lens.goToTimeRange();

      await PageObjects.lens.configureDimension({
        dimension: 'lnsXY_yDimensionPanel > lns-empty-dimension',
        operation: 'formula',
        formula: `count()`,
        keepOpen: true,
      });

      PageObjects.lens.toggleFullscreen();

      expect(await PageObjects.lens.getAutoApplyToggleExists()).to.be.ok();

      PageObjects.lens.toggleFullscreen();

      PageObjects.lens.closeDimensionEditor();
    });

    it('should apply changes when "Apply" is clicked', async () => {
      await retry.waitForWithTimeout('x dimension to be available', 1000, () =>
        testSubjects
          .existOrFail('lnsXY_xDimensionPanel > lns-empty-dimension')
          .then(() => true)
          .catch(() => false)
      );

      // configureDimension
      await PageObjects.lens.configureDimension({
        dimension: 'lnsXY_xDimensionPanel > lns-empty-dimension',
        operation: 'date_histogram',
        field: '@timestamp',
      });

      // assert that changes haven't been applied
      await PageObjects.lens.waitForEmptyWorkspace();

      await PageObjects.lens.applyChanges();

      await PageObjects.lens.waitForVisualization();
    });
    // it('should display workspace panel errors if present when "Apply" is clicked', () => {});
    // it('should preview a suggestion', () => {});
  });
}
