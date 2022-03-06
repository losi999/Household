import { default as handler } from '@household/api/functions/transactions-trigger/transactions-trigger.handler';
import { transactionsTriggerServiceFactory } from '@household/api/functions/transactions-trigger/transactions-trigger.service';

const transactionsTriggerService = transactionsTriggerServiceFactory();

export default handler(transactionsTriggerService);
