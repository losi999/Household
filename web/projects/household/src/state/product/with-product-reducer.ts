import { getSpecificProductFullName, getVariantProductFullName, sortProductsByFullName } from '@household/shared/common/utils';
import { ProductType } from '@household/shared/enums';
import { Api } from '@household/shared/types/api';
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
const toProduct = (request: Api.Product.ProductId & Requests.Product, productList: Responses.Product[]): Responses.Product => {
  switch (request.productType) {
    case ProductType.Generic: {
      return {
        productId: request.productId,
        productType: request.productType,
        name: request.name,
        fullName: request.name,
      };
    }
    case ProductType.Specific: {
      const generic = findGeneric(productList, request.parentProductId);

      return {
        productId: request.productId,
        productType: request.productType,
        name: request.name,
        fullName: getSpecificProductFullName(generic?.fullName ?? '', request),
        measurement: request.measurement,
        unitOfMeasurement: request.unitOfMeasurement,
        genericProductId: request.parentProductId,
      };
    }
    case ProductType.Variant: {
      const specific = findSpecific(productList, request.parentProductId);

      return {
        productId: request.productId,
        productType: request.productType,
        name: request.name,
        fullName: getVariantProductFullName(specific?.fullName ?? '', request.name),
        genericProductId: specific?.genericProductId,
        specificProductId: request.parentProductId,
      };
    }
  }
};

// The full names of the descendants of an updated product are built from its full name
const refreshDescendants = (productList: Responses.Product[], updated: Responses.Product): Responses.Product[] => {
  switch (updated.productType) {
    case ProductType.Generic: {
      const specifics = new Map(productList
        .filter((product): product is Responses.SpecificProduct => product.productType === ProductType.Specific && product.genericProductId === updated.productId)
        .map(specific => [
          specific.productId,
          {
            ...specific,
            fullName: getSpecificProductFullName(updated.fullName, specific),
          },
        ] as const));

      return productList.map((product): Responses.Product => {
        if (product.productType === ProductType.Specific && specifics.has(product.productId)) {
          return specifics.get(product.productId);
        }

        if (product.productType === ProductType.Variant && product.genericProductId === updated.productId) {
          return {
            ...product,
            fullName: getVariantProductFullName(specifics.get(product.specificProductId)?.fullName ?? '', product.name),
          };
        }

        return product;
      });
    }
    case ProductType.Specific: {
      return productList.map((product): Responses.Product => {
        if (product.productType === ProductType.Variant && product.specificProductId === updated.productId) {
          return {
            ...product,
            genericProductId: updated.genericProductId,
            fullName: getVariantProductFullName(updated.fullName, product.name),
          };
        }

        return product;
      });
    }
    default: {
      return productList;
    }
  }
};

export const withProductReducer = () => {
  return signalStoreFeature(
    withReducer<ProductState>(
      on(productEvents.selectProduct, productEvents.createProduct, productEvents.updateProduct, () => {
        return {
          pendingParentProduct: undefined,
        };
      }),
      on(productEvents.productSelected, ({ payload }) => {
        return {
          pendingParentProduct: payload,
        };
      }),
      on(productApiEvents.listProductsCompleted, ({ payload }) => {
        return {
          productList: payload,
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
          const productList = state.productList.map(product => product.productId === payload.productId ? updated : product);

          return {
            isInProgress: state.isInProgress.filter(id => id !== payload.productId),
            productList: sortProductsByFullName(refreshDescendants(productList, updated)),
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
          const remaining = state.productList.filter(product => !sourceProductIds.includes(product.productId));
          const specifics = new Map(remaining
            .filter((product): product is Responses.SpecificProduct => product.productType === ProductType.Specific && sourceProductIds.includes(product.genericProductId))
            .map(specific => [
              specific.productId,
              {
                ...specific,
                genericProductId: targetProductId,
                fullName: getSpecificProductFullName(target?.fullName ?? '', specific),
              },
            ] as const));

          return {
            isInProgress: state.isInProgress.filter(id => !sourceProductIds.includes(id)),
            productList: sortProductsByFullName(remaining.map((product): Responses.Product => {
              if (product.productType === ProductType.Specific && specifics.has(product.productId)) {
                return specifics.get(product.productId);
              }

              if (product.productType === ProductType.Variant && sourceProductIds.includes(product.genericProductId)) {
                return {
                  ...product,
                  genericProductId: targetProductId,
                  fullName: getVariantProductFullName(specifics.get(product.specificProductId)?.fullName ?? '', product.name),
                };
              }

              if (product.productType === ProductType.Variant && sourceProductIds.includes(product.specificProductId)) {
                return {
                  ...product,
                  specificProductId: targetProductId,
                  fullName: getVariantProductFullName(target?.fullName ?? '', product.name),
                };
              }

              return product;
            })),
          };
        };
      }),
    ),
  );
};
