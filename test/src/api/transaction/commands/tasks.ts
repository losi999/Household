import { Transaction } from '@household/shared/types/types';
import { CommandFunction } from '@household/test/api/types';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { createDate } from '@household/shared/common/utils';
import { TransactionType } from '@household/shared/enums';

const fixDate = (doc: Transaction.Document<string>): Transaction.Document => {
  switch(doc?.transactionType) {
    case TransactionType.Draft:
    case TransactionType.Transfer: return {
      ...doc,
      issuedAt: createDate(doc.issuedAt),
    };
    case TransactionType.Deferred:
    case TransactionType.Reimbursement:
    case TransactionType.Payment: return {
      ...doc,
      issuedAt: createDate(doc.issuedAt),
      billingEndDate: createDate(doc.billingEndDate),
      billingStartDate: createDate(doc.billingStartDate),
    };
    case TransactionType.Split:
      return {
        ...doc,
        issuedAt: createDate(doc.issuedAt),
        deferredSplits: doc.deferredSplits?.map<Transaction.DeferredDocument>(({ issuedAt, ...s }) => ({
          ...s,
          billingEndDate: createDate(s.billingEndDate),
          billingStartDate: createDate(s.billingStartDate),
        }) as Transaction.DeferredDocument),
        splits: doc.splits?.map(s => ({
          ...s,
          billingEndDate: createDate(s.billingEndDate),
          billingStartDate: createDate(s.billingStartDate),
        })),
      };
    default: return doc;
  }
};

const saveTransactionDocument = (...params: Parameters<ITransactionService['saveTransaction']>) => {
  return cy.task<Transaction.Document<string>>('saveTransaction', params).then((doc) => fixDate(doc));
};

const saveTransactionDocuments = (...params: Parameters<ITransactionService['saveTransactions']>) => {
  return cy.task<Transaction.Document<string>[]>('saveTransactions', params).then((docs) => docs.map(d => fixDate(d)));
};

const getTransactionDocumentById = (...params: Parameters<ITransactionService['getTransactionById']>) => {
  return cy.task<Transaction.Document<string>>('getTransactionById', params).then((doc) => fixDate(doc));
};

export const setTransactionTaskCommands = () => {
  Cypress.Commands.addAll({
    getTransactionDocumentById,
    saveTransactionDocument,
    saveTransactionDocuments,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      saveTransactionDocument: CommandFunction<typeof saveTransactionDocument>;
      saveTransactionDocuments: CommandFunction<typeof saveTransactionDocuments>;
      getTransactionDocumentById: CommandFunction<typeof getTransactionDocumentById>
    }
  }
}
