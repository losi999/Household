import { IRecipientsTriggerService } from '@household/api/functions/recipients-trigger/recipients-trigger.service';

export default (recipientsTrigger: IRecipientsTriggerService): AWSLambda.EventBridgeHandler<any, any, any> => {
  return async (event) => {
    console.log(JSON.stringify(event, null, 2));

    try {
      await recipientsTrigger();
    } catch (error) {
      console.error(error);
      // return errorResponse(error);
    }
  };
};
