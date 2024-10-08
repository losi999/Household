import { generateMongoId } from '@household/shared/common/utils';
import { addSeconds, getProductId } from '@household/shared/common/utils';
import { Category, Product, Transaction } from '@household/shared/types/types';
import { UpdateQuery } from 'mongoose';

export interface IProductDocumentConverter {
  create(data: {
    body: Product.Request;
    category: Category.Document
  }, expiresIn: number, generateId?: boolean): Product.Document;
  update(body: Product.Request, expiresIn: number): UpdateQuery<Product.Document>;
  toResponse(document: Product.Document): Product.Response;
  toReport(data: Transaction.Quantity & { document: Product.Document }): Product.Report;
  toResponseList(documents: Product.Document[]): Product.Response[];
}

export const productDocumentConverterFactory = (): IProductDocumentConverter => {
  const instance: IProductDocumentConverter = {
    create: ({ body, category }, expiresIn, generateId): Product.Document => {
      return {
        ...body,
        fullName: `${body.brand} ${body.measurement} ${body.unitOfMeasurement}`,
        category,
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    update: (body, expiresIn): UpdateQuery<Product.Document> => {
      return {
        $set: {
          ...body,
          fullName: `${body.brand} ${body.measurement} ${body.unitOfMeasurement}`,
          expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
        },
      };
    },
    toReport: ({ document, quantity }): Product.Report => {
      return document ? {
        productId: getProductId(document),
        fullName: document.fullName,
        quantity,
      } : undefined;
    },
    toResponse: (doc): Product.Response => {
      return {
        ...doc,
        category: undefined,
        _id: undefined,
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
