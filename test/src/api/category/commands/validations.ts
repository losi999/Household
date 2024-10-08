import { Category, Product } from '@household/shared/types/types';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { getCategoryId, getProductId } from '@household/shared/common/utils';
import { expectEmptyObject, expectRemainingProperties } from '@household/test/api/utils';

const validateCategoryDocument = (response: Category.CategoryId, request: Category.Request, parent?: Category.Document, productDocument?: Product.Document) => {
  const id = response?.categoryId;

  cy.log('Get category document', id)
    .getCategoryDocumentById(id)
    .should((document) => {
      expect(getCategoryId(document), 'id').to.equal(id);
      const { categoryType, fullName, name, parentCategory, products, ...internal } = document;

      expect(name, 'name').to.equal(request.name);
      expect(categoryType, 'categoryType').to.equal(request.categoryType);
      expect(fullName, 'fullName').to.equal(request.parentCategoryId ? `${parent.fullName}:${request.name}` : request.name);
      expect(getCategoryId(parentCategory), 'parentCategory.categoryId').to.equal(request.parentCategoryId);
      if (productDocument) {
        expect(products.map(p => getProductId(p)), 'products array').to.contain(getProductId(productDocument));
      }
      expectRemainingProperties(internal);
    });
};

const validateCategoryResponse = (nestedPath: string = '') => (response: Category.Response, document: Category.Document, parent?: Category.Document, productDocument?: Product.Document) => {
  const { categoryId, name, categoryType, fullName, parentCategory, products, ...empty } = response;
  expect(categoryId, `${nestedPath}categoryId`).to.equal(getCategoryId(document));
  expect(name, `${nestedPath}name`).to.equal(document.name);
  expect(categoryType, `${nestedPath}categoryType`).to.equal(document.categoryType);
  expect(fullName, `${nestedPath}fullName`).to.equal(document.fullName);
  if (parent) {
    const { name, fullName, categoryType, categoryId, ...empty } = parentCategory;

    expect(name, `${nestedPath}parentCategory.name`).to.equal(parent?.name);
    expect(fullName, `${nestedPath}parentCategory.fullName`).to.equal(parent?.fullName);
    expect(categoryType, `${nestedPath}parentCategory.categoryType`).to.equal(parent?.categoryType);
    expect(categoryId, `${nestedPath}parentCategory.categoryId`).to.equal(getCategoryId(parent));
    expectEmptyObject(empty, `${nestedPath}parentCategory`);
  } else {
    expect(parentCategory, `${nestedPath}parentCategory`).to.be.undefined;
  }
  if (productDocument) {
    expect(products.length, `${nestedPath}products count`).to.equal(1);
    const { productId, brand, fullName, measurement, unitOfMeasurement, ...empty } = products[0];

    expect(productId, `${nestedPath}products[0].productId`).to.equal(getProductId(productDocument));
    expect(brand, `${nestedPath}products[0].brand`).to.equal(productDocument.brand);
    expect(fullName, `${nestedPath}products[0].fullName`).to.equal(productDocument.fullName);
    expect(measurement, `${nestedPath}products[0].measurement`).to.equal(productDocument.measurement);
    expect(unitOfMeasurement, `${nestedPath}products[0].unitOfMeasurement`).to.equal(productDocument.unitOfMeasurement);
    expectEmptyObject(empty, `${nestedPath}products`);
  } else {
    expect(products, `${nestedPath}products`).to.be.undefined;
  }
  expectEmptyObject(empty, nestedPath);
};

const validateNestedCategoryResponse = (nestedPath: string, ...rest: Parameters<ReturnType<typeof validateCategoryResponse>>) => validateCategoryResponse(nestedPath)(...rest);

const validateCategoryListResponse = (responses: Category.Response[], documents: Category.Document[], products?: Product.Document[]) => {
  documents.forEach((document, index) => {
    const response = responses.find(r => r.categoryId === getCategoryId(document));
    cy.validateNestedCategoryResponse(`[${index}].`, response, document, undefined, products?.[index]);
  });
};

const validateCategoryDeleted = (categoryId: Category.Id) => {
  cy.log('Get category document', categoryId)
    .getCategoryDocumentById(categoryId)
    .should((document) => {
      expect(document, 'document').to.be.null;
    });
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
      expect(getCategoryId(currentDocument), 'id').to.equal(getCategoryId(originalDocument));
      const { name, categoryType, products, fullName, parentCategory, ...internal } = currentDocument;

      expect(name, 'name').to.equal(originalDocument.name);
      expect(categoryType, 'categoryType').to.equal(originalDocument.categoryType);
      expect(products).to.equal(originalDocument.products);

      if (parentCategoryDocument) {
        expect(fullName, 'fullName').to.equal(`${parentCategoryDocument.fullName}:${currentDocument.name}`);
        expect(getCategoryId(parentCategory), 'parentCategory').to.equal(getCategoryId(parentCategoryDocument));
      } else {
        expect(fullName, 'fullName').to.equal(currentDocument.name);
        expect(!!parentCategory, 'parentCategory').to.be.false;
      }
      expectRemainingProperties(internal);
    });
};

const validateProductRemoval = (originalDocument: Category.Document, removedProductIds: Product.Id[]) => {
  const categoryId = getCategoryId(originalDocument);

  cy.log('Get category document', categoryId)
    .getCategoryDocumentById(categoryId)
    .should((document) => {
      expect(getCategoryId(document), 'id').to.equal(getCategoryId(originalDocument));
      const { categoryType, fullName, name, parentCategory, products, ...internal } = document;

      expect(name, 'name').to.equal(originalDocument.name);
      expect(categoryType, 'categoryType').to.equal(originalDocument.categoryType);
      expect(fullName, 'fullName').to.equal(originalDocument.fullName);
      expect(getCategoryId(parentCategory), 'parentCategory.categoryId').to.equal(getCategoryId(originalDocument.parentCategory));

      removedProductIds.forEach(productId => {
        expect(products, 'products').to.not.contain(productId);
      });
      expectRemainingProperties(internal);
    });
};

export const setCategoryValidationCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    validateCategoryDocument,
    validateCategoryResponse: validateCategoryResponse(),
    validateCategoryListResponse,
  });

  Cypress.Commands.addAll({
    validateCategoryDeleted,
    validateCategoryParentReassign,
    validateProductRemoval,
    validateNestedCategoryResponse,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateCategoryDeleted: CommandFunction<typeof validateCategoryDeleted>;
      validateCategoryParentReassign: CommandFunction<typeof validateCategoryParentReassign>;
      validateProductRemoval: CommandFunction<typeof validateProductRemoval>;
      validateNestedCategoryResponse: CommandFunction<typeof validateNestedCategoryResponse>;
    }

    interface ChainableResponseBody extends Chainable {
      validateCategoryDocument: CommandFunctionWithPreviousSubject<typeof validateCategoryDocument>;
      validateCategoryResponse: CommandFunctionWithPreviousSubject<ReturnType<typeof validateCategoryResponse>>;
      validateCategoryListResponse: CommandFunctionWithPreviousSubject<typeof validateCategoryListResponse>;
    }
  }
}
