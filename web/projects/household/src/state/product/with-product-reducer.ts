import { ProductType } from '@household/shared/enums';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { productApiEvents, productEvents, ProductTreeNode } from '@household/state/product/product-events';
import { ProductState } from '@household/state/product/product-store';
import { signalStoreFeature } from '@ngrx/signals';
import { on, withReducer } from '@ngrx/signals/events';

const sortByName = <T extends { name: string }>(items: T[]) => {
  return items.toSorted((a, b) => a.name.localeCompare(b.name, 'hu', {
    sensitivity: 'base',
  }));
};

const findProduct = (productList: Responses.ProductTree[], productId: Api.Product.Id): ProductTreeNode => {
  const specifics = productList.flatMap(generic => generic.children);
  const variants = specifics.flatMap(specific => specific.children);

  return [
    ...productList,
    ...specifics,
    ...variants,
  ].find(product => product.productId === productId);
};

const removeProduct = (productList: Responses.ProductTree[], productId: Api.Product.Id): Responses.ProductTree[] => {
  return productList
    .filter(generic => generic.productId !== productId)
    .map((generic) => {
      return {
        ...generic,
        children: generic.children
          .filter(specific => specific.productId !== productId)
          .map((specific) => {
            return {
              ...specific,
              children: specific.children.filter(variant => variant.productId !== productId),
            };
          }),
      };
    });
};

// Puts the product to the place determined by its parent, keeping the children of the previous version of the product
// as long as its type does not change
const addProduct = (productList: Responses.ProductTree[], request: Api.Product.ProductId & Requests.Product, previous?: ProductTreeNode): Responses.ProductTree[] => {
  switch (request.productType) {
    case ProductType.Generic: {
      return sortByName([
        ...productList,
        {
          productId: request.productId,
          productType: request.productType,
          name: request.name,
          children: previous?.productType === ProductType.Generic ? previous.children : [],
        },
      ]);
    }
    case ProductType.Specific: {
      const specific: Responses.SpecificProductTreeItem = {
        productId: request.productId,
        productType: request.productType,
        name: request.name,
        fullName: `${request.name} ${request.measurement} ${request.unitOfMeasurement}`,
        measurement: request.measurement,
        unitOfMeasurement: request.unitOfMeasurement,
        children: previous?.productType === ProductType.Specific ? previous.children : [],
      };

      return productList.map((generic) => {
        if (generic.productId !== request.parentProductId) {
          return generic;
        }

        return {
          ...generic,
          children: sortByName([
            ...generic.children,
            specific,
          ]),
        };
      });
    }
    case ProductType.Variant: {
      const variant: Responses.VariantProductTreeItem = {
        productId: request.productId,
        productType: request.productType,
        name: request.name,
      };

      return productList.map((generic) => {
        return {
          ...generic,
          children: generic.children.map((specific) => {
            if (specific.productId !== request.parentProductId) {
              return specific;
            }

            return {
              ...specific,
              children: sortByName([
                ...specific.children,
                variant,
              ]),
            };
          }),
        };
      });
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
            productList: addProduct(state.productList, payload),
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
          const previous = findProduct(state.productList, payload.productId);

          return {
            isInProgress: state.isInProgress.filter(id => id !== payload.productId),
            productList: addProduct(removeProduct(state.productList, payload.productId), payload, previous),
          };
        };
      }),
      on(productApiEvents.deleteProductCompleted, ({ payload: { productId } }) => {
        return (state) => {
          return {
            isInProgress: state.isInProgress.filter(id => id !== productId),
            productList: removeProduct(state.productList, productId),
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
          const isSource = (product: { productId: Api.Product.Id }) => sourceProductIds.includes(product.productId);
          const sourceGenerics = state.productList.filter(isSource);

          return {
            isInProgress: state.isInProgress.filter(id => !sourceProductIds.includes(id)),
            productList: state.productList
              .filter(generic => !isSource(generic))
              .map((generic) => {
                const sourceSpecifics = generic.children.filter(isSource);
                const specifics = generic.children
                  .filter(specific => !isSource(specific))
                  .map((specific) => {
                    const variants = specific.children.filter(variant => !isSource(variant));

                    if (specific.productId === targetProductId) {
                      return {
                        ...specific,
                        children: sortByName([
                          ...variants,
                          ...sourceSpecifics.flatMap(sourceSpecific => sourceSpecific.children),
                        ]),
                      };
                    }

                    return {
                      ...specific,
                      children: variants,
                    };
                  });

                if (generic.productId === targetProductId) {
                  return {
                    ...generic,
                    children: sortByName([
                      ...specifics,
                      ...sourceGenerics.flatMap(sourceGeneric => sourceGeneric.children),
                    ]),
                  };
                }

                return {
                  ...generic,
                  children: specifics,
                };
              }),
          };
        };
      }),
    ),
  );
};
