/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiText, EuiTitle } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { Connector } from '@kbn/search-connectors';
import React, { useEffect, useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { isValidIndexName } from '../../../../utils/validate_index_name';
import { SAVE_LABEL } from '../../../../../common/i18n_string';
import { useConnector } from '../../../hooks/api/use_connector';
import { useKibanaServices } from '../../../hooks/use_kibana';
import { ApiKeyPanel } from './api_key_panel';
import { ConnectorIndexNameForm } from './connector_index_name_form';

interface ConnectorIndexNameProps {
  connector: Connector;
}

export const ConnectorIndexName: React.FC<ConnectorIndexNameProps> = ({ connector }) => {
  const { http, notifications } = useKibanaServices();
  const queryClient = useQueryClient();
  const { queryKey } = useConnector(connector.id);
  const { data, error, isLoading, isSuccess, mutate, reset } = useMutation({
    mutationFn: async ({ inputName, sync }: { inputName: string | null; sync?: boolean }) => {
      if (inputName && inputName !== connector.index_name) {
        const body = { index_name: inputName };
        await http.post(`/internal/serverless_search/connectors/${connector.id}/index_name`, {
          body: JSON.stringify(body),
        });
      }
      if (sync) {
        await http.post(`/internal/serverless_search/connectors/${connector.id}/sync`);
      }
      return inputName;
    },
  });

  useEffect(() => {
    if (isSuccess) {
      queryClient.setQueryData(queryKey, { connector: { ...connector, index_name: data } });
      queryClient.invalidateQueries(queryKey);
      reset();
    }
  }, [data, isSuccess, connector, queryClient, queryKey, reset]);

  useEffect(() => {
    if (error) {
      notifications.toasts.addError(error as Error, {
        title: i18n.translate('xpack.serverlessSearch.connectors.config.connectorIndexNameError', {
          defaultMessage: 'Error updating index name',
        }),
      });
    }
  }, [error, notifications]);

  const [newIndexName, setNewIndexname] = useState(connector.index_name);

  return (
    <>
      <EuiFlexGroup direction="column" alignItems="center" justifyContent="center">
        <EuiFlexItem>
          <EuiTitle size="s">
            <h2>
              {i18n.translate('xpack.serverlessSearch.connectors.config.connectorIndexNameTitle', {
                defaultMessage: 'Link index',
              })}
            </h2>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiText color="subdued">
            {i18n.translate(
              'xpack.serverlessSearch.connectors.config.connectorIndexNameDescription',
              {
                defaultMessage:
                  'Pick an index where your documents will be synced, or create a new one for this connector.',
              }
            )}
          </EuiText>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer />
      <ConnectorIndexNameForm
        indexName={newIndexName || ''}
        onChange={(name) => setNewIndexname(name)}
      />
      <EuiSpacer />
      <ApiKeyPanel connector={connector} />
      <EuiSpacer />
      <EuiFlexGroup>
        <EuiFlexItem grow={false}>
          <span>
            <EuiButton
              color="primary"
              isDisabled={!isValidIndexName(newIndexName)}
              isLoading={isLoading}
              onClick={() => mutate({ inputName: newIndexName, sync: false })}
            >
              {SAVE_LABEL}
            </EuiButton>
          </span>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <span>
            <EuiButton
              color="primary"
              disabled={!isValidIndexName(newIndexName)}
              fill
              isLoading={isLoading}
              onClick={() => mutate({ inputName: newIndexName, sync: true })}
            >
              {i18n.translate('xpack.serverlessSearch.connectors.config.saveSyncLabel', {
                defaultMessage: 'Save and sync',
              })}
            </EuiButton>
          </span>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};
