import { Category } from '@household/shared/types/types';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { getCategoryId } from '@household/shared/common/utils';
import { expectEmptyObject, expectRemainingProperties } from '@household/test/api/utils';

const validateCategoryDocument = (response: Category.CategoryId, request: Category.Request, ...ancestorDocuments: Category.Document[]) => {
  const id = response?.categoryId;

  cy.log('Get category document', id)
    .getCategoryDocumentById(id)
    .should((document) => {
      expect(getCategoryId(document), 'id').to.equal(id);
      const { categoryType, name, ancestors, ...internal } = document;

      expect(name, 'name').to.equal(request.name);
      expect(categoryType, 'categoryType').to.equal(request.categoryType);
      ancestorDocuments.forEach((a, index) => {
        expect(getCategoryId(ancestors[index]), `ancestors[${index}]`).to.equal(getCategoryId(a));
      });
      expectRemainingProperties(internal);
    });
};

const validateCategoryResponse = (nestedPath: string = '') => (response: Category.Response, document: Category.Document, ...ancestorDocuments: Category.Document[]) => {
  const { categoryId, name, categoryType, fullName, ancestors, ...empty } = response;
  expect(categoryId, `${nestedPath}categoryId`).to.equal(getCategoryId(document));
  expect(name, `${nestedPath}name`).to.equal(document.name);
  expect(categoryType, `${nestedPath}categoryType`).to.equal(document.categoryType);
  expect(fullName, 'fullName').to.equal([
    ...ancestorDocuments ?? [],
    document,
  ].map(c => c.name).join(':'));

  ancestorDocuments.forEach((a, index) => {
    const { categoryId, categoryType, name, ...empty } = ancestors[index];

    expect(name, `${nestedPath}ancestors[${index}].name`).to.equal(a.name);
    expect(categoryType, `${nestedPath}ancestors[${index}].categoryType`).to.equal(a.categoryType);
    expect(categoryId, `${nestedPath}ancestors[${index}].categoryId`).to.equal(getCategoryId(a));
    expectEmptyObject(empty, `${nestedPath}ancestors[${index}]`);
  });
  expectEmptyObject(empty, nestedPath);
};

const validateNestedCategoryResponse = (nestedPath: string, ...rest: Parameters<ReturnType<typeof validateCategoryResponse>>) => validateCategoryResponse(nestedPath)(...rest);

const validateCategoryListResponse = (responses: Category.Response[], documents: Category.Document[]) => {
  documents.forEach((document, index) => {
    const response = responses.find(r => r.categoryId === getCategoryId(document));
    cy.validateNestedCategoryResponse(`[${index}].`, response, document);
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
      const { name, categoryType, ancestors, ...internal } = currentDocument;

      expect(name, 'name').to.equal(originalDocument.name);
      expect(categoryType, 'categoryType').to.equal(originalDocument.categoryType);

      if (parentCategoryId) {
        const ancestorDocuments = [
          ...parentCategoryDocument.ancestors,
          parentCategoryDocument,
        ];

        ancestorDocuments.forEach((a, index) => {
          expect(getCategoryId(ancestors[index]), `ancestors[${index}]`).to.equal(getCategoryId(a));
        });
      } else {
        expect(ancestors, 'ancestors').to.deep.equal([]);
      }

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
    validateNestedCategoryResponse,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateCategoryDeleted: CommandFunction<typeof validateCategoryDeleted>;
      validateCategoryParentReassign: CommandFunction<typeof validateCategoryParentReassign>;
      validateNestedCategoryResponse: CommandFunction<typeof validateNestedCategoryResponse>;
    }

    interface ChainableResponseBody extends Chainable {
      validateCategoryDocument: CommandFunctionWithPreviousSubject<typeof validateCategoryDocument>;
      validateCategoryResponse: CommandFunctionWithPreviousSubject<ReturnType<typeof validateCategoryResponse>>;
      validateCategoryListResponse: CommandFunctionWithPreviousSubject<typeof validateCategoryListResponse>;
    }
  }
}
