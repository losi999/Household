import { Customer } from '@household/shared/types/types';
import { CommandFunction } from '@household/test/api/types';
import { ICustomerService } from '@household/shared/services/customer-service';

const saveCustomerDocument = (...params: Parameters<ICustomerService['saveCustomer']>) => {
  return cy.task('saveCustomer', params);
};

const saveCustomerDocuments = (...params: Parameters<ICustomerService['saveCustomers']>) => {
  return cy.task('saveCustomers', params);
};

const findCustomerDocumentById = (...params: Parameters<ICustomerService['findCustomerById']>) => {
  return cy.task<Customer.Document>('findCustomerById', params);
};

export const setCustomerTaskCommands = () => {

  Cypress.Commands.addAll({
    saveCustomerDocument,
    saveCustomerDocuments,
    findCustomerDocumentById,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      saveCustomerDocument: CommandFunction<typeof saveCustomerDocument>;
      saveCustomerDocuments: CommandFunction<typeof saveCustomerDocuments>;
      findCustomerDocumentById: CommandFunction<typeof findCustomerDocumentById>
    }
  }
}
