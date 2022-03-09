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
    update: ({ document, body, parentCategory }, expiresIn): Category.Document => {
      return {
        ...document,
        ...body,
        fullName: parentCategory ? `${parentCategory.fullName}:${body.name}` : body.name,
        parentCategory: parentCategory,
        parentCategoryId: undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    toResponse: (doc): Category.Response => {
      return {
        ...doc,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
        _id: undefined,
        expiresAt: undefined,
        categoryId: doc._id.toString() as Category.IdType,
        parentCategory: undefined,
        parentCategoryId: doc.parentCategory?._id.toString() as Category.IdType,
        children: [],
      }
    },
    toResponseList: (docs) => {
      const mapped = docs.reduce<{ [categoryId: string]: Category.Response }>((accumulator, currentValue) => {
        const resp = instance.toResponse(currentValue);
        if (currentValue.parentCategory) {
          accumulator[currentValue.parentCategory.toString()].children.push(resp);
        }

        return {
          ...accumulator,
          [currentValue._id.toString()]: resp,
        };
      }, {});

      return Object.values(mapped).filter(x => !x.parentCategoryId);
    }
  };

  return instance;
};