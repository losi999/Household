import { Category } from '@household/shared/types/types';
import { CommandFunction } from '@household/test/api/types';
import { ICategoryService } from '@household/shared/services/category-service';

const saveCategoryDocument = (...params: Parameters<ICategoryService['saveCategory']>) => {
  return cy.task<Category.Document>('saveCategory', ...params);
};

const saveCategoryDocuments = (...params: Parameters<ICategoryService['saveCategories']>) => {
  return cy.task<Category.Document>('saveCategories', ...params);
};

const getCategoryDocumentById = (...params: Parameters<ICategoryService['getCategoryById']>) => {
  return cy.task<Category.Document>('getCategoryById', ...params);
};

export const setCategoryTaskCommands = () => {
  Cypress.Commands.addAll({
    saveCategoryDocument,
    saveCategoryDocuments,
    getCategoryDocumentById,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      saveCategoryDocument: CommandFunction<typeof saveCategoryDocument>;
      saveCategoryDocuments: CommandFunction<typeof saveCategoryDocuments>;
      getCategoryDocumentById: CommandFunction<typeof getCategoryDocumentById>;
    }
  }
}
