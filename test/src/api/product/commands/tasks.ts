import { Product } from '@household/shared/types/types';
import { CommandFunction } from '@household/test/api/types';
import { IProductService } from '@household/shared/services/product-service';

const saveProductDocument = (...params: Parameters<IProductService['saveProduct']>) => {
  return cy.task<Product.Document>('saveProduct', params);
};

const saveProductDocuments = (...params: Parameters<IProductService['saveProducts']>) => {
  return cy.task<Product.Document>('saveProducts', params);
};

const findProductDocumentById = (...params: Parameters<IProductService['findProductById']>) => {
  return cy.task<Product.Document>('findProductById', params);
};

export const setProductTaskCommands = () => {

  Cypress.Commands.addAll({
    saveProductDocument,
    saveProductDocuments,
    findProductDocumentById,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      saveProductDocument: CommandFunction<typeof saveProductDocument>;
      saveProductDocuments: CommandFunction<typeof saveProductDocuments>;
      findProductDocumentById: CommandFunction<typeof findProductDocumentById>;
    }
  }
}
