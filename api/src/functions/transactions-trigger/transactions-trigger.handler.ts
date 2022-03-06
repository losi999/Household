import { ITransactionsTriggerService } from '@household/api/functions/transactions-trigger/transactions-trigger.service';

export default (transactionsTrigger: ITransactionsTriggerService): AWSLambda.EventBridgeHandler<any, any, any> => {
  return async (event) => {
    console.log(JSON.stringify(event, null, 2));

    try {
      await transactionsTrigger();
    } catch (error) {
      console.error(error);
      // return errorResponse(error);
    }
  };
};
