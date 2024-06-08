import { generateMongoId } from '@household/shared/common/utils';
import { addSeconds, getCategoryId } from '@household/shared/common/utils';
import { IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
import { Restrict } from '@household/shared/types/common';
import { Category } from '@household/shared/types/types';
import { UpdateQuery } from 'mongoose';

export interface ICategoryDocumentConverter {
  create(data: {
    body: Category.Request;
    parentCategory: Category.Document
  }, expiresIn: number, generateId?: boolean): Category.Document;
  update(data: {
    body: Restrict<Category.Request, 'parentCategoryId'>;
    parentCategory: Category.Document;
  }, expiresIn: number): UpdateQuery<Category.Document>;
  toResponse(doc: Category.Document): Category.Response;
  toReport(doc: Category.Document): Category.Report;
  toResponseList(docs: Category.Document[]): Category.Response[];
}

export const categoryDocumentConverterFactory = (
  productDocumentConverter: IProductDocumentConverter,
): ICategoryDocumentConverter => {
  const instance: ICategoryDocumentConverter = {
    create: ({ body, parentCategory }, expiresIn, generateId): Category.Document => {
      return {
        ...body,
        fullName: parentCategory ? `${parentCategory.fullName}:${body.name}` : body.name,
        parentCategory: parentCategory ?? undefined,
        parentCategoryId: undefined,
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    update: ({ body, parentCategory }, expiresIn): UpdateQuery<Category.Document> => {
      const update: UpdateQuery<Category.Document> = {
        $set: {
          ...body,
          fullName: parentCategory ? `${parentCategory.fullName}:${body.name}` : body.name,
          expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
        },
      };

      if (parentCategory) {
        update.$set.parentCategory = parentCategory;
      } else {
        update.$unset = {
          parentCategory: 1,
        };
      }

      return update;
    },
    toResponse: (doc): Category.Response => {
      return {
        ...doc,
        createdAt: undefined,
        updatedAt: undefined,
        _id: undefined,
        expiresAt: undefined,
        categoryId: getCategoryId(doc),
        parentCategory: doc.parentCategory ? {
          ...instance.toResponse(doc.parentCategory),
          parentCategory: undefined,
        } : undefined,
        products: doc.products ? productDocumentConverter.toResponseList(doc.products) : undefined,
      };
    },
    toReport: (doc): Category.Report => {
      return doc ? {
        categoryId: getCategoryId(doc),
        fullName: doc.fullName,
      } : undefined;
    },
    toResponseList: docs => docs.map(d => instance.toResponse(d)),
  };

  return instance;
};
