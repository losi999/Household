import { httpError } from '@household/shared/common/utils';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';

type Catch = (error: any) => never;
const log = (message: string, ctx: any, error?: any) => {
  console.error(message, JSON.stringify(ctx, null, 2), error);
};

export const httpErrors = {
  transaction: {
    save: (doc: Transaction.Document, statusCode = 500): Catch => (error) => {
      log('Save transaction', doc, error);
      throw httpError(statusCode, 'Error while saving transaction');
    },
    getById: (ctx: Transaction.Id, statusCode = 500): Catch => (error) => {
      log('Get transaction', ctx, error);
      throw httpError(statusCode, 'Error while getting transaction');
    },
    notFound: (condition: boolean, ctx: Transaction.Id, statusCode = 404) => {
      if (condition) {
        log('No transaction found', ctx);
        throw httpError(statusCode, 'No transaction found');
      }
    },
    update: (doc: Transaction.Document, statusCode = 500): Catch => (error) => {
      log('Update transaction', doc, error);
      throw httpError(statusCode, 'Error while updating transaction');
    },
    sumOfSplits: (condition: boolean, ctx: Transaction.SplitRequest, statusCode = 400) => {
      if(condition) {
        log('Sum of splits must equal to total amount', ctx);
        throw httpError(statusCode, 'Sum of splits must equal to total amount');
      }
    },
  },
  project: {
    notFound: (condition: boolean, ctx: Project.Id, statusCode = 404) => {
      if (condition) {
        log('No project found', ctx);
        throw httpError(statusCode, 'No project found');
      }
    },
    multipleNotFound: (condition: boolean, ctx: { projectIds: Project.IdType[] }, statusCode = 400) => {
      if (condition) {
        log('Some of the projects are not found', ctx);
        throw httpError(statusCode, 'Some of the projects are not found');
      }
    },
  },
  account: {
    notFound: (condition: boolean, ctx: Account.Id, statusCode = 404) => {
      if (condition) {
        log('No account found', ctx);
        throw httpError(statusCode, 'No account found');
      }
    },
  },
  category: {
    getById: (ctx: Category.Id & Partial<Category.ParentCategoryId>, statusCode = 500): Catch => (error) => {
      log('Get category', ctx, error);
      throw httpError(statusCode, 'Error while getting category');
    },
    notFound: (condition: boolean, ctx: Category.Id, statusCode = 404) => {
      if (condition) {
        log('No category found', ctx);
        throw httpError(statusCode, 'No category found');
      }
    },
    notInventoryType: (ctx: Category.Document, statusCode = 400) => {
      if(ctx.categoryType !== 'inventory') {
        log('Category must be "inventory" type', ctx);
        throw httpError(statusCode, 'Category must be "inventory" type');
      }
    },
    multipleNotFound: (condition: boolean, ctx: { categoryIds: Category.IdType[] }, statusCode = 400) => {
      if (condition) {
        log('Some of the categories are not found', ctx);
        throw httpError(statusCode, 'Some of the categories are not found');
      }
    },
    parentNotFound: (condition: boolean, ctx: Category.ParentCategoryId, statusCode = 400) => {
      if (condition) {
        log('Parent category not found', ctx);
        throw httpError(statusCode, 'Parent category not found');
      }
    },
    save: (ctx: Category.Document, statusCode = 500): Catch => (error) => {
      log('Save category', ctx, error);
      throw httpError(statusCode, 'Error while saving category');
    },
    update: (ctx: {document: Category.Document, oldFullName: string}, statusCode = 500): Catch => (error) => {
      log('Update category', ctx, error);
      throw httpError(statusCode, 'Error while updating category');
    },
  },
  recipient: {
    notFound: (condition: boolean, ctx: Recipient.Id, statusCode = 404) => {
      if (condition) {
        log('No recipient found', ctx);
        throw httpError(statusCode, 'No recipient found');
      }
    },
  },
  product: {
    notFound: (condition: boolean, ctx: Product.Id, statusCode = 404) => {
      if (condition) {
        log('No product found', ctx);
        throw httpError(statusCode, 'No product found');
      }
    },
    categoryRelation: (condition: boolean, ctx: Category.Id & Product.Id, statusCode = 400) => {
      if (condition) {
        log('Product belongs to different category', ctx);
        throw httpError(statusCode, 'Product belongs to different category');
      }
    },
    save: (doc: Product.Document, statusCode = 500): Catch => (error) => {
      log('Save product', doc, error);
      throw httpError(statusCode, 'Error while saving product');
    },
  },
  common: {
    getRelatedData: (ctx: any, statusCode = 500): Catch => (error) => {
      log('Unable to query related data', ctx, error);
      throw httpError(statusCode, 'Unable to query related data');
    },
  },
};
