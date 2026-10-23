import { getSpecificProductFullName, getVariantProductFullName, sortProductsByFullName, toSearchable } from '@household/shared/common/utils';
import { PRODUCT_FULL_NAME_SEPARATOR } from '@household/shared/constants';
import { ProductType } from '@household/shared/enums';
import { Api } from '@household/shared/types/api';
import { Searchable } from '@household/shared/types/common';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { productApiEvents, productEvents } from '@household/state/product/product-events';
import { ProductState } from '@household/state/product/product-store';
import { signalStoreFeature } from '@ngrx/signals';
import { on, withReducer } from '@ngrx/signals/events';

const findGeneric = (productList: Responses.Product[], productId: Api.Product.Id) => {
  return productList.find((product): product is Responses.GenericProduct => product.productType === ProductType.Generic && product.productId === productId);
};

const findSpecific = (productList: Responses.Product[], productId: Api.Product.Id) => {
  return productList.find((product): product is Responses.SpecificProduct => product.productType === ProductType.Specific && product.productId === productId);
};

// The full name and the ids of the parents are built the same way as the API builds them
const toProduct = (request: Api.Product.ProductId & Requests.Product, productList: Responses.Product[]): Searchable<Responses.Product> => {
  switch (request.productType) {
    case ProductType.Generic: {
      return toSearchable({
        productId: request.productId,
        productType: request.productType,
        name: request.name,
        fullName: request.name,
      }, ['name']);
    }
    case ProductType.Specific: {
      const generic = findGeneric(productList, request.parentProductId);
      const fullName = getSpecificProductFullName(generic.fullName, request);

      return toSearchable({
        productId: request.productId,
        productType: request.productType,
        name: request.name,
        fullName,
        measurement: request.measurement,
        unitOfMeasurement: request.unitOfMeasurement,
        genericProductId: request.parentProductId,
      }, ['fullName'], PRODUCT_FULL_NAME_SEPARATOR);
    }
    case ProductType.Variant: {
      const specific = findSpecific(productList, request.parentProductId);
      const fullName = getVariantProductFullName(specific.fullName, request.name);

      return toSearchable({
        productId: request.productId,
        productType: request.productType,
        name: request.name,
        fullName,
        genericProductId: specific.genericProductId,
        specificProductId: request.parentProductId,
      }, ['fullName'], PRODUCT_FULL_NAME_SEPARATOR);
      
    }
  }
};

