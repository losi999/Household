import { default as handler } from '@household/api/functions/accounts-trigger/accounts-trigger.handler';
import { accountsTriggerServiceFactory } from '@household/api/functions/accounts-trigger/accounts-trigger.service';

const accountsTriggerService = accountsTriggerServiceFactory();

export default handler(accountsTriggerService);
