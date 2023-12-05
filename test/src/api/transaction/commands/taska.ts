import { Transaction } from '@household/shared/types/types';
import { CommandFunction } from '@household/test/api/types';
import { ITransactionService } from '@household/shared/services/transaction-service';

const saveTransactionDocument = (...params: Parameters<ITransactionService['saveTransaction']>) => {
  return cy.task<Transaction.Document>('saveTransaction', ...params);
};

const getTransactionDocumentById = (...params: Parameters<ITransactionService['getTransactionById']>) => {
  return cy.task<Transaction.Document>('getTransactionById', ...params);
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
