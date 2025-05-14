import { getCategoryId, getProductId } from '@household/shared/common/utils';
import { AccountType, CategoryType } from '@household/shared/enums';
import { HttpError } from '@household/shared/types/common';
import { Account, Category, Common, File, Product, Project, Recipient, Setting, Transaction, User } from '@household/shared/types/types';
import { UpdateQuery } from 'mongoose';

type CatchAndThrow = (error: any) => never;
type CatchAndLog = (error: any) => void;
const log = (message: string, ctx: any, error?: any) => {
  console.error(message, JSON.stringify(ctx, null, 2), error);
};

const httpError = (statusCode: number, message: string): HttpError => ({
  statusCode,
  message,
});

export const httpErrors = {
  transaction: {
    save: (doc: Transaction.Document, statusCode = 500): CatchAndThrow => (error) => {
      if (error.code === 11000) {
        log('Duplicate transaction name', doc, error);
        throw httpError(400, 'Duplicate transaction name'); // TODO ????
      }

      log('Save transaction', doc, error);
      throw httpError(statusCode, 'Error while saving transaction');
    },
    saveMultiple: (docs: Transaction.Document[], statusCode = 500): CatchAndThrow => (error) => {
      log('Save transactions', docs, error);
      throw httpError(statusCode, 'Error while saving transactions');
    },
    getById: (ctx: Transaction.TransactionId & Partial<Account.AccountId>, statusCode = 500): CatchAndThrow => (error) => {
      log('Get transaction', ctx, error);
      throw httpError(statusCode, 'Error while getting transaction');
    },
    list: (statusCode = 500): CatchAndThrow => (error) => {
      log('List transactions', undefined, error);
      throw httpError(statusCode, 'Error while listing transactions');
    },
    listByAccountId: (ctx: Account.AccountId & Common.Pagination<number>, statusCode = 500): CatchAndThrow => (error) => {
      log('List transactions by account', ctx, error);
      throw httpError(statusCode, 'Error while getting transactions');
    },
    listByFileId: (ctx: File.FileId, statusCode = 500): CatchAndThrow => (error) => {
      log('List transactions by file', ctx, error);
      throw httpError(statusCode, 'Error while getting transactions');
    },
    notFound: (ctx: Transaction.TransactionId & Partial<Account.AccountId> & {transaction: Transaction.Document}, statusCode = 404) => {
      if (ctx.transactionId && !ctx.transaction) {
        log('No transaction found', ctx);
        throw httpError(statusCode, 'No transaction found');
      }
    },
    multipleNotFound: (ctx: { transactionIds: Transaction.Id[]; transactions: Transaction.Document[] }, statusCode = 400) => {
      if (ctx.transactionIds.length !== ctx.transactions.length) {
        log('Some of the transactions are not found', ctx);
        throw httpError(statusCode, 'Some of the transactions are not found');
      }
    },
    update: (update: UpdateQuery<Transaction.Document>, statusCode = 500): CatchAndThrow => (error) => {
      if (error.code === 11000) {
        log('Duplicate transaction name', update, error);
        throw httpError(400, 'Duplicate transaction name');
      }

      log('Update transaction', update, error);
      throw httpError(statusCode, 'Error while updating transaction');
    },
    delete: (ctx: Transaction.TransactionId, statusCode = 500): CatchAndThrow => (error) => {
      log('Delete transaction', ctx, error);
      throw httpError(statusCode, 'Error while deleting transaction');
    },
    sumOfSplits: (ctx: {body: Transaction.SplitRequest; total: number;}, statusCode = 400) => {
      if(ctx.body.amount !== ctx.total) {
        log('Sum of splits must equal to total amount', ctx);
        throw httpError(statusCode, 'Sum of splits must equal to total amount');
      }
    },
    sameAccountTransfer: (ctx: Account.AccountId & Transaction.TransferAccountId, statusCode = 400) => {
      if (ctx.accountId === ctx.transferAccountId) {
        log('Cannot transfer to same account', ctx);
        throw httpError(statusCode, 'Cannot transfer to same account');
      }
    },
    sameAccountLoan: (ctx: Account.AccountId & Transaction.LoanAccountId, statusCode = 400) => {
      if (ctx.accountId === ctx.loanAccountId) {
        log('Cannot loan to same account', ctx);
        throw httpError(statusCode, 'Cannot loan to same account');
      }
    },
    invalidLoanAccountType: (ctx: Account.Document, statusCode = 400) => {
      if (ctx.accountType === AccountType.Loan) {
        log('Account type cannot be loan', ctx);
        throw httpError(statusCode, 'Account type cannot be loan');
      }
    },
  },
  project: {
    save: (doc: Project.Document, statusCode = 500): CatchAndThrow => (error) => {
      if (error.code === 11000) {
        log('Duplicate project name', doc, error);
        throw httpError(400, 'Duplicate project name');
      }

      log('Save project', doc, error);
      throw httpError(statusCode, 'Error while saving project');
    },
    getById: (ctx: Project.ProjectId, statusCode = 500): CatchAndThrow => (error) => {
      log('Get project', ctx, error);
      throw httpError(statusCode, 'Error while getting project');
    },
    listByIds: (ctx: Project.Id[], statusCode = 500): CatchAndThrow => (error) => {
      log('List projects by ids', ctx, error);
      throw httpError(statusCode, 'Error while listing projects by ids');
    },
    list: (statusCode = 500): CatchAndThrow => (error) => {
      log('List projects', undefined, error);
      throw httpError(statusCode, 'Error while listing projects');
    },
    notFound: (ctx: Project.ProjectId & {project: Project.Document}, statusCode = 404) => {
      if (ctx.projectId && !ctx.project) {
        log('No project found', ctx);
        throw httpError(statusCode, 'No project found');
      }
    },
    delete: (ctx: Project.ProjectId, statusCode = 500): CatchAndThrow => (error) => {
      log('Delete project', ctx, error);
      throw httpError(statusCode, 'Error while deleting project');
    },
    multipleNotFound: (ctx: { projectIds: Project.Id[]; projects: Project.Document[] }, statusCode = 400) => {
      if (ctx.projectIds.length !== ctx.projects.length) {
        log('Some of the projects are not found', ctx);
        throw httpError(statusCode, 'Some of the projects are not found');
      }
    },
    update: (ctx: Project.ProjectId & {update: UpdateQuery<Project.Document>}, statusCode = 500): CatchAndThrow => (error) => {
      if (error.code === 11000) {
        log('Duplicate project name', ctx, error);
        throw httpError(400, 'Duplicate project name');
      }

      log('Update project', ctx, error);
      throw httpError(statusCode, 'Error while updating project');
    },
    mergeTargetAmongSource: (ctx: {target: Project.Id; source: Project.Id[]}, statusCode = 400) => {
      if (ctx.source.includes(ctx.target)) {
        log('Target project is among the source project Ids', ctx);
        throw httpError(statusCode, 'Target project is among the source project Ids');
      }
    },
    merge: (ctx: {
      targetProjectId: Project.Id;
      sourceProjectIds: Project.Id[];
    }, statusCode = 500): CatchAndThrow => (error) => {
      log('Merge projects', ctx, error);
      throw httpError(statusCode, 'Error while merging projects');
    },
  },
  account: {
    save: (doc: Account.Document, statusCode = 500): CatchAndThrow => (error) => {
      if (error.code === 11000) {
        log('Duplicate account name', doc, error);
        throw httpError(400, 'Duplicate account name');
      }

      log('Save account', doc, error);
      throw httpError(statusCode, 'Error while saving account');
    },
    getById: (ctx: Account.AccountId, statusCode = 500): CatchAndThrow => (error) => {
      log('Get account', ctx, error);
      throw httpError(statusCode, 'Error while getting account');
    },
    list: (statusCode = 500): CatchAndThrow => (error) => {
      log('List accounts', undefined, error);
      throw httpError(statusCode, 'Error while listing accounts');
    },
    notFound: (ctx: Account.AccountId & {account: Account.Document}, statusCode = 404) => {
      if (ctx.accountId && !ctx.account) {
        log('No account found', ctx);
        throw httpError(statusCode, 'No account found');
      }
    },
    update: (ctx: Account.AccountId & {update: UpdateQuery<Account.Document>}, statusCode = 500): CatchAndThrow => (error) => {
      if (error.code === 11000) {
        log('Duplicate account name', ctx, error);
        throw httpError(400, 'Duplicate account name');
      }

      log('Update account', ctx, error);
      throw httpError(statusCode, 'Error while updating account');
    },
    delete: (ctx: Account.AccountId, statusCode = 500): CatchAndThrow => (error) => {
      log('Delete account', ctx, error);
      throw httpError(statusCode, 'Error while deleting account');
    },
    multipleNotFound: (ctx: { accountIds: Account.Id[]; accounts: Account.Document[] }, statusCode = 400) => {
      if (ctx.accountIds.length !== ctx.accounts.length) {
        log('Some of the accounts are not found', ctx);
        throw httpError(statusCode, 'Some of the accounts are not found');
      }
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
    save: (doc: Category.Document, statusCode = 500): CatchAndThrow => (error) => {
      if (error.code === 11000) {
        log('Duplicate category name', doc, error);
        throw httpError(400, 'Duplicate category name');
      }

      log('Save category', doc, error);
      throw httpError(statusCode, 'Error while saving category');
    },
    getById: (ctx: Category.CategoryId & Partial<Category.ParentCategoryId>, statusCode = 500): CatchAndThrow => (error) => {
      log('Get category', ctx, error);
      throw httpError(statusCode, 'Error while getting category');
    },
    getByProductIds: (ctx: Product.Id[], statusCode = 500): CatchAndThrow => (error) => {
      log('Get category by product Ids', ctx, error);
      throw httpError(statusCode, 'Error while getting category by product Ids');
    },
    list: (statusCode = 500): CatchAndThrow => (error) => {
      log('List categories', undefined, error);
      throw httpError(statusCode, 'Error while listing categories');
    },
    listByIds: (ctx: Category.Id[], statusCode = 500): CatchAndThrow => (error) => {
      log('List categories by ids', ctx, error);
      throw httpError(statusCode, 'Error while listing categories by ids');
    },
    notFound: (ctx: Category.CategoryId & { category: Category.Document }, statusCode = 404) => {
      if (ctx.categoryId && !ctx.category) {
        log('No category found', ctx);
        throw httpError(statusCode, 'No category found');
      }
    },
    delete: (ctx: Category.CategoryId, statusCode = 500): CatchAndThrow => (error) => {
      log('Delete category', ctx, error);
      throw httpError(statusCode, 'Error while deleting category');
    },
    notInventoryType: (ctx: Category.Document, statusCode = 400) => {
      if(ctx.categoryType !== CategoryType.Inventory) {
        log('Category must be "inventory" type', ctx);
        throw httpError(statusCode, 'Category must be "inventory" type');
      }
    },
    notSameType: (ctx: Category.Document[], statusCode = 400) => {
      const categoryType = ctx[0].categoryType;
      if (ctx.some(c => c.categoryType !== categoryType)) {
        log('All categories must be of same type', ctx);
        throw httpError(statusCode, 'All categories must be of same type');
      }
    },
    multipleNotFound: (ctx: { categoryIds: Category.Id[]; categories: Category.Document[] }, statusCode = 400) => {
      if (ctx.categories.length !== ctx.categoryIds.length) {
        log('Some of the categories are not found', ctx);
        throw httpError(statusCode, 'Some of the categories are not found');
      }
    },
    parentNotFound: (ctx: Category.ParentCategoryId & {parentCategory: Category.Document}, statusCode = 400) => {
      if (ctx.parentCategoryId && !ctx.parentCategory) {
        log('Parent category not found', ctx);
        throw httpError(statusCode, 'Parent category not found');
      }
    },
    parentIsAChild: (parentCategory: Category.Document, categoryId: Category.Id, statusCode = 400) => {
      if (parentCategory?.ancestors.some((category) => getCategoryId(category) === categoryId)) {
        log('Parent category is already a child of the current category', {
          categoryId,
          parentCategory,
        });
        throw httpError(statusCode, 'Parent category is already a child of the current category');
      }
    },
    update: (ctx: Category.CategoryId & {update: UpdateQuery<Category.Document>;}, statusCode = 500): CatchAndThrow => (error) => {
      if (error.code === 11000) {
        log('Duplicate category name', ctx, error);
        throw httpError(400, 'Duplicate category name');
      }

      log('Update category', ctx, error);
      throw httpError(statusCode, 'Error while updating category');
    },
    mergeTargetAmongSource: (ctx: {target: Category.Id; source: Category.Id[]}, statusCode = 400) => {
      if (ctx.source.includes(ctx.target)) {
        log('Target category is among the source category Ids', ctx);
        throw httpError(statusCode, 'Target category is among the source category Ids');
      }
    },
    mergeSourceIsAnAncestor: (ctx: {
      target: Category.Document;
      source: Category.Id[];
    }, statusCode = 400) => {
      console.log('CTX', ctx);
      if (ctx.target.ancestors.some((c) => ctx.source.includes(getCategoryId(c)))) {
        log('A source category is among the target category ancestors', ctx);
        throw httpError(statusCode, 'A source category is among the target category ancestors');
      }
    },
    merge: (ctx: {
      targetCategoryId: Category.Id;
      sourceCategoryIds: Category.Id[];
    }, statusCode = 500): CatchAndThrow => (error) => {
      log('Merge categories', ctx, error);
      throw httpError(statusCode, 'Error while merging categories');
    },
  },
  recipient: {
    save: (doc: Recipient.Document, statusCode = 500): CatchAndThrow => (error) => {
      if (error.code === 11000) {
        log('Duplicate recipient name', doc, error);
        throw httpError(400, 'Duplicate recipient name');
      }

      log('Save recipient', doc, error);
      throw httpError(statusCode, 'Error while saving recipient');
    },
    getById: (ctx: Recipient.RecipientId, statusCode = 500): CatchAndThrow => (error) => {
      log('Get recipient', ctx, error);
      throw httpError(statusCode, 'Error while getting recipient');
    },
    list: (statusCode = 500): CatchAndThrow => (error) => {
      log('List recipients', undefined, error);
      throw httpError(statusCode, 'Error while listing recipients');
    },
    listByIds: (ctx: Recipient.Id[], statusCode = 500): CatchAndThrow => (error) => {
      log('List recipients by ids', ctx, error);
      throw httpError(statusCode, 'Error while listing recipients by ids');
    },
    notFound: (ctx: Recipient.RecipientId & {recipient: Recipient.Document}, statusCode = 404) => {
      if (ctx.recipientId && !ctx.recipient) {
        log('No recipient found', ctx);
        throw httpError(statusCode, 'No recipient found');
      }
    },
    multipleNotFound: (ctx: { recipientIds: Recipient.Id[]; recipients: Recipient.Document[] }, statusCode = 400) => {
      if (ctx.recipientIds.length !== ctx.recipients.length) {
        log('Some of the recipients are not found', ctx);
        throw httpError(statusCode, 'Some of the recipients are not found');
      }
    },
    delete: (ctx: Recipient.RecipientId, statusCode = 500): CatchAndThrow => (error) => {
      log('Delete recipient', ctx, error);
      throw httpError(statusCode, 'Error while deleting recipient');
    },
    update: (ctx: Recipient.RecipientId & {update: UpdateQuery<Recipient.Document>}, statusCode = 500): CatchAndThrow => (error) => {
      if (error.code === 11000) {
        log('Duplicate recipient name', ctx, error);
        throw httpError(400, 'Duplicate recipient name');
      }

      log('Update recipient', ctx, error);
      throw httpError(statusCode, 'Error while updating recipient');
    },
    mergeTargetAmongSource: (ctx: {target: Recipient.Id; source: Recipient.Id[]}, statusCode = 400) => {
      if (ctx.source.includes(ctx.target)) {
        log('Target recipient is among the source recipient Ids', ctx);
        throw httpError(statusCode, 'Target recipient is among the source recipient Ids');
      }
    },
    merge: (ctx: {
      targetRecipientId: Recipient.Id;
      sourceRecipientIds: Recipient.Id[];
    }, statusCode = 500): CatchAndThrow => (error) => {
      log('Merge recipients', ctx, error);
      throw httpError(statusCode, 'Error while merging recipients');
    },
  },
  product: {
    save: (doc: Product.Document, statusCode = 500): CatchAndThrow => (error) => {
      if (error.code === 11000) {
        log('Duplicate product name', doc, error);
        throw httpError(400, 'Duplicate product name');
      }

      log('Save product', doc, error);
      throw httpError(statusCode, 'Error while saving product');
    },
    getById: (ctx: Product.ProductId, statusCode = 500): CatchAndThrow => (error) => {
      log('Get product', ctx, error);
      throw httpError(statusCode, 'Error while getting product');
    },
    list: (statusCode = 500): CatchAndThrow => (error) => {
      log('List products', undefined, error);
      throw httpError(statusCode, 'Error while listing products');
    },
    listByIds: (ctx: Product.Id[], statusCode = 500): CatchAndThrow => (error) => {
      log('List products by ids', ctx, error);
      throw httpError(statusCode, 'Error while listing products by ids');
    },
    notFound: (ctx: Product.ProductId & {product: Product.Document}, statusCode = 404) => {
      if (ctx.productId && !ctx.product) {
        log('No product found', ctx);
        throw httpError(statusCode, 'No product found');
      }
    },
    multipleNotFound: (ctx: { productIds: Product.Id[]; products: Product.Document[] }, statusCode = 400) => {
      if (ctx.productIds.length !== ctx.products.length) {
        log('Some of the products are not found', ctx);
        throw httpError(statusCode, 'Some of the products are not found');
      }
    },
    delete: (ctx: Product.ProductId, statusCode = 500): CatchAndThrow => (error) => {
      log('Delete product', ctx, error);
      throw httpError(statusCode, 'Error while deleting product');
    },
    categoryRelation: (ctx: Category.CategoryId & {product: Product.Document}, statusCode = 400) => {
      if (getCategoryId(ctx.product.category) !== ctx.categoryId) {
        log('Product belongs to different category', ctx);
        throw httpError(statusCode, 'Product belongs to different category');
      }
    },
    update: (ctx: Product.ProductId & {update: UpdateQuery<Product.Document>}, statusCode = 500): CatchAndThrow => (error) => {
      if (error.code === 11000) {
        log('Duplicate product name', ctx, error);
        throw httpError(400, 'Duplicate product name');
      }

      log('Update product', ctx, error);
      throw httpError(statusCode, 'Error while updating product');
    },
    mergeTargetAmongSource: (ctx: {target: Product.Id; source: Product.Id[]}, statusCode = 400) => {
      if (ctx.source.includes(ctx.target)) {
        log('Target product is among the source product Ids', ctx);
        throw httpError(statusCode, 'Target product is among the source product Ids');
      }
    },
    notSameCategory: (products: Product.Document[], statusCode = 400) => {
      const categoryId = getCategoryId(products[0].category);

      if (!products.every(p => getCategoryId(p.category) === categoryId)) {
        log('Not all products belong to the same category', products.map(p => getProductId(p)));
        throw httpError(statusCode, 'Not all products belong to the same category');
      }
    },
    merge: (ctx: {
      targetProductId: Product.Id;
      sourceProductIds: Product.Id[];
    }, statusCode = 500): CatchAndThrow => (error) => {
      log('Merge products', ctx, error);
      throw httpError(statusCode, 'Error while merging products');
    },
  },
  file: {
    list: (statusCode = 500): CatchAndThrow => (error) => {
      log('List files', undefined, error);
      throw httpError(statusCode, 'Error while listing files');
    },
    save: (doc: File.Document, statusCode = 500): CatchAndThrow => (error) => {
      log('Save file', doc, error);
      throw httpError(statusCode, 'Error while saving file document');
    },
    getById: (ctx: File.FileId, statusCode = 500): CatchAndThrow => (error) => {
      log('Get file', ctx, error);
      throw httpError(statusCode, 'Error while getting file document');
    },
    delete: (ctx: File.FileId, statusCode = 500): CatchAndThrow => (error) => {
      log('Delete file', ctx, error);
      throw httpError(statusCode, 'Error while deleting file');
    },
    readFile: (ctx: {
      fileId: string;
    }, statusCode = 500): CatchAndThrow => (error) => {
      log('Read file', ctx, error);
      throw httpError(statusCode, 'Error while reading file');
    },
    getUploadUrl: (ctx: File.FileType & File.FileId, statusCode = 500): CatchAndThrow => (error) => {
      log('Get upload URL', ctx, error);
      throw httpError(statusCode, 'Error while getting URL for file upload');
    },
    deleteFile: (ctx: File.FileId): CatchAndLog => (error) => {
      log('Delete file from S3', ctx, error);
    },
    update: (ctx: File.FileId & UpdateQuery<File.Document>, statusCode = 500): CatchAndThrow => (error) => {
      log('Update file', ctx, error);
      throw httpError(statusCode, 'Error while updating file document');
    },
  },
  setting: {
    list: (statusCode = 500): CatchAndThrow => (error) => {
      log('List settings', undefined, error);
      throw httpError(statusCode, 'Error while listing settings');
    },
    delete: (ctx: Setting.SettingKey, statusCode = 500): CatchAndThrow => (error) => {
      log('Delete setting', ctx, error);
      throw httpError(statusCode, 'Error while deleting setting');
    },
    update: (ctx: Setting.SettingKey & UpdateQuery<Setting.Document>, statusCode = 500): CatchAndThrow => (error) => {
      log('Update setting', ctx, error);
      throw httpError(statusCode, 'Error while updating setting document');
    },
  },
  common: {
    getRelatedData: (ctx: any, statusCode = 500): CatchAndThrow => (error) => {
      log('Unable to query related data', ctx, error);
      throw httpError(statusCode, 'Unable to query related data');
    },
    genericError: (message: string, ctx?: any, statusCode = 500): CatchAndThrow => (error) => {
      log(message, ctx, error);
      throw httpError(statusCode, error.message);
    },
  },
  cognito: {
    createUser: (ctx: User.Email, statusCode = 500): CatchAndThrow => (error) => {
      if (error.name === 'UsernameExistsException') {
        log('Duplicate user email', ctx, error);
        throw httpError(400, 'Duplicate user email');
      }
      log('Create user in cognito', ctx, error);
      throw httpError(statusCode, 'Error while creating user in cognito');
    },
    confirmUser: (ctx: User.Email, statusCode = 500): CatchAndThrow => (error) => {
      log('Confirm user in cognito', ctx, error);
      throw httpError(statusCode, 'Error while confirming user in cognito');
    },
    deleteUser: (ctx: User.Email, statusCode = 500): CatchAndThrow => (error) => {
      log('Delete user from cognito', ctx, error);
      throw httpError(statusCode, 'Error while deleting user from cognito');
    },
    listUsers: (statusCode = 500): CatchAndThrow => (error) => {
      log('Listing users from cognito', undefined, error);
      throw httpError(statusCode, 'Error while listing users from cognito');
    },
  },
};
