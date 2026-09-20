import { getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId } from '@household/shared/common/utils';
import { splitTransactionDocumentConverter } from '@household/shared/dependencies/converters/split-transaction-document-converter';
import { Dictionary } from '@household/shared/types/common';
import { Documents } from '@household/shared/types/documents';
import { AccountType } from '@household/shared/enums';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred/deferred-data-factory';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { Requests } from '@household/shared/types/requests';

export const splitTransactionDataFactory = (() => {
  const createSplitTransactionDocument = (ctx: {
    body?: Partial<Omit<Requests.SplitTransaction, 'splits' | 'loans'>>;
    splits?: (Partial<Requests.SplitItem> & {
      project?: Documents.Project;
      category?: Documents.Category;
      product?: Documents.Product;
    })[];
    loans?: (Partial<Requests.LoanItem> & {
      project?: Documents.Project;
      category?: Documents.Category;
      product?: Documents.Product;
      loanAccount: Documents.Account;
    })[];
    account: Documents.Account;
    recipient?: Documents.Recipient;
  }): Documents.SplitTransaction => {
    if (ctx.account.accountType === AccountType.Loan) {
      throw 'Account cannot be loan in split transaction';
    }

    if (Object.hasOwn(ctx, 'loans') && !ctx.loans && Object.hasOwn(ctx, 'splits') && !ctx.splits) {
      throw 'Both splits and loans cannot be undefined in split transaction';
    }

    const accounts: Dictionary<Documents.Account> = {
      [getAccountId(ctx.account)]: ctx.account,
    };
    const categories: Dictionary<Documents.Category> = {};
    const products: Dictionary<Documents.Product> = {};
    const projects: Dictionary<Documents.Project> = {};

    const splits = ctx.splits?.map<Partial<Requests.SplitItem>>(({ category, product, project, ...split }) => {
      categories[getCategoryId(category)] = category;
      products[getProductId(product)] = product;
      projects[getProjectId(project)] = project;

      return {
        categoryId: getCategoryId(category),
        productId: getProductId(product),
        projectId: getProjectId(project),
        ...split,
      };
    });

    const loans = ctx.loans?.map<Partial<Requests.LoanItem>>(({ category, product, project, loanAccount, ...split }) => {
      categories[getCategoryId(category)] = category;
      products[getProductId(product)] = product;
      projects[getProjectId(project)] = project;
      accounts[getAccountId(loanAccount)] = loanAccount;

      return {
        categoryId: getCategoryId(category),
        productId: getProductId(product),
        projectId: getProjectId(project),
        loanAccountId: getAccountId(loanAccount),
        transactionId: deferredTransactionDataFactory.id(), // TODO
        ...split,
      };
    });

    const body = testDataFactory.transaction.request.split({
      ...ctx.body,
      accountId: getAccountId(ctx.account),
      recipientId: getRecipientId(ctx.recipient),
      ...(Object.hasOwn(ctx, 'splits') ? {
        splits,
      } : {}),
      ...(Object.hasOwn(ctx, 'loans') ? {
        loans,
      } : {}),
    });

    const doc = splitTransactionDocumentConverter.create({
      body,
      accounts,
      categories,
      products,
      projects,
      recipient: ctx.recipient,
    }, Number(process.env.EXPIRES_IN), true);

    return doc;
  };

  return {
    request: testDataFactory.transaction.request.split,
    document: createSplitTransactionDocument,
    id: testDataFactory.transaction.id,
  };
})();
