import { headerExpiresIn, headerSuppressEmail } from '@household/shared/constants';
import { Calendar, Customer, Price, Transaction } from '@household/shared/types/types';
import { Api } from '@household/shared/types/api';

type APIEvent<R = {}> = Omit<AWSLambda.APIGatewayProxyEvent, 'pathParameters' | 'body' | 'queryStringParameters' | 'multiValueQueryStringParameters'> & R;
export type APIHandler<R extends {
  pathParameters?: any;
  body?: any;
  queryStringParameters?: any;
  multiValueQueryStringParameters?: any;
} = {}> = AWSLambda.Handler<APIEvent<R>, AWSLambda.APIGatewayProxyResult>;

export const castPathParameters = (event: AWSLambda.APIGatewayProxyEvent) => {
  return event.pathParameters as (Api.Account.AccountId & Api.Project.ProjectId & Api.Category.CategoryId & Api.Recipient.RecipientId & Transaction.TransactionId & Api.Product.ProductId & Api.File.FileId & Api.Setting.SettingKey & Customer.CustomerId & Price.PriceId & Calendar.Entry.CalendarEntryId & Calendar.DayProp);
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
