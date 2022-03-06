import { IProjectsTriggerService } from '@household/api/functions/projects-trigger/projects-trigger.service';

export default (projectsTrigger: IProjectsTriggerService): AWSLambda.EventBridgeHandler<any, any, any> => {
  return async (event) => {
    console.log(JSON.stringify(event, null, 2));

    try {
      await projectsTrigger();
    } catch (error) {
      console.error(error);
      // return errorResponse(error);
    }
  };
};
