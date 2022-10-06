import { HttpError } from '@household/shared/types/common';
import { Account, Category, Common, Product, Project, Recipient, Transaction } from '@household/shared/types/types';

type Catch = (error: Error) => never;
const log = (message: string, ctx: any, error?: any) => {
  console.error(message, JSON.stringify(ctx, null, 2), error);
};

const httpError = (statusCode: number, message: string): HttpError => ({
  statusCode,
  message,
});

export const httpErrors = {
  transaction: {
    save: (doc: Transaction.Document, statusCode = 500): Catch => (error) => {
      log('Save transaction', doc, error);
      throw httpError(statusCode, 'Error while saving transaction');
    },
    getById: (ctx: Transaction.Id & Partial<Account.Id>, statusCode = 500): Catch => (error) => {
      log('Get transaction', ctx, error);
      throw httpError(statusCode, 'Error while getting transaction');
    },
    list: (statusCode = 500): Catch => (error) => {
      log('List transactions', undefined, error);
      throw httpError(statusCode, 'Error while listing transactions');
    },
    listByAccountId: (ctx: Account.Id & Common.Pagination<number>, statusCode = 500): Catch => (error) => {
      log('List transactions by account', ctx, error);
      throw httpError(statusCode, 'Error while getting transactions');
    },
    notFound: (condition: boolean, ctx: Transaction.Id & Partial<Account.Id>, statusCode = 404) => {
      if (condition) {
        log('No transaction found', ctx);
        throw httpError(statusCode, 'No transaction found');
      }
    },
    update: (doc: Transaction.Document, statusCode = 500): Catch => (error) => {
      log('Update transaction', doc, error);
      throw httpError(statusCode, 'Error while updating transaction');
    },
    delete: (ctx: Transaction.Id, statusCode = 500): Catch => (error) => {
      log('Delete transaction', ctx, error);
      throw httpError(statusCode, 'Error while deleting transaction');
    },
    sumOfSplits: (condition: boolean, ctx: Transaction.SplitRequest, statusCode = 400) => {
      if(condition) {
        log('Sum of splits must equal to total amount', ctx);
        throw httpError(statusCode, 'Sum of splits must equal to total amount');
      }
    },
    sameAccountTransfer: (ctx: Account.Id & Transaction.TransferAccountId, statusCode = 400) => {
      if (ctx.accountId === ctx.transferAccountId) {
        log('Cannot transfer to same account', ctx);
        throw httpError(statusCode, 'Cannot transfer to same account');
      }
    },
  },
  project: {
    save: (doc: Project.Document, statusCode = 500): Catch => (error) => {
      log('Save project', doc, error);
      throw httpError(statusCode, 'Error while saving project');
    },
    getById: (ctx: Project.Id, statusCode = 500): Catch => (error) => {
      log('Get project', ctx, error);
      throw httpError(statusCode, 'Error while getting project');
    },
    list: (statusCode = 500): Catch => (error) => {
      log('List projects', undefined, error);
      throw httpError(statusCode, 'Error while listing projects');
    },
    notFound: (condition: boolean, ctx: Project.Id, statusCode = 404) => {
      if (condition) {
        log('No project found', ctx);
        throw httpError(statusCode, 'No project found');
      }
    },
    delete: (ctx: Project.Id, statusCode = 500): Catch => (error) => {
      log('Delete project', ctx, error);
      throw httpError(statusCode, 'Error while deleting project');
    },
    multipleNotFound: (condition: boolean, ctx: { projectIds: Project.IdType[] }, statusCode = 400) => {
      if (condition) {
        log('Some of the projects are not found', ctx);
        throw httpError(statusCode, 'Some of the projects are not found');
      }
    },
    update: (doc: Project.Document, statusCode = 500): Catch => (error) => {
      log('Update project', doc, error);
      throw httpError(statusCode, 'Error while updating project');
    },
  },
  account: {
    save: (doc: Account.Document, statusCode = 500): Catch => (error) => {
      log('Save account', doc, error);
      throw httpError(statusCode, 'Error while saving account');
    },
    getById: (ctx: Account.Id, statusCode = 500): Catch => (error) => {
      log('Get account', ctx, error);
      throw httpError(statusCode, 'Error while getting account');
    },
    list: (statusCode = 500): Catch => (error) => {
      log('List accounts', undefined, error);
      throw httpError(statusCode, 'Error while listing accounts');
    },
    notFound: (condition: boolean, ctx: Account.Id, statusCode = 404) => {
      if (condition) {
        log('No account found', ctx);
        throw httpError(statusCode, 'No account found');
      }
    },
    update: (doc: Account.Document, statusCode = 500): Catch => (error) => {
      log('Update account', doc, error);
      throw httpError(statusCode, 'Error while updating account');
    },
    delete: (ctx: Account.Id, statusCode = 500): Catch => (error) => {
      log('Delete account', ctx, error);
      throw httpError(statusCode, 'Error while deleting account');
    },
    differentCurrency: (account: Account.Document, transferAccount: Account.Document, statusCode = 400) => {
      if(account.currency !== transferAccount.currency) {
        log('Accounts must be in the same currency', {
          account,
          transferAccount,
        });
        throw httpError(statusCode, 'Accounts must be in the same currency');
      }
    },
  },
  category: {
    save: (ctx: Category.Document, statusCode = 500): Catch => (error) => {
      log('Save category', ctx, error);
      throw httpError(statusCode, 'Error while saving category');
    },
    getById: (ctx: Category.Id & Partial<Category.ParentCategoryId>, statusCode = 500): Catch => (error) => {
      log('Get category', ctx, error);
      throw httpError(statusCode, 'Error while getting category');
    },
    getByproductIds: (ctx: Product.IdType[], statusCode = 500): Catch => (error) => {
      log('Get category by product Ids', ctx, error);
      throw httpError(statusCode, 'Error while getting category by product Ids');
    },
    list: (statusCode = 500): Catch => (error) => {
      log('List categories', undefined, error);
      throw httpError(statusCode, 'Error while listing categories');
    },
    notFound: (condition: boolean, ctx: Category.Id | { productIds: Product.IdType[] }, statusCode = 404) => {
      if (condition) {
        log('No category found', ctx);
        throw httpError(statusCode, 'No category found');
      }
    },
    delete: (ctx: Category.Id, statusCode = 500): Catch => (error) => {
      log('Delete category', ctx, error);
      throw httpError(statusCode, 'Error while deleting category');
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
    update: (ctx: {document: Category.Document, oldFullName: string}, statusCode = 500): Catch => (error) => {
      log('Update category', ctx, error);
      throw httpError(statusCode, 'Error while updating category');
    },
  },
  recipient: {
    save: (ctx: Recipient.Document, statusCode = 500): Catch => (error) => {
      log('Save recipient', ctx, error);
      throw httpError(statusCode, 'Error while saving recipient');
    },
    getById: (ctx: Recipient.Id, statusCode = 500): Catch => (error) => {
      log('Get recipient', ctx, error);
      throw httpError(statusCode, 'Error while getting recipient');
    },
    list: (statusCode = 500): Catch => (error) => {
      log('List recipients', undefined, error);
      throw httpError(statusCode, 'Error while listing recipients');
    },
    notFound: (condition: boolean, ctx: Recipient.Id, statusCode = 404) => {
      if (condition) {
        log('No recipient found', ctx);
        throw httpError(statusCode, 'No recipient found');
      }
    },
    delete: (ctx: Recipient.Id, statusCode = 500): Catch => (error) => {
      log('Delete recipient', ctx, error);
      throw httpError(statusCode, 'Error while deleting recipient');
    },
    update: (document: Recipient.Document, statusCode = 500): Catch => (error) => {
      log('Update recipient', document, error);
      throw httpError(statusCode, 'Error while updating recipient');
    },
  },
  product: {
    save: (doc: Product.Document, statusCode = 500): Catch => (error) => {
      log('Save product', doc, error);
      throw httpError(statusCode, 'Error while saving product');
    },
    getById: (ctx: Product.Id, statusCode = 500): Catch => (error) => {
      log('Get product', ctx, error);
      throw httpError(statusCode, 'Error while getting product');
    },
    notFound: (condition: boolean, ctx: Product.Id, statusCode = 404) => {
      if (condition) {
        log('No product found', ctx);
        throw httpError(statusCode, 'No product found');
      }
    },
    multipleNotFound: (condition: boolean, ctx: { productIds: Product.IdType[] }, statusCode = 400) => {
      if (condition) {
        log('Some of the products are not found', ctx);
        throw httpError(statusCode, 'Some of the products are not found');
      }
    },
    delete: (ctx: Product.Id, statusCode = 500): Catch => (error) => {
      log('Delete product', ctx, error);
      throw httpError(statusCode, 'Error while deleting product');
    },
    categoryRelation: (condition: boolean, ctx: Category.Id & Product.Id, statusCode = 400) => {
      if (condition) {
        log('Product belongs to different category', ctx);
        throw httpError(statusCode, 'Product belongs to different category');
      }
    },
    update: (document: Product.Document, statusCode = 500): Catch => (error) => {
      log('Update product', document, error);
      throw httpError(statusCode, 'Error while updating product');
    },
    mergeTargetAmongSource: (condition: boolean, ctx: Product.Id & {source: Product.IdType[]}, statusCode = 400) => {
      if (condition) {
        log('Target product is is among the source product Ids', ctx);
        throw httpError(statusCode, 'Target product is is among the source product Ids');
      }
    },
    merge: (ctx: {
      targetProductId: Product.IdType;
      sourceProductIds: Product.IdType[];
      categoryId: Category.IdType;
    }, statusCode = 500): Catch => (error) => {
      log('Merge products', ctx, error);
      throw httpError(statusCode, 'Error while merging products');
    },
  },
  common: {
    getRelatedData: (ctx: any, statusCode = 500): Catch => (error) => {
      log('Unable to query related data', ctx, error);
      throw httpError(statusCode, 'Unable to query related data');
    },
    genericError: (message: string, ctx: any, statusCode = 500): Catch => (error) => {
      log(message, ctx, error);
      throw httpError(statusCode, error.message);
    },
  },
};
