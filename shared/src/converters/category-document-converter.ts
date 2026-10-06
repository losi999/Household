import { generateMongoId } from '@household/shared/common/mongoose-utils';
import { addSeconds, getCategoryId } from '@household/shared/common/utils';
import { DocumentUpdate, Restrict } from '@household/shared/types/common';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { Documents } from '@household/shared/types/documents';
import { UpdateQuery } from 'mongoose';

export interface ICategoryDocumentConverter {
  create(data: {
    body: Requests.Category;
    parentCategory: Documents.Category
  }, expiresIn: number, generateId?: boolean): Documents.Category;
  update(data: {
    body: Restrict<Requests.Category, 'parentCategoryId'>;
    parentCategory: Documents.Category;
  }, expiresIn: number): DocumentUpdate<Documents.Category>;
  toResponse(doc: Documents.Category): Responses.Category;
  toReport(doc: Documents.Category): Responses.CategoryReport;
  toResponseList(docs: Documents.Category[]): Responses.Category[];
}

export const categoryDocumentConverterFactory = (): ICategoryDocumentConverter => {
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
      const update: UpdateQuery<Documents.Category> = {
        $set: {
          ...body,
          ancestors: parentCategory ? [
            ...parentCategory.ancestors,
            parentCategory,
          ] : [],
          expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
        },
      };

      return {
        update,
      };
    },
    toResponse: (doc) => {
      const parentFullName = doc.ancestors.map(d => d.name).join(':');
      const parent = doc.ancestors.at(-1);

      return {
        categoryType: doc.categoryType,
        name: doc.name,
        fullName: parentFullName ? `${parentFullName}:${doc.name}` : doc.name,
        categoryId: getCategoryId(doc._id),
        parentCategory: parent ? {
          categoryId: getCategoryId(parent._id),
          categoryType: parent.categoryType,
          fullName: parentFullName,
          name: parent.name,
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
