import { ComponentFixture, TestBed } from '@angular/core/testing';
import { elementSelectorFactory, IconText, IElementSelector, MockSignalStore, createStubComponent, ProgressStore, provideMockDispatcher, provideMockSignalStore, SelectionStore } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { validateFunctionCall } from '@household/shared/common/unit-testing';
import { Responses } from '@household/shared/types/responses';
import { productEvents } from '@household/state/product/product-events';
import { Dispatcher } from '@ngrx/signals/events';
import { ProductSelector } from './product-selector';

describe('ProductSelector', () => {
  const IconTextStub = createStubComponent(IconText);

  let fixture: ComponentFixture<ProductSelector>;
  let selector: IElementSelector;
  let mockProgressStore: MockSignalStore<typeof ProgressStore>;
  let mockSelectionStore: MockSignalStore<typeof SelectionStore>;
  let mockDispatcher: Dispatcher;

  const label = 'Termék';
  const product = testDataFactory.product.response.generic();

  const getAddButton = () => selector.getElementByTestId('add-button');
  const getSelectButton = () => selector.getElementByTestId('select-button');
  const getMenuButton = () => selector.getElementByTestId('menu-button');
  const getIconText = () => selector.getComponent(IconTextStub);

  // The menu is rendered in the overlay, which is outside of the fixture
  const getMenuItem = (testId: string) => document.querySelector<HTMLElement>(`[data-testId="${testId}"]`);

  const render = async (params?: {
    value?: Responses.Product;
    required?: boolean;
    items?: Responses.Product[];
    isInProgress?: boolean;
  }) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [ProductSelector],
      providers: [
        provideMockSignalStore(ProgressStore, 'isInProgress'),
        provideMockSignalStore(SelectionStore, 'selectedItems'),
        provideMockDispatcher(),
      ],
    })
      .overrideComponent(ProductSelector, {
        remove: {
          imports: [IconText], 
        },
        add: {
          imports: [IconTextStub], 
        },
      })
      .compileComponents();

    mockProgressStore = TestBed.inject<MockSignalStore<typeof ProgressStore>>(ProgressStore);
    mockSelectionStore = TestBed.inject<MockSignalStore<typeof SelectionStore>>(SelectionStore);
    mockDispatcher = TestBed.inject(Dispatcher);

    mockProgressStore.isInProgress.set(params?.isInProgress ?? false);
    mockSelectionStore.selectedItems.set({});

    fixture = TestBed.createComponent(ProductSelector);
    fixture.componentRef.setInput('label', label);
    fixture.componentRef.setInput('required', params?.required ?? false);
    fixture.componentRef.setInput('items', params?.items ?? []);
    fixture.componentRef.setInput('value', params?.value);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('if nothing is selected', () => {
    it('should show the add button with the label', async () => {
      await render();

      expect(getAddButton().nativeElement.textContent).toContain(`${label} kiválasztása`);
      expect(getIconText()).toBeFalsy();
    });

    it('should start the selection from the given items when the add button is clicked', async () => {
      const items = [product];
      await render({
        items, 
      });

      getAddButton().nativeElement.click();

      validateFunctionCall(mockDispatcher.dispatch, productEvents.selectProduct({
        selectionId: expect.any(String),
        products: items,
      }), {
        scope: 'self', 
      });
    });

    it('should use a different selection id for every selection', async () => {
      await render();

      getAddButton().nativeElement.click();
      getAddButton().nativeElement.click();

      const [
        first,
        second,
      ] = (mockDispatcher.dispatch as any).mock.calls.map(([event]) => event.payload.selectionId);
      expect(first).not.toBe(second);
    });
  });

  describe('if a product is selected', () => {
    it('should show the label and the name of the product', async () => {
      await render({
        value: product, 
      });

      expect(selector.getElementByCss('.label').nativeElement.textContent).toBe(label);
      expect(getIconText().componentInstance.text()).toBe(product.fullName);
      expect(getIconText().componentInstance.icon()).toBe('account_tree');
      expect(getAddButton()).toBeFalsy();
    });

    describe('and it is required', () => {
      it('should show an edit button instead of the menu', async () => {
        await render({
          value: product,
          required: true, 
        });

        expect(getSelectButton()).toBeTruthy();
        expect(getMenuButton()).toBeFalsy();
      });

      it('should start the selection when the edit button is clicked', async () => {
        await render({
          value: product,
          required: true,
          items: [product], 
        });

        getSelectButton().nativeElement.click();

        validateFunctionCall(mockDispatcher.dispatch, productEvents.selectProduct({
          selectionId: expect.any(String),
          products: [product],
        }), {
          scope: 'self', 
        });
      });
    });

    describe('and it is not required', () => {
      it('should show the menu instead of the edit button', async () => {
        await render({
          value: product, 
        });

        expect(getMenuButton()).toBeTruthy();
        expect(getSelectButton()).toBeFalsy();
      });

      it('should remove the product with the remove menu item', async () => {
        await render({
          value: product, 
        });

        getMenuButton().nativeElement.click();
        await fixture.whenStable();
        getMenuItem('remove-button').click();
        await fixture.whenStable();

        expect(fixture.componentInstance.value()).toBeNull();
      });

      it('should start the selection with the edit menu item', async () => {
        await render({
          value: product,
          items: [product], 
        });

        getMenuButton().nativeElement.click();
        await fixture.whenStable();
        getMenuItem('edit-button').click();

        validateFunctionCall(mockDispatcher.dispatch, productEvents.selectProduct({
          selectionId: expect.any(String),
          products: [product],
        }), {
          scope: 'self', 
        });
      });
    });
  });

  describe('selection result', () => {
    it('should take the value from the selection store for the started selection', async () => {
      await render();
      getAddButton().nativeElement.click();
      const { selectionId } = (mockDispatcher.dispatch as any).mock.calls[0][0].payload;

      mockSelectionStore.selectedItems.set({
        [selectionId]: product,
      });
      await fixture.whenStable();

      expect(fixture.componentInstance.value()).toEqual(product);
      expect(getIconText().componentInstance.text()).toBe(product.fullName);
    });

    it('should ignore the selections of other selectors', async () => {
      await render();
      getAddButton().nativeElement.click();

      mockSelectionStore.selectedItems.set({
        'other-selection': product,
      });
      await fixture.whenStable();

      expect(fixture.componentInstance.value()).toBeUndefined();
    });
  });

  describe('loading', () => {
    it('should show the loading text instead of the buttons while a request is in progress', async () => {
      await render({
        isInProgress: true,
        value: product, 
      });

      expect(fixture.nativeElement.textContent).toContain('Loading');
      expect(getAddButton()).toBeFalsy();
      expect(getIconText()).toBeFalsy();
    });
  });
});
