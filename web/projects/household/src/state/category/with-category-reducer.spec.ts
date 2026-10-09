import { TestBed } from '@angular/core/testing';
import { Dispatcher } from '@ngrx/signals/events';
import { signalStore, withState } from '@ngrx/signals';
import { categoryApiEvents, categoryEvents } from '@household/state/category/category-events';
import { CategoryState } from '@household/state/category/category-store';
import { withCategoryReducer } from '@household/state/category/with-category-reducer';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { CATEGORY_FULL_NAME_SEPARATOR } from '@household/shared/constants';

const createTestStore = (state: CategoryState) => {
  return signalStore({
    providedIn: 'root',
  }, withState<CategoryState>(state), withCategoryReducer());
};

describe('withCategoryReducer', () => {
  let initialState: CategoryState;
  let store: InstanceType<ReturnType<typeof createTestStore>>;
  let dispatcher: Dispatcher;

  const validateState = (currentValue?: Partial<CategoryState>) => {
    expect(store.isInProgress(), 'isInProgress').toEqual(Object.hasOwn(currentValue ?? {}, 'isInProgress') ? currentValue.isInProgress : initialState.isInProgress);
    expect(store.categoryList(), 'categoryList').toEqual(Object.hasOwn(currentValue ?? {}, 'categoryList') ? currentValue.categoryList : initialState.categoryList);
    expect(store.pendingParentCategory(), 'pendingParentCategory').toEqual(Object.hasOwn(currentValue ?? {}, 'pendingParentCategory') ? currentValue.pendingParentCategory : initialState.pendingParentCategory);
  };

  const setup = (initial?: Partial<CategoryState>) => {
    TestBed.resetTestingModule();

    initialState = {
      isInProgress: [],
      categoryList: [],
      pendingParentCategory: undefined,
      ...initial,
    };

    store = TestBed.inject(createTestStore(initialState));
    dispatcher = TestBed.inject(Dispatcher);
  };

  beforeEach(() => {
    setup();
  });

  describe('createCategory', () => {
    it('should clear the pending parent category', () => {
      setup({
        pendingParentCategory: testDataFactory.category.response(),
      });

      dispatcher.dispatch(categoryEvents.createCategory());

      validateState({
        pendingParentCategory: undefined,
      });
    });
  });

  describe('updateCategory', () => {
    it('should clear the pending parent category', () => {
      setup({
        pendingParentCategory: testDataFactory.category.response(),
      });

      dispatcher.dispatch(categoryEvents.updateCategory(testDataFactory.category.response()));

      validateState({
        pendingParentCategory: undefined,
      });
    });
  });

  describe('selectCategory', () => {
    it('should clear the pending parent category', () => {
      setup({
        pendingParentCategory: testDataFactory.category.response(),
      });

      dispatcher.dispatch(categoryEvents.selectCategory({
        excludedCategory: testDataFactory.category.response(),
      }));

      validateState({
        pendingParentCategory: undefined,
      });
    });
  });

  describe('categorySelected', () => {
    it('should store the selected category as the pending parent category', () => {
      const categoryResponse = testDataFactory.category.response();

      dispatcher.dispatch(categoryEvents.categorySelected(categoryResponse));

      validateState({
        pendingParentCategory: categoryResponse,
      });
    });
  });

  describe('listCategoriesCompleted', () => {
    it('should store the categories with their search terms', () => {
      const name = 'ékezetes név';
      const categoryResponse = testDataFactory.category.response({
        name,
      });

      dispatcher.dispatch(categoryApiEvents.listCategoriesCompleted([categoryResponse]));

      validateState({
        categoryList: [
          {
            ...categoryResponse,
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
        ],
      });
    });
  });

  describe('createCategoryCompleted', () => {
    it('should add the category with its full name, ancestors and search terms', () => {
      const name = 'ékezetes név';
      const categoryId = testDataFactory.category.id();
      const parentCategory = testDataFactory.category.response();
      const categoryRequest = testDataFactory.category.request({
        name,
        parentCategoryId: parentCategory.categoryId,
      });

      setup({
        categoryList: [parentCategory],
      });

      dispatcher.dispatch(categoryApiEvents.createCategoryCompleted({
        categoryId,
        ...categoryRequest,
      }));

      validateState({
        categoryList: [
          parentCategory,
          {
            categoryId,
            categoryType: categoryRequest.categoryType,
            name: categoryRequest.name,
            parentCategory: {
              categoryId: parentCategory.categoryId,
              name: parentCategory.name,
              categoryType: parentCategory.categoryType,
              fullName: parentCategory.fullName,
            },
            fullName: `${parentCategory.fullName}${CATEGORY_FULL_NAME_SEPARATOR}${categoryRequest.name}`,
            ancestors: [
              ...parentCategory.ancestors,
              parentCategory,
            ],
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
        ],
      });
    });
  });

  describe('updateCategoryInitiated', () => {
    it('should mark the category and its descendants as in progress', () => {
      const categoryRequest = testDataFactory.category.request();
      const originalCategory = testDataFactory.category.response();
      const childCategory = testDataFactory.category.response({
        ancestors: [originalCategory],
      });

      setup({
        categoryList: [
          originalCategory,
          childCategory,
        ],
      });

      dispatcher.dispatch(categoryApiEvents.updateCategoryInitiated({
        categoryId: originalCategory.categoryId,
        ...categoryRequest,
      }));

      validateState({
        isInProgress: expect.arrayContaining([
          originalCategory.categoryId,
          childCategory.categoryId,
        ]),
      });
    });
  });

  describe('updateCategoryCompleted', () => {
    it('should replace the category, update its descendants and clear the in progress flags', () => {
      const originalCategory = testDataFactory.category.response();
      const parentCategory = testDataFactory.category.response({
        fullName: 'aaa',
        name: 'aaa',
      });
      const childCategory = testDataFactory.category.response({
        parentCategory: originalCategory,
        ancestors: [
          parentCategory,
          originalCategory,
        ],
      });
      setup({
        isInProgress: [
          originalCategory.categoryId,
          childCategory.categoryId,
        ],
        categoryList: [
          parentCategory,
          originalCategory,
          childCategory,
        ],
      });

      const name = 'ékezetes név';
      const categoryRequest = testDataFactory.category.request({
        name,
        parentCategoryId: parentCategory.categoryId,
      });

      dispatcher.dispatch(categoryApiEvents.updateCategoryCompleted({
        categoryId: originalCategory.categoryId,
        ...categoryRequest,
      }));

      validateState({
        isInProgress: [],
        categoryList: [
          parentCategory,
          {
            categoryId: originalCategory.categoryId,
            categoryType: categoryRequest.categoryType,
            name: categoryRequest.name,
            parentCategory: {
              categoryId: parentCategory.categoryId,
              name: parentCategory.name,
              categoryType: parentCategory.categoryType,
              fullName: parentCategory.fullName,
            },
            fullName: `${parentCategory.fullName}${CATEGORY_FULL_NAME_SEPARATOR}${categoryRequest.name}`,
            ancestors: [
              ...parentCategory.ancestors,
              {
                categoryId: parentCategory.categoryId,
                categoryType: parentCategory.categoryType,
                name: parentCategory.name,
              },
            ],
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
          {
            ...childCategory,
            fullName: `${parentCategory.fullName}${CATEGORY_FULL_NAME_SEPARATOR}${categoryRequest.name}${CATEGORY_FULL_NAME_SEPARATOR}${childCategory.name}`,
            ancestors: [
              {
                categoryId: parentCategory.categoryId,
                categoryType: parentCategory.categoryType,
                name: parentCategory.name,
              },
              {
                categoryId: originalCategory.categoryId,
                categoryType: categoryRequest.categoryType,
                name: categoryRequest.name,
              },
            ],
            parentCategory: {
              categoryId: originalCategory.categoryId,
              categoryType: categoryRequest.categoryType,
              name: categoryRequest.name,
              fullName: `${parentCategory.fullName}${CATEGORY_FULL_NAME_SEPARATOR}${categoryRequest.name}`,
            },
          },
        ],
      });
    });
  });

  describe('updateCategoryFailed', () => {
    it('should clear the in progress flags of the category and its descendants', () => {
      const originalCategory = testDataFactory.category.response();
      const childCategory = testDataFactory.category.response({
        ancestors: [originalCategory],
      });
      setup({
        isInProgress: [
          originalCategory.categoryId,
          childCategory.categoryId,
        ],
        categoryList: [
          originalCategory,
          childCategory,
        ],
      });

      dispatcher.dispatch(categoryApiEvents.updateCategoryFailed({
        categoryId: originalCategory.categoryId,
      }));

      validateState({
        isInProgress: [],
      });
    });
  });

  describe('deleteCategoryInitiated', () => {
    it('should mark the category and its descendants as in progress', () => {
      const originalCategory = testDataFactory.category.response();
      const childCategory = testDataFactory.category.response({
        ancestors: [originalCategory],
      });

      setup({
        categoryList: [
          originalCategory,
          childCategory,
        ],
      });

      dispatcher.dispatch(categoryApiEvents.deleteCategoryInitiated({
        categoryId: originalCategory.categoryId,
      }));

      validateState({
        isInProgress: expect.arrayContaining([
          originalCategory.categoryId,
          childCategory.categoryId,
        ]),
      });
    });
  });

  describe('deleteCategoryCompleted', () => {
    it('should remove the category, detach its descendants and clear the in progress flags', () => {
      const originalCategory = testDataFactory.category.response();
      const childCategory = testDataFactory.category.response({
        ancestors: [originalCategory],
      });
      setup({
        isInProgress: [
          originalCategory.categoryId,
          childCategory.categoryId,
        ],
        categoryList: [
          originalCategory,
          childCategory,
        ],
      });

      dispatcher.dispatch(categoryApiEvents.deleteCategoryCompleted({
        categoryId: originalCategory.categoryId,
      }));

      validateState({
        isInProgress: [],
        categoryList: [
          {
            ...childCategory,
            ancestors: [],
            parentCategory: undefined,
          },
        ],
      });
    });
  });

  describe('deleteCategoryFailed', () => {
    it('should clear the in progress flags of the category and its descendants', () => {
      const originalCategory = testDataFactory.category.response();
      const childCategory = testDataFactory.category.response({
        ancestors: [originalCategory],
      });
      setup({
        isInProgress: [
          originalCategory.categoryId,
          childCategory.categoryId,
        ],
        categoryList: [
          originalCategory,
          childCategory,
        ],
      });

      dispatcher.dispatch(categoryApiEvents.deleteCategoryFailed({
        categoryId: originalCategory.categoryId,
      }));

      validateState({
        isInProgress: [],
      });
    });
  });

  describe('mergeCategoriesInitiated', () => {
    it('should mark the source categories as in progress', () => {
      const targetCategory = testDataFactory.category.response();
      const sourceCategory = testDataFactory.category.response();

      setup({
        categoryList: [
          targetCategory,
          sourceCategory,
        ],
      });

      dispatcher.dispatch(categoryApiEvents.mergeCategoriesInitiated({
        sourceCategoryIds: [sourceCategory.categoryId],
        targetCategoryId: targetCategory.categoryId,
      }));

      validateState({
        isInProgress: [sourceCategory.categoryId],
      });
    });
  });

  describe('mergeCategoriesCompleted', () => {
    it('should remove the source categories and clear their in progress flags', () => {
      const sourceCategory = testDataFactory.category.response();
      setup({
        isInProgress: [sourceCategory.categoryId],
        categoryList: [sourceCategory],
      });

      dispatcher.dispatch(categoryApiEvents.mergeCategoriesCompleted({
        sourceCategoryIds: [sourceCategory.categoryId],
      }));

      validateState({
        isInProgress: [],
        categoryList: [],
      });
    });
  });

  describe('mergeCategoriesFailed', () => {
    it('should clear the in progress flags of the source categories', () => {
      const sourceCategory = testDataFactory.category.response();
      setup({
        isInProgress: [sourceCategory.categoryId],
        categoryList: [sourceCategory],
      });

      dispatcher.dispatch(categoryApiEvents.mergeCategoriesFailed({
        sourceCategoryIds: [sourceCategory.categoryId],
      }));

      validateState({
        isInProgress: [],
      });
    });
  });
});
