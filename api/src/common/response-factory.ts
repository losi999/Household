import { HttpError } from '@household/shared/types/common';

const response = (statusCode: number, data?: any): AWSLambda.APIGatewayProxyResult => {
  return {
    statusCode,
    body: data ? JSON.stringify(data) : '',
  };
};

export const errorResponse = ({ statusCode, message }: HttpError): AWSLambda.APIGatewayProxyResult => {
  return response(statusCode ?? 500, {
    message,
  });
};

export const okResponse = (data?: any) => response(200, data);
export const createdResponse = (data?: any) => response(201, data);
export const noContentResponse = () => response(204);
export const badRequestResponse = (data: any) => response(400, data);
export const forbiddenResponse = () => response(403);
