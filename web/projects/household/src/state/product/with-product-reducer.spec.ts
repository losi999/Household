import { TestBed } from '@angular/core/testing';
import { Dispatcher } from '@ngrx/signals/events';
import { signalStore, withState } from '@ngrx/signals';
import { productApiEvents, productEvents } from '@household/state/product/product-events';
import { ProductType } from '@household/shared/enums';
import { ProductState } from '@household/state/product/product-store';
import { withProductReducer } from '@household/state/product/with-product-reducer';
import { testDataFactory } from '@household/shared/common/test-data-factory';

const createTestStore = (state: ProductState) => {
  return signalStore({
    providedIn: 'root',
  }, withState<ProductState>(state), withProductReducer());
};

describe('withProductReducer', () => {
  let initialState: ProductState;
  let store: InstanceType<ReturnType<typeof createTestStore>>;
  let dispatcher: Dispatcher;

  const validateState = (currentValue?: Partial<ProductState>) => {
    expect(store.pendingParentProduct(), 'pendingParentProduct').toEqual(Object.hasOwn(currentValue ?? {}, 'pendingParentProduct') ? currentValue.pendingParentProduct : initialState.pendingParentProduct);
    expect(store.isInProgress(), 'isInProgress').toEqual(Object.hasOwn(currentValue ?? {}, 'isInProgress') ? currentValue.isInProgress : initialState.isInProgress);
    expect(store.productList(), 'productList').toEqual(Object.hasOwn(currentValue ?? {}, 'productList') ? currentValue.productList : initialState.productList);
  };

  const setup = (initial?: Partial<ProductState>) => {
    TestBed.resetTestingModule();

    initialState = {
      isInProgress: [],
      pendingParentProduct: undefined,
      productList: [],
      ...initial,
    };

    store = TestBed.inject(createTestStore(initialState));
    dispatcher = TestBed.inject(Dispatcher);
  };

  beforeEach(() => {
    setup();
  });

  describe('listProductsCompleted', () => {
    it('should store the product tree', () => {
      const productTree = testDataFactory.product.tree();

      dispatcher.dispatch(productApiEvents.listProductsCompleted([productTree]));

      validateState({
        productList: [productTree],
      });
    });

    it('should replace the previously stored product tree', () => {
      setup({
        productList: [testDataFactory.product.tree()],
      });
      const productTree = testDataFactory.product.tree();

      dispatcher.dispatch(productApiEvents.listProductsCompleted([productTree]));

      validateState({
        productList: [productTree],
      });
    });
  });

  describe('deleteProductInitiated', () => {
    it('should mark the product as in progress', () => {
      const product = testDataFactory.product.tree();
      const otherProductId = testDataFactory.product.id();
      setup({
        isInProgress: [otherProductId],
        productList: [product],
      });

      dispatcher.dispatch(productApiEvents.deleteProductInitiated({
        productId: product.productId,
      }));

      validateState({
        isInProgress: [
          otherProductId,
          product.productId,
        ],
      });
    });
  });

  describe('deleteProductFailed', () => {
    it('should clear the in progress flag of the product', () => {
      const product = testDataFactory.product.tree();
      const otherProductId = testDataFactory.product.id();
      setup({
        isInProgress: [
          otherProductId,
          product.productId,
        ],
        productList: [product],
      });

      dispatcher.dispatch(productApiEvents.deleteProductFailed({
        productId: product.productId,
      }));

      validateState({
        isInProgress: [otherProductId],
      });
    });
  });

  describe('deleteProductCompleted', () => {
    it('should remove a generic product and clear its in progress flag', () => {
      const genericToDelete = testDataFactory.product.tree();
      const otherGeneric = testDataFactory.product.tree();
      const otherProductId = testDataFactory.product.id();
      setup({
        isInProgress: [
          otherProductId,
          genericToDelete.productId,
        ],
        productList: [
          genericToDelete,
          otherGeneric,
        ],
      });

      dispatcher.dispatch(productApiEvents.deleteProductCompleted({
        productId: genericToDelete.productId,
      }));

      validateState({
        isInProgress: [otherProductId],
        productList: [otherGeneric],
      });
    });

    it('should remove a specific product from its generic product', () => {
      const specificToDelete = testDataFactory.product.treeItem.specific();
      const otherSpecific = testDataFactory.product.treeItem.specific();
      const generic = testDataFactory.product.tree({
        children: [
          specificToDelete,
          otherSpecific,
        ],
      });
      setup({
        isInProgress: [specificToDelete.productId],
        productList: [generic],
      });

      dispatcher.dispatch(productApiEvents.deleteProductCompleted({
        productId: specificToDelete.productId,
      }));

      validateState({
        isInProgress: [],
        productList: [
          {
            ...generic,
            children: [otherSpecific],
          },
        ],
      });
    });

    it('should remove a variant product from its specific product', () => {
      const variantToDelete = testDataFactory.product.treeItem.variant();
      const otherVariant = testDataFactory.product.treeItem.variant();
      const specific = testDataFactory.product.treeItem.specific({
        children: [
          variantToDelete,
          otherVariant,
        ],
      });
      const generic = testDataFactory.product.tree({
        children: [specific],
      });
      setup({
        isInProgress: [variantToDelete.productId],
        productList: [generic],
      });

      dispatcher.dispatch(productApiEvents.deleteProductCompleted({
        productId: variantToDelete.productId,
      }));

      validateState({
        isInProgress: [],
        productList: [
          {
            ...generic,
            children: [
              {
                ...specific,
                children: [otherVariant],
              },
            ],
          },
        ],
      });
    });
  });

  describe('mergeProductsInitiated', () => {
    it('should mark the source products as in progress', () => {
      const targetProduct = testDataFactory.product.tree();
      const sourceProduct = testDataFactory.product.tree();
      const otherProductId = testDataFactory.product.id();
      setup({
        isInProgress: [otherProductId],
        productList: [
          targetProduct,
          sourceProduct,
        ],
      });

      dispatcher.dispatch(productApiEvents.mergeProductsInitiated({
        sourceProductIds: [sourceProduct.productId],
        targetProductId: targetProduct.productId,
      }));

      validateState({
        isInProgress: [
          otherProductId,
          sourceProduct.productId,
        ],
      });
    });
  });

  describe('mergeProductsFailed', () => {
    it('should clear the in progress flags of the source products', () => {
      const sourceProduct1 = testDataFactory.product.tree();
      const sourceProduct2 = testDataFactory.product.tree();
      const otherProductId = testDataFactory.product.id();
      setup({
        isInProgress: [
          otherProductId,
          sourceProduct1.productId,
          sourceProduct2.productId,
        ],
        productList: [
          sourceProduct1,
          sourceProduct2,
        ],
      });

      dispatcher.dispatch(productApiEvents.mergeProductsFailed({
        sourceProductIds: [
          sourceProduct1.productId,
          sourceProduct2.productId,
        ],
      }));

      validateState({
        isInProgress: [otherProductId],
      });
    });
  });

  describe('mergeProductsCompleted', () => {
    it('should remove the source generic products and move their specific products under the target, ordered by name', () => {
      const specificB = testDataFactory.product.treeItem.specific({
        name: 'b specific',
      });
      const specificA = testDataFactory.product.treeItem.specific({
        name: 'a specific',
      });
      const specificC = testDataFactory.product.treeItem.specific({
        name: 'c specific',
      });
      const targetGeneric = testDataFactory.product.tree({
        children: [specificB],
      });
      const sourceGeneric1 = testDataFactory.product.tree({
        children: [specificC],
      });
      const sourceGeneric2 = testDataFactory.product.tree({
        children: [specificA],
      });
      const otherGeneric = testDataFactory.product.tree();
      setup({
        isInProgress: [
          sourceGeneric1.productId,
          sourceGeneric2.productId,
        ],
        productList: [
          targetGeneric,
          sourceGeneric1,
          otherGeneric,
          sourceGeneric2,
        ],
      });

      dispatcher.dispatch(productApiEvents.mergeProductsCompleted({
        sourceProductIds: [
          sourceGeneric1.productId,
          sourceGeneric2.productId,
        ],
        targetProductId: targetGeneric.productId,
      }));

      validateState({
        isInProgress: [],
        productList: [
          {
            ...targetGeneric,
            children: [
              specificA,
              specificB,
              specificC,
            ],
          },
          otherGeneric,
        ],
      });
    });

    it('should remove the source specific products and move their variant products under the target, ordered by name', () => {
      const variantB = testDataFactory.product.treeItem.variant({
        name: 'b variant',
      });
      const variantA = testDataFactory.product.treeItem.variant({
        name: 'a variant',
      });
      const targetSpecific = testDataFactory.product.treeItem.specific({
        children: [variantB],
      });
      const sourceSpecific = testDataFactory.product.treeItem.specific({
        children: [variantA],
      });
      const otherSpecific = testDataFactory.product.treeItem.specific();
      const generic = testDataFactory.product.tree({
        children: [
          targetSpecific,
          sourceSpecific,
          otherSpecific,
        ],
      });
      const otherGeneric = testDataFactory.product.tree({
        children: [testDataFactory.product.treeItem.specific()],
      });
      setup({
        isInProgress: [sourceSpecific.productId],
        productList: [
          generic,
          otherGeneric,
        ],
      });

      dispatcher.dispatch(productApiEvents.mergeProductsCompleted({
        sourceProductIds: [sourceSpecific.productId],
        targetProductId: targetSpecific.productId,
      }));

      validateState({
        isInProgress: [],
        productList: [
          {
            ...generic,
            children: [
              {
                ...targetSpecific,
                children: [
                  variantA,
                  variantB,
                ],
              },
              otherSpecific,
            ],
          },
          otherGeneric,
        ],
      });
    });

    it('should remove the source variant products', () => {
      const targetVariant = testDataFactory.product.treeItem.variant();
      const sourceVariant = testDataFactory.product.treeItem.variant();
      const otherVariant = testDataFactory.product.treeItem.variant();
      const specific = testDataFactory.product.treeItem.specific({
        children: [
          targetVariant,
          sourceVariant,
          otherVariant,
        ],
      });
      const generic = testDataFactory.product.tree({
        children: [specific],
      });
      setup({
        isInProgress: [sourceVariant.productId],
        productList: [generic],
      });

      dispatcher.dispatch(productApiEvents.mergeProductsCompleted({
        sourceProductIds: [sourceVariant.productId],
        targetProductId: targetVariant.productId,
      }));

      validateState({
        isInProgress: [],
        productList: [
          {
            ...generic,
            children: [
              {
                ...specific,
                children: [
                  targetVariant,
                  otherVariant,
                ],
              },
            ],
          },
        ],
      });
    });
  });

  describe('createProduct', () => {
    it('should clear the pending parent product', () => {
      setup({
        pendingParentProduct: testDataFactory.product.tree(),
      });

      dispatcher.dispatch(productEvents.createProduct());

      validateState({
        pendingParentProduct: undefined,
      });
    });
  });

  describe('updateProduct', () => {
    it('should clear the pending parent product', () => {
      setup({
        pendingParentProduct: testDataFactory.product.tree(),
      });

      dispatcher.dispatch(productEvents.updateProduct(testDataFactory.product.tree()));

      validateState({
        pendingParentProduct: undefined,
      });
    });
  });

  describe('selectProduct', () => {
    it('should clear the pending parent product', () => {
      setup({
        pendingParentProduct: testDataFactory.product.tree(),
      });

      dispatcher.dispatch(productEvents.selectProduct({
        productToUpdate: testDataFactory.product.tree(),
      }));

      validateState({
        pendingParentProduct: undefined,
      });
    });
  });

  describe('productSelected', () => {
    it('should store the selected product as the pending parent product', () => {
      const product = testDataFactory.product.tree();

      dispatcher.dispatch(productEvents.productSelected(product));

      validateState({
        pendingParentProduct: product,
      });
    });
  });

  describe('createProductCompleted', () => {
    it('should add a generic product ordered by name', () => {
      const existingGeneric = testDataFactory.product.tree({
        name: 'b generic',
      });
      const productId = testDataFactory.product.id();
      const request = testDataFactory.product.request.generic({
        name: 'a generic',
      });
      setup({
        productList: [existingGeneric],
      });

      dispatcher.dispatch(productApiEvents.createProductCompleted({
        productId,
        ...request,
      }));

      validateState({
        productList: [
          {
            productId,
            productType: ProductType.Generic,
            name: 'a generic',
            children: [],
          },
          existingGeneric,
        ],
      });
    });

    it('should add a specific product to its generic product with its full name', () => {
      const generic = testDataFactory.product.tree();
      const otherGeneric = testDataFactory.product.tree();
      const productId = testDataFactory.product.id();
      const request = testDataFactory.product.request.specific({
        name: 'specific',
        measurement: 2,
        unitOfMeasurement: 'kg',
        parentProductId: generic.productId,
      });
      setup({
        productList: [
          generic,
          otherGeneric,
        ],
      });

      dispatcher.dispatch(productApiEvents.createProductCompleted({
        productId,
        ...request,
      }));

      validateState({
        productList: [
          {
            ...generic,
            children: [
              {
                productId,
                productType: ProductType.Specific,
                name: 'specific',
                fullName: 'specific 2 kg',
                measurement: 2,
                unitOfMeasurement: 'kg',
                children: [],
              },
            ],
          },
          otherGeneric,
        ],
      });
    });

    it('should add a variant product to its specific product', () => {
      const specific = testDataFactory.product.treeItem.specific();
      const generic = testDataFactory.product.tree({
        children: [specific],
      });
      const productId = testDataFactory.product.id();
      const request = testDataFactory.product.request.variant({
        name: 'variant',
        parentProductId: specific.productId,
      });
      setup({
        productList: [generic],
      });

      dispatcher.dispatch(productApiEvents.createProductCompleted({
        productId,
        ...request,
      }));

      validateState({
        productList: [
          {
            ...generic,
            children: [
              {
                ...specific,
                children: [
                  {
                    productId,
                    productType: ProductType.Variant,
                    name: 'variant',
                  },
                ],
              },
            ],
          },
        ],
      });
    });
  });

  describe('updateProductInitiated', () => {
    it('should mark the product as in progress', () => {
      const product = testDataFactory.product.tree();
      const otherProductId = testDataFactory.product.id();
      setup({
        isInProgress: [otherProductId],
        productList: [product],
      });

      dispatcher.dispatch(productApiEvents.updateProductInitiated({
        productId: product.productId,
        ...testDataFactory.product.request.generic(),
      }));

      validateState({
        isInProgress: [
          otherProductId,
          product.productId,
        ],
      });
    });
  });

  describe('updateProductFailed', () => {
    it('should clear the in progress flag of the product', () => {
      const product = testDataFactory.product.tree();
      const otherProductId = testDataFactory.product.id();
      setup({
        isInProgress: [
          otherProductId,
          product.productId,
        ],
        productList: [product],
      });

      dispatcher.dispatch(productApiEvents.updateProductFailed({
        productId: product.productId,
      }));

      validateState({
        isInProgress: [otherProductId],
      });
    });
  });

  describe('updateProductCompleted', () => {
    it('should rename a generic product keeping its children and the order by name', () => {
      const specific = testDataFactory.product.treeItem.specific();
      const generic = testDataFactory.product.tree({
        name: 'a generic',
        children: [specific],
      });
      const otherGeneric = testDataFactory.product.tree({
        name: 'b generic',
      });
      setup({
        isInProgress: [generic.productId],
        productList: [
          generic,
          otherGeneric,
        ],
      });

      dispatcher.dispatch(productApiEvents.updateProductCompleted({
        productId: generic.productId,
        ...testDataFactory.product.request.generic({
          name: 'c generic',
        }),
      }));

      validateState({
        isInProgress: [],
        productList: [
          otherGeneric,
          {
            ...generic,
            name: 'c generic',
          },
        ],
      });
    });

    it('should move a specific product with its variants to another generic product', () => {
      const variant = testDataFactory.product.treeItem.variant();
      const specific = testDataFactory.product.treeItem.specific({
        children: [variant],
      });
      const sourceGeneric = testDataFactory.product.tree({
        children: [specific],
      });
      const targetGeneric = testDataFactory.product.tree();
      setup({
        isInProgress: [specific.productId],
        productList: [
          sourceGeneric,
          targetGeneric,
        ],
      });

      dispatcher.dispatch(productApiEvents.updateProductCompleted({
        productId: specific.productId,
        ...testDataFactory.product.request.specific({
          name: 'moved',
          measurement: 3,
          unitOfMeasurement: 'l',
          parentProductId: targetGeneric.productId,
        }),
      }));

      validateState({
        isInProgress: [],
        productList: [
          {
            ...sourceGeneric,
            children: [],
          },
          {
            ...targetGeneric,
            children: [
              {
                productId: specific.productId,
                productType: ProductType.Specific,
                name: 'moved',
                fullName: 'moved 3 l',
                measurement: 3,
                unitOfMeasurement: 'l',
                children: [variant],
              },
            ],
          },
        ],
      });
    });

    it('should turn a variant product into a specific product of a generic product', () => {
      const variant = testDataFactory.product.treeItem.variant();
      const specific = testDataFactory.product.treeItem.specific({
        name: 'z specific',
        children: [variant],
      });
      const generic = testDataFactory.product.tree({
        children: [specific],
      });
      setup({
        isInProgress: [variant.productId],
        productList: [generic],
      });

      dispatcher.dispatch(productApiEvents.updateProductCompleted({
        productId: variant.productId,
        ...testDataFactory.product.request.specific({
          name: 'was a variant',
          measurement: 1,
          unitOfMeasurement: 'db',
          parentProductId: generic.productId,
        }),
      }));

      validateState({
        isInProgress: [],
        productList: [
          {
            ...generic,
            children: [
              {
                productId: variant.productId,
                productType: ProductType.Specific,
                name: 'was a variant',
                fullName: 'was a variant 1 db',
                measurement: 1,
                unitOfMeasurement: 'db',
                children: [],
              },
              {
                ...specific,
                children: [],
              },
            ],
          },
        ],
      });
    });

    it('should turn a specific product without children into a variant product of another specific product', () => {
      const specificToUpdate = testDataFactory.product.treeItem.specific({
        name: 'a specific',
      });
      const targetSpecific = testDataFactory.product.treeItem.specific({
        name: 'b specific',
      });
      const generic = testDataFactory.product.tree({
        children: [
          specificToUpdate,
          targetSpecific,
        ],
      });
      setup({
        isInProgress: [specificToUpdate.productId],
        productList: [generic],
      });

      dispatcher.dispatch(productApiEvents.updateProductCompleted({
        productId: specificToUpdate.productId,
        ...testDataFactory.product.request.variant({
          name: 'now a variant',
          parentProductId: targetSpecific.productId,
        }),
      }));

      validateState({
        isInProgress: [],
        productList: [
          {
            ...generic,
            children: [
              {
                ...targetSpecific,
                children: [
                  {
                    productId: specificToUpdate.productId,
                    productType: ProductType.Variant,
                    name: 'now a variant',
                  },
                ],
              },
            ],
          },
        ],
      });
    });

    it('should turn a specific product without children into a generic product', () => {
      const specific = testDataFactory.product.treeItem.specific();
      const generic = testDataFactory.product.tree({
        name: 'b generic',
        children: [specific],
      });
      setup({
        isInProgress: [specific.productId],
        productList: [generic],
      });

      dispatcher.dispatch(productApiEvents.updateProductCompleted({
        productId: specific.productId,
        ...testDataFactory.product.request.generic({
          name: 'a generic',
        }),
      }));

      validateState({
        isInProgress: [],
        productList: [
          {
            productId: specific.productId,
            productType: ProductType.Generic,
            name: 'a generic',
            children: [],
          },
          {
            ...generic,
            children: [],
          },
        ],
      });
    });
  });
});
