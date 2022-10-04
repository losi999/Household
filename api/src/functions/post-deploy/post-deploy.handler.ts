import { IPostDeployService } from '@household/api/functions/post-deploy/post-deploy.service';

export default (postDeploy: IPostDeployService): AWSLambda.Handler =>
  async () => {
    await postDeploy({
      stackName: process.env.INFRASTRUCTURE_STACK,
    });
  };
