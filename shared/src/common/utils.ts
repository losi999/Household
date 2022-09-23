import { headerExpiresIn } from '@household/shared/constants';
import { Dictionary, HttpError } from '@household/shared/types/common';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';

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
  return event.pathParameters as (Account.Id & Project.Id & Category.Id & Recipient.Id & Transaction.Id & Product.Id);
};

export const getExpiresInHeader = (event: AWSLambda.APIGatewayProxyEvent) => {
  const expiresInLowercased = headerExpiresIn.toLowerCase();
  const headerName = Object.keys(event.headers).find(name => name.toLowerCase() === expiresInLowercased);

  return event.headers[headerName];
};

export const toDictionary = <P>(docs: P[], key: keyof P): Dictionary<P> => {
  return docs.reduce((accumulator, currentValue) => {
    return {
      ...accumulator,
      [currentValue[key].toString()]: currentValue,
    };
  }, {});
};
