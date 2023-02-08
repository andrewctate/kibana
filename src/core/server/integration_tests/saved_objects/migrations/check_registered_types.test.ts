/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ISavedObjectTypeRegistry } from '@kbn/core-saved-objects-server';
import { getMigrationHash } from '@kbn/core-test-helpers-so-type-serializer';
import { Root } from '@kbn/core-root-server-internal';
import {
  createTestServers,
  createRootWithCorePlugins,
  type TestElasticsearchUtils,
} from '@kbn/core-test-helpers-kbn-server';

describe('checking migration metadata changes on all registered SO types', () => {
  let esServer: TestElasticsearchUtils;
  let root: Root;
  let typeRegistry: ISavedObjectTypeRegistry;

  beforeAll(async () => {
    const { startES } = createTestServers({
      adjustTimeout: (t: number) => jest.setTimeout(t),
    });

    esServer = await startES();
    root = createRootWithCorePlugins({}, { oss: false });
    await root.preboot();
    await root.setup();
    const coreStart = await root.start();
    typeRegistry = coreStart.savedObjects.getTypeRegistry();
  });

  afterAll(async () => {
    if (root) {
      await root.shutdown();
    }
    if (esServer) {
      await esServer.stop();
    }
  });

  // This test is meant to fail when any change is made in registered types that could potentially impact the SO migration.
  // Just update the snapshot by running this test file via jest_integration with `-u` and push the update.
  // The intent is to trigger a code review from the Core team to review the SO type changes.
  it('detecting migration related changes in registered types', () => {
    const allTypes = typeRegistry.getAllTypes();

    const hashMap = allTypes.reduce((map, type) => {
      map[type.name] = getMigrationHash(type);
      return map;
    }, {} as Record<string, string>);

    expect(hashMap).toMatchInlineSnapshot(`
      Object {
        "action": "6cfc277ed3211639e37546ac625f4a68f2494215",
        "action_task_params": "db2afea7d78e00e725486b791554d0d4e81956ef",
        "alert": "492f749af60bed1cc7022519ddf5fe4c482b62c4",
        "api_key_pending_invalidation": "16e7bcf8e78764102d7f525542d5b616809a21ee",
        "apm-indices": "d19dd7fb51f2d2cbc1f8769481721e0953f9a6d2",
        "apm-server-schema": "1d42f17eff9ec6c16d3a9324d9539e2d123d0a9a",
        "apm-service-group": "2801c50332e3bf5726c923966c1f19f886e7d389",
        "apm-telemetry": "712138c3d5e36d865e67c7fc0171c8a779446e58",
        "app_search_telemetry": "9269643c9a5894998b44883f7f7d07a453fd6a95",
        "application_usage_daily": "9867f6e1355124f822beab051e0fbac4cc117eac",
        "application_usage_totals": "9469a48ab887761a73ee3719b8d401ac627f1eb1",
        "canvas-element": "ec334dd45d14291db4d74197e0e42dfe06526868",
        "canvas-workpad": "ab0525bd5aa4dbad2d6fdb30e6a51bb475254751",
        "canvas-workpad-template": "c54f2a188a1d0bf18a6cebd9d6f28a7337d41bbf",
        "cases": "74c00dfb25f4b109894971bd1090fce4a7c99490",
        "cases-comments": "b94072c8f0cb642dd6da43c833bd2d391e175ec0",
        "cases-configure": "25099c9e4bbb91e01e334848c605b4a5de5c9fce",
        "cases-connector-mappings": "8de3b77dc6ae8ee62cce2b58a222471dfc3dbdad",
        "cases-telemetry": "fdeddcef28c75d8c66422475a829e75d37f0b668",
        "cases-user-actions": "cfd388d2ca27b3abfd3955dc41428fb229989921",
        "config": "97e16b8f5dc10c404fd3b201ef36bc6c3c63dc80",
        "config-global": "d9791e8f73edee884630e1cb6e4954ae513ce75e",
        "connector_token": "fb05ff5afdcb6e2f20c9c6513ff7a1ab12b66f36",
        "core-usage-stats": "b3c04da317c957741ebcdedfea4524049fdc79ff",
        "csp-rule-template": "099c229bf97578d9ca72b3a672d397559b84ee0b",
        "dashboard": "71e3f8dfcffeb5fbd410dec81ce46f5691763c43",
        "endpoint:user-artifact": "a5b154962fb6cdf5d9e7452e58690054c95cc72a",
        "endpoint:user-artifact-manifest": "5989989c0f84dd2d02da1eb46b6254e334bd2ccd",
        "enterprise_search_telemetry": "4b41830e3b28a16eb92dee0736b44ae6276ced9b",
        "epm-packages": "1922a722ea42ab4953a96037fabb81a9ded8e240",
        "epm-packages-assets": "00c8b5e5bf059627ffc9fbde920e1ac75926c5f6",
        "event_loop_delays_daily": "ef49e7f15649b551b458c7ea170f3ed17f89abd0",
        "exception-list": "aae42e8f19017277d194d37d4898ed6598c03e9a",
        "exception-list-agnostic": "2634ee4219d27663a5755536fc06cbf3bb4beba5",
        "file": "d12998f49bc82da596a9e6c8397999930187ec6a",
        "file-upload-usage-collection-telemetry": "c6fcb9a7efcf19b2bb66ca6e005bfee8961f6073",
        "fileShare": "f07d346acbb724eacf139a0fb781c38dc5280115",
        "fleet-fleet-server-host": "67180a54a689111fb46403c3603c9b3a329c698d",
        "fleet-preconfiguration-deletion-record": "3afad160748b430427086985a3445fd8697566d5",
        "fleet-proxy": "94d0a902a0fd22578d7d3a20873b95d902e25245",
        "graph-workspace": "565642a208fe7413b487aea979b5b153e4e74abe",
        "guided-onboarding-guide-state": "3257825ae840309cb676d64b347107db7b76f30a",
        "guided-onboarding-plugin-state": "2d3ef3069ca8e981cafe8647c0c4a4c20739db10",
        "index-pattern": "cd51191712081278c2af83d16552c3438ef83353",
        "infrastructure-monitoring-log-view": "8040108f02ef27419cff79077384379709d44bbc",
        "infrastructure-ui-source": "2311f7d0abe2a713aa71e30ee24f78828d4acfc1",
        "ingest-agent-policies": "e5bb18f8c1d1106139e82fccb93fce01b21fde9b",
        "ingest-download-sources": "95a15b6589ef46e75aca8f7e534c493f99cc3ccd",
        "ingest-outputs": "f5adeb3f6abc732a6067137e170578dbf1f58c62",
        "ingest-package-policies": "f20a00d14ba0651e0dbdada40f9762926819e298",
        "ingest_manager_settings": "fb75bff08a8de3435b23664b1191f9244a255701",
        "inventory-view": "6d47ef0b38166ecbd1c2fc7394599a4500db1ae4",
        "kql-telemetry": "23ed96ff02cd69cbfaa22f313cae3a54c434db51",
        "legacy-url-alias": "9b8cca3fbb2da46fd12823d3cd38fdf1c9f24bc8",
        "lens": "42793535312de4e3e3df16a69cb85f5df3b14f72",
        "lens-ui-telemetry": "d6c4e330d170eefc6214dbf77a53de913fa3eebc",
        "map": "7902b2e2a550e0b73fd5aa6c4e2ba3a4e6558877",
        "maps-telemetry": "1b2e468ec4dd1207e417b98f84b24cd87e1efd14",
        "metrics-explorer-view": "713dbf1ab5e067791d19170f715eb82cf07ebbcc",
        "ml-job": "12e21f1b1adfcc1052dc0b10c7459de875653b94",
        "ml-module": "c88b6a012cfb7b7adb7629b1edeab6b83f1fd048",
        "ml-trained-model": "49a1685d79990ad05ea1d1d30e28456fe002f3b9",
        "monitoring-telemetry": "24f7393dfacb6c7b0f7ad7d242171a1c29feaa48",
        "osquery-manager-usage-metric": "23a8f08a98dd0f58ab4e559daa35b06edc40ed4f",
        "osquery-pack": "407f82b8f05f02a04627993e6d2a071b4d71f816",
        "osquery-pack-asset": "e10ca4b6ac5dff1954b5140ed97c3187d353a029",
        "osquery-saved-query": "86bd3e1d39c470375263b28437c67b4f96667bc2",
        "query": "495b96d251383d44b48ad3ccd831b857f909ae41",
        "rules-settings": "9854495c3b54b16a6625fb250c35e5504da72266",
        "sample-data-telemetry": "c38daf1a49ed24f2a4fb091e6e1e833fccf19935",
        "search": "928589cf4b2497623faa48d22f406bab4721704c",
        "search-session": "e0f495ac1b3bb40ba3eb3aea90b2d11e6c8d4c32",
        "search-telemetry": "ab67ef721f294f28d5e10febbd20653347720188",
        "security-rule": "1ff82dfb2298c3caf6888fc3ef15c6bf7a628877",
        "security-solution-signals-migration": "c2db409c1857d330beb3d6fd188fa186f920302c",
        "siem-detection-engine-rule-actions": "dbf3747aad2b986534b052703063a7026b25f485",
        "siem-ui-timeline": "e9d6b3a9fd7af6dc502293c21cbdb309409f3996",
        "siem-ui-timeline-note": "13c9d4c142f96624a93a623c6d7cba7e1ae9b5a6",
        "siem-ui-timeline-pinned-event": "96a43d59b9e2fc11f12255a0cb47ef0a3d83af4c",
        "space": "9542afcd6fd71558623c09151e453c5e84b4e5e1",
        "spaces-usage-stats": "084bd0f080f94fb5735d7f3cf12f13ec92f36bad",
        "synthetics-monitor": "5d0a69fac9d6cfdacfa1962274344aecb596167a",
        "synthetics-param": "9776c9b571d35f0d0397e8915e035ea1dc026db7",
        "synthetics-privates-locations": "7d032fc788905e32152029ae7ab3d6038c48ae44",
        "tag": "87f21f07df9cc37001b15a26e413c18f50d1fbfe",
        "task": "ebcc113df12f14bf627dbd335ba78507187b48a3",
        "telemetry": "561b329aaed3c15b91aaf2075645be3097247612",
        "ui-metric": "410a8ad28e0f44b161c960ff0ce950c712b17c52",
        "upgrade-assistant-ml-upgrade-operation": "e20ff1efa3c4757f5e7ff5fb897c557b08524c3a",
        "upgrade-assistant-reindex-operation": "c7442ffe34954c117a74bf138e48e4c25095a6cf",
        "upgrade-assistant-telemetry": "12bcbfc4e4ce64d2ca7c24f9acccd331a2bd2ab6",
        "uptime-dynamic-settings": "9a63ce80904a04be114749e426882dc3ff011137",
        "uptime-synthetics-api-key": "599319bedbfa287e8761e1ba49d536417a33fa13",
        "url": "2422b3cbe0af71f7a9c2e228e19a972e759c56d4",
        "usage-counters": "f478b2668be350f5bdc08d9e1cf6fbce0e079f61",
        "visualization": "3aff13fbc2223de74167be6a78537812c8b9d236",
        "workplace_search_telemetry": "10e278fe9ae1396bfc36ae574bc387d7e696d43f",
      }
    `);
  });
});
