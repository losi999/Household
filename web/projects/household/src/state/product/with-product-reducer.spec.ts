import { TestBed } from '@angular/core/testing';
import { Dispatcher } from '@ngrx/signals/events';
import { signalStore, withState } from '@ngrx/signals';
import { productApiEvents, productEvents } from '@household/state/product/product-events';
import { ProductState } from '@household/state/product/product-store';
import { withProductReducer } from '@household/state/product/with-product-reducer';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { getSpecificProductFullName, getVariantProductFullName } from '@household/shared/common/utils';
import { ProductType } from '@household/shared/enums';
import { PRODUCT_FULL_NAME_SEPARATOR } from '@household/shared/constants';

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
    expect(store.selectedProduct(), 'selectedProduct').toEqual(Object.hasOwn(currentValue ?? {}, 'selectedProduct') ? currentValue.selectedProduct : initialState.selectedProduct);
    expect(store.isInProgress(), 'isInProgress').toEqual(Object.hasOwn(currentValue ?? {}, 'isInProgress') ? currentValue.isInProgress : initialState.isInProgress);
    expect(store.productList(), 'productList').toEqual(Object.hasOwn(currentValue ?? {}, 'productList') ? currentValue.productList : initialState.productList);
  };

  const setup = (initial?: Partial<ProductState>) => {
    TestBed.resetTestingModule();

    initialState = {
      isInProgress: [],
      selectedProduct: undefined,
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
    it('should clear the selected product', () => {
      setup({
        selectedProduct: testDataFactory.product.response.generic({
          name: 'parent',
        }),
      });

      dispatcher.dispatch(productEvents.createProduct());

      validateState({
        selectedProduct: undefined,
      });
    });
  });

  describe('updateProduct', () => {
    it('should clear the selected product', () => {
      setup({
        selectedProduct: testDataFactory.product.response.generic({
          name: 'parent',
        }),
      });

      dispatcher.dispatch(productEvents.updateProduct(testDataFactory.product.response.generic({
        name: 'product',
      })));

      validateState({
        selectedProduct: undefined,
      });
    });
  });

  describe('selectProduct', () => {
    it('should clear the selected product', () => {
      setup({
        selectedProduct: testDataFactory.product.response.generic({
          name: 'parent',
        }),
      });

      dispatcher.dispatch(productEvents.selectProduct(undefined));

      validateState({
        selectedProduct: undefined,
      });
    });
  });

  describe('productSelected', () => {
    it('should store the selected product', () => {
      const product = testDataFactory.product.response.generic({
        name: 'parent',
      });

      dispatcher.dispatch(productEvents.productSelected(product));

      validateState({
        selectedProduct: product,
      });
    });
  });

  describe('listProductsCompleted', () => {
    it('should replace the previously stored products', () => {
      setup({
        productList: [
          testDataFactory.product.response.generic({
            name: 'old',
          }),
        ],
      });
      const product = testDataFactory.product.response.generic({
        name: 'ékezetes név',
      });

      dispatcher.dispatch(productApiEvents.listProductsCompleted([product]));

      validateState({
        productList: [
          {
            ...product,
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
        ],
      });
    });
  });

  describe('createProductCompleted', () => {
    it('should add a generic product in the order of the full names', () => {
      const existing = testDataFactory.product.response.generic({
        name: 'z generic',
      });
      const productId = testDataFactory.product.id();
      setup({
        productList: [existing],
      });

      const name = 'ékezetes név';

      dispatcher.dispatch(productApiEvents.createProductCompleted({
        productId,
        ...testDataFactory.product.request.generic({
          name,
        }),
      }));

      validateState({
        productList: [
          {
            productId,
            productType: ProductType.Generic,
            name,
            fullName: name,
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
          existing,
        ],
      });
    });

    it('should add a specific product with its full name and generic product right after its generic product', () => {
      const generic = testDataFactory.product.response.generic({
        name: 'a generic',
      });
      const productId = testDataFactory.product.id();
      setup({
        productList: [generic],
      });

      const name = 'ékezetes név';
      const request = testDataFactory.product.request.specific({
        name,
        parentProductId: generic.productId,
      });

      dispatcher.dispatch(productApiEvents.createProductCompleted({
        productId,
        ...request,
      }));

      validateState({
        productList: [
          generic,
          {
            productId,
            measurement: request.measurement,
            name: request.name,
            unitOfMeasurement: request.unitOfMeasurement,
            productType: ProductType.Specific,
            fullName: getSpecificProductFullName(generic.name, request),
            genericProductId: generic.productId,
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
        ],
      });
    });

    it('should add a variant product with its full name and both of its parents', () => {
      const specific = testDataFactory.product.response.specific();
      const productId = testDataFactory.product.id();
      setup({
        productList: [specific],
      });

      const name = 'ékezetes név';
      const request = testDataFactory.product.request.variant({
        name,
        parentProductId: specific.productId,
      });

      dispatcher.dispatch(productApiEvents.createProductCompleted({
        productId,
        ...request,
      }));

      validateState({
        productList: [
          specific,
          {
            productId,
            productType: ProductType.Variant,
            name: request.name,
            fullName: getVariantProductFullName(specific.fullName, request.name),
            genericProductId: specific.genericProductId,
            specificProductId: specific.productId,
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
        ],
      });
    });
  });

  describe('updateProductInitiated', () => {
    it('should mark the product as in progress', () => {
      const product = testDataFactory.product.response.generic();
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
      const product = testDataFactory.product.response.generic();
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
      const generic = testDataFactory.product.response.generic();
      const specific = testDataFactory.product.response.specific({
        genericProduct: generic,
      });
      const variant = testDataFactory.product.response.variant({
        specificProduct: specific,
      });
      setup({
        isInProgress: [generic.productId],
        productList: [
          generic,
          specific,
          variant,
        ],
      });

      const name = 'ékezetes név';

      dispatcher.dispatch(productApiEvents.updateProductCompleted({
        productId: generic.productId,
        ...testDataFactory.product.request.generic({
          name,
        }),
      }));

      validateState({
        isInProgress: [],
        productList: [
          {
            ...generic,
            name,
            fullName: name,
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
          {
            ...specific,
            fullName: getSpecificProductFullName(name, specific),
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
          {
            ...variant,
            fullName: getVariantProductFullName(getSpecificProductFullName(name, specific), variant.name),
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
        ],
      });
    });

    it('should change a specific product and rebuild the full names of its variant products', () => {
      const generic = testDataFactory.product.response.generic();
      const specific = testDataFactory.product.response.specific({
        genericProduct: generic,
      });
      const variant = testDataFactory.product.response.variant({
        specificProduct: specific,
      });
      setup({
        isInProgress: [specific.productId],
        productList: [
          generic,
          specific,
          variant,
        ],
      });

      const name = 'ékezetes név';
      const request = testDataFactory.product.request.specific({
        name,
        parentProductId: generic.productId,
      });

      dispatcher.dispatch(productApiEvents.updateProductCompleted({
        productId: specific.productId,
        ...request,
      }));

      validateState({
        isInProgress: [],
        productList: [
          generic,
          {
            ...specific,
            name,
            measurement: request.measurement,
            unitOfMeasurement: request.unitOfMeasurement,
            fullName: getSpecificProductFullName(generic.name, request),
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
          {
            ...variant,
            fullName: getVariantProductFullName(getSpecificProductFullName(generic.name, request), variant.name),
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
        ],
      });
    });

    it('should rename a variant product', () => {
      const generic = testDataFactory.product.response.generic();
      const specific = testDataFactory.product.response.specific({
        genericProduct: generic,
      });
      const variant = testDataFactory.product.response.variant({
        specificProduct: specific,
      });
      setup({
        isInProgress: [variant.productId],
        productList: [
          generic,
          specific,
          variant,
        ],
      });

      const name = 'ékezetes név';
      const request = testDataFactory.product.request.variant({
        name,
        parentProductId: specific.productId,
      });

      dispatcher.dispatch(productApiEvents.updateProductCompleted({
        productId: variant.productId,
        ...request,
      }));

      validateState({
        isInProgress: [],
        productList: [
          generic,
          specific,
          {
            ...variant,
            name,
            fullName: getVariantProductFullName(specific.fullName, name),
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
        ],
      });
    });

    it('should move a specific product with its variant products to another generic product', () => {
      const sourceGeneric = testDataFactory.product.response.generic({
        name: 'a generic',
      });
      const targetGeneric = testDataFactory.product.response.generic({
        name: 'z generic',
      });
      const specific = testDataFactory.product.response.specific({
        genericProduct: sourceGeneric,
      });
      const variant = testDataFactory.product.response.variant({
        specificProduct: specific,
      });
      setup({
        isInProgress: [specific.productId],
        productList: [
          sourceGeneric,
          specific,
          variant,
          targetGeneric,
        ],
      });

      const name = 'ékezetes név';
      const request = testDataFactory.product.request.specific({
        name,
        parentProductId: targetGeneric.productId,
      });

      dispatcher.dispatch(productApiEvents.updateProductCompleted({
        productId: specific.productId,
        ...request,
      }));
      
      validateState({
        isInProgress: [],
        productList: [
          sourceGeneric,
          targetGeneric,
          {
            ...specific,
            name,
            measurement: request.measurement,
            unitOfMeasurement: request.unitOfMeasurement,
            genericProductId: targetGeneric.productId,
            fullName: getSpecificProductFullName(targetGeneric.name, request),
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
          {
            ...variant,
            genericProductId: targetGeneric.productId,
            fullName: getVariantProductFullName(getSpecificProductFullName(targetGeneric.name, request), variant.name),
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
        ],
      });
    });

    it('should move a variant product to another specific product', () => {
      const sourceGeneric = testDataFactory.product.response.generic({
        name: 'a generic',
      });
      const targetGeneric = testDataFactory.product.response.generic({
        name: 'b generic',
      });
      const sourceSpecific = testDataFactory.product.response.specific({
        response: {
          name: 'a specific',
        },
        genericProduct: sourceGeneric,
      });
      const targetSpecific = testDataFactory.product.response.specific({
        response: {
          name: 'b specific',
        },
        genericProduct: targetGeneric,
      });
      const variant = testDataFactory.product.response.variant({
        specificProduct: sourceSpecific,
      });

      setup({
        isInProgress: [variant.productId],
        productList: [
          sourceGeneric,
          sourceSpecific,
          variant,
          targetGeneric,
          targetSpecific,
        ],
      });

      const name = 'ékezetes név';
      const request = testDataFactory.product.request.variant({
        name,
        parentProductId: targetSpecific.productId,
      });

      dispatcher.dispatch(productApiEvents.updateProductCompleted({
        productId: variant.productId,
        ...request,
      }));
      
      validateState({
        isInProgress: [],
        productList: [
          sourceGeneric,
          sourceSpecific,
          targetGeneric, 
          targetSpecific,
          {
            ...variant,
            specificProductId: targetSpecific.productId,
            genericProductId: targetGeneric.productId,
            name,
            fullName: getVariantProductFullName(targetSpecific.fullName, name),
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
        ],
      });
    });

    it('should turn a generic product without children into a specific product of a different generic product', () => {
      const generic = testDataFactory.product.response.generic();
      const targetGeneric = testDataFactory.product.response.generic();
      setup({
        isInProgress: [generic.productId],
        productList: [
          generic,
          targetGeneric,
        ],
      });

      const name = 'ékezetes név';
      const request = testDataFactory.product.request.specific({
        name,
        parentProductId: targetGeneric.productId,
      });

      dispatcher.dispatch(productApiEvents.updateProductCompleted({
        productId: generic.productId,
        ...request,
      }));

      validateState({
        isInProgress: [],
        productList: [
          targetGeneric,
          {
            productId: generic.productId,
            productType: ProductType.Specific,
            name,
            fullName: getSpecificProductFullName(targetGeneric.name, request),
            measurement: request.measurement,
            unitOfMeasurement: request.unitOfMeasurement,
            genericProductId: targetGeneric.productId,
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
        ],
      });

    });

    it('should turn a generic product without children into a variant product of a specific product', () => {
      const sourceGeneric = testDataFactory.product.response.generic();
      const targetGeneric = testDataFactory.product.response.generic({
        name: 'a generic',
      });
      const targetSpecific = testDataFactory.product.response.specific({
        response: {
          name: 'a specific',
        },
        genericProduct: targetGeneric,
      });

      setup({
        isInProgress: [sourceGeneric.productId],
        productList: [
          sourceGeneric,
          targetGeneric,
          targetSpecific,
        ],
      });

      const name = 'ékezetes név';
      const request = testDataFactory.product.request.variant({
        name,
        parentProductId: targetSpecific.productId,
      });

      dispatcher.dispatch(productApiEvents.updateProductCompleted({
        productId: sourceGeneric.productId,
        ...request,
      }));
      
      validateState({
        isInProgress: [],
        productList: [
          targetGeneric, 
          targetSpecific,
          {
            productId: sourceGeneric.productId,
            productType: ProductType.Variant,
            specificProductId: targetSpecific.productId,
            genericProductId: targetGeneric.productId,
            name,
            fullName: getVariantProductFullName(targetSpecific.fullName, name),
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
        ],
      });
    });

    it('should turn a specific product without children into a variant product of another specific product', () => {
      const generic = testDataFactory.product.response.generic();
      const specificToUpdate = testDataFactory.product.response.specific({
        genericProduct: generic,
      });
      const targetSpecific = testDataFactory.product.response.specific({
        genericProduct: generic,
      });
      setup({
        isInProgress: [specificToUpdate.productId],
        productList: [
          generic,
          specificToUpdate,
          targetSpecific,
        ],
      });

      const name = 'ékezetes név';

      dispatcher.dispatch(productApiEvents.updateProductCompleted({
        productId: specificToUpdate.productId,
        ...testDataFactory.product.request.variant({
          name,
          parentProductId: targetSpecific.productId,
        }),
      }));

      validateState({
        isInProgress: [],
        productList: [
          generic,
          targetSpecific,
          {
            productId: specificToUpdate.productId,
            productType: ProductType.Variant,
            name,
            fullName: getVariantProductFullName(targetSpecific.fullName, name),
            genericProductId: generic.productId,
            specificProductId: targetSpecific.productId,
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
        ],
      });
    });

    it('should turn a specific product without children into a generic product', () => {
      const generic = testDataFactory.product.response.generic({
        name: 'a generic',
      });
      const specific = testDataFactory.product.response.specific({
        genericProduct: generic,
      });
      setup({
        isInProgress: [specific.productId],
        productList: [
          generic,
          specific,
        ],
      });

      const name = 'ékezetes név';

      dispatcher.dispatch(productApiEvents.updateProductCompleted({
        productId: specific.productId,
        ...testDataFactory.product.request.generic({
          name,
        }),
      }));

      validateState({
        isInProgress: [],
        productList: [
          generic,
          {
            productId: specific.productId,
            productType: ProductType.Generic,
            name,
            fullName: name,
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
        ],
      });
    });

    it('should turn a variant product into a specific product of a generic product', () => {
      const generic = testDataFactory.product.response.generic();
      const specific = testDataFactory.product.response.specific({
        response: {
          name: 'a specific',
        },
        genericProduct: generic,
      });
      const variant = testDataFactory.product.response.variant({
        specificProduct: specific,
      });
      setup({
        isInProgress: [variant.productId],
        productList: [
          generic,
          specific,
          variant,
        ],
      });

      const name = 'ékezetes név';
      const request = testDataFactory.product.request.specific({
        name,
        parentProductId: generic.productId,
      });

      dispatcher.dispatch(productApiEvents.updateProductCompleted({
        productId: variant.productId,
        ...request,
      }));

      validateState({
        isInProgress: [],
        productList: [
          generic,
          specific,
          {
            productId: variant.productId,
            productType: ProductType.Specific,
            name,
            fullName: getSpecificProductFullName(generic.name, request),
            measurement: request.measurement,
            unitOfMeasurement: request.unitOfMeasurement,
            genericProductId: generic.productId,
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
        ],
      });
    });

    it('should turn a variant product into a generic product', () => {
      const generic = testDataFactory.product.response.generic({
        name: 'a generic',
      });
      const specific = testDataFactory.product.response.specific({
        genericProduct: generic,
      });
      const variant = testDataFactory.product.response.variant({
        specificProduct: specific,
      });
      setup({
        isInProgress: [variant.productId],
        productList: [
          generic,
          specific,
          variant,
        ],
      });

      const name = 'ékezetes név';
      const request = testDataFactory.product.request.generic({
        name,
      });

      dispatcher.dispatch(productApiEvents.updateProductCompleted({
        productId: variant.productId,
        ...request,
      }));

      validateState({
        isInProgress: [],
        productList: [
          generic,
          specific,
          {
            productId: variant.productId,
            productType: ProductType.Generic,
            name,
            fullName: name,
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
        ],
      });
    });
  });

  describe('deleteProductInitiated', () => {
    it('should mark the product as in progress', () => {
      const product = testDataFactory.product.response.generic();
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
      const product = testDataFactory.product.response.generic();
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
      const productToDelete = testDataFactory.product.response.generic();
      const otherProduct = testDataFactory.product.response.generic();
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
      const target = testDataFactory.product.response.generic();
      const source = testDataFactory.product.response.generic();
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
      const source1 = testDataFactory.product.response.generic();
      const source2 = testDataFactory.product.response.generic();
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
      const target = testDataFactory.product.response.generic();
      const source = testDataFactory.product.response.generic();
      const movedSpecific = testDataFactory.product.response.specific({
        genericProduct: source,
      });
      const movedVariant = testDataFactory.product.response.variant({
        specificProduct: movedSpecific,
      });
      setup({
        isInProgress: [source.productId],
        productList: [
          target,
          source,
          movedSpecific,
          movedVariant,
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
          {
            ...movedSpecific,
            genericProductId: target.productId,
            fullName: getSpecificProductFullName(target.name, movedSpecific),
            searchTerms: expect.arrayContaining(target.name.toLowerCase().split(' ')),
          },
          {
            ...movedVariant,
            genericProductId: target.productId,
            fullName: getVariantProductFullName(getSpecificProductFullName(target.name, movedSpecific), movedVariant.name),
            searchTerms: expect.arrayContaining(target.name.toLowerCase().split(' ')),
          },
        ],
      });
    });

    it('should remove the source specific products and move their variant products under the target', () => {
      const generic = testDataFactory.product.response.generic();
      const targetSpecific = testDataFactory.product.response.specific({
        genericProduct: generic,
      });
      const source = testDataFactory.product.response.specific({
        genericProduct: generic,
      });
      const movedVariant = testDataFactory.product.response.variant({
        specificProduct: source,
      });
      setup({
        isInProgress: [source.productId],
        productList: [
          generic,
          targetSpecific,
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
          generic,
          targetSpecific,
          {
            ...movedVariant,
            specificProductId: targetSpecific.productId,
            fullName: getVariantProductFullName(targetSpecific.fullName, movedVariant.name),
            searchTerms: expect.arrayContaining(targetSpecific.fullName.toLowerCase().replaceAll(PRODUCT_FULL_NAME_SEPARATOR, ' ')
              .split(' ')),
          },
        ],
      });
    });

    it('should remove the source variant products', () => {
      const generic = testDataFactory.product.response.generic();
      const specific = testDataFactory.product.response.specific({
        genericProduct: generic,
      });
      const targetVariant = testDataFactory.product.response.variant({
        specificProduct: specific,
      });
      const source = testDataFactory.product.response.variant({
        specificProduct: specific,
      });
      setup({
        isInProgress: [source.productId],
        productList: [
          generic,
          specific,
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
          generic,
          specific,
          targetVariant,
        ],
      });
    });
  });
});
