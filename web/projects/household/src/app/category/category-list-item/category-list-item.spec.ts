import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryListItem } from './category-list-item';
import { elementSelectorFactory, IElementSelector, MockSignalStore, provideMockDispatcher, provideMockSignalStore } from '@household/shared-ui';
import { categoryEvents } from '@household/state/category/category-events';
import { CategoryStore } from '@household/state/category/category-store';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { validateFunctionCall } from '@household/shared/common/unit-testing';
import { Dispatcher } from '@ngrx/signals/events';
import { MatListItem, MatListItemTitle } from '@angular/material/list';
import { Api } from '@household/shared/types/api';

describe('CategoryListItem', () => {
  let fixture: ComponentFixture<CategoryListItem>;
  let selector: IElementSelector;
  let mockCategoryStore: MockSignalStore<typeof CategoryStore>;
  let mockDispatcher: Dispatcher;

  const category = testDataFactory.category.response();

  const render = async (isInProgress: Api.Category.Id[] = []) => {
    mockCategoryStore.isInProgress.set(isInProgress);

    fixture = TestBed.createComponent(CategoryListItem);
    fixture.componentRef.setInput('category', category);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  beforeEach(async () => {
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
  });

  describe('list item button', () => {
    const getElement = () => {
      return selector.getComponent<MatListItem, HTMLButtonElement>(MatListItem);
    };

    it('should be rendered', async () => {
      await render();

      expect(getElement()).toBeTruthy();
    });

    it('should be enabled if category is not in progress', async () => {
      await render([testDataFactory.category.id()]);

      expect(getElement().nativeElement.disabled).toBe(false);
    });

    it('should be disabled if category is in progress', async () => {
      await render([category.categoryId]);

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
        await render([category.categoryId]);

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
});
