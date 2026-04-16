import { getCategoryId } from '@household/shared/common/utils';
import { headerExpiresIn } from '@household/shared/constants';
import { Category } from '@household/shared/types/types';
import { createComparer } from '@household/test/utils';
import { test as baseTest } from '@household/test/fixtures/api.fixture';
import { expect as baseExpect, APIResponse } from '@playwright/test';

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

  const comparer = createComparer((compare) => {
    const parentCategoryDocument = ancestorDocuments.at(-1);
    const expectedParentFullName = parentCategoryDocument ? ancestorDocuments.map(a => a.name).join(':') : undefined;

    return {
      categoryId: compare(response.categoryId, getCategoryId(document)),
      name: compare(response.name, document.name),
      categoryType: compare(response.categoryType, document.categoryType),
      fullName: compare(response.fullName, expectedFullName),
      ...response.ancestors.reduce((accumulator, currentValue, index) => {
        return {
          ...accumulator,
          [`ancestors[${index}].categoryType`]: compare(currentValue.categoryType, ancestorDocuments[index]?.categoryType),
          [`ancestors[${index}].name`]: compare(currentValue.name, ancestorDocuments[index]?.name),
          [`ancestors[${index}].categoryId`]: compare(currentValue.categoryId, getCategoryId(ancestorDocuments[index])),
        };
      }, {}),
      'parentCategory.categoryId': compare(response.parentCategory?.categoryId, getCategoryId(parentCategoryDocument)),
      'parentCategory.name': compare(response.parentCategory?.name, parentCategoryDocument?.name),
      'parentCategory.categoryType': compare(response.parentCategory?.categoryType, parentCategoryDocument?.categoryType),
      'parentCategory.fullName': compare(response.parentCategory?.fullName, expectedParentFullName),
    };
  });

  const extraKeys = comparer.extraKeys(response, [
    'ancestors',
    'parentCategory',
  ]);

  if (extraKeys.length > 0) {
    return `expected response to have no additional properties, but got extra properties: ${extraKeys.join(', ')}`;
  }

  const notMatchingProperties = comparer.notMatchingProperties();

  if (notMatchingProperties.length > 0) {
    return `expected response to match category document, but the following properties did not match: ${notMatchingProperties.join(', ')}`;
  }
};

export const expect = baseExpect.extend({
  toHaveBeenDeletedFromDatabase(document: Category.Document) {
    return {
      pass: !document,
      message: () => `expected category to be deleted from database, but it was found with id ${getCategoryId(document)}`,
    };
  },
  async toBeStoredInDatabase(req: Category.Request, document: Category.Document, ...ancestorDocuments: Category.Document[]) {
    if (!document) {
      return {
        pass: false,
        message: () => 'expected category to be stored in database, but it was not found',
      };
    }

    const comparer = createComparer((compare) => {
      return {
        name: compare(document.name, req.name),
        categoryType: compare(document.categoryType, req.categoryType),
        ...document.ancestors.reduce((accumulator, currentValue, index) => {
          return {
            ...accumulator
            , [`ancestors[${index}]`]: compare(getCategoryId(currentValue), getCategoryId(ancestorDocuments[index])),
          };
        }, {}),
      };
    });

    const extraKeys = comparer.extraKeys(document, [
      '_id',
      'createdAt',
      'expiresAt',
      'updatedAt',
      'ancestors',
    ]);

    if (extraKeys.length > 0) {
      return {
        pass: false,
        message: () => `expected category in database to have no additional properties, but got extra properties: ${extraKeys.join(', ')}`,
      };
    }

    const notMatchingProperties = comparer.notMatchingProperties();

    if (notMatchingProperties.length > 0) {
      return {
        pass: false,
        message: () => `expected category in database to match request, but the following properties did not match: ${notMatchingProperties.join(', ')}`,
      };
    }

    return {
      pass: true,
      message: () => '',
    };
  },
  async toMatchCategoryDocument(received: APIResponse, document: Category.Document, ...ancestorDocuments: Category.Document[]) {
    const response = await received.json() as Category.Response;

    const message = validateCategoryResponse(response, document, ...ancestorDocuments);

    return {
      pass: !message,
      message: () => message,
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

    const message = validateCategoryResponse(matchingResponse, document, ...ancestorDocuments);

    return {
      pass: !message,
      message: () => message,
    };
  },
  toHaveItsParentReassigned(originalDocument: Category.Document, currentDocument: Category.Document, parentCategoryDocument?: Category.Document) {

    const expectedAncestors = parentCategoryDocument ? [
      ...parentCategoryDocument.ancestors,
      parentCategoryDocument,
    ] : []; 

    const comparer = createComparer((compare) => {
      return {
        name: compare(currentDocument.name, originalDocument.name),
        categoryType: compare(currentDocument.categoryType, originalDocument.categoryType),
        ...currentDocument.ancestors.reduce((accumulator, currentValue, index) => {
          return {
            ...accumulator,
            [`ancestors[${index}]`]: compare(getCategoryId(currentValue), getCategoryId(expectedAncestors[index])),
          };
        }, {}),
      };
    });

    const extraKeys = comparer.extraKeys(currentDocument, [
      '_id',
      'createdAt',
      'expiresAt',
      'updatedAt',
      'ancestors',
    ]);

    if (extraKeys.length > 0) {
      return {
        pass: false,
        message: () => `expected category in database to have no additional properties, but got extra properties: ${extraKeys.join(', ')}`,
      };
    }

    const notMatchingProperties = comparer.notMatchingProperties();

    if (notMatchingProperties.length > 0) {
      return {
        pass: false,
        message: () => `expected category in database to match request, but the following properties did not match: ${notMatchingProperties.join(', ')}`,
      };
    }

    return {
      pass: true,
      message: () => '',
    };
  },
});
