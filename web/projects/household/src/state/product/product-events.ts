import { Api } from '@household/shared/types/api';
import { Searchable } from '@household/shared/types/common';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';

export const productEvents = eventGroup({
  source: 'Product',
  events: {
    createProduct: type<void>(),
    updateProduct: type<Responses.Product>(),
    deleteProduct: type<Responses.Product>(),
    mergeProducts: type<Responses.Product>(),
    openProductListItemSubmenu: type<{
      product: Responses.Product;
      hasChildren: boolean;
    }>(),
    selectProduct: type<Searchable<Responses.Product>[] | undefined>(),
    productSelected: type<Responses.Product>(),
  },
});

export const productApiEvents = eventGroup({
  source: 'Product API',
  events: {
    listProductsInitiated: type<void>(),
    listProductsCompleted: type<Responses.Product[]>(),
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
