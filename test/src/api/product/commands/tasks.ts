import { Product } from '@household/shared/types/types';
import { CommandFunction } from '@household/test/api/types';
import { IProductService } from '@household/shared/services/product-service';

const saveProductDocument = (...params: Parameters<IProductService['saveProduct']>) => {
  return cy.task<Product.Document>('saveProduct', ...params);
};

const saveProductDocuments = (...params: Parameters<IProductService['saveProducts']>) => {
  return cy.task<Product.Document>('saveProducts', ...params);
};

const getProductDocumentById = (...params: Parameters<IProductService['getProductById']>) => {
  return cy.task<Product.Document>('getProductById', ...params);
};

export const setProductTaskCommands = () => {

  Cypress.Commands.addAll({
    saveProductDocument,
    saveProductDocuments,
    getProductDocumentById,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      saveProductDocument: CommandFunction<typeof saveProductDocument>;
      saveProductDocuments: CommandFunction<typeof saveProductDocuments>;
      getProductDocumentById: CommandFunction<typeof getProductDocumentById>;
    }
  }
}
