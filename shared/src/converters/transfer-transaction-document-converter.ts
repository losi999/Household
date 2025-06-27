import { generateMongoId } from '@household/shared/common/utils';
import { addSeconds, getAccountId, getTransactionId } from '@household/shared/common/utils';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { IDeferredTransactionDocumentConverter } from '@household/shared/converters/deferred-transaction-document-converter';
import { TransactionType } from '@household/shared/enums';
import { Dictionary, Unset } from '@household/shared/types/common';
import { Account, Transaction } from '@household/shared/types/types';
import { UpdateQuery } from 'mongoose';

export interface ITransferTransactionDocumentConverter {
  create(data: {
    body: Transaction.TransferRequest;
    account: Account.Document;
    transferAccount: Account.Document;
    transactions: Dictionary<Transaction.DeferredDocument>;
  }, expiresIn: number, generateId?: boolean): Transaction.TransferDocument;
  update(data: {
    body: Transaction.TransferRequest;
    account: Account.Document;
    transferAccount: Account.Document;
    transactions: Dictionary<Transaction.DeferredDocument>;
  }, expiresIn: number): UpdateQuery<Transaction.Document>;
  toResponse(document: Transaction.TransferDocument, viewingAccountId: Account.Id): Transaction.TransferResponse;
  toResponseList(documents: Transaction.TransferDocument[], viewingAccountId: Account.Id): Transaction.TransferResponse[];
}

export const transferTransactionDocumentConverterFactory = (
  accountDocumentConverter: IAccountDocumentConverter,
  deferredTransactionDocumentConverter: IDeferredTransactionDocumentConverter,
): ITransferTransactionDocumentConverter => {
  const transactionType = TransactionType.Transfer;
  const defaultUnset: Unset<Transaction.Document, Transaction.TransferDocument> = {
    file: true,
    potentialDuplicates: true,
    isSettled: true,
    ownerAccount: true,
    payingAccount: true,
    remainingAmount: true,
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
    create: ({ body: { amount, description, transferAmount, payments, issuedAt }, account, transferAccount, transactions }, expiresIn, generateId) => {
      return {
        amount,
        description,
        transferAmount: transferAmount ?? amount * -1,
        account,
        transferAccount,
        payments: payments?.map(p => {
          const transaction = transactions[p.transactionId];
          return {
            amount: Math.min(p.amount, Math.abs(transaction.remainingAmount ?? transaction.amount)),
            transaction: transactions[p.transactionId],
          };
        }) ?? [],
        issuedAt: new Date(issuedAt),
        transactionType,
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    update: ({ body: { amount, description, transferAmount, payments, issuedAt }, account, transferAccount, transactions }, expiresIn) => {
      const optionalSet: UpdateQuery<Transaction.Document>['$set'] = {
        description,
      };

      return {
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
          payments: payments?.map(p => {
            const transaction = transactions[p.transactionId];
            return {
              amount: Math.min(p.amount, Math.abs(transaction.remainingAmount ?? transaction.amount)),
              transaction: transactions[p.transactionId],
            };
          }) ?? [],
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
      };
    },
    toResponse: ({ description, transactionType, _id, issuedAt, payments, transferAccount, transferAmount, amount, account }, viewingAccountId) => {
      return {
        description,
        transactionType,
        transactionId: getTransactionId(_id),
        issuedAt: issuedAt.toISOString(),
        payments: payments?.map(p => ({
          amount: p.amount,
          transaction: deferredTransactionDocumentConverter.toResponse(p.transaction),
        })) ?? undefined,
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
