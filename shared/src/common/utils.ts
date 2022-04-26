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

export const isSplitTransaction = (transaction: Transaction.Response): transaction is Transaction.SplitResponse => {
  return transaction.transactionType === 'split';
};

export const isTransferTransaction = (transaction: Transaction.Response): transaction is Transaction.TransferResponse => {
  return transaction.transactionType === 'transfer';
};

export const isPaymentTransaction = (transaction: Transaction.Response): transaction is Transaction.PaymentResponse => {
  return transaction.transactionType === 'payment';
};
