import { TestBed } from '@angular/core/testing';
import { CategoryService } from '@household/services/category-service';
import { CategoryState, CategoryStore, provideCategoryStoreInitialState } from '@household/state/category/category-store';
import { BottomSheetService, createDispatcherSpy, DialogService, notificationEvents, validateDispatcher } from '@household/shared-ui';
import { Dispatcher } from '@ngrx/signals/events';
import { Mock } from 'vitest';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { categoryApiEvents, categoryEvents } from '@household/state/category/category-events';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { of, throwError } from 'rxjs';
import { CategoryDialog } from '@household/app/category/category-dialog/category-dialog';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { CategoryMergeDialog } from '@household/app/category/category-merge-dialog/category-merge-dialog';
import { CategorySelectDialog } from '@household/app/category/category-select-dialog/category-select-dialog';

describe('Category store', () => {
  let initialState: CategoryState; 
  let store: InstanceType<typeof CategoryStore>;
  let dispatcher: Dispatcher;
  let dispatchSpy: Mock;
  let mockCategoryService: MockService<CategoryService>;
  let mockDialogService: MockService<DialogService>;
  let mockMatDialog: MockService<MatDialog>;
  let mockBottomSheetService: MockService<BottomSheetService>;

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

    TestBed.configureTestingModule({
      providers: [
        {
          provide: CategoryService,
          useValue: mockCategoryService.service,
        },
        {
          provide: MatDialog,
          useValue: mockMatDialog.service,
        },
        {
          provide: DialogService,
          useValue: mockDialogService.service,
        },
        {
          provide: BottomSheetService,
          useValue: mockBottomSheetService.service,
        },
        provideCategoryStoreInitialState(initialState),
      ],
    });

    store = TestBed.inject(CategoryStore);
    dispatcher = TestBed.inject(Dispatcher);
    dispatchSpy = createDispatcherSpy(dispatcher);
  };

  beforeEach(() => {
    mockCategoryService = createMockService('listCategories', 'createCategory', 'updateCategory', 'deleteCategory', 'mergeCategories');
    mockDialogService = createMockService('openConfirmationDialog');
    mockBottomSheetService = createMockService('openBottomSubmenu');  
    mockMatDialog = createMockService('open');

    setup();
  });

  it('should initialize', () => {
    validateState();
  });

  describe('dispatching createCategory', () => {
    beforeEach(() => {
      setup({
        pendingParentCategory: testDataFactory.category.response(),
      });
    });

    it('should open dialog and dispatch if submitted', () => {
      const categoryRequest = testDataFactory.category.request();
      
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(categoryRequest),
      } as MatDialogRef<any>);

      dispatcher.dispatch(categoryEvents.createCategory()); 

      validateFunctionCall(mockMatDialog.functions.open, CategoryDialog, {
        disableClose: true,
      });
      validateDispatcher(dispatchSpy, categoryApiEvents.createCategoryInitiated(categoryRequest));
      validateState({
        pendingParentCategory: undefined,
      });
    });

    it('should open dialog and not dispatch anything if cancelled', () => {    
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>);

      dispatcher.dispatch(categoryEvents.createCategory()); 

      validateFunctionCall(mockMatDialog.functions.open, CategoryDialog, {
        disableClose: true,
      });
      validateDispatcher(dispatchSpy);
      validateState({
        pendingParentCategory: undefined,
      });
    });
  });

  describe('dispatching updateCategory', () => {
    const categoryId = testDataFactory.category.id();
    const categoryRequest = testDataFactory.category.request();
    const categoryResponse = testDataFactory.category.response({
      categoryId,
    });

    beforeEach(() => {
      setup({
        pendingParentCategory: testDataFactory.category.response(),
      });
    });
    it('should open dialog and dispatch if submitted', () => {      
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(categoryRequest),
      } as MatDialogRef<any>);

      dispatcher.dispatch(categoryEvents.updateCategory(categoryResponse)); 

      validateFunctionCall(mockMatDialog.functions.open, CategoryDialog, {
        disableClose: true,
        data: categoryResponse,
      });
      validateDispatcher(dispatchSpy, categoryApiEvents.updateCategoryInitiated({
        ...categoryRequest,
        categoryId,
      }));
      validateState({
        pendingParentCategory: undefined,
      });
    });

    it('should open dialog and not dispatch anything if cancelled', () => {    
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>);

      dispatcher.dispatch(categoryEvents.updateCategory(categoryResponse)); 

      validateFunctionCall(mockMatDialog.functions.open, CategoryDialog, {
        disableClose: true,
        data: categoryResponse,
      });
      validateDispatcher(dispatchSpy);
      validateState({
        pendingParentCategory: undefined,
      });
    });
  });

  describe('dispatching deleteCategory', () => {
    const categoryResponse = testDataFactory.category.response();
    it('should open dialog and dispatch if confirmed', () => {
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(true));

      dispatcher.dispatch(categoryEvents.deleteCategory(categoryResponse)); 

      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Törölni akarod ezt a kategóriát?',
        content: categoryResponse.name,
      });
      validateDispatcher(dispatchSpy, categoryApiEvents.deleteCategoryInitiated({
        categoryId: categoryResponse.categoryId,
      }));
      validateState();
    });

    it('should open dialog and not dispatch anything if cancelled', () => {    
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(false));

      dispatcher.dispatch(categoryEvents.deleteCategory(categoryResponse)); 

      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Törölni akarod ezt a kategóriát?',
        content: categoryResponse.name,
      });
      validateDispatcher(dispatchSpy);
      validateState();
    });
  });

  describe('dispatching mergeCategories', () => {    
    const categoryResponse = testDataFactory.category.response();
    const sourceCategoryId = testDataFactory.category.id();
    it('should open dialog and dispatch if submitted', () => {
      
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of({
          sourceCategoryIds: [sourceCategoryId],
          targetCategoryId: categoryResponse.categoryId,
        }),
      } as MatDialogRef<any>);

      dispatcher.dispatch(categoryEvents.mergeCategories(categoryResponse)); 

      validateFunctionCall(mockMatDialog.functions.open, CategoryMergeDialog, {
        disableClose: true,
        data: categoryResponse,
        height: '80vh',
        width: '90vw',
      });
      validateDispatcher(dispatchSpy, categoryApiEvents.mergeCategoriesInitiated({
        sourceCategoryIds: [sourceCategoryId],
        targetCategoryId: categoryResponse.categoryId,
      }));
      validateState();
    });

    it('should open dialog and not dispatch anything if cancelled', () => {    
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>);

      dispatcher.dispatch(categoryEvents.mergeCategories(categoryResponse)); 

      validateFunctionCall(mockMatDialog.functions.open, CategoryMergeDialog, {
        disableClose: true,
        data: categoryResponse,
        height: '80vh',
        width: '90vw',
      });
      validateDispatcher(dispatchSpy);
      validateState();
    });
  });

  describe('dispatching openCategoryListItemSubmenu', () => {
    const categoryResponse = testDataFactory.category.response();
    it('should open bottom sheet and dispatch if edit is selected', () => {
      mockBottomSheetService.functions.openBottomSubmenu.mockReturnValue({
        afterDismissed: () => of('edit'),
      } as MatBottomSheetRef);

      dispatcher.dispatch(categoryEvents.openCategoryListItemSubmenu(categoryResponse)); 

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, categoryResponse.name, 'edit', 'merge', 'delete');
      validateDispatcher(dispatchSpy, categoryEvents.updateCategory(categoryResponse));
      validateState();
    });

    it('should open bottom sheet and dispatch if merge is selected', () => {
      mockBottomSheetService.functions.openBottomSubmenu.mockReturnValue({
        afterDismissed: () => of('merge'),
      } as MatBottomSheetRef);

      dispatcher.dispatch(categoryEvents.openCategoryListItemSubmenu(categoryResponse)); 

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, categoryResponse.name, 'edit', 'merge', 'delete');
      validateDispatcher(dispatchSpy, categoryEvents.mergeCategories(categoryResponse));
      validateState();
    });

    it('should open bottom sheet and dispatch if delete is selected', () => {
      mockBottomSheetService.functions.openBottomSubmenu.mockReturnValue({
        afterDismissed: () => of('delete'),
      } as MatBottomSheetRef);

      dispatcher.dispatch(categoryEvents.openCategoryListItemSubmenu(categoryResponse)); 

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, categoryResponse.name, 'edit', 'merge', 'delete');
      validateDispatcher(dispatchSpy, categoryEvents.deleteCategory(categoryResponse));
      validateState();
    });

    it('should open bottom sheet and not dispatch anything if cancelled', () => {
      mockBottomSheetService.functions.openBottomSubmenu.mockReturnValue({
        afterDismissed: () => of(undefined),
      } as MatBottomSheetRef);

      dispatcher.dispatch(categoryEvents.openCategoryListItemSubmenu(categoryResponse)); 

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, categoryResponse.name, 'edit', 'merge', 'delete');
      validateDispatcher(dispatchSpy);
      validateState();
    });
  });

  describe('dispatching selectCategory', () => {    
    const categoryResponse = testDataFactory.category.response();

    beforeEach(() => {
      setup({
        pendingParentCategory: testDataFactory.category.response(),
      });
    });

    it('should open dialog and dispatch if submitted', () => {
      
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(categoryResponse),
      } as MatDialogRef<any>);

      dispatcher.dispatch(categoryEvents.selectCategory({
        selectedCategory: categoryResponse,
        exclude: {
          self: true,
          children: true,
        },
      }));  

      validateFunctionCall(mockMatDialog.functions.open, CategorySelectDialog, {
        disableClose: true,
        data: {
          selectedCategory: categoryResponse,
          exclude: {
            self: true,
            children: true,
          },
        },
        height: '80vh',
        width: '90vw',
      });
      validateDispatcher(dispatchSpy, categoryEvents.categorySelected(categoryResponse));
      validateState({
        pendingParentCategory: undefined,
      });
    });

    it('should open dialog and not dispatch anything if cancelled', () => {    
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>);

      dispatcher.dispatch(categoryEvents.selectCategory({
        selectedCategory: categoryResponse,
        exclude: {
          self: true,
          children: true,
        },
      })); 

      validateFunctionCall(mockMatDialog.functions.open, CategorySelectDialog, {
        disableClose: true,
        data: {
          selectedCategory: categoryResponse,
          exclude: {
            self: true,
            children: true,
          },
        },
        height: '80vh',
        width: '90vw',
      });
      validateDispatcher(dispatchSpy);
      validateState({
        pendingParentCategory: undefined,
      });
    });
  });

  describe('dispatching categorySelected', () => {
    it('should update store', () => {
      const categoryResponse = testDataFactory.category.response();

      dispatcher.dispatch(categoryEvents.categorySelected(categoryResponse)); 

      validateDispatcher(dispatchSpy);
      validateState({
        pendingParentCategory: categoryResponse,
      });
    });
  });

  describe('dispatching listCategoriesInitiated', () => {
    it('should call API and dispatch response', () => {
      const categoryList = [testDataFactory.category.response()];
      mockCategoryService.functions.listCategories.mockReturnValue(of(categoryList));

      dispatcher.dispatch(categoryApiEvents.listCategoriesInitiated());

      expect(mockCategoryService.functions.listCategories).toHaveBeenCalled();
      validateDispatcher(dispatchSpy, categoryApiEvents.listCategoriesCompleted(categoryList));
      validateState();
    });

    it('should call API and show notification if there is an error', () => {
      mockCategoryService.functions.listCategories.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(categoryApiEvents.listCategoriesInitiated());

      expect(mockCategoryService.functions.listCategories).toHaveBeenCalled();
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
      validateState();
    });
  });

  describe('dispatching listCategoriesCompleted', () => {
    it('should update store', () => {
      const name = 'ékezetes név';
      const categoryResponse = testDataFactory.category.response({
        name,
      });

      dispatcher.dispatch(categoryApiEvents.listCategoriesCompleted([categoryResponse]));
      
      validateDispatcher(dispatchSpy);    
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

  describe('dispatching createCategoryInitiated', () => {
    const categoryRequest = testDataFactory.category.request();
    const categoryId = testDataFactory.category.id();

    it('should call API and dispatch response', () => {
      mockCategoryService.functions.createCategory.mockReturnValue(of({
        categoryId,
      }));

      dispatcher.dispatch(categoryApiEvents.createCategoryInitiated(categoryRequest));

      validateFunctionCall(mockCategoryService.functions.createCategory, categoryRequest);
      validateDispatcher(dispatchSpy, categoryApiEvents.createCategoryCompleted({
        categoryId,
        ...categoryRequest, 
      }));
      validateState();
    });

    it('should call API and show notification if category name is already taken', () => {
      mockCategoryService.functions.createCategory.mockReturnValue(throwError(() => ({
        error: {
          message: 'Duplicate category name',
        },
      })));

      dispatcher.dispatch(categoryApiEvents.createCategoryInitiated(categoryRequest));

      validateFunctionCall(mockCategoryService.functions.createCategory, categoryRequest);
      validateDispatcher(dispatchSpy, notificationEvents.showMessage(`Kategória (${categoryRequest.name}) már létezik!`));
      validateState();
    });

    it('should call API and show notification if there is an error', () => {
      mockCategoryService.functions.createCategory.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(categoryApiEvents.createCategoryInitiated(categoryRequest));

      validateFunctionCall(mockCategoryService.functions.createCategory, categoryRequest);
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
      validateState();
    });
  });

  describe('dispatching createCategoryCompleted', () => {
    it('should update store', () => {
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

      validateDispatcher(dispatchSpy);
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
            fullName: `${parentCategory.fullName}:${categoryRequest.name}`,
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

  describe('dispatching updateCategoryInitiated', () => {
    let categoryRequest: Requests.Category;
    let categoryId: Api.Category.Id;
    let originalCategory: Responses.Category;
    let childCategory: Responses.Category;

    beforeEach(() => {
      categoryRequest = testDataFactory.category.request();
      originalCategory = testDataFactory.category.response();
      categoryId = originalCategory.categoryId;
      childCategory = testDataFactory.category.response({
        ancestors: [originalCategory],
      });

      setup({
        categoryList: [
          originalCategory,
          childCategory,
        ],
      });
    });

    it('should call API and dispatch response', () => {
      mockCategoryService.functions.updateCategory.mockReturnValue(of(undefined));

      dispatcher.dispatch(categoryApiEvents.updateCategoryInitiated({
        categoryId,
        ...categoryRequest, 
      }));

      validateFunctionCall(mockCategoryService.functions.updateCategory, categoryId, categoryRequest);
      validateDispatcher(dispatchSpy, categoryApiEvents.updateCategoryCompleted({
        categoryId,
        ...categoryRequest, 
      }));
      validateState({
        isInProgress: expect.arrayContaining([
          categoryId,
          childCategory.categoryId,
        ]),
      });
    });

    it('should call API and show notification if category name is already taken', () => {
      mockCategoryService.functions.updateCategory.mockReturnValue(throwError(() => ({
        error: {
          message: 'Duplicate category name',
        },
      })));

      dispatcher.dispatch(categoryApiEvents.updateCategoryInitiated({
        categoryId,
        ...categoryRequest, 
      }));
      
      validateDispatcher(dispatchSpy, categoryApiEvents.updateCategoryFailed({
        categoryId,
      }), notificationEvents.showMessage(`Kategória (${categoryRequest.name}) már létezik!`));
      validateState({
        isInProgress: expect.arrayContaining([
          categoryId,
          childCategory.categoryId,
        ]),
      });

    });

    it('should call API and show notification if there is an error', () => {
      mockCategoryService.functions.updateCategory.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(categoryApiEvents.updateCategoryInitiated({
        categoryId,
        ...categoryRequest, 
      }));

      validateFunctionCall(mockCategoryService.functions.updateCategory, categoryId, categoryRequest);
      validateDispatcher(dispatchSpy, categoryApiEvents.updateCategoryFailed({
        categoryId,
      }), notificationEvents.showMessage('Hiba történt'));
      validateState({
        isInProgress: expect.arrayContaining([
          categoryId,
          childCategory.categoryId,
        ]),
      });
    });
  });

  describe('dispatching updateCategoryCompleted', () => {
    it('should update store', () => {
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

      validateDispatcher(dispatchSpy);
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
            fullName: `${parentCategory.fullName}:${categoryRequest.name}`,
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
            fullName: `${parentCategory.fullName}:${categoryRequest.name}:${childCategory.name}`,
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
              fullName: `${parentCategory.fullName}:${categoryRequest.name}`,
            },
          },
        ],
      });
    });
  });

  describe('dispatching updateCategoryFailed', () => {
    it('should update store', () => {
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

      validateDispatcher(dispatchSpy);
      validateState({
        isInProgress: [],
      });
    });
  });

  describe('dispatching deleteCategoryInitiated', () => {
    let originalCategory: Responses.Category;
    let categoryId: Api.Category.Id;
    let childCategory: Responses.Category;
    
    beforeEach(() => {
      originalCategory = testDataFactory.category.response();
      categoryId = originalCategory.categoryId;
      childCategory = testDataFactory.category.response({
        ancestors: [originalCategory],
      });

      setup({
        categoryList: [
          originalCategory,
          childCategory,
        ],
      });
    });

    it('should call API and dispatch response', () => {
      mockCategoryService.functions.deleteCategory.mockReturnValue(of(undefined));

      dispatcher.dispatch(categoryApiEvents.deleteCategoryInitiated({
        categoryId, 
      }));

      validateFunctionCall(mockCategoryService.functions.deleteCategory, categoryId);
      validateDispatcher(dispatchSpy, categoryApiEvents.deleteCategoryCompleted({
        categoryId,
      }));
      validateState({
        isInProgress: expect.arrayContaining([
          categoryId,
          childCategory.categoryId,
        ]),
      });
    });

    it('should call API and show notification if there is an error', () => {
      mockCategoryService.functions.deleteCategory.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(categoryApiEvents.deleteCategoryInitiated({
        categoryId, 
      }));

      validateFunctionCall(mockCategoryService.functions.deleteCategory, categoryId);
      validateDispatcher(dispatchSpy, categoryApiEvents.deleteCategoryFailed({
        categoryId,
      }), notificationEvents.showMessage('Hiba történt'));
      validateState({
        isInProgress: expect.arrayContaining([
          categoryId,
          childCategory.categoryId,
        ]),
      });
    });
  });

  describe('dispatching deleteCategoryCompleted', () => {
    it('should update store', () => {
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
      const categoryRequest = testDataFactory.category.request();

      dispatcher.dispatch(categoryApiEvents.deleteCategoryCompleted({
        categoryId: originalCategory.categoryId,
        ...categoryRequest,
      }));

      validateDispatcher(dispatchSpy);
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

  describe('dispatching deleteCategoryFailed', () => {
    it('should update store', () => {
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

      validateDispatcher(dispatchSpy);
      validateState({
        isInProgress: [],
      });
    });
  });

  describe('dispatching mergeCategoryInitiated', () => {
    let targetCategory: Responses.Category;
    let sourceCategory: Responses.Category;
    
    beforeEach(() => {
      targetCategory = testDataFactory.category.response();
      sourceCategory = testDataFactory.category.response();

      setup({
        categoryList: [
          targetCategory,
          sourceCategory,
        ],
      });
    });

    it('should call API and dispatch response', () => {
      mockCategoryService.functions.mergeCategories.mockReturnValue(of(undefined));

      dispatcher.dispatch(categoryApiEvents.mergeCategoriesInitiated({
        sourceCategoryIds: [sourceCategory.categoryId],
        targetCategoryId: targetCategory.categoryId,
      }));

      validateFunctionCall(mockCategoryService.functions.mergeCategories, targetCategory.categoryId, [sourceCategory.categoryId]);
      validateDispatcher(dispatchSpy, categoryApiEvents.mergeCategoriesCompleted({
        sourceCategoryIds: [sourceCategory.categoryId],
      }));
      validateState({
        isInProgress: [sourceCategory.categoryId],
      });
    });

    it('should call API and show notification if there is an error', () => {
      mockCategoryService.functions.mergeCategories.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(categoryApiEvents.mergeCategoriesInitiated({
        sourceCategoryIds: [sourceCategory.categoryId],
        targetCategoryId: targetCategory.categoryId,
      }));

      validateFunctionCall(mockCategoryService.functions.mergeCategories, targetCategory.categoryId, [sourceCategory.categoryId]);
      validateDispatcher(dispatchSpy, categoryApiEvents.mergeCategoriesFailed({
        sourceCategoryIds: [sourceCategory.categoryId],
      }), notificationEvents.showMessage('Hiba történt'));
      validateState({
        isInProgress: [sourceCategory.categoryId],
      });
    });
  });

  describe('dispatching mergeCategoryCompleted', () => {
    it('should update store', () => {
      const sourceCategory = testDataFactory.category.response();
      setup({
        isInProgress: [sourceCategory.categoryId],
        categoryList: [sourceCategory],
      });

      dispatcher.dispatch(categoryApiEvents.mergeCategoriesCompleted({
        sourceCategoryIds: [sourceCategory.categoryId],
      }));

      validateDispatcher(dispatchSpy);
      validateState({
        isInProgress: [],
        categoryList: [],
      });
    });
  });

  describe('dispatching mergeCategoryFailed', () => {
    it('should update store', () => {
      const sourceCategory = testDataFactory.category.response();
      setup({
        isInProgress: [sourceCategory.categoryId],
        categoryList: [sourceCategory],
      });

      dispatcher.dispatch(categoryApiEvents.mergeCategoriesFailed({
        sourceCategoryIds: [sourceCategory.categoryId],
      }));

      validateDispatcher(dispatchSpy);
      validateState({
        isInProgress: [],
      });
    });
  });
});
