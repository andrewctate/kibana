/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { HttpServiceSetup } from '@kbn/core/server';
import { stateCoordinator } from './state_coordinator';

export function defineRoutes(http: HttpServiceSetup) {
  const router = http.createRouter();

  stateCoordinator(router);
}
