import { IAccountsTriggerService } from '@household/api/functions/accounts-trigger/accounts-trigger.service';

export default (accountsTrigger: IAccountsTriggerService): AWSLambda.EventBridgeHandler<any, any, any> => {
  return async (event) => {
    console.log(JSON.stringify(event, null, 2));

    try {
      await accountsTrigger();
    } catch (error) {
      console.error(error);
      // return errorResponse(error);
    }
  };
};
