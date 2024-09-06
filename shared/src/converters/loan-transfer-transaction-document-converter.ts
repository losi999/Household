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
    create: ({ body: { amount, description, issuedAt }, account, transferAccount }, expiresIn, generateId) => {
      return {
        amount,
        description,
        account,
        transferAccount,
        issuedAt: new Date(issuedAt),
        transactionType: 'loanTransfer',
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    toResponse: ({ _id, amount, issuedAt, transferAccount, account, description, transactionType }, viewingAccountId) => {
      return {
        description,
        transactionType,
        transactionId: getTransactionId(_id),
        issuedAt: issuedAt.toISOString(),
        amount: amount,
        account: viewingAccountId === getAccountId(transferAccount) ? accountDocumentConverter.toResponse(transferAccount) : accountDocumentConverter.toResponse(account),
        transferAccount: viewingAccountId === getAccountId(transferAccount) ? accountDocumentConverter.toResponse(account) : accountDocumentConverter.toResponse(transferAccount),
      };
    },
    toResponseList: (docs, mainAccountId) => docs.map(d => instance.toResponse(d, mainAccountId)),
  };

  return instance;
};
