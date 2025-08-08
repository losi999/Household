import { headerExpiresIn, headerSuppressEmail } from '@household/shared/constants';
import { Account, Category, Customer, File, Price, Product, Project, Recipient, Setting, Transaction } from '@household/shared/types/types';

type APIEvent<R = {}> = Omit<AWSLambda.APIGatewayProxyEvent, 'pathParameters' | 'body' | 'queryStringParameters' | 'multiValueQueryStringParameters'> & R;
export type APIHandler<R extends {
  pathParameters?: any;
  body?: any;
  queryStringParameters?: any;
  multiValueQueryStringParameters?: any;
} = {}> = AWSLambda.Handler<APIEvent<R>, AWSLambda.APIGatewayProxyResult>;

export const castPathParameters = (event: AWSLambda.APIGatewayProxyEvent) => {
  return event.pathParameters as (Account.AccountId & Project.ProjectId & Category.CategoryId & Recipient.RecipientId & Transaction.TransactionId & Product.ProductId & File.FileId & Setting.SettingKey & Customer.CustomerId & Price.PriceId);
};

export const getExpiresInHeader = (event: AWSLambda.APIGatewayProxyEvent | APIEvent) => {
  const expiresInLowercased = headerExpiresIn.toLowerCase();
  const headerName = Object.keys(event.headers).find(name => name.toLowerCase() === expiresInLowercased);

  return event.headers[headerName];
};

export const getSuppressEmailHeader = (event: AWSLambda.APIGatewayProxyEvent) => {
  const expiresInLowercased = headerSuppressEmail.toLowerCase();
  return Object.entries(event.headers ?? {}).find(([key]) => {
    return key.toLowerCase() === expiresInLowercased;
  })?.[1];
};
