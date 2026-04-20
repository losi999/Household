import { getCategoryId } from '@household/shared/common/utils';
import { headerExpiresIn } from '@household/shared/constants';
import { Category } from '@household/shared/types/types';
import { test as baseTest } from '@household/test/fixtures/api.fixture';
import { expect as baseExpect, APIResponse } from '@playwright/test';
import { createComparer } from '@household/test/comparer3';

type CategoryApiFixture = {
  requestGetCategory(categoryId: Category.Id): Promise<APIResponse>;
  requestListCategories(): Promise<APIResponse>;
  requestCreateCategory(category: Category.Request): Promise<APIResponse>;
  requestUpdateCategory(categoryId: Category.Id, category: Category.Request): Promise<APIResponse>;
  requestDeleteCategory(categoryId: Category.Id): Promise<APIResponse>;
  requestMergeCategories(categoryId: Category.Id, sourceCategoryIds: Category.Id[]): Promise<APIResponse>;
};

export const test = baseTest.extend<CategoryApiFixture>({
  requestGetCategory: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestGetCategory = async (categoryId: Category.Id) => {
      return request.get(`${process.env.BASE_URL}/category/v1/categories/${categoryId}`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestGetCategory);
  },
  requestListCategories: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestListCategories = async () => {
      return request.get(`${process.env.BASE_URL}/category/v1/categories`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestListCategories);
  },
  requestCreateCategory: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestCreateCategory = async (category: Category.Request) => {
      return request.post(`${process.env.BASE_URL}/category/v1/categories`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: category,
      });
    };

    await use(requestCreateCategory);
  },
  requestUpdateCategory: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestUpdateCategory = async (categoryId: Category.Id, category: Category.Request) => {
      return request.put(`${process.env.BASE_URL}/category/v1/categories/${categoryId}`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: category,
      });
    };

    await use(requestUpdateCategory);
  },
  requestDeleteCategory: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestDeleteCategory = async (categoryId: Category.Id) => {
      return request.delete(`${process.env.BASE_URL}/category/v1/categories/${categoryId}`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestDeleteCategory);
  },
  requestMergeCategories: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestMergeCategories = async (categoryId: Category.Id, sourceCategoryIds: Category.Id[]) => {
      return request.post(`${process.env.BASE_URL}/category/v1/categories/${categoryId}/merge`, {
        headers: {
          Authorization: authToken,
        },
        data: sourceCategoryIds,
      });
    };

    await use(requestMergeCategories);
  },
});

const validateCategoryResponse = (response: Category.Response, document: Category.Document, ...ancestorDocuments: Category.Document[]) => {
  const expectedFullName = [
    ...ancestorDocuments,
    document,
  ].map(c => c.name).join(':');
  const parentCategoryDocument = ancestorDocuments.at(-1);
  const expectedParentFullName = parentCategoryDocument ? ancestorDocuments.map(a => a.name).join(':') : undefined;
  
  return createComparer(response, {
    categoryId: getCategoryId(document),
    name: document.name,
    categoryType: document.categoryType,
    fullName: expectedFullName,
    parentCategory: createComparer(response.parentCategory, {
      categoryId: getCategoryId(parentCategoryDocument),
      name: parentCategoryDocument?.name,
      categoryType: parentCategoryDocument?.categoryType,
      fullName: expectedParentFullName, 
    }),
    ancestors: response.ancestors.map((ancestor, index) => {
      return createComparer(ancestor, {
        categoryId: getCategoryId(ancestorDocuments[index]),
        name: ancestorDocuments[index].name,
        categoryType: ancestorDocuments[index].categoryType,
      });
    }),
  });
};

export const expect = baseExpect.extend({
  toHaveBeenDeletedFromDatabase(document: Category.Document) {
    return {
      pass: !document,
      message: () => `expected category to be deleted from database, but it was found with id ${getCategoryId(document)}`,
    };
  },
  toHaveBeenSavedAsCategoryDocument(req: Category.Request, document: Category.Document, ...ancestorDocuments: Category.Document[]) {
    if (!document) {
      return {
        pass: false,
        message: () => 'expected category to be stored in database, but it was not found',
      };
    }

    const comparer = createComparer(document, {
      name: req.name,
      categoryType: req.categoryType,
      ancestors: ancestorDocuments.map((ancestor) => {
        return getCategoryId(ancestor);
      }),
    }, '_id', 'createdAt', 'expiresAt', 'updatedAt');

    const errors = comparer.validate();

    return {
      pass: errors.length === 0,
      message: () => errors.join('\n'),
    };
  },
  async toMatchCategoryDocument(received: APIResponse, document: Category.Document, ...ancestorDocuments: Category.Document[]) {
    const response = await received.json() as Category.Response;

    const errors = validateCategoryResponse(response, document, ...ancestorDocuments).validate();

    return {
      pass: errors.length === 0,
      message: () => `Expected response to match category document, but it did not match:\n${errors.join('\n')}`,
    };
  },
  async toMatchCategoryDocumentInList(received: APIResponse, document: Category.Document, ...ancestorDocuments: Category.Document[]) {
    const response = await received.json() as Category.Response[];

    const matchingResponse = response.find(r => r.categoryId === getCategoryId(document));

    if (!matchingResponse) {
      return {
        pass: false,
        message: () => `expected response to contain a category with id ${getCategoryId(document)}, but it was not found`,
      };
    }

    const errors = validateCategoryResponse(matchingResponse, document, ...ancestorDocuments).validate();

    return {
      pass: errors.length === 0,
      message: () => `Expected response to match category document, but it did not match:\n${errors.join('\n')}`,
    };
  },
  toHaveItsParentReassigned(originalDocument: Category.Document, currentDocument: Category.Document, parentCategoryDocument?: Category.Document) {

    const expectedAncestors = parentCategoryDocument ? [
      ...parentCategoryDocument.ancestors,
      parentCategoryDocument,
    ] : []; 

    const comparer = createComparer(currentDocument, {
      name: originalDocument.name,
      categoryType: originalDocument.categoryType,
      ancestors: expectedAncestors.map((ancestor) => {
        return getCategoryId(ancestor);
      }),
    }, '_id', 'createdAt', 'expiresAt', 'updatedAt');

    const errors = comparer.validate();

    return {
      pass: errors.length === 0,
      message: () => errors.join('\n'),
    };
  },
});
