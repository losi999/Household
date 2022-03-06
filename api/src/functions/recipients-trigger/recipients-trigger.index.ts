import { default as handler } from '@household/api/functions/recipients-trigger/recipients-trigger.handler';
import { recipientsTriggerServiceFactory } from '@household/api/functions/recipients-trigger/recipients-trigger.service';

const recipientsTriggerService = recipientsTriggerServiceFactory();

export default handler(recipientsTriggerService);
