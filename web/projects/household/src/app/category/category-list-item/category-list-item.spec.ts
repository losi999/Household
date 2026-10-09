import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryListItem } from './category-list-item';
import { elementSelectorFactory, IElementSelector, MockSignalStore, provideMockDispatcher, provideMockSignalStore } from '@household/shared-ui';
import { categoryEvents } from '@household/state/category/category-events';
import { CategoryStore } from '@household/state/category/category-store';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { validateFunctionCall } from '@household/shared/common/unit-testing';
import { Dispatcher } from '@ngrx/signals/events';
import { MatListItem, MatListItemIcon, MatListItemTitle } from '@angular/material/list';
import { Api } from '@household/shared/types/api';
import { CategoryType } from '@household/shared/enums';
import { Responses } from '@household/shared/types/responses';

describe('CategoryListItem', () => {
  let fixture: ComponentFixture<CategoryListItem>;
  let selector: IElementSelector;
  let mockCategoryStore: MockSignalStore<typeof CategoryStore>;
  let mockDispatcher: Dispatcher;

  const category = testDataFactory.category.response();

  const render = async (params?: {
    isInProgress?: Api.Category.Id[];
    category?: Responses.Category;
  }) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [CategoryListItem],
      providers: [
        provideMockSignalStore(CategoryStore, 'isInProgress'),
        provideMockDispatcher(),
      ],
    })
      .compileComponents();

    mockCategoryStore = TestBed.inject<MockSignalStore<typeof CategoryStore>>(CategoryStore);
    mockDispatcher = TestBed.inject(Dispatcher);

    mockCategoryStore.isInProgress.set(params?.isInProgress ?? []);

    fixture = TestBed.createComponent(CategoryListItem);
    fixture.componentRef.setInput('category', params?.category ?? category);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('list item button', () => {
    const getElement = () => {
      return selector.getComponent<MatListItem, HTMLButtonElement>(MatListItem);
    };

    it('should be rendered', async () => {
      await render();

      expect(getElement()).toBeTruthy();
    });

    it('should be enabled if category is not in progress', async () => {
      await render({
        isInProgress: [testDataFactory.category.id()], 
      });

      expect(getElement().nativeElement.disabled).toBe(false);
    });

    it('should be disabled if category is in progress', async () => {
      await render({
        isInProgress: [category.categoryId], 
      });

      expect(getElement().nativeElement.disabled).toBe(true);
    });

    describe('on click', () => {
      it('should dispatch openCategoryListItemSubmenu', async () => {
        await render();

        getElement().nativeElement.click();

        validateFunctionCall(mockDispatcher.dispatch, categoryEvents.openCategoryListItemSubmenu(category), {
          scope: 'self',
        });
      });

      it('should not dispatch anything if disabled', async () => {
        await render({
          isInProgress: [category.categoryId], 
        });

        getElement().nativeElement.click();

        validateFunctionCall(mockDispatcher.dispatch);
      });
    });
  });

  describe('name', () => {
    it('should be rendered', async () => {
      await render();

      expect(selector.getComponent(MatListItemTitle, MatListItem).nativeElement.textContent).toBe(category.name);
    });
  });

  describe('icon', () => {
    it('should be rendered for regular category', async () => {
      await render({
        category: testDataFactory.category.response({
          categoryType: CategoryType.Regular,
        }),
      });

      expect(selector.getComponent(MatListItemIcon, MatListItem).nativeElement.textContent).toBe('category');
    });

    it('should be rendered for inventory category', async () => {
      await render({
        category: testDataFactory.category.response({
          categoryType: CategoryType.Inventory,
        }),
      });

      expect(selector.getComponent(MatListItemIcon, MatListItem).nativeElement.textContent).toBe('inventory_2');
    });

    it('should be rendered for invoice category', async () => {
      await render({
        category: testDataFactory.category.response({
          categoryType: CategoryType.Invoice,
        }),
      });

      expect(selector.getComponent(MatListItemIcon, MatListItem).nativeElement.textContent).toBe('receipt_long');
    });
  });
});
