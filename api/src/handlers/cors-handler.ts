export const CORS_HEADERS_NAME = 'Access-Control-Allow-Headers';
export const CORS_METHODS_NAME = 'Access-Control-Allow-Methods';
export const CORS_ORIGIN_NAME = 'Access-Control-Allow-Origin';

export default (): ((handler: AWSLambda.APIGatewayProxyHandler) => AWSLambda.APIGatewayProxyHandler) => {
  return (handler) => {
    return async (event, context, callback) => {
      event.headers = event.headers || {};
      const response = await handler(event, context, callback) as AWSLambda.APIGatewayProxyResult;
      response.headers = response.headers || {};
      response.headers[CORS_ORIGIN_NAME] = '*';
      response.headers[CORS_HEADERS_NAME] = '*';
      response.headers[CORS_METHODS_NAME] = '*';
      return response;
    };
  };
};

