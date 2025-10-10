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
  const toResponseBase = ({ name, categoryType, _id }: Category.Document): Category.ResponseAncestor => {
    return {
      categoryType,
      name,
      categoryId: getCategoryId(_id),
    };
  };

  const instance: ICategoryDocumentConverter = {
    create: ({ body: { categoryType, name }, parentCategory }, expiresIn, generateId) => {
      return {
        name,
        categoryType,
        ancestors: parentCategory ? [
          ...parentCategory.ancestors,
          parentCategory,
        ] : [],
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    update: ({ body, parentCategory }, expiresIn) => {
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
    toResponse: (doc) => {
      const parentFullName = doc.ancestors.map(d => d.name).join(':');
      return {
        ...toResponseBase(doc),
        ancestors: doc.ancestors.map(d => toResponseBase(d)),
        fullName: parentFullName ? `${parentFullName}:${doc.name}` : doc.name,
        parentCategory: parentFullName ? {
          ...toResponseBase(doc.ancestors.at(-1)),
          fullName: parentFullName,
        } : undefined,
      };
    },
    toReport: (doc) => {
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
