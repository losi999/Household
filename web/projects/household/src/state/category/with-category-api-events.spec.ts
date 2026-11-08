import { TestBed } from '@angular/core/testing';
import { CategoryService } from '@household/services/category-service';
import { createDispatcherSpy, notificationEvents, validateDispatcher } from '@household/shared-ui';
import { Dispatcher } from '@ngrx/signals/events';
import { signalStore } from '@ngrx/signals';
import { Mock } from 'vitest';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { categoryApiEvents } from '@household/state/category/category-events';
import { withCategoryApiEvents } from '@household/state/category/with-category-api-events';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { of, throwError } from 'rxjs';

describe('withCategoryApiEvents', () => {
  let dispatcher: Dispatcher;
  let dispatchSpy: Mock;
  let mockCategoryService: MockService<CategoryService>;

  const setup = () => {
    TestBed.resetTestingModule();

    mockCategoryService = createMockService('listCategories', 'createCategory', 'updateCategory', 'deleteCategory', 'mergeCategories');

    TestBed.configureTestingModule({
      providers: [
        {
          provide: CategoryService,
          useValue: mockCategoryService.service,
        },
      ],
    });

    TestBed.inject(signalStore({
      providedIn: 'root',
    }, withCategoryApiEvents()));
    dispatcher = TestBed.inject(Dispatcher);
    dispatchSpy = createDispatcherSpy(dispatcher);
  };

  beforeEach(() => {
    setup();
  });

  describe('dispatching listCategoriesInitiated', () => {
    it('should call API and dispatch response', () => {
      const categoryList = [testDataFactory.category.response()];
      mockCategoryService.functions.listCategories.mockReturnValue(of(categoryList));

      dispatcher.dispatch(categoryApiEvents.listCategoriesInitiated());

      expect(mockCategoryService.functions.listCategories).toHaveBeenCalled();
      validateDispatcher(dispatchSpy, categoryApiEvents.listCategoriesCompleted(categoryList));
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
    });
  });

  describe('dispatching updateCategoryInitiated', () => {
    const categoryRequest = testDataFactory.category.request();
    const categoryId = testDataFactory.category.id();

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

      validateFunctionCall(mockCategoryService.functions.updateCategory, categoryId, categoryRequest);
      validateDispatcher(dispatchSpy, categoryApiEvents.updateCategoryFailed({
        categoryId,
      }), notificationEvents.showMessage(`Kategória (${categoryRequest.name}) már létezik!`));
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
    });
  });

  describe('dispatching deleteCategoryInitiated', () => {
    const categoryId = testDataFactory.category.id();

    it('should call API and dispatch response', () => {
      mockCategoryService.functions.deleteCategory.mockReturnValue(of(undefined));

      dispatcher.dispatch(categoryApiEvents.deleteCategoryInitiated({
        categoryId,
      }));

      validateFunctionCall(mockCategoryService.functions.deleteCategory, categoryId);
      validateDispatcher(dispatchSpy, categoryApiEvents.deleteCategoryCompleted({
        categoryId,
      }));
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
    });
  });

  describe('dispatching mergeCategoriesInitiated', () => {
    const targetCategoryId = testDataFactory.category.id();
    const sourceCategoryId = testDataFactory.category.id();

    it('should call API and dispatch response', () => {
      mockCategoryService.functions.mergeCategories.mockReturnValue(of(undefined));

      dispatcher.dispatch(categoryApiEvents.mergeCategoriesInitiated({
        sourceCategoryIds: [sourceCategoryId],
        targetCategoryId,
      }));

      validateFunctionCall(mockCategoryService.functions.mergeCategories, targetCategoryId, [sourceCategoryId]);
      validateDispatcher(dispatchSpy, categoryApiEvents.mergeCategoriesCompleted({
        sourceCategoryIds: [sourceCategoryId],
      }));
    });

    it('should call API and show notification if there is an error', () => {
      mockCategoryService.functions.mergeCategories.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(categoryApiEvents.mergeCategoriesInitiated({
        sourceCategoryIds: [sourceCategoryId],
        targetCategoryId,
      }));

      validateFunctionCall(mockCategoryService.functions.mergeCategories, targetCategoryId, [sourceCategoryId]);
      validateDispatcher(dispatchSpy, categoryApiEvents.mergeCategoriesFailed({
        sourceCategoryIds: [sourceCategoryId],
      }), notificationEvents.showMessage('Hiba történt'));
    });
  });
});
