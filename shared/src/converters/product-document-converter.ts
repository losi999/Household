import { generateMongoId } from '@household/shared/common/utils';
import { addSeconds, getProductId } from '@household/shared/common/utils';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { Category, Product, Transaction } from '@household/shared/types/types';
import { UpdateQuery } from 'mongoose';

export interface IProductDocumentConverter {
  create(data: {
    body: Product.Request;
    category: Category.Document
  }, expiresIn: number, generateId?: boolean): Product.Document;
  update(body: Product.Request, expiresIn: number): UpdateQuery<Product.Document>;
  toGroupedResponse(category: Category.Document): Product.GroupedResponse;
  toGroupedResponseList(categories: Category.Document[]): Product.GroupedResponse[];
  toResponse(document: Product.Document): Product.Response;
  toReport(data: Transaction.Quantity & { document: Product.Document }): Product.Report;
  toResponseList(documents: Product.Document[]): Product.Response[];
}

export const productDocumentConverterFactory = (categoryDocumentConverter: ICategoryDocumentConverter): IProductDocumentConverter => {
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
    toGroupedResponse: (category): Product.GroupedResponse => {
      const { categoryId, fullName } = categoryDocumentConverter.toResponse(category);
      return {
        categoryId,
        fullName,
        products: instance.toResponseList(category.products),
      };
    },
    toGroupedResponseList: docs => docs.map(d => instance.toGroupedResponse(d)).toSorted((a, b) => a.fullName.localeCompare(b.fullName, 'hu', {
      sensitivity: 'base',
    })),
    toResponse: (doc): Product.Response => {
      const { brand, fullName, measurement, unitOfMeasurement } = doc;
      return {
        brand,
        fullName,
        measurement,
        unitOfMeasurement,
        productId: getProductId(doc),
      };
    },
    toResponseList: docs => docs.map(d => instance.toResponse(d)),
  };

  return instance;
};
