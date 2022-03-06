import { default as handler } from '@household/api/functions/categories-trigger/categories-trigger.handler';
import { categoriesTriggerServiceFactory } from '@household/api/functions/categories-trigger/categories-trigger.service';

const categoriesTriggerService = categoriesTriggerServiceFactory();

export default handler(categoriesTriggerService);
