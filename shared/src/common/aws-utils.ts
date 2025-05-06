import { headerExpiresIn } from '@household/shared/constants';
import { Account, Category, File, Product, Project, Recipient, Setting, Transaction } from '@household/shared/types/types';

export const castPathParameters = (event: AWSLambda.APIGatewayProxyEvent) => {
  return event.pathParameters as (Account.AccountId & Project.ProjectId & Category.CategoryId & Recipient.RecipientId & Transaction.TransactionId & Product.ProductId & File.FileId & Setting.SettingKey);
};

export const getExpiresInHeader = (event: AWSLambda.APIGatewayProxyEvent) => {
  const expiresInLowercased = headerExpiresIn.toLowerCase();
  const headerName = Object.keys(event.headers).find(name => name.toLowerCase() === expiresInLowercased);

  return event.headers[headerName];
};
