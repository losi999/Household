export const CORS_HEADERS_NAME = 'Access-Control-Allow-Headers';
export const CORS_METHODS_NAME = 'Access-Control-Allow-Methods';
export const CORS_ORIGIN_NAME = 'Access-Control-Allow-Origin';

export default (): (response: AWSLambda.APIGatewayProxyResult) => AWSLambda.APIGatewayProxyResult => {
  return (response) => {
    response.headers = response.headers || {};
    response.headers[CORS_ORIGIN_NAME] = '*';
    response.headers[CORS_HEADERS_NAME] = '*';
    response.headers[CORS_METHODS_NAME] = '*';
    return response;
  };
};
