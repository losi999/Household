// The dialog classes the event handlers reference import the store, which imports the event handlers back. Loading the
// store first resolves that cycle in the same order as the application does.
import '@household/state/product/product-store';
import { TestBed } from '@angular/core/testing';
import { BottomSheetService, createDispatcherSpy, DialogService, validateDispatcher } from '@household/shared-ui';
import { Dispatcher } from '@ngrx/signals/events';
import { signalStore } from '@ngrx/signals';
import { Mock } from 'vitest';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { productApiEvents, productEvents, ProductTreeNode } from '@household/state/product/product-events';
import { withProductEvents } from '@household/state/product/with-product-events';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { of } from 'rxjs';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ProductDialog } from '@household/app/product/product-dialog/product-dialog';
import { ProductMergeDialog } from '@household/app/product/product-merge-dialog/product-merge-dialog';
import { ProductSelectDialog } from '@household/app/product/product-select-dialog/product-select-dialog';

describe('withProductEvents', () => {
  let dispatcher: Dispatcher;
  let dispatchSpy: Mock;
  let mockBottomSheetService: MockService<BottomSheetService>;
  let mockDialogService: MockService<DialogService>;
  let mockMatDialog: MockService<MatDialog>;

  const setup = () => {
    TestBed.resetTestingModule();

    mockBottomSheetService = createMockService('openBottomSubmenu');
    mockDialogService = createMockService('openConfirmationDialog');
    mockMatDialog = createMockService('open');

    TestBed.configureTestingModule({
      providers: [
        {
          provide: BottomSheetService,
          useValue: mockBottomSheetService.service,
        },
        {
          provide: DialogService,
          useValue: mockDialogService.service,
        },
        {
          provide: MatDialog,
          useValue: mockMatDialog.service,
        },
      ],
    });

    TestBed.inject(signalStore({
      providedIn: 'root',
    }, withProductEvents()));
    dispatcher = TestBed.inject(Dispatcher);
    dispatchSpy = createDispatcherSpy(dispatcher);
  };

  const dismissWith = (value: 'edit' | 'merge' | 'delete' | undefined) => {
    mockBottomSheetService.functions.openBottomSubmenu.mockReturnValue({
      afterDismissed: () => of(value),
    } as MatBottomSheetRef);
  };

  beforeEach(() => {
    setup();
  });

  describe('dispatching createProduct', () => {
    it('should open dialog and dispatch if submitted', () => {
      const productRequest = testDataFactory.product.request.generic();
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(productRequest),
      } as MatDialogRef<any>);

      dispatcher.dispatch(productEvents.createProduct());

      validateFunctionCall(mockMatDialog.functions.open, ProductDialog, {
        disableClose: true,
      });
      validateDispatcher(dispatchSpy, productApiEvents.createProductInitiated(productRequest));
    });

    it('should open dialog and not dispatch anything if cancelled', () => {
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>);

      dispatcher.dispatch(productEvents.createProduct());

      validateFunctionCall(mockMatDialog.functions.open, ProductDialog, {
        disableClose: true,
      });
      validateDispatcher(dispatchSpy);
    });
  });

  describe('dispatching updateProduct', () => {
    const product = testDataFactory.product.tree();
    const productRequest = testDataFactory.product.request.specific();

    it('should open dialog and dispatch if submitted', () => {
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(productRequest),
      } as MatDialogRef<any>);

      dispatcher.dispatch(productEvents.updateProduct(product));

      validateFunctionCall(mockMatDialog.functions.open, ProductDialog, {
        disableClose: true,
        data: product,
      });
      validateDispatcher(dispatchSpy, productApiEvents.updateProductInitiated({
        productId: product.productId,
        ...productRequest,
      }));
    });

    it('should open dialog and not dispatch anything if cancelled', () => {
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>);

      dispatcher.dispatch(productEvents.updateProduct(product));

      validateFunctionCall(mockMatDialog.functions.open, ProductDialog, {
        disableClose: true,
        data: product,
      });
      validateDispatcher(dispatchSpy);
    });
  });

  describe('dispatching selectProduct', () => {
    const productToUpdate = testDataFactory.product.tree();
    const selectedProduct = testDataFactory.product.tree();

    it('should open dialog and dispatch if submitted', () => {
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(selectedProduct),
      } as MatDialogRef<any>);

      dispatcher.dispatch(productEvents.selectProduct({
        productToUpdate,
      }));

      validateFunctionCall(mockMatDialog.functions.open, ProductSelectDialog, {
        disableClose: true,
        data: {
          productToUpdate,
        },
        height: '80vh',
        width: '90vw',
      });
      validateDispatcher(dispatchSpy, productEvents.productSelected(selectedProduct));
    });

    it('should open dialog and not dispatch anything if cancelled', () => {
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>);

      dispatcher.dispatch(productEvents.selectProduct({
        productToUpdate,
      }));

      validateFunctionCall(mockMatDialog.functions.open, ProductSelectDialog, {
        disableClose: true,
        data: {
          productToUpdate,
        },
        height: '80vh',
        width: '90vw',
      });
      validateDispatcher(dispatchSpy);
    });
  });

  describe('dispatching mergeProducts', () => {
    const product = testDataFactory.product.tree();
    const sourceProductId = testDataFactory.product.id();

    it('should open dialog and dispatch if submitted', () => {
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of({
          sourceProductIds: [sourceProductId],
          targetProductId: product.productId,
        }),
      } as MatDialogRef<any>);

      dispatcher.dispatch(productEvents.mergeProducts(product));

      validateFunctionCall(mockMatDialog.functions.open, ProductMergeDialog, {
        disableClose: true,
        data: product,
        height: '80vh',
        width: '90vw',
      });
      validateDispatcher(dispatchSpy, productApiEvents.mergeProductsInitiated({
        sourceProductIds: [sourceProductId],
        targetProductId: product.productId,
      }));
    });

    it('should open dialog and not dispatch anything if cancelled', () => {
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>);

      dispatcher.dispatch(productEvents.mergeProducts(product));

      validateFunctionCall(mockMatDialog.functions.open, ProductMergeDialog, {
        disableClose: true,
        data: product,
        height: '80vh',
        width: '90vw',
      });
      validateDispatcher(dispatchSpy);
    });
  });

  describe('dispatching deleteProduct', () => {
    const product = testDataFactory.product.tree();

    it('should open dialog and dispatch if confirmed', () => {
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(true));

      dispatcher.dispatch(productEvents.deleteProduct(product));

      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Törölni akarod ezt a terméket?',
        content: product.name,
      });
      validateDispatcher(dispatchSpy, productApiEvents.deleteProductInitiated({
        productId: product.productId,
      }));
    });

    it('should open dialog and not dispatch anything if cancelled', () => {
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(false));

      dispatcher.dispatch(productEvents.deleteProduct(product));

      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Törölni akarod ezt a terméket?',
        content: product.name,
      });
      validateDispatcher(dispatchSpy);
    });
  });

  describe('dispatching openProductListItemSubmenu', () => {
    const productWithoutChildren: ProductTreeNode = testDataFactory.product.tree();
    const productWithChildren: ProductTreeNode = testDataFactory.product.tree({
      children: [testDataFactory.product.treeItem.specific()],
    });

    describe('bottom sheet', () => {
      it('should offer edit, merge and delete for a generic product without children', () => {
        dismissWith(undefined);

        dispatcher.dispatch(productEvents.openProductListItemSubmenu(productWithoutChildren));

        validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, productWithoutChildren.name, 'edit', 'merge', 'delete');
      });

      it('should offer edit, merge and delete for a specific product without children', () => {
        const specificProduct = testDataFactory.product.treeItem.specific();
        dismissWith(undefined);

        dispatcher.dispatch(productEvents.openProductListItemSubmenu(specificProduct));

        validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, specificProduct.name, 'edit', 'merge', 'delete');
      });

      it('should offer edit, merge and delete for a variant product', () => {
        const variantProduct = testDataFactory.product.treeItem.variant();
        dismissWith(undefined);

        dispatcher.dispatch(productEvents.openProductListItemSubmenu(variantProduct));

        validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, variantProduct.name, 'edit', 'merge', 'delete');
      });

      it('should offer only edit and merge for a generic product with children', () => {
        dismissWith(undefined);

        dispatcher.dispatch(productEvents.openProductListItemSubmenu(productWithChildren));

        validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, productWithChildren.name, 'edit', 'merge');
      });

      it('should offer only edit and merge for a specific product with children', () => {
        const specificProduct = testDataFactory.product.treeItem.specific({
          children: [testDataFactory.product.treeItem.variant()],
        });
        dismissWith(undefined);

        dispatcher.dispatch(productEvents.openProductListItemSubmenu(specificProduct));

        validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, specificProduct.name, 'edit', 'merge');
      });
    });

    describe('selected action', () => {
      it('should dispatch updateProduct if edit is selected', () => {
        dismissWith('edit');

        dispatcher.dispatch(productEvents.openProductListItemSubmenu(productWithoutChildren));

        validateDispatcher(dispatchSpy, productEvents.updateProduct(productWithoutChildren));
      });

      it('should dispatch mergeProducts if merge is selected', () => {
        dismissWith('merge');

        dispatcher.dispatch(productEvents.openProductListItemSubmenu(productWithoutChildren));

        validateDispatcher(dispatchSpy, productEvents.mergeProducts(productWithoutChildren));
      });

      it('should dispatch deleteProduct if delete is selected', () => {
        dismissWith('delete');

        dispatcher.dispatch(productEvents.openProductListItemSubmenu(productWithoutChildren));

        validateDispatcher(dispatchSpy, productEvents.deleteProduct(productWithoutChildren));
      });

      it('should not dispatch anything if cancelled', () => {
        dismissWith(undefined);

        dispatcher.dispatch(productEvents.openProductListItemSubmenu(productWithoutChildren));

        validateDispatcher(dispatchSpy);
      });
    });
  });
});
