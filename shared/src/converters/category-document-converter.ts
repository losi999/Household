import { generateMongoId } from '@household/shared/common/utils';
import { addSeconds, getCategoryId } from '@household/shared/common/utils';
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

export const categoryDocumentConverterFactory = (): ICategoryDocumentConverter => {
  const toResponseBase = (doc: Category.Document): Category.ResponseBase => {
    return {
      ...doc,
      categoryId: getCategoryId(doc),
      createdAt: undefined,
      updatedAt: undefined,
      _id: undefined,
      expiresAt: undefined,
      ancestors: undefined,
    };
  };

  const instance: ICategoryDocumentConverter = {
    create: ({ body, parentCategory }, expiresIn, generateId): Category.Document => {
      return {
        ...body,
        ancestors: parentCategory ? [
          ...parentCategory.ancestors,
          parentCategory,
        ] : [],
        parentCategoryId: undefined,
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    update: ({ body, parentCategory }, expiresIn): UpdateQuery<Category.Document> => {
      const update: UpdateQuery<Category.Document> = {
        $set: {
          ...body,
          ancestors: parentCategory ? [
            ...parentCategory.ancestors,
            parentCategory,
          ] : [],
          expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
        },
      };

      return update;
    },
    toResponse: (doc): Category.Response => {
      return {
        ...toResponseBase(doc),
        ancestors: doc.ancestors.map(d => toResponseBase(d)),
        fullName: [
          ...doc.ancestors.map(d => d.name),
          doc.name,
        ].join(':'),
      };
    },
    toReport: (doc): Category.Report => {
      return doc ? {
        categoryId: getCategoryId(doc),
        fullName: [
          ...doc.ancestors.map(d => d.name),
          doc.name,
        ].join(':'),
      } : undefined;
    },
    toResponseList: docs => docs.map(d => instance.toResponse(d)).toSorted((a, b) => a.fullName.localeCompare(b.fullName, 'hu', {
      sensitivity: 'base',
    })),
  };

  return instance;
};
