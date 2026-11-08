import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryHome } from './category-home';
import { createStubComponent, elementSelectorFactory, IElementSelector, MockSignalStore, provideMockDispatcher, provideMockSignalStore } from '@household/shared-ui';
import { Toolbar } from '@household/app/shared/toolbar/toolbar';
import { CategoryList } from '@household/app/category/category-list/category-list';
import { CategoryStore } from '@household/state/category/category-store';
import { categoryApiEvents, categoryEvents } from '@household/state/category/category-events';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { validateFunctionCall } from '@household/shared/common/unit-testing';
import { Dispatcher } from '@ngrx/signals/events';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { Responses } from '@household/shared/types/responses';

describe('CategoryHome', () => {
  const ToolbarStub = createStubComponent(Toolbar);
  const CategoryListStub = createStubComponent(CategoryList);

  let fixture: ComponentFixture<CategoryHome>;
  let selector: IElementSelector;
  let mockCategoryStore: MockSignalStore<typeof CategoryStore>;
  let mockDispatcher: Dispatcher;

  const categories = [
    testDataFactory.category.response(),
    testDataFactory.category.response(),
  ];

  const render = async (categoryList: Responses.Category[] = categories) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [CategoryHome],
      providers: [
        provideMockSignalStore(CategoryStore, 'categoryList'),
        provideMockDispatcher(),
      ],
    })
      .overrideComponent(CategoryHome, {
        remove: {
          imports: [
            Toolbar,
            CategoryList,
          ],
        },
        add: {
          imports: [
            ToolbarStub,
            CategoryListStub,
          ],
        },
      })
      .compileComponents();

    mockCategoryStore = TestBed.inject<MockSignalStore<typeof CategoryStore>>(CategoryStore);
    mockDispatcher = TestBed.inject(Dispatcher);

    mockCategoryStore.categoryList.set(categoryList);

    fixture = TestBed.createComponent(CategoryHome);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('on init', () => {
    it('should dispatch listCategoriesInitiated', async () => {
      await render();

      validateFunctionCall(mockDispatcher.dispatch, categoryApiEvents.listCategoriesInitiated(), {
        scope: 'self',
      });
    });
  });

  describe('toolbar', () => {
    it('should be rendered with the title', async () => {
      await render();

      expect(selector.getComponent<Toolbar>(ToolbarStub).componentInstance.title()).toBe('Kategóriák');
    });
  });

  describe('create button', () => {
    const getElement = () => {
      return selector.getComponent<MatIconButton, HTMLButtonElement>(MatIconButton, ToolbarStub);
    };

    it('should be rendered', async () => {
      await render();

      expect(selector.getComponent(MatIcon, ToolbarStub).nativeElement.textContent).toBe('add');
    });

    it('should dispatch createCategory if clicked', async () => {
      await render();

      getElement().nativeElement.click();

      validateFunctionCall(mockDispatcher.dispatch, categoryEvents.createCategory(), {
        scope: 'self',
      });
    });
  });

  describe('category list', () => {
    it('should be rendered with the categories of the store', async () => {
      await render();

      expect(selector.getComponent<CategoryList>(CategoryListStub).componentInstance.categories()).toEqual(categories);
    });

    it('should be rendered with an empty list', async () => {
      await render([]);

      expect(selector.getComponent<CategoryList>(CategoryListStub).componentInstance.categories()).toEqual([]);
    });
  });
});
