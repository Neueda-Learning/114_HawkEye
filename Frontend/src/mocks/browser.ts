import { setupWorker } from 'msw/browser';
import { transactionHandlers } from './handlers/transactions';
import { alertHandlers } from './handlers/alerts';
import { ruleHandlers } from './handlers/rules';

export const worker = setupWorker(
  ...transactionHandlers,
  ...alertHandlers,
  ...ruleHandlers,
);

