import { default as handler } from '@household/api/functions/post-deploy/post-deploy.handler';
import { postDeployServiceFactory } from '@household/api/functions/post-deploy/post-deploy.service';
import { infrastructureService } from '@household/shared/dependencies/services/infrastructure-service';

const postDeployService = postDeployServiceFactory(infrastructureService);

export default handler(postDeployService);
