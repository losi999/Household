import { Account } from '@household/shared/types/types';
import { CommandFunction } from '@household/test/api/types';
import { IAccountService } from '@household/shared/services/account-service';
import '@household/test/api/account/commands/requests';

const saveAccountDocument = (...params: Parameters<IAccountService['saveAccount']>) => {
  return cy.task<Account.Document>('saveAccount', params);
};

const saveAccountDocuments = (...params: Parameters<IAccountService['saveAccounts']>) => {
  return cy.task<Account.Document[]>('saveAccounts', params);
};

const getAccountDocumentById = (...params: Parameters<IAccountService['getAccountById']>) => {
  return cy.task<Account.Document>('getAccountById', params);
};

export const setAccountTaskCommands = () => {
  Cypress.Commands.addAll({
    saveAccountDocument,
    getAccountDocumentById,
    saveAccountDocuments,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      saveAccountDocument: CommandFunction<typeof saveAccountDocument>;
      saveAccountDocuments: CommandFunction<typeof saveAccountDocuments>;
      getAccountDocumentById: CommandFunction<typeof getAccountDocumentById>;
    }
  }
}
