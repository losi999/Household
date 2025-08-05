import { APIHandler } from '@household/shared/common/aws-utils';
import { cors } from '@household/api/dependencies/handlers/cors.handler';

export default (params: {
  handler: APIHandler;
}): AWSLambda.APIGatewayProxyHandler => {
  return async (event, context, callback) => {

    return undefined;
    // console.log('handler start');
    // context.callbackWaitsForEmptyEventLoop = false;
    // let modifiedEvent: E;
    // let result: R;
    // try {
    //   modifiedEvent = params.before.reduce((accumulator, currentValue) => {
    //     return currentValue(accumulator);
    //   }, event);
    // } catch (error) {
    //   result = error as R;
    // }

    // if (!result) {
    //   result = (await params.handler(modifiedEvent, context, callback)) as R;
    // }

    // if (result) {
    //   const modifiedResult = params.after.reduce((accumulator, currentValue) => {
    //     return currentValue(accumulator);
    //   }, result);

    //   return modifiedResult;
    // }
  };
};
