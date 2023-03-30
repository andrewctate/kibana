/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ExpressionAstExpression } from '@kbn/expressions-plugin/common/ast';
import { SavedObjectCommon } from '@kbn/saved-objects-plugin/common';
import { SavedObjectsFindOptionsReference } from '@kbn/core-saved-objects-api-browser';
import { EventAnnotationGroupContent } from '../../common/types';
import { EventAnnotationConfig, EventAnnotationGroupConfig } from '../../common';

export interface EventAnnotationServiceType {
  loadAnnotationGroup: (savedObjectId: string) => Promise<EventAnnotationGroupConfig>;
  findAnnotationGroupContent: (
    searchTerm: string,
    pageSize: number,
    references?: SavedObjectsFindOptionsReference[],
    referencesToExclude?: SavedObjectsFindOptionsReference[]
  ) => Promise<{ total: number; hits: EventAnnotationGroupContent[] }>;
  // deleteAnnotationGroup: (savedObjectId: string) => Promise<void>;
  createAnnotationGroup: (group: EventAnnotationGroupConfig) => Promise<{ id: string }>;
  // updateAnnotations: (
  //   savedObjectId: string,
  //   modifications: { delete?: string[]; upsert?: EventAnnotationConfig[] }
  // ) => Promise<void>;
  updateAnnotationGroup: (
    group: EventAnnotationGroupConfig,
    savedObjectId: string
  ) => Promise<void>;
  toExpression: (props: EventAnnotationConfig[]) => ExpressionAstExpression[];
  toFetchExpression: (props: {
    interval: string;
    groups: EventAnnotationGroupConfig[];
  }) => ExpressionAstExpression[];
  renderEventAnnotationGroupSavedObjectFinder: (props: {
    fixedPageSize: number;
    onChoose: (value: {
      id: string;
      type: string;
      fullName: string;
      savedObject: SavedObjectCommon<unknown>;
    }) => void;
  }) => JSX.Element;
}
