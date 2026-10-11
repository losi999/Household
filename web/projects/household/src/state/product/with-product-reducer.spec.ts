import { TestBed } from '@angular/core/testing';
import { Dispatcher } from '@ngrx/signals/events';
import { signalStore, withState } from '@ngrx/signals';
import { productApiEvents, productEvents } from '@household/state/product/product-events';
import { ProductState } from '@household/state/product/product-store';
import { withProductReducer } from '@household/state/product/with-product-reducer';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { getSpecificProductFullName, getVariantProductFullName } from '@household/shared/common/utils';
import { ProductType } from '@household/shared/enums';
import { Responses } from '@household/shared/types/responses';

const createTestStore = (state: ProductState) => {
  return signalStore({
    providedIn: 'root',
  }, withState<ProductState>(state), withProductReducer());
};

describe('withProductReducer', () => {
  let initialState: ProductState;
  let store: InstanceType<ReturnType<typeof createTestStore>>;
  let dispatcher: Dispatcher;

  // builders of consistent products, the full names are built the same way as the API builds them
  const generic = (name: string) => {
    return testDataFactory.product.response.generic({
      name,
      fullName: name,
    });
  };

  const specific = (parent: Responses.GenericProduct, name: string, measurement = 1, unitOfMeasurement: Responses.SpecificProduct['unitOfMeasurement'] = 'kg') => {
    return testDataFactory.product.response.specific({
      name,
      measurement,
      unitOfMeasurement,
      genericProductId: parent.productId,
      fullName: getSpecificProductFullName(parent.fullName, {
        name,
        measurement,
        unitOfMeasurement,
      }),
    });
  };

  const variant = (parent: Responses.SpecificProduct, name: string) => {
    return testDataFactory.product.response.variant({
      name,
      genericProductId: parent.genericProductId,
      specificProductId: parent.productId,
      fullName: getVariantProductFullName(parent.fullName, name),
    });
  };

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

  describe('createProduct', () => {
    it('should clear the pending parent product', () => {
      setup({
        pendingParentProduct: generic('parent'),
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
        pendingParentProduct: generic('parent'),
      });

      dispatcher.dispatch(productEvents.updateProduct(generic('product')));

      validateState({
        pendingParentProduct: undefined,
      });
    });
  });

  describe('selectProduct', () => {
    it('should clear the pending parent product', () => {
      setup({
        pendingParentProduct: generic('parent'),
      });

      dispatcher.dispatch(productEvents.selectProduct({
        productToUpdate: generic('product'),
      }));

      validateState({
        pendingParentProduct: undefined,
      });
    });
  });

  describe('productSelected', () => {
    it('should store the selected product as the pending parent product', () => {
      const product = generic('parent');

      dispatcher.dispatch(productEvents.productSelected(product));

      validateState({
        pendingParentProduct: product,
      });
    });
  });

  describe('listProductsCompleted', () => {
    it('should store the products in the given order', () => {
      const g = generic('a generic');
      const s = specific(g, 'a specific');
      const v = variant(s, 'a variant');

      dispatcher.dispatch(productApiEvents.listProductsCompleted([
        g,
        s,
        v,
      ]));

      validateState({
        productList: [
          g,
          s,
          v,
        ],
      });
    });

    it('should replace the previously stored products', () => {
      setup({
        productList: [generic('old')],
      });
      const product = generic('new');

      dispatcher.dispatch(productApiEvents.listProductsCompleted([product]));

      validateState({
        productList: [product],
      });
    });
  });

  describe('createProductCompleted', () => {
    it('should add a generic product in the order of the full names', () => {
      const existing = generic('b generic');
      const productId = testDataFactory.product.id();
      setup({
        productList: [existing],
      });

      dispatcher.dispatch(productApiEvents.createProductCompleted({
        productId,
        ...testDataFactory.product.request.generic({
          name: 'a generic',
        }),
      }));

      validateState({
        productList: [
          {
            productId,
            productType: ProductType.Generic,
            name: 'a generic',
            fullName: 'a generic',
          },
          existing,
        ],
      });
    });

    it('should add a specific product with its full name and generic product right after its generic product', () => {
      const g = generic('a generic');
      const other = generic('b generic');
      const productId = testDataFactory.product.id();
      setup({
        productList: [
          g,
          other,
        ],
      });

      dispatcher.dispatch(productApiEvents.createProductCompleted({
        productId,
        ...testDataFactory.product.request.specific({
          name: 'specific',
          measurement: 2,
          unitOfMeasurement: 'kg',
          parentProductId: g.productId,
        }),
      }));

      validateState({
        productList: [
          g,
          {
            productId,
            productType: ProductType.Specific,
            name: 'specific',
            fullName: 'a generic / specific 2 kg',
            measurement: 2,
            unitOfMeasurement: 'kg',
            genericProductId: g.productId,
          },
          other,
        ],
      });
    });

    it('should add a variant product with its full name and both of its parents', () => {
      const g = generic('a generic');
      const s = specific(g, 'a specific');
      const productId = testDataFactory.product.id();
      setup({
        productList: [
          g,
          s,
        ],
      });

      dispatcher.dispatch(productApiEvents.createProductCompleted({
        productId,
        ...testDataFactory.product.request.variant({
          name: 'variant',
          parentProductId: s.productId,
        }),
      }));

      validateState({
        productList: [
          g,
          s,
          {
            productId,
            productType: ProductType.Variant,
            name: 'variant',
            fullName: 'a generic / a specific 1 kg / variant',
            genericProductId: g.productId,
            specificProductId: s.productId,
          },
        ],
      });
    });
  });

  describe('updateProductInitiated', () => {
    it('should mark the product as in progress', () => {
      const product = generic('product');
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
      const product = generic('product');
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
    it('should rename a generic product and rebuild the full names of its specific and variant products', () => {
      const g = generic('a generic');
      const s = specific(g, 'a specific');
      const v = variant(s, 'a variant');
      const other = generic('b generic');
      setup({
        isInProgress: [g.productId],
        productList: [
          g,
          s,
          v,
          other,
        ],
      });

      dispatcher.dispatch(productApiEvents.updateProductCompleted({
        productId: g.productId,
        ...testDataFactory.product.request.generic({
          name: 'c generic',
        }),
      }));

      validateState({
        isInProgress: [],
        productList: [
          other,
          {
            ...g,
            name: 'c generic',
            fullName: 'c generic',
          },
          {
            ...s,
            fullName: 'c generic / a specific 1 kg',
          },
          {
            ...v,
            fullName: 'c generic / a specific 1 kg / a variant',
          },
        ],
      });
    });

    it('should change a specific product and rebuild the full names of its variant products', () => {
      const g = generic('a generic');
      const s = specific(g, 'a specific');
      const v = variant(s, 'a variant');
      setup({
        isInProgress: [s.productId],
        productList: [
          g,
          s,
          v,
        ],
      });

      dispatcher.dispatch(productApiEvents.updateProductCompleted({
        productId: s.productId,
        ...testDataFactory.product.request.specific({
          name: 'b specific',
          measurement: 2,
          unitOfMeasurement: 'l',
          parentProductId: g.productId,
        }),
      }));

      validateState({
        isInProgress: [],
        productList: [
          g,
          {
            ...s,
            name: 'b specific',
            measurement: 2,
            unitOfMeasurement: 'l',
            fullName: 'a generic / b specific 2 l',
          },
          {
            ...v,
            fullName: 'a generic / b specific 2 l / a variant',
          },
        ],
      });
    });

    it('should move a specific product with its variant products to another generic product', () => {
      const sourceGeneric = generic('a generic');
      const targetGeneric = generic('b generic');
      const s = specific(sourceGeneric, 'a specific');
      const v = variant(s, 'a variant');
      setup({
        isInProgress: [s.productId],
        productList: [
          sourceGeneric,
          s,
          v,
          targetGeneric,
        ],
      });

      dispatcher.dispatch(productApiEvents.updateProductCompleted({
        productId: s.productId,
        ...testDataFactory.product.request.specific({
          name: 'a specific',
          measurement: 1,
          unitOfMeasurement: 'kg',
          parentProductId: targetGeneric.productId,
        }),
      }));

      validateState({
        isInProgress: [],
        productList: [
          sourceGeneric,
          targetGeneric,
          {
            ...s,
            genericProductId: targetGeneric.productId,
            fullName: 'b generic / a specific 1 kg',
          },
          {
            ...v,
            genericProductId: targetGeneric.productId,
            fullName: 'b generic / a specific 1 kg / a variant',
          },
        ],
      });
    });

    it('should turn a variant product into a specific product of a generic product', () => {
      const g = generic('a generic');
      const s = specific(g, 'a specific');
      const v = variant(s, 'a variant');
      setup({
        isInProgress: [v.productId],
        productList: [
          g,
          s,
          v,
        ],
      });

      dispatcher.dispatch(productApiEvents.updateProductCompleted({
        productId: v.productId,
        ...testDataFactory.product.request.specific({
          name: 'was a variant',
          measurement: 1,
          unitOfMeasurement: 'db',
          parentProductId: g.productId,
        }),
      }));

      validateState({
        isInProgress: [],
        productList: [
          g,
          s,
          {
            productId: v.productId,
            productType: ProductType.Specific,
            name: 'was a variant',
            fullName: 'a generic / was a variant 1 db',
            measurement: 1,
            unitOfMeasurement: 'db',
            genericProductId: g.productId,
          },
        ],
      });
    });

    it('should turn a specific product without children into a variant product of another specific product', () => {
      const g = generic('a generic');
      const specificToUpdate = specific(g, 'a specific');
      const targetSpecific = specific(g, 'b specific');
      setup({
        isInProgress: [specificToUpdate.productId],
        productList: [
          g,
          specificToUpdate,
          targetSpecific,
        ],
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
          g,
          targetSpecific,
          {
            productId: specificToUpdate.productId,
            productType: ProductType.Variant,
            name: 'now a variant',
            fullName: 'a generic / b specific 1 kg / now a variant',
            genericProductId: g.productId,
            specificProductId: targetSpecific.productId,
          },
        ],
      });
    });

    it('should turn a specific product without children into a generic product', () => {
      const g = generic('b generic');
      const s = specific(g, 'a specific');
      setup({
        isInProgress: [s.productId],
        productList: [
          g,
          s,
        ],
      });

      dispatcher.dispatch(productApiEvents.updateProductCompleted({
        productId: s.productId,
        ...testDataFactory.product.request.generic({
          name: 'a generic',
        }),
      }));

      validateState({
        isInProgress: [],
        productList: [
          {
            productId: s.productId,
            productType: ProductType.Generic,
            name: 'a generic',
            fullName: 'a generic',
          },
          g,
        ],
      });
    });
  });

  describe('deleteProductInitiated', () => {
    it('should mark the product as in progress', () => {
      const product = generic('product');
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
      const product = generic('product');
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
    it('should remove the product and clear its in progress flag', () => {
      const productToDelete = generic('a generic');
      const otherProduct = generic('b generic');
      const otherProductId = testDataFactory.product.id();
      setup({
        isInProgress: [
          otherProductId,
          productToDelete.productId,
        ],
        productList: [
          productToDelete,
          otherProduct,
        ],
      });

      dispatcher.dispatch(productApiEvents.deleteProductCompleted({
        productId: productToDelete.productId,
      }));

      validateState({
        isInProgress: [otherProductId],
        productList: [otherProduct],
      });
    });
  });

  describe('mergeProductsInitiated', () => {
    it('should mark the source products as in progress', () => {
      const target = generic('a generic');
      const source = generic('b generic');
      const otherProductId = testDataFactory.product.id();
      setup({
        isInProgress: [otherProductId],
        productList: [
          target,
          source,
        ],
      });

      dispatcher.dispatch(productApiEvents.mergeProductsInitiated({
        sourceProductIds: [source.productId],
        targetProductId: target.productId,
      }));

      validateState({
        isInProgress: [
          otherProductId,
          source.productId,
        ],
      });
    });
  });

  describe('mergeProductsFailed', () => {
    it('should clear the in progress flags of the source products', () => {
      const source1 = generic('a generic');
      const source2 = generic('b generic');
      const otherProductId = testDataFactory.product.id();
      setup({
        isInProgress: [
          otherProductId,
          source1.productId,
          source2.productId,
        ],
        productList: [
          source1,
          source2,
        ],
      });

      dispatcher.dispatch(productApiEvents.mergeProductsFailed({
        sourceProductIds: [
          source1.productId,
          source2.productId,
        ],
      }));

      validateState({
        isInProgress: [otherProductId],
      });
    });
  });

  describe('mergeProductsCompleted', () => {
    it('should remove the source generic products and move their specific and variant products under the target', () => {
      const target = generic('a generic');
      const targetSpecific = specific(target, 'a specific');
      const source = generic('b generic');
      const movedSpecific = specific(source, 'b specific');
      const movedVariant = variant(movedSpecific, 'b variant');
      const other = generic('c generic');
      const otherSpecific = specific(other, 'c specific');
      setup({
        isInProgress: [source.productId],
        productList: [
          target,
          targetSpecific,
          source,
          movedSpecific,
          movedVariant,
          other,
          otherSpecific,
        ],
      });

      dispatcher.dispatch(productApiEvents.mergeProductsCompleted({
        sourceProductIds: [source.productId],
        targetProductId: target.productId,
      }));

      validateState({
        isInProgress: [],
        productList: [
          target,
          targetSpecific,
          {
            ...movedSpecific,
            genericProductId: target.productId,
            fullName: 'a generic / b specific 1 kg',
          },
          {
            ...movedVariant,
            genericProductId: target.productId,
            fullName: 'a generic / b specific 1 kg / b variant',
          },
          other,
          otherSpecific,
        ],
      });
    });

    it('should remove the source specific products and move their variant products under the target', () => {
      const g = generic('a generic');
      const targetSpecific = specific(g, 'a specific');
      const targetVariant = variant(targetSpecific, 'a variant');
      const source = specific(g, 'b specific');
      const movedVariant = variant(source, 'b variant');
      setup({
        isInProgress: [source.productId],
        productList: [
          g,
          targetSpecific,
          targetVariant,
          source,
          movedVariant,
        ],
      });

      dispatcher.dispatch(productApiEvents.mergeProductsCompleted({
        sourceProductIds: [source.productId],
        targetProductId: targetSpecific.productId,
      }));

      validateState({
        isInProgress: [],
        productList: [
          g,
          targetSpecific,
          targetVariant,
          {
            ...movedVariant,
            specificProductId: targetSpecific.productId,
            fullName: 'a generic / a specific 1 kg / b variant',
          },
        ],
      });
    });

    it('should remove the source variant products', () => {
      const g = generic('a generic');
      const s = specific(g, 'a specific');
      const targetVariant = variant(s, 'a variant');
      const source = variant(s, 'b variant');
      setup({
        isInProgress: [source.productId],
        productList: [
          g,
          s,
          targetVariant,
          source,
        ],
      });

      dispatcher.dispatch(productApiEvents.mergeProductsCompleted({
        sourceProductIds: [source.productId],
        targetProductId: targetVariant.productId,
      }));

      validateState({
        isInProgress: [],
        productList: [
          g,
          s,
          targetVariant,
        ],
      });
    });
  });
});
