import { addSeconds } from '@household/shared/common/utils';
import { Category, Product } from '@household/shared/types/types';

export interface IProductDocumentConverter {
  create(data: { body: Product.Request, category: Category.Document }, expiresIn: number): Product.Document;
  toResponse(document: Product.Document): Product.Response;
}

export const productDocumentConverterFactory = (): IProductDocumentConverter => {
  const instance: IProductDocumentConverter = {
    create: ({ body, category }, expiresIn): Product.Document => {
      return {
        ...body,
        category,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    toResponse: (doc): Product.Response => {
      return {
        ...doc,
        _id: undefined,
        category: undefined,
        createdAt: undefined,
        updatedAt: undefined,
        expiresAt: undefined,
        productId: doc._id.toString() as Product.IdType,
      };
    },
  };

  return instance;
};
