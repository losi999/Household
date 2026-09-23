import { generateMongoId } from '@household/shared/common/mongoose-utils';
import { addSeconds, getProductId } from '@household/shared/common/utils';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { DocumentUpdate } from '@household/shared/types/common';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { Documents } from '@household/shared/types/documents';

export interface IProductDocumentConverter {
  create(data: {
    body: Requests.Product;
    category: Documents.Category
  }, expiresIn: number, generateId?: boolean): Documents.Product;
  update(body: Requests.Product, expiresIn: number): DocumentUpdate<Documents.Product>;
  toGroupedResponse(category: Documents.Category): Responses.ProductGroupedResponse;
  toGroupedResponseList(categories: Documents.Category[]): Responses.ProductGroupedResponse[];
  toResponse(document: Documents.Product): Responses.Product;
  toReport(document: Documents.Product): Responses.ProductReport;
  toResponseList(documents: Documents.Product[]): Responses.Product[];
}

export const productDocumentConverterFactory = (categoryDocumentConverter: ICategoryDocumentConverter): IProductDocumentConverter => {
  const instance: IProductDocumentConverter = {
    create: ({ body: { brand, measurement, unitOfMeasurement }, category }, expiresIn, generateId) => {
      return {
        brand,
        measurement,
        unitOfMeasurement,
        fullName: `${brand} ${measurement} ${unitOfMeasurement}`,
        category,
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    update: (body, expiresIn) => {
      return {
        update: {
          $set: {
            ...body,
            fullName: `${body.brand} ${body.measurement} ${body.unitOfMeasurement}`,
            expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
          },
        },
      };
    },
    toReport: (document) => {
      return document ? {
        productId: getProductId(document),
        fullName: document.fullName,
      } : undefined;
    },
    toGroupedResponse: (category) => {
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
    toResponse: ({ brand, fullName, measurement, unitOfMeasurement, _id }) => {
      return {
        brand,
        fullName,
        measurement,
        unitOfMeasurement,
        productId: getProductId(_id),
      };
    },
    toResponseList: docs => docs.map(d => instance.toResponse(d)),
  };

  return instance;
};
