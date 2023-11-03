/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { act, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { HOST_ISOLATION_EXCEPTIONS_PATH } from '../../../../../../common/constants';
import type { AppContextTestRender } from '../../../../../common/mock/endpoint';
import { createAppRootMockRenderer } from '../../../../../common/mock/endpoint';
import { HostIsolationExceptionsList } from '../host_isolation_exceptions_list';
import { exceptionsListAllHttpMocks } from '../../../../mocks/exceptions_list_http_mocks';
import { SEARCHABLE_FIELDS } from '../../constants';
import { parseQueryFilterToKQL } from '../../../../common/utils';
import { useUserPrivileges as _useUserPrivileges } from '../../../../../common/components/user_privileges';
import { getUserPrivilegesMockDefaultValue } from '../../../../../common/components/user_privileges/__mocks__';
import { getFirstCard } from '../../../../components/artifact_list_page/mocks';
import { getEndpointAuthzInitialStateMock } from '../../../../../../common/endpoint/service/authz/mocks';

jest.mock('../../../../../common/components/user_privileges');
const useUserPrivilegesMock = _useUserPrivileges as jest.Mock;

describe('When on the host isolation exceptions page', () => {
  let render: () => ReturnType<AppContextTestRender['render']>;
  let renderResult: ReturnType<typeof render>;
  let history: AppContextTestRender['history'];
  let mockedContext: AppContextTestRender;
  let apiMocks: ReturnType<typeof exceptionsListAllHttpMocks>;

  const pageTestId = 'hostIsolationExceptionsListPage';

  beforeEach(() => {
    mockedContext = createAppRootMockRenderer();
    ({ history } = mockedContext);
    render = () => (renderResult = mockedContext.render(<HostIsolationExceptionsList />));

    apiMocks = exceptionsListAllHttpMocks(mockedContext.coreStart.http);

    act(() => {
      history.push(HOST_ISOLATION_EXCEPTIONS_PATH);
    });
  });

  afterEach(() => {
    useUserPrivilegesMock.mockImplementation(getUserPrivilegesMockDefaultValue);
  });

  it('should search using expected exception item fields', async () => {
    const expectedFilterString = parseQueryFilterToKQL('fooFooFoo', SEARCHABLE_FIELDS);
    const { findAllByTestId } = render();

    await waitFor(async () => {
      await expect(findAllByTestId(`${pageTestId}-card`)).resolves.toHaveLength(10);
    });

    apiMocks.responseProvider.exceptionsFind.mockClear();

    act(() => {
      await userEvent.type(renderResult.getByTestId('searchField'), 'fooFooFoo');
    });
    act(() => {
      fireEvent.click(renderResult.getByTestId('searchButton'));
    });

    await waitFor(() => {
      expect(apiMocks.responseProvider.exceptionsFind).toHaveBeenCalled();
    });

    expect(apiMocks.responseProvider.exceptionsFind).toHaveBeenLastCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({
          filter: expectedFilterString,
        }),
      })
    );
  });

  describe('RBAC + licensing', () => {
    describe('ALL privilege', () => {
      beforeEach(() => {
        useUserPrivilegesMock.mockReturnValue({
          endpointPrivileges: getEndpointAuthzInitialStateMock(),
        });
      });

      it('should allow the Create action', async () => {
        const { queryByTestId } = render();

        await waitFor(() => expect(queryByTestId(`${pageTestId}-pageAddButton`)).toBeTruthy());
      });

      it('should allow the Edit and Delete actions', async () => {
        const { getByTestId } = render();

        await getFirstCard(renderResult, {
          showActions: true,
          testId: 'hostIsolationExceptionsListPage',
        });

        expect(getByTestId(`${pageTestId}-card-cardEditAction`)).toBeTruthy();
        expect(getByTestId(`${pageTestId}-card-cardDeleteAction`)).toBeTruthy();
      });
    });

    describe('READ privilege', () => {
      beforeEach(() => {
        useUserPrivilegesMock.mockReturnValue({
          endpointPrivileges: getEndpointAuthzInitialStateMock({
            canWriteHostIsolationExceptions: false,
            canDeleteHostIsolationExceptions: false,
          }),
        });
      });

      it('should disable the Create action', async () => {
        const { queryByTestId } = render();

        await waitFor(() => expect(queryByTestId(`${pageTestId}-container`)).toBeTruthy());

        expect(queryByTestId(`${pageTestId}-pageAddButton`)).toBeNull();
      });

      it('should disable the Edit and Delete actions', async () => {
        const { queryByTestId } = render();

        await waitFor(() => expect(queryByTestId(`${pageTestId}-container`)).toBeTruthy());

        expect(queryByTestId(`${pageTestId}-card-header-actions-button`)).toBeNull();
      });
    });

    describe('ALL privilege and license downgrade situation', () => {
      // Use case: license downgrade scenario, where user still has entries defined, but no longer
      // able to create or edit them, only delete them

      beforeEach(() => {
        useUserPrivilegesMock.mockReturnValue({
          endpointPrivileges: getEndpointAuthzInitialStateMock({
            canWriteHostIsolationExceptions: false,
            canReadHostIsolationExceptions: true,
            canDeleteHostIsolationExceptions: true,
          }),
        });
      });

      it('should hide the Create and Edit actions when host isolation exceptions write authz is not allowed, but HIE entries exist', async () => {
        const { findAllByTestId, queryByTestId, getByTestId } = await render();

        await waitFor(async () => {
          await expect(findAllByTestId(`${pageTestId}-card`)).resolves.toHaveLength(10);
        });
        await getFirstCard(renderResult, {
          showActions: true,
          testId: 'hostIsolationExceptionsListPage',
        });

        expect(queryByTestId(`${pageTestId}-pageAddButton`)).toBeNull();
        expect(getByTestId(`${pageTestId}-card-cardDeleteAction`)).toBeTruthy();
        expect(queryByTestId(`${pageTestId}-card-cardEditAction`)).toBeNull();
      });

      it('should allow Delete action', async () => {
        const { findAllByTestId, getByTestId } = await render();

        await waitFor(async () => {
          await expect(findAllByTestId(`${pageTestId}-card`)).resolves.toHaveLength(10);
        });
        await getFirstCard(renderResult, {
          showActions: true,
          testId: 'hostIsolationExceptionsListPage',
        });

        const deleteButton = getByTestId(`${pageTestId}-card-cardDeleteAction`);
        expect(deleteButton).toBeTruthy();

        await userEvent.click(deleteButton);
        const confirmDeleteButton = getByTestId(`${pageTestId}-deleteModal-submitButton`);
        await userEvent.click(confirmDeleteButton);
        await waitFor(() => {
          expect(apiMocks.responseProvider.exceptionDelete).toHaveReturnedWith(
            expect.objectContaining({
              namespace_type: 'agnostic',
              os_types: ['windows'],
              tags: ['policy:all'],
            })
          );
        });
      });
    });
  });
});
