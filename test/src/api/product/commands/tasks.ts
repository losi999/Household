import { Product } from '@household/shared/types/types';
import { CommandFunction } from '@household/test/api/types';
import { IProductService } from '@household/shared/services/product-service';

const saveProductDocument = (...params: Parameters<IProductService['saveProduct']>) => {
  return cy.task<Product.Document>('saveProduct', ...params);
};

const getProductDocumentById = (...params: Parameters<IProductService['getProductById']>) => {
  return cy.task<Product.Document>('getProductById', ...params);
};

export const setProductTaskCommands = () => {

  Cypress.Commands.addAll({
    saveProductDocument,
    getProductDocumentById,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      saveProductDocument: CommandFunction<typeof saveProductDocument>;
      getProductDocumentById: CommandFunction<typeof getProductDocumentById>;
    }
  }
}
