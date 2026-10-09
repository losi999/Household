// The dialogs opened by the event handlers import the store, which imports the event handlers back. Loading the store
// first resolves that cycle in the same order as the application does.
import '@household/state/category/category-store';
import { TestBed } from '@angular/core/testing';
import { BottomSheetService, createDispatcherSpy, DialogService, validateDispatcher } from '@household/shared-ui';
import { Dispatcher } from '@ngrx/signals/events';
import { signalStore } from '@ngrx/signals';
import { Mock } from 'vitest';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { categoryApiEvents, categoryEvents } from '@household/state/category/category-events';
import { withCategoryEvents } from '@household/state/category/with-category-events';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { of } from 'rxjs';
import { CategoryDialog } from '@household/app/category/category-dialog/category-dialog';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { CategoryMergeDialog } from '@household/app/category/category-merge-dialog/category-merge-dialog';
import { CategorySelectDialog } from '@household/app/category/category-select-dialog/category-select-dialog';

describe('withCategoryEvents', () => {
  let dispatcher: Dispatcher;
  let dispatchSpy: Mock;
  let mockDialogService: MockService<DialogService>;
  let mockMatDialog: MockService<MatDialog>;
  let mockBottomSheetService: MockService<BottomSheetService>;

  const setup = () => {
    TestBed.resetTestingModule();

    mockDialogService = createMockService('openConfirmationDialog');
    mockBottomSheetService = createMockService('openBottomSubmenu');
    mockMatDialog = createMockService('open');

    TestBed.configureTestingModule({
      providers: [
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
      ],
    });

    TestBed.inject(signalStore({
      providedIn: 'root',
    }, withCategoryEvents()));
    dispatcher = TestBed.inject(Dispatcher);
    dispatchSpy = createDispatcherSpy(dispatcher);
  };

  beforeEach(() => {
    setup();
  });

  describe('dispatching createCategory', () => {
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
    });
  });

  describe('dispatching updateCategory', () => {
    const categoryId = testDataFactory.category.id();
    const categoryRequest = testDataFactory.category.request();
    const categoryResponse = testDataFactory.category.response({
      categoryId,
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
    });

    it('should open dialog and not dispatch anything if cancelled', () => {
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(false));

      dispatcher.dispatch(categoryEvents.deleteCategory(categoryResponse));

      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Törölni akarod ezt a kategóriát?',
        content: categoryResponse.name,
      });
      validateDispatcher(dispatchSpy);
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
    });

    it('should open bottom sheet and dispatch if merge is selected', () => {
      mockBottomSheetService.functions.openBottomSubmenu.mockReturnValue({
        afterDismissed: () => of('merge'),
      } as MatBottomSheetRef);

      dispatcher.dispatch(categoryEvents.openCategoryListItemSubmenu(categoryResponse));

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, categoryResponse.name, 'edit', 'merge', 'delete');
      validateDispatcher(dispatchSpy, categoryEvents.mergeCategories(categoryResponse));
    });

    it('should open bottom sheet and dispatch if delete is selected', () => {
      mockBottomSheetService.functions.openBottomSubmenu.mockReturnValue({
        afterDismissed: () => of('delete'),
      } as MatBottomSheetRef);

      dispatcher.dispatch(categoryEvents.openCategoryListItemSubmenu(categoryResponse));

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, categoryResponse.name, 'edit', 'merge', 'delete');
      validateDispatcher(dispatchSpy, categoryEvents.deleteCategory(categoryResponse));
    });

    it('should open bottom sheet and not dispatch anything if cancelled', () => {
      mockBottomSheetService.functions.openBottomSubmenu.mockReturnValue({
        afterDismissed: () => of(undefined),
      } as MatBottomSheetRef);

      dispatcher.dispatch(categoryEvents.openCategoryListItemSubmenu(categoryResponse));

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, categoryResponse.name, 'edit', 'merge', 'delete');
      validateDispatcher(dispatchSpy);
    });
  });

  describe('dispatching selectCategory', () => {
    const categoryResponse = testDataFactory.category.response();

    it('should open dialog and dispatch if submitted', () => {
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(categoryResponse),
      } as MatDialogRef<any>);

      dispatcher.dispatch(categoryEvents.selectCategory({
        excludedCategory: categoryResponse,
      }));

      validateFunctionCall(mockMatDialog.functions.open, CategorySelectDialog, {
        disableClose: true,
        data: {
          excludedCategory: categoryResponse,
        },
        height: '80vh',
        width: '90vw',
      });
      validateDispatcher(dispatchSpy, categoryEvents.categorySelected(categoryResponse));
    });

    it('should open dialog and not dispatch anything if cancelled', () => {
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>);

      dispatcher.dispatch(categoryEvents.selectCategory({
        excludedCategory: categoryResponse,
      }));

      validateFunctionCall(mockMatDialog.functions.open, CategorySelectDialog, {
        disableClose: true,
        data: {
          excludedCategory: categoryResponse,
        },
        height: '80vh',
        width: '90vw',
      });
      validateDispatcher(dispatchSpy);
    });
  });
});
