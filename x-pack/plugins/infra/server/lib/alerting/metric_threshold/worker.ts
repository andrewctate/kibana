/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { ElasticsearchClient, LoggerFactory } from 'kibana/server';
import { first, last, isEqual } from 'lodash';
import { i18n } from '@kbn/i18n';
import moment from 'moment';
import { LogLevel } from '@kbn/logging';
import { RecoveredActionGroup } from '../../../../../alerting/common';
import { InfraSource } from '../../sources';
import {
  buildErrorAlertReason,
  buildFiredAlertReason,
  buildNoDataAlertReason,
  stateToAlertMessage,
} from '../common/messages';
import { UNGROUPED_FACTORY_KEY } from '../common/utils';
import { evaluateRule, EvaluatedRuleParams } from './lib/evaluate_rule';
import { createFormatter } from '../../../../common/formatters';
import { AlertStates, Comparator } from './types';
import { FIRED_ACTIONS, WARNING_ACTIONS } from './metric_threshold_executor';

import { configureClient } from '../../../../../../../src/core/server/elasticsearch/client';
import { BaseLogger } from '../../../../../../../src/core/server/logging/logger';

export interface IActionSchedulingInfo {
  actionGroupId: string;
  alertState: string;
  group: string;
  reason: string;
  timestamp: number;
  value: ReturnType<typeof mapToConditionsLookup>;
  threshold: ReturnType<typeof mapToConditionsLookup>;
}

const scopedClient = configureClient(
  {
    customHeaders: {},
    sniffOnStart: false,
    sniffOnConnectionFault: false,
    requestHeadersWhitelist: [],
    sniffInterval: false,
    hosts: [],
    username: 'elastic',
    password: 'changeme',
  },
  {
    logger: new BaseLogger('worker thread', LogLevel.All, [], { get: () => {} } as LoggerFactory),
    type: 'foobar',
    scoped: true,
  }
);

