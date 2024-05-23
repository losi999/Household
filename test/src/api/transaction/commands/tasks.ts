import { Transaction } from '@household/shared/types/types';
import { CommandFunction } from '@household/test/api/types';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { createDate } from '@household/shared/common/utils';

const fixDate = (doc: Transaction.Document<string>): Transaction.Document => {
  switch(doc?.transactionType) {
    case 'draft':
    case 'transfer': return {
      ...doc,
      issuedAt: createDate(doc.issuedAt),
    };
    case 'payment': return {
      ...doc,
      issuedAt: createDate(doc.issuedAt),
      billingEndDate: createDate(doc.billingEndDate),
      billingStartDate: createDate(doc.billingStartDate),
    };
    case 'split': return {
      ...doc,
      issuedAt: createDate(doc.issuedAt),
      splits: doc.splits.map(s => ({
        ...s,
        billingEndDate: createDate(s.billingEndDate),
        billingStartDate: createDate(s.billingStartDate),
      })),
    };
    default: return doc;
  }
};

const saveTransactionDocument = (...params: Parameters<ITransactionService['saveTransaction']>) => {
  return cy.task<Transaction.Document<string>>('saveTransaction', ...params).then((doc) => fixDate(doc));
};

const getTransactionDocumentById = (...params: Parameters<ITransactionService['getTransactionById']>) => {
  return cy.task<Transaction.Document<string>>('getTransactionById', ...params).then((doc) => fixDate(doc));
};

export const setTransactionTaskCommands = () => {
  Cypress.Commands.addAll({
    getTransactionDocumentById,
    saveTransactionDocument,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      saveTransactionDocument: CommandFunction<typeof saveTransactionDocument>;
      getTransactionDocumentById: CommandFunction<typeof getTransactionDocumentById>
    }
  }
}
