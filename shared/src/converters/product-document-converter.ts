import { generateMongoId } from '@household/shared/common/test-data-factory';
import { addSeconds, getProductId } from '@household/shared/common/utils';
import { Category, Product } from '@household/shared/types/types';

export interface IProductDocumentConverter {
  create(data: { body: Product.Request, category: Category.Document }, expiresIn: number, generateId?: boolean): Product.Document;
  toResponse(document: Product.Document): Product.Response;
  toResponseList(documents: Product.Document[]): Product.Response[];
}

export const productDocumentConverterFactory = (): IProductDocumentConverter => {
  const instance: IProductDocumentConverter = {
    create: ({ body, category }, expiresIn, generateId): Product.Document => {
      return {
        ...body,
        category: category ?? undefined,
        _id: generateId ? generateMongoId() : undefined,
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
        productId: getProductId(doc),
      };
    },
    toResponseList: docs => docs.map(d => instance.toResponse(d)),
  };

  return instance;
};
