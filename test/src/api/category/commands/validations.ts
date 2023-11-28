import { Category, Product } from '@household/shared/types/types';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { getCategoryId, getProductId } from '@household/shared/common/utils';

type RelatedDocumentOperation = 'parentReassign' | 'productRemoval';

const validateCategoryDocument = (response: Category.CategoryId, request: Category.Request, parentCategory?: Category.Document, productDocument?: Product.Document) => {
  const id = response?.categoryId;

  cy.log('Get category document', id)
    .getCategoryDocumentById(id)
    .should((document) => {
      expect(getCategoryId(document), 'id').to.equal(id);
      expect(document.name, 'name').to.equal(request.name);
      expect(document.categoryType, 'categoryType').to.equal(request.categoryType);
      expect(document.fullName, 'fullName').to.equal(request.parentCategoryId ? `${parentCategory.fullName}:${request.name}` : request.name);
      expect(getCategoryId(document.parentCategory), 'parentCategory.categoryId').to.equal(request.parentCategoryId);
      if (productDocument) {
        expect(document.products.map(p => getProductId(p)), 'products array').to.contain(getProductId(productDocument));
      }
    });
};

const validateCategoryResponse = (response: Category.Response, document: Category.Document, parentCategory?: Category.Document, productDocument?: Product.Document) => {
  expect(response.categoryId, 'categoryId').to.equal(getCategoryId(document));
  expect(response.name, 'name').to.equal(document.name);
  expect(response.categoryType, 'categoryType').to.equal(document.categoryType);
  expect(response.fullName, 'fullName').to.equal(document.fullName);
  expect(response.parentCategory?.name, 'parentCategory.name').to.equal(parentCategory?.name);
  expect(response.parentCategory?.fullName, 'parentCategory.fullName').to.equal(parentCategory?.fullName);
  expect(response.parentCategory?.categoryType, 'parentCategory.categoryType').to.equal(parentCategory?.categoryType);
  expect(response.parentCategory?.categoryId, 'parentCategory.categoryId').to.equal(getCategoryId(parentCategory));
  if (productDocument) {
    expect(response.products.length, 'products count').to.equal(1);
    expect(response.products[0].productId, 'products[0].productId').to.equal(getProductId(productDocument));
    expect(response.products[0].brand, 'products[0].brand').to.equal(productDocument.brand);
    expect(response.products[0].fullName, 'products[0].fullName').to.equal(productDocument.fullName);
    expect(response.products[0].measurement, 'products[0].measurement').to.equal(productDocument.measurement);
    expect(response.products[0].unitOfMeasurement, 'products[0].unitOfMeasurement').to.equal(productDocument.unitOfMeasurement);
  }
};

const validateCategoryListResponse = (responses: Category.Response[], documents: Category.Document[], products?: Product.Document[]) => {
  documents.forEach((document, index) => {
    const response = responses.find(r => r.categoryId === getCategoryId(document));
    validateCategoryResponse(response, document, undefined, products?.[index]);
  });
};

const validateCategoryDeleted = (categoryId: Category.Id) => {
  cy.log('Get category document', categoryId)
    .getCategoryDocumentById(categoryId)
    .should((document) => {
      expect(document, 'document').to.be.null;
    });
};

const compareCategoryDocuments = (original: Category.Document, updated: Category.Document, operation: RelatedDocumentOperation) => {
  expect(getCategoryId(original), 'id').to.equal(getCategoryId(updated));
  expect(updated.name, 'name').to.equal(original.name);
  expect(updated.categoryType, 'categoryType').to.equal(original.categoryType);

  if (operation !== 'parentReassign') {
    expect(updated.fullName, 'fullName').to.equal(original.fullName);
    expect(getCategoryId(updated.parentCategory), 'parentCategory.categoryId').to.equal(getCategoryId(original.parentCategory));
  }

  if (operation !== 'productRemoval') {
    expect(updated.products).to.equal(original.products);
  }
};

const validateCategoryParentReassign = (originalDocument: Category.Document, parentCategoryId?: Category.Id) => {
  const categoryId = getCategoryId(originalDocument);
  let parentCategoryDocument: Category.Document;

  cy.log('Get parent category document', parentCategoryId)
    .getCategoryDocumentById(parentCategoryId)
    .should((document) => {
      parentCategoryDocument = document;
    })
    .log('Get category document', categoryId)
    .getCategoryDocumentById(categoryId)
    .should((currentDocument) => {
      compareCategoryDocuments(originalDocument, currentDocument, 'parentReassign');
      if (parentCategoryDocument) {
        expect(currentDocument.fullName, 'fullName').to.equal(`${parentCategoryDocument.fullName}:${currentDocument.name}`);
        expect(getCategoryId(currentDocument.parentCategory), 'parentCategory').to.equal(getCategoryId(parentCategoryDocument));
      } else {
        expect(currentDocument.fullName, 'fullName').to.equal(currentDocument.name);
        expect(!!currentDocument.parentCategory, 'parentCategory').to.be.false;
      }
    });
};

const validateProductRemoval = (originalDocument: Category.Document, removedProductIds: Product.Id[]) => {
  const categoryId = getCategoryId(originalDocument);

  cy.log('Get category document', categoryId)
    .getCategoryDocumentById(categoryId)
    .should((document) => {
      compareCategoryDocuments(originalDocument, document, 'productRemoval');
      removedProductIds.forEach(productId => {
        expect(document.products, 'products').to.not.contain(productId);
      });
    });
};

export const setCategoryValidationCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    validateCategoryDocument,
    validateCategoryResponse,
    validateCategoryListResponse,
  });

  Cypress.Commands.addAll({
    validateCategoryDeleted,
    validateCategoryParentReassign,
    validateProductRemoval,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateCategoryDeleted: CommandFunction<typeof validateCategoryDeleted>;
      validateCategoryParentReassign: CommandFunction<typeof validateCategoryParentReassign>;
      validateProductRemoval: CommandFunction<typeof validateProductRemoval>;
    }

    interface ChainableResponseBody extends Chainable {
      validateCategoryDocument: CommandFunctionWithPreviousSubject<typeof validateCategoryDocument>;
      validateCategoryResponse: CommandFunctionWithPreviousSubject<typeof validateCategoryResponse>;
      validateCategoryListResponse: CommandFunctionWithPreviousSubject<typeof validateCategoryListResponse>;
    }
  }
}