async function getActionsFromMetricThreshold({
  params,
  config,
  prevGroups,
  alertOnNoData,
  alertOnGroupDisappear,
  compositeSize,
}: {
  esClient: ElasticsearchClient;
  params: EvaluatedRuleParams;
  config: InfraSource['configuration'];
  prevGroups: string[];
  alertOnNoData: boolean;
  alertOnGroupDisappear?: boolean;
  compositeSize: number;
}) {
  const alertResults = await evaluateRule(scopedClient, params, config, prevGroups, compositeSize);

  // Because each alert result has the same group definitions, just grab the groups from the first one.
  const resultGroups = Object.keys(first(alertResults)!);
  // Merge the list of currently fetched groups and previous groups, and uniquify them. This is necessary for reporting
  // no data results on groups that get removed
  const groups = [...new Set([...prevGroups, ...resultGroups])];

  const hasGroups = !isEqual(groups, [UNGROUPED_FACTORY_KEY]);

  const actionsToSchedule: IActionSchedulingInfo[] = [];
  for (const group of groups) {
    // AND logic; all criteria must be across the threshold
    const shouldAlertFire = alertResults.every((result) =>
      // Grab the result of the most recent bucket
      last(result[group].shouldFire)
    );
    const shouldAlertWarn = alertResults.every((result) => last(result[group].shouldWarn));
    // AND logic; because we need to evaluate all criteria, if one of them reports no data then the
    // whole alert is in a No Data/Error state
    const isNoData = alertResults.some((result) => last(result[group].isNoData));
    const isError = alertResults.some((result) => result[group].isError);

    const nextState = isError
      ? AlertStates.ERROR
      : isNoData
      ? AlertStates.NO_DATA
      : shouldAlertFire
      ? AlertStates.ALERT
      : shouldAlertWarn
      ? AlertStates.WARNING
      : AlertStates.OK;

    let reason;
    if (nextState === AlertStates.ALERT || nextState === AlertStates.WARNING) {
      reason = alertResults
        .map((result) =>
          buildFiredAlertReason({
            ...formatAlertResult(result[group], nextState === AlertStates.WARNING),
            group,
          })
        )
        .join('\n');
      /*
       * Custom recovery actions aren't yet available in the alerting framework
       * Uncomment the code below once they've been implemented
       * Reference: https://github.com/elastic/kibana/issues/87048
       */
      // } else if (nextState === AlertStates.OK && prevState?.alertState === AlertStates.ALERT) {
      // reason = alertResults
      //   .map((result) => buildRecoveredAlertReason(formatAlertResult(result[group])))
      //   .join('\n');
    }

    /* NO DATA STATE HANDLING
     *
     * - `alertOnNoData` does not indicate IF the alert's next state is No Data, but whether or not the user WANTS TO BE ALERTED
     *   if the state were No Data.
     * - `alertOnGroupDisappear`, on the other hand, determines whether or not it's possible to return a No Data state
     *   when a group disappears.
     *
     * This means we need to handle the possibility that `alertOnNoData` is false, but `alertOnGroupDisappear` is true
     *
     * nextState === NO_DATA would be true on both { '*': No Data } or, e.g. { 'a': No Data, 'b': OK, 'c': OK }, but if the user
     * has for some reason disabled `alertOnNoData` and left `alertOnGroupDisappear` enabled, they would only care about the latter
     * possibility. In this case, use hasGroups to determine whether to alert on a potential No Data state
     *
     * If `alertOnNoData` is true but `alertOnGroupDisappear` is false, we don't need to worry about the {a, b, c} possibility.
     * At this point in the function, a false `alertOnGroupDisappear` would already have prevented group 'a' from being evaluated at all.
     */
    if (alertOnNoData || (alertOnGroupDisappear && hasGroups)) {
      // In the previous line we've determined if the user is interested in No Data states, so only now do we actually
      // check to see if a No Data state has occurred
      if (nextState === AlertStates.NO_DATA) {
        reason = alertResults
          .filter((result) => result[group].isNoData)
          .map((result) => buildNoDataAlertReason({ ...result[group], group }))
          .join('\n');
      } else if (nextState === AlertStates.ERROR) {
        reason = alertResults
          .filter((result) => result[group].isError)
          .map((result) => buildErrorAlertReason(result[group].metric))
          .join('\n');
      }
    }

    if (reason) {
      const firstResult = first(alertResults);
      const timestamp = (firstResult && firstResult[group].timestamp) ?? moment().toISOString();
      const actionGroupId =
        nextState === AlertStates.OK
          ? RecoveredActionGroup.id
          : nextState === AlertStates.WARNING
          ? WARNING_ACTIONS.id
          : FIRED_ACTIONS.id;

      actionsToSchedule.push({
        actionGroupId,
        alertState: stateToAlertMessage[nextState],
        group,
        reason,
        timestamp,
        value: mapToConditionsLookup(
          alertResults,
          (result) => formatAlertResult(result[group]).currentValue
        ),
        threshold: mapToConditionsLookup(
          alertResults,
          (result) => formatAlertResult(result[group]).threshold
        ),
      });
    }
  }

  return { groups, actionsToSchedule };
}

const formatAlertResult = <AlertResult>(
  alertResult: {
    metric: string;
    currentValue: number;
    threshold: number[];
    comparator: Comparator;
    warningThreshold?: number[];
    warningComparator?: Comparator;
  } & AlertResult,
  useWarningThreshold?: boolean
) => {
  const { metric, currentValue, threshold, comparator, warningThreshold, warningComparator } =
    alertResult;
  const noDataValue = i18n.translate(
    'xpack.infra.metrics.alerting.threshold.noDataFormattedValue',
    {
      defaultMessage: '[NO DATA]',
    }
  );
  if (!metric.endsWith('.pct'))
    return {
      ...alertResult,
      currentValue: currentValue ?? noDataValue,
    };
  const formatter = createFormatter('percent');
  const thresholdToFormat = useWarningThreshold ? warningThreshold! : threshold;
  const comparatorToFormat = useWarningThreshold ? warningComparator! : comparator;
  return {
    ...alertResult,
    currentValue:
      currentValue !== null && typeof currentValue !== 'undefined'
        ? formatter(currentValue)
        : noDataValue,
    threshold: Array.isArray(thresholdToFormat)
      ? thresholdToFormat.map((v: number) => formatter(v))
      : thresholdToFormat,
    comparator: comparatorToFormat,
  };
};

// TODO - deduplicate?
const mapToConditionsLookup = (
  list: any[],
  mapFn: (value: any, index: number, array: any[]) => unknown
) =>
  list
    .map(mapFn)
    .reduce(
      (result: Record<string, any>, value, i) => ({ ...result, [`condition${i}`]: value }),
      {}
    );

export { getActionsFromMetricThreshold };
