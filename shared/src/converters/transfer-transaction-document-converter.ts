import { generateMongoId } from '@household/shared/common/mongoose-utils';
import { addSeconds, getAccountId, getTransactionId } from '@household/shared/common/utils';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { TransactionType } from '@household/shared/enums';
import { DocumentUpdate, Unset } from '@household/shared/types/common';
import { Api } from '@household/shared/types/api';
import { Documents } from '@household/shared/types/documents';
import { UpdateQuery } from 'mongoose';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';

export interface ITransferTransactionDocumentConverter {
  create(data: {
    body: Requests.TransferTransaction;
    account: Documents.Account;
    transferAccount: Documents.Account;
  }, expiresIn: number, generateId?: boolean): Documents.TransferTransaction;
  update(data: {
    body: Requests.TransferTransaction;
    account: Documents.Account;
    transferAccount: Documents.Account;
  }, expiresIn: number): DocumentUpdate<Documents.Transaction>;
  toResponse(document: Documents.TransferTransaction, viewingAccountId: Api.Account.Id): Responses.TransferTransaction;
  toResponseList(documents: Documents.TransferTransaction[], viewingAccountId: Api.Account.Id): Responses.TransferTransaction[];
}

export const transferTransactionDocumentConverterFactory = (accountDocumentConverter: IAccountDocumentConverter): ITransferTransactionDocumentConverter => {
  const transactionType = TransactionType.Transfer;
  const defaultUnset: Unset<Documents.Transaction, Documents.TransferTransaction> = {
    file: true,
    potentialDuplicates: true,
    ownerAccount: true,
    payingAccount: true,
    deferredSplits: true,
    splits: true,
    billingEndDate: true,
    billingStartDate: true,
    category: true,
    invoiceNumber: true,
    product: true,
    project: true,
    quantity: true,
    recipient: true,
  };

  const instance: ITransferTransactionDocumentConverter = {
    create: ({ body: { amount, description, transferAmount, issuedAt }, account, transferAccount }, expiresIn, generateId) => {
      return {
        amount,
        description,
        transferAmount: transferAmount ?? amount * -1,
        account,
        transferAccount,
        issuedAt: new Date(issuedAt),
        transactionType,
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    update: ({ body: { amount, description, transferAmount, issuedAt }, account, transferAccount }, expiresIn) => {
      const optionalSet: UpdateQuery<Documents.Transaction>['$set'] = {
        description,
      };

      return {
        update: {
          $unset: {
            ...defaultUnset,
            ...Object.entries(optionalSet).reduce((accumulator, [
              key,
              value,
            ]) => {
              if (value) {
                return accumulator;
              }

              return {
                ...accumulator,
                [key]: true,
              };
            }, {}),
          },
          $set: {
            amount,
            account,
            transferAccount,
            transferAmount: transferAmount ?? amount * -1,
            issuedAt: new Date(issuedAt),
            transactionType,
            expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
            ...Object.entries(optionalSet).reduce((accumulator, [
              key,
              value,
            ]) => {
              if (value) {
                return {
                  ...accumulator,
                  [key]: value,
                };
              }

              return accumulator;
            }, {}),
          },
        },
      };
    },
    toResponse: ({ description, transactionType, _id, issuedAt, transferAccount, transferAmount, amount, account }, viewingAccountId) => {
      return {
        description,
        transactionType,
        transactionId: getTransactionId(_id),
        issuedAt: issuedAt.toISOString(),
        amount: viewingAccountId === getAccountId(transferAccount) ? transferAmount : amount,
        transferAmount: viewingAccountId === getAccountId(transferAccount) ? amount : transferAmount,
        account: viewingAccountId === getAccountId(transferAccount) ? accountDocumentConverter.toResponse(transferAccount) : accountDocumentConverter.toResponse(account),
        transferAccount: viewingAccountId === getAccountId(transferAccount) ? accountDocumentConverter.toResponse(account) : accountDocumentConverter.toResponse(transferAccount),
      };
    },
    toResponseList: (docs, viewingAccountId) => docs.map(d => instance.toResponse(d, viewingAccountId)),
  };

  return instance;
};
