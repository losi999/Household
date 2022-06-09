import { addSeconds } from '@household/shared/common/utils';
import { Restrict } from '@household/shared/types/common';
import { Category } from '@household/shared/types/types';

export interface ICategoryDocumentConverter {
  create(data: {
    body: Category.Request;
    parentCategory: Category.Document
  }, expiresIn: number): Category.Document;
  update(data: {
    document: Restrict<Category.Document, 'updatedAt'>;
    body: Category.Request;
    parentCategory: Category.Document;
  }, expiresIn: number): Category.Document;
  toResponse(doc: Category.Document): Category.Response;
  toResponseList(docs: Category.Document[]): Category.Response[];
}

export const categoryDocumentConverterFactory = (): ICategoryDocumentConverter => {
  const instance: ICategoryDocumentConverter = {
    create: ({ body, parentCategory }, expiresIn): Category.Document => {
      return {
        ...body,
        fullName: parentCategory ? `${parentCategory.fullName}:${body.name}` : body.name,
        parentCategory: parentCategory,
        parentCategoryId: undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    update: ({ document: { _id, createdAt }, body, parentCategory }, expiresIn): Category.Document => {
      return {
        ...instance.create({
          body,
          parentCategory,
        }, expiresIn),
        _id,
        createdAt,
      };
    },
    toResponse: (doc): Category.Response => {
      return {
        ...doc,
        createdAt: undefined,
        updatedAt: undefined,
        _id: undefined,
        expiresAt: undefined,
        categoryId: doc._id.toString() as Category.IdType,
        parentCategory: doc.parentCategory ? {
          ...instance.toResponse(doc.parentCategory),
          parentCategory: undefined,
        } : undefined,
      };
    },
    toResponseList: docs => docs.map(d => instance.toResponse(d)),
  };

  return instance;
};
