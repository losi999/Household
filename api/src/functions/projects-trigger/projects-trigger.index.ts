import { default as handler } from '@household/api/functions/projects-trigger/projects-trigger.handler';
import { projectsTriggerServiceFactory } from '@household/api/functions/projects-trigger/projects-trigger.service';

const projectsTriggerService = projectsTriggerServiceFactory();

export default handler(projectsTriggerService);
