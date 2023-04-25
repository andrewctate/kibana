/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { OptionsListEmbeddable, OptionsListEmbeddableFactory } from '../../public';
import { OptionsListComponentState, OptionsListReduxState } from '../../public/options_list/types';
import { ControlFactory, ControlOutput } from '../../public/types';
import { OptionsListEmbeddableInput } from './types';

import * as optionsListStateModule from '../../public/options_list/options_list_reducers';

const mockOptionsListComponentState = {
  searchString: { value: '', valid: true },
  field: undefined,
  totalCardinality: 0,
  availableOptions: {
    woof: { doc_count: 100 },
    bark: { doc_count: 75 },
    meow: { doc_count: 50 },
    quack: { doc_count: 25 },
    moo: { doc_count: 5 },
  },
  invalidSelections: [],
  allowExpensiveQueries: true,
  popoverOpen: false,
  validSelections: [],
} as OptionsListComponentState;

export const mockOptionsListEmbeddableInput = {
  id: 'sample options list',
  fieldName: 'sample field',
  dataViewId: 'sample id',
  selectedOptions: [],
  runPastTimeout: false,
  singleSelect: false,
  exclude: false,
} as OptionsListEmbeddableInput;

const mockOptionsListOutput = {
  loading: false,
} as ControlOutput;

export const mockOptionsListEmbeddable = async (partialState?: Partial<OptionsListReduxState>) => {
  const optionsListFactoryStub = new OptionsListEmbeddableFactory();
  const optionsListControlFactory = optionsListFactoryStub as unknown as ControlFactory;
  optionsListControlFactory.getDefaultInput = () => ({});

  // initial component state can be provided by overriding the defaults.
  const initialComponentState = {
    ...mockOptionsListComponentState,
    ...partialState?.componentState,
  };
  jest
    .spyOn(optionsListStateModule, 'getDefaultComponentState')
    .mockImplementation(() => initialComponentState);

  const mockEmbeddable = (await optionsListControlFactory.create({
    ...mockOptionsListEmbeddableInput,
    ...partialState?.explicitInput,
  })) as OptionsListEmbeddable;
  mockEmbeddable.getOutput = jest.fn().mockReturnValue(mockOptionsListOutput);
  return mockEmbeddable;
};
