import { getCategoryId } from '@household/shared/common/utils';
import { headerExpiresIn } from '@household/shared/constants';
import { Api } from '@household/shared/types/api';
import { Documents } from '@household/shared/types/documents';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { test as baseTest } from '@household/test/fixtures/api.fixture';
import { expect as baseExpect, APIResponse } from '@playwright/test';
import { Comparer } from '@household/test/comparer';

type CategoryApiFixture = {
  requestGetCategory(categoryId: Api.Category.Id): Promise<APIResponse>;
  requestListCategories(): Promise<APIResponse>;
  requestCreateCategory(category: Requests.Category): Promise<APIResponse>;
  requestUpdateCategory(categoryId: Api.Category.Id, category: Requests.Category): Promise<APIResponse>;
  requestDeleteCategory(categoryId: Api.Category.Id): Promise<APIResponse>;
  requestMergeCategories(categoryId: Api.Category.Id, sourceCategoryIds: Api.Category.Id[]): Promise<APIResponse>;
};

export const test = baseTest.extend<CategoryApiFixture>({
  requestGetCategory: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestGetCategory = async (categoryId: Api.Category.Id) => {
      return loggedRequest.get(`${process.env.BASE_URL}/category/v1/categories/${categoryId}`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestGetCategory);
  },
  requestListCategories: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestListCategories = async () => {
      return loggedRequest.get(`${process.env.BASE_URL}/category/v1/categories`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestListCategories);
  },
  requestCreateCategory: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestCreateCategory = async (category: Requests.Category) => {
      return loggedRequest.post(`${process.env.BASE_URL}/category/v1/categories`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: category,
      });
    };

    await use(requestCreateCategory);
  },
  requestUpdateCategory: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestUpdateCategory = async (categoryId: Api.Category.Id, category: Requests.Category) => {
      return loggedRequest.put(`${process.env.BASE_URL}/category/v1/categories/${categoryId}`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: category,
      });
    };

    await use(requestUpdateCategory);
  },
  requestDeleteCategory: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestDeleteCategory = async (categoryId: Api.Category.Id) => {
      return loggedRequest.delete(`${process.env.BASE_URL}/category/v1/categories/${categoryId}`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestDeleteCategory);
  },
  requestMergeCategories: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestMergeCategories = async (categoryId: Api.Category.Id, sourceCategoryIds: Api.Category.Id[]) => {
      return loggedRequest.post(`${process.env.BASE_URL}/category/v1/categories/${categoryId}/merge`, {
        headers: {
          Authorization: authToken,
        },
        data: sourceCategoryIds,
      });
    };

    await use(requestMergeCategories);
  },
});

export const validateCategoryResponse = (response: Responses.Category, document: Documents.Category, ...ancestorDocuments: Documents.Category[]) => {
  const expectedFullName = [
    ...ancestorDocuments,
    document,
  ].filter(c => !!c).map(c => c.name)
    .join(':');
  const parentCategoryDocument = ancestorDocuments.at(-1);
  const expectedParentFullName = parentCategoryDocument ? ancestorDocuments.map(a => a.name).join(':') : undefined;
  
  return new Comparer(response, {
    categoryId: getCategoryId(document),
    name: document?.name,
    categoryType: document?.categoryType,
    fullName: expectedFullName,
    parentCategory: new Comparer(response?.parentCategory, {
      categoryId: getCategoryId(parentCategoryDocument),
      name: parentCategoryDocument?.name,
      categoryType: parentCategoryDocument?.categoryType,
      fullName: expectedParentFullName, 
    }),
    ancestors: response?.ancestors.map((ancestor, index) => {
      return new Comparer(ancestor, {
        categoryId: getCategoryId(ancestorDocuments[index]),
        name: ancestorDocuments[index]?.name,
        categoryType: ancestorDocuments[index]?.categoryType,
      });
    }),
  });
};

export const expect = baseExpect.extend({
  toHaveBeenDeletedFromDatabase(document: Documents.Category) {
    return {
      pass: !document,
      message: () => `Expected category to be deleted from database, but it was found with id ${getCategoryId(document)}`,
    };
  },
  toHaveBeenSavedAsCategoryDocument(req: Requests.Category, document: Documents.Category, ...ancestorDocuments: Documents.Category[]) {
    if (!document) {
      return {
        pass: false,
        message: () => 'Expected category to be stored in database, but it was not found',
      };
    }

    const comparer = new Comparer(document, {
      name: req.name,
      categoryType: req.categoryType,
      ancestors: ancestorDocuments.map((ancestor) => {
        return getCategoryId(ancestor);
      }),
    }, '_id', 'createdAt', 'expiresAt', 'updatedAt');

    const errors = comparer.validate();

    return {
      pass: errors.length === 0,
      message: () => `Expected category to be stored in database, but it was not:\n${errors.join('\n')}`,
    };
  },
  async toMatchCategoryDocument(received: APIResponse, document: Documents.Category, ...ancestorDocuments: Documents.Category[]) {
    const response = await received.json() as Responses.Category;

    const errors = validateCategoryResponse(response, document, ...ancestorDocuments).validate();

    return {
      pass: errors.length === 0,
      message: () => `Expected response to match category document, but it did not:\n${errors.join('\n')}`,
    };
  },
  async toContainMatchingCategoryDocument(received: APIResponse, document: Documents.Category, ...ancestorDocuments: Documents.Category[]) {
    const response = await received.json() as Responses.Category[];

    const matchingResponse = response.find(r => r.categoryId === getCategoryId(document));

    if (!matchingResponse) {
      return {
        pass: false,
        message: () => `Expected response to contain a category with id ${getCategoryId(document)}, but it was not found`,
      };
    }

    const errors = validateCategoryResponse(matchingResponse, document, ...ancestorDocuments).validate();

    return {
      pass: errors.length === 0,
      message: () => `Expected response to match category document, but it did not:\n${errors.join('\n')}`,
    };
  },
  toHaveItsParentReassigned(originalDocument: Documents.Category, currentDocument: Documents.Category, parentCategoryDocument?: Documents.Category) {

    const expectedAncestors = parentCategoryDocument ? [
      ...parentCategoryDocument.ancestors,
      parentCategoryDocument,
    ] : []; 

    const comparer = new Comparer(currentDocument, {
      name: originalDocument.name,
      categoryType: originalDocument.categoryType,
      ancestors: expectedAncestors.map((ancestor) => {
        return getCategoryId(ancestor);
      }),
    }, '_id', 'createdAt', 'expiresAt', 'updatedAt');

    const errors = comparer.validate();

    return {
      pass: errors.length === 0,
      message: () => `Expected category to have its parent reassigned, but it was not:\n${errors.join('\n')}`,
    };
  },
});
