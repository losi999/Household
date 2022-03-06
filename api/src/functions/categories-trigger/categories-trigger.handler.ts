import { ICategoriesTriggerService } from '@household/api/functions/categories-trigger/categories-trigger.service';

export default (categoriesTrigger: ICategoriesTriggerService): AWSLambda.EventBridgeHandler<any, any, any> => {
  return async (event) => {
    console.log(JSON.stringify(event, null, 2));

    try {
      await categoriesTrigger();
    } catch (error) {
      console.error(error);
      // return errorResponse(error);
    }
  };
};
