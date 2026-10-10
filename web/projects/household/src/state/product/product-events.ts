import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';

export type ProductTreeNode = Responses.ProductTree | Responses.SpecificProductTreeItem | Responses.VariantProductTreeItem;

export const productEvents = eventGroup({
  source: 'Product',
  events: {
    createProduct: type<void>(),
    updateProduct: type<ProductTreeNode>(),
    deleteProduct: type<ProductTreeNode>(),
    mergeProducts: type<ProductTreeNode>(),
    openProductListItemSubmenu: type<ProductTreeNode>(),
    selectProduct: type<{
      productToUpdate?: ProductTreeNode;
    }>(),
    productSelected: type<ProductTreeNode>(),
  },
});

export const productApiEvents = eventGroup({
  source: 'Product API',
  events: {
    listProductsInitiated: type<void>(),
    listProductsCompleted: type<Responses.ProductTree[]>(),
    createProductInitiated: type<Requests.Product>(),
    createProductCompleted: type<Api.Product.ProductId & Requests.Product>(),
    updateProductInitiated: type<Api.Product.ProductId & Requests.Product>(),
    updateProductCompleted: type<Api.Product.ProductId & Requests.Product>(),
    updateProductFailed: type<Api.Product.ProductId>(),
    deleteProductInitiated: type<Api.Product.ProductId>(),
    deleteProductCompleted: type<Api.Product.ProductId>(),
    deleteProductFailed: type<Api.Product.ProductId>(),
    mergeProductsInitiated: type<{
      sourceProductIds: Api.Product.Id[];
      targetProductId: Api.Product.Id;
    }>(),
    mergeProductsCompleted: type<{
      sourceProductIds: Api.Product.Id[];
      targetProductId: Api.Product.Id;
    }>(),
    mergeProductsFailed: type<{
      sourceProductIds: Api.Product.Id[];
    }>(),
  },
});