export const withProductReducer = () => {
  return signalStoreFeature(
    withReducer<ProductState>(
      on(productEvents.selectProduct, productEvents.createProduct, productEvents.updateProduct, () => {
        return {
          selectedProduct: undefined,
        };
      }),
      on(productEvents.productSelected, ({ payload }) => {
        return {
          selectedProduct: payload,
        };
      }),
      on(productApiEvents.listProductsCompleted, ({ payload }) => {
        return {
          productList: payload.map(p => {
            return toSearchable(p, ['fullName'], PRODUCT_FULL_NAME_SEPARATOR);
          }),
        };
      }),
      on(productApiEvents.createProductCompleted, ({ payload }) => {
        return (state) => {
          return {
            productList: sortProductsByFullName([
              ...state.productList,
              toProduct(payload, state.productList),
            ]),
          };
        };
      }),
      on(productApiEvents.updateProductInitiated, productApiEvents.deleteProductInitiated, ({ payload: { productId } }) => {
        return (state) => {
          return {
            isInProgress: [
              ...state.isInProgress,
              productId,
            ],
          };
        };
      }),
      on(productApiEvents.updateProductFailed, productApiEvents.deleteProductFailed, ({ payload: { productId } }) => {
        return (state) => {
          return {
            isInProgress: state.isInProgress.filter(id => id !== productId),
          };
        };
      }),
      on(productApiEvents.updateProductCompleted, ({ payload }) => {
        return (state) => {
          const updated = toProduct(payload, state.productList);
          const specifics = new Map<Api.Product.Id, Searchable<Responses.SpecificProduct>>();

          const productList = state.productList.reduce<Searchable<Responses.Product>[]>((accumulator, currentValue) => {
            if (currentValue.productId === updated.productId) {
              return [
                ...accumulator,
                updated,
              ];
            }

            if (currentValue.productType === ProductType.Generic) {
              return [
                ...accumulator,
                currentValue,
              ];  
            }

            if (currentValue.genericProductId === updated.productId) {
              if (currentValue.productType === ProductType.Specific) {
                const fullName = getSpecificProductFullName(updated.fullName, currentValue);

                specifics.set(currentValue.productId, toSearchable({
                  ...currentValue,
                  fullName,
                }, ['fullName'], PRODUCT_FULL_NAME_SEPARATOR));

                return [
                  ...accumulator,
                  specifics.get(currentValue.productId),
                ];
              }

              const fullName = getVariantProductFullName(specifics.get(currentValue.specificProductId).fullName, currentValue.name);

              return [
                ...accumulator,
                toSearchable({
                  ...currentValue,
                  fullName,
                }, ['fullName'], PRODUCT_FULL_NAME_SEPARATOR),
              ];
            }

            if (currentValue.productType === ProductType.Variant && currentValue.specificProductId === updated.productId) {
              const fullName = getVariantProductFullName(updated.fullName, currentValue.name);

              return [
                ...accumulator,
                toSearchable({
                  ...currentValue,
                  fullName,
                  genericProductId: (updated as Responses.SpecificProduct).genericProductId,
                }, ['fullName'], PRODUCT_FULL_NAME_SEPARATOR),
              ];
            }
            
            return [
              ...accumulator,
              currentValue,
            ];
          }, []);

          return {
            isInProgress: state.isInProgress.filter(id => id !== payload.productId),
            productList: sortProductsByFullName(productList),
          };
        };
      }),
      on(productApiEvents.deleteProductCompleted, ({ payload: { productId } }) => {
        return (state) => {
          return {
            isInProgress: state.isInProgress.filter(id => id !== productId),
            productList: state.productList.filter(product => product.productId !== productId),
          };
        };
      }),
      on(productApiEvents.mergeProductsInitiated, ({ payload: { sourceProductIds } }) => {
        return (state) => {
          return {
            isInProgress: [
              ...state.isInProgress,
              ...sourceProductIds,
            ],
          };
        };
      }),
      on(productApiEvents.mergeProductsFailed, ({ payload: { sourceProductIds } }) => {
        return (state) => {
          return {
            isInProgress: state.isInProgress.filter(id => !sourceProductIds.includes(id)),
          };
        };
      }),
      // The source products are deleted and their children are moved under the target product
      on(productApiEvents.mergeProductsCompleted, ({ payload: { sourceProductIds, targetProductId } }) => {
        return (state) => {
          const target = state.productList.find(product => product.productId === targetProductId);
          const specifics = new Map<Api.Product.Id, Searchable<Responses.SpecificProduct>>();
              
          const productList = state.productList.reduce<Searchable<Responses.Product>[]>((accumulator, currentValue) => {
            if (currentValue.productId === targetProductId) {
              return [
                ...accumulator,
                currentValue,
              ];
            }

            if (sourceProductIds.includes(currentValue.productId)) {
              return accumulator;
            }

            if (currentValue.productType === ProductType.Specific && sourceProductIds.includes(currentValue.genericProductId)) {
              const fullName = getSpecificProductFullName(target.fullName, currentValue);

              specifics.set(currentValue.productId, toSearchable({
                ...currentValue,
                fullName,
                genericProductId: targetProductId,
              }, ['fullName'], PRODUCT_FULL_NAME_SEPARATOR));

              return [
                ...accumulator,
                {
                  ...specifics.get(currentValue.productId),
                },
              ];
            }

            if (currentValue.productType === ProductType.Variant && sourceProductIds.includes(currentValue.genericProductId)) {
              const fullName = getVariantProductFullName(specifics.get(currentValue.specificProductId).fullName, currentValue.name);

              return [
                ...accumulator,
                toSearchable({
                  ...currentValue,
                  fullName,
                  genericProductId: targetProductId,
                }, ['fullName'], PRODUCT_FULL_NAME_SEPARATOR),
              ];
            }

            if (currentValue.productType === ProductType.Variant && sourceProductIds.includes(currentValue.specificProductId)) {
              const fullName = getVariantProductFullName(target.fullName, currentValue.name);

              return [
                ...accumulator,
                toSearchable({
                  ...currentValue,
                  fullName,
                  specificProductId: targetProductId,
                }, ['fullName'], PRODUCT_FULL_NAME_SEPARATOR),
              ];
            }

            return [
              ...accumulator,
              currentValue,
            ];
          }, []);

          return {
            isInProgress: state.isInProgress.filter(id => !sourceProductIds.includes(id)),
            productList: sortProductsByFullName(productList),
          };
        };
      }),
    ),
  );
};
