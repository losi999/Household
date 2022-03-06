import { HttpError } from '@household/shared/types/common';

const successResponse = (statusCode: number, data?: any): AWSLambda.APIGatewayProxyResult => {
  return {
    statusCode,
    body: data ? JSON.stringify(data) : '',
  };
};

export const errorResponse = ({ statusCode, message }: HttpError): AWSLambda.APIGatewayProxyResult => {
  return {
    statusCode,
    body: JSON.stringify({ message }),
  };
};

export const okResponse = (data: any) => successResponse(200, data);
export const createdResponse = (data: any) => successResponse(201, data);
export const noContentResponse = () => successResponse(204);