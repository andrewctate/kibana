/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

/*
 * NOTICE: Do not edit this file manually.
 * This file is automatically generated by the OpenAPI Generator, @kbn/openapi-generator.
 *
 * info:
 *   title: Create list API endpoint
 *   version: 2023-10-31
 */

import { z } from '@kbn/zod';

import {
  ListId,
  ListName,
  ListDescription,
  ListType,
  ListMetadata,
} from '../model/list_common.gen';
import { List } from '../model/list_schemas.gen';

export type CreateListRequestBody = z.infer<typeof CreateListRequestBody>;
export const CreateListRequestBody = z.object({
  id: ListId.optional(),
  name: ListName,
  description: ListDescription,
  type: ListType,
  serializer: z.string().optional(),
  deserializer: z.string().optional(),
  meta: ListMetadata.optional(),
  version: z.number().int().min(1).optional().default(1),
});
export type CreateListRequestBodyInput = z.input<typeof CreateListRequestBody>;

export type CreateListResponse = z.infer<typeof CreateListResponse>;
export const CreateListResponse = List;
