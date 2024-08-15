import { generateMongoId } from '@household/shared/common/utils';
import { addSeconds, getAccountId, getTransactionId } from '@household/shared/common/utils';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { Account, Transaction } from '@household/shared/types/types';

export interface ILoanTransferTransactionDocumentConverter {
  create(data: {
    body: Transaction.TransferRequest;
    account: Account.Document;
    transferAccount: Account.Document;
  }, expiresIn: number, generateId?: boolean): Transaction.LoanTransferDocument;
  toResponse(document: Transaction.LoanTransferDocument, viewingAccountId: Account.Id): Transaction.LoanTransferResponse;
  toResponseList(documents: Transaction.LoanTransferDocument[], viewingAccountId: Account.Id): Transaction.LoanTransferResponse[];
}

export const loanTransferTransactionDocumentConverterFactory = (
  accountDocumentConverter: IAccountDocumentConverter,
): ILoanTransferTransactionDocumentConverter => {
  const instance: ILoanTransferTransactionDocumentConverter = {
    create: ({ body: { amount, description, issuedAt }, account, transferAccount }, expiresIn, generateId): Transaction.LoanTransferDocument => {
      return {
        amount,
        description,
        account,
        transferAccount,
        issuedAt: new Date(issuedAt),
        transactionType: 'loanTransfer',
        _id: generateId ? generateMongoId() : undefined,
        accountId: undefined,
        transferAccountId: undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    toResponse: (doc, viewingAccountId): Transaction.LoanTransferResponse => {
      return {
        ...doc,
        createdAt: undefined,
        updatedAt: undefined,
        transactionId: getTransactionId(doc),
        issuedAt: doc.issuedAt.toISOString(),
        _id: undefined,
        expiresAt: undefined,
        amount: doc.amount,
        account: viewingAccountId === getAccountId(doc.transferAccount) ? accountDocumentConverter.toResponse(doc.transferAccount) : accountDocumentConverter.toResponse(doc.account),
        transferAccount: viewingAccountId === getAccountId(doc.transferAccount) ? accountDocumentConverter.toResponse(doc.account) : accountDocumentConverter.toResponse(doc.transferAccount),
      };
    },
    toResponseList: (docs, mainAccountId) => docs.map(d => instance.toResponse(d, mainAccountId)),
  };

  return instance;
};
