import { generateMongoId } from '@household/shared/common/utils';
import { addSeconds, getAccountId, getTransactionId } from '@household/shared/common/utils';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { Dictionary } from '@household/shared/types/common';
import { Account, Transaction } from '@household/shared/types/types';

export interface ITransferTransactionDocumentConverter {
  create(data: {
    body: Transaction.TransferRequest;
    account: Account.Document;
    transferAccount: Account.Document;
    transactions: Dictionary<Transaction.DeferredDocument>;
  }, expiresIn: number, generateId?: boolean): Transaction.TransferDocument;
  toResponse(document: Transaction.TransferDocument, viewingAccountId: Account.Id): Transaction.TransferResponse;
  toResponseList(documents: Transaction.TransferDocument[], viewingAccountId: Account.Id): Transaction.TransferResponse[];
}

export const transferTransactionDocumentConverterFactory = (
  accountDocumentConverter: IAccountDocumentConverter,
): ITransferTransactionDocumentConverter => {
  const instance: ITransferTransactionDocumentConverter = {
    create: ({ body, account, transferAccount, transactions }, expiresIn, generateId): Transaction.TransferDocument => {
      return {
        ...body,
        transferAmount: body.transferAmount ?? body.amount * -1,
        accounts: {
          mainAccount: account,
          transferAccount: transferAccount,
        },
        payments: body.payments?.map(p => {
          return {
            amount: Math.min(p.amount, Math.abs(transactions[p.transactionId].remainingAmount)),
            transaction: transactions[p.transactionId],
          };
        }),
        issuedAt: new Date(body.issuedAt),
        transactionType: 'transfer',
        _id: generateId ? generateMongoId() : undefined,
        accountId: undefined,
        transferAccountId: undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    toResponse: (doc, viewingAccountId): Transaction.TransferResponse => {
      return {
        ...doc,
        createdAt: undefined,
        updatedAt: undefined,
        transactionId: getTransactionId(doc),
        issuedAt: doc.issuedAt.toISOString(),
        _id: undefined,
        expiresAt: undefined,
        accounts: undefined,
        amount: viewingAccountId === getAccountId(doc.accounts.transferAccount) ? doc.transferAmount : doc.amount,
        transferAmount: viewingAccountId === getAccountId(doc.accounts.transferAccount) ? doc.amount : doc.transferAmount,
        account: viewingAccountId === getAccountId(doc.accounts.transferAccount) ? accountDocumentConverter.toResponse(doc.accounts.transferAccount) : accountDocumentConverter.toResponse(doc.accounts.mainAccount),
        transferAccount: viewingAccountId === getAccountId(doc.accounts.transferAccount) ? accountDocumentConverter.toResponse(doc.accounts.mainAccount) : accountDocumentConverter.toResponse(doc.accounts.transferAccount),
      };
    },
    toResponseList: (docs, mainAccountId) => docs.map(d => instance.toResponse(d, mainAccountId)),
  };

  return instance;
};
