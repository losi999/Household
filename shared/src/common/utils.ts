import { HttpError } from '@household/shared/types/common';
import { Account, Category, Project, Recipient, Transaction } from '@household/shared/types/types';

export const httpError = (statusCode: number, message: string): HttpError => ({
  statusCode,
  message,
});

export const addSeconds = (seconds: number, dateFrom?: Date): Date => {
  if (dateFrom) {
    return new Date(dateFrom.getTime() + seconds * 1000);
  }
  return new Date(Date.now() + seconds * 1000);
};

export const castPathParameters = (event: AWSLambda.APIGatewayProxyEvent) => {
  return event.pathParameters as (Account.Id & Project.Id & Category.Id & Recipient.Id & Transaction.Id);
};
