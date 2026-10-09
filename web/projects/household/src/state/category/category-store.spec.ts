import { TestBed } from '@angular/core/testing';
import { CategoryService } from '@household/services/category-service';
import { CategoryState, CategoryStore, provideCategoryStoreInitialState } from '@household/state/category/category-store';
import { BottomSheetService, DialogService } from '@household/shared-ui';
import { Dispatcher } from '@ngrx/signals/events';
import { createMockService, MockService } from '@household/shared/common/unit-testing';
import { MatDialog } from '@angular/material/dialog';
import { categoryApiEvents, categoryEvents } from '@household/state/category/category-events';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { of } from 'rxjs';
import { CategoryDialog } from '@household/app/category/category-dialog/category-dialog';

// The behavior of each store feature is covered in its own spec (with-category-reducer.spec.ts,
// with-category-events.spec.ts, with-category-api-events.spec.ts). This spec only verifies that the store
// provides its initial state and has every feature wired in.
describe('Category store', () => {
  let initialState: CategoryState;
  let store: InstanceType<typeof CategoryStore>;
  let dispatcher: Dispatcher;
  let mockCategoryService: MockService<CategoryService>;
  let mockDialogService: MockService<DialogService>;
  let mockMatDialog: MockService<MatDialog>;
  let mockBottomSheetService: MockService<BottomSheetService>;

  const setup = (initial?: Partial<CategoryState>) => {
    TestBed.resetTestingModule();

    initialState = {
      isInProgress: [],
      categoryList: [],
      pendingParentCategory: undefined,
      ...initial,
    };

    mockCategoryService = createMockService('listCategories', 'createCategory', 'updateCategory', 'deleteCategory', 'mergeCategories');
    mockDialogService = createMockService('openConfirmationDialog');
    mockBottomSheetService = createMockService('openBottomSubmenu');
    mockMatDialog = createMockService('open');

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
  };

  it('should initialize with the provided state', () => {
    const categoryList = [testDataFactory.category.searchableResponse()];
    const pendingParentCategory = testDataFactory.category.response();
    const isInProgress = [testDataFactory.category.id()];

    setup({
      categoryList,
      pendingParentCategory,
      isInProgress,
    });

    expect(store.categoryList()).toEqual(categoryList);
    expect(store.pendingParentCategory()).toEqual(pendingParentCategory);
    expect(store.isInProgress()).toEqual(isInProgress);
  });

  it('should initialize with the default state', () => {
    setup();

    expect(store.categoryList()).toEqual([]);
    expect(store.pendingParentCategory()).toBeUndefined();
    expect(store.isInProgress()).toEqual([]);
  });

  it('should have the reducer wired in', () => {
    setup();
    const categoryResponse = testDataFactory.category.response();

    dispatcher.dispatch(categoryEvents.categorySelected(categoryResponse));

    expect(store.pendingParentCategory()).toEqual(categoryResponse);
  });

  it('should have the UI event handlers wired in', () => {
    setup();
    mockMatDialog.functions.open.mockReturnValue({
      afterClosed: () => of(undefined),
    } as any);

    dispatcher.dispatch(categoryEvents.createCategory());

    expect(mockMatDialog.functions.open).toHaveBeenCalledWith(CategoryDialog, expect.anything());
  });

  it('should have the API event handlers and the reducer working together', () => {
    setup();
    const categoryResponse = testDataFactory.category.response();
    mockCategoryService.functions.listCategories.mockReturnValue(of([categoryResponse]));

    dispatcher.dispatch(categoryApiEvents.listCategoriesInitiated());

    expect(mockCategoryService.functions.listCategories).toHaveBeenCalled();
    expect(store.categoryList()).toEqual([
      {
        ...categoryResponse,
        searchTerms: expect.any(Array),
      },
    ]);
  });
});
