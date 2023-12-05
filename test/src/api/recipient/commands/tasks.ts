import { Recipient } from '@household/shared/types/types';
import { CommandFunction } from '@household/test/api/types';
import { IRecipientService } from '@household/shared/services/recipient-service';

const saveRecipientDocument = (...params: Parameters<IRecipientService['saveRecipient']>) => {
  return cy.task('saveRecipient', ...params);
};

const getRecipientDocumentById = (...params: Parameters<IRecipientService['getRecipientById']>) => {
  return cy.task<Recipient.Document>('getRecipientById', ...params);
};

export const setRecipientTaskCommands = () => {

  Cypress.Commands.addAll({
    saveRecipientDocument,
    getRecipientDocumentById,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      saveRecipientDocument: CommandFunction<typeof saveRecipientDocument>;
      getRecipientDocumentById: CommandFunction<typeof getRecipientDocumentById>
    }
  }
}
