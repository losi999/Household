import { getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId } from '@household/shared/common/utils';
import { splitTransactionDocumentConverter } from '@household/shared/dependencies/converters/split-transaction-document-converter';
import { DataFactoryFunction, Dictionary } from '@household/shared/types/common';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { faker } from '@faker-js/faker';
import { createId } from '@household/test/api/utils';

export const splitTransactionDataFactory = (() => {
  const createSplitRequestItem: DataFactoryFunction<Transaction.SplitRequestItem> = (req) => {
    const billingEndDate = faker.date.recent();
    return {
      amount: faker.number.float({
        min: -10000,
        max: 0,
      }),
      description: faker.word.words({
        count: {
          min: 1,
          max: 5,
        },
      }),
      billingEndDate: billingEndDate.toISOString(),
      billingStartDate: faker.date.recent({
        refDate: billingEndDate,
        days: 90,
      }).toISOString(),
      invoiceNumber: faker.finance.accountNumber(),
      quantity: faker.number.float({
        max: 20,
      }),
      productId: undefined,
      projectId: undefined,
      categoryId: undefined,
      loanAccountId: undefined,
      ...req,
    };
  };

  const createSplitTransactionRequest = (req?: Partial<Omit<Transaction.SplitRequest, 'splits'>>, ...splitsReq: Partial<Transaction.SplitRequestItem>[]): Transaction.SplitRequest => {
    const splits = splitsReq?.length > 0 ? splitsReq.map(s => createSplitRequestItem(s)) : [createSplitRequestItem()];

    return {
      amount: splits.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.amount;
      }, 0),
      description: faker.word.words({
        count: {
          min: 1,
          max: 5,
        },
      }),
      issuedAt: faker.date.recent().toISOString(),
      accountId: undefined,
      recipientId: undefined,
      splits,
      ...req,
    };
  };

  const createSplitTransactionDocument = (ctx: {
    body?: Partial<Omit<Transaction.SplitRequest, 'splits'>>;
    splits?: Partial<Transaction.SplitRequestItem &
    Transaction.Project<Project.Document> &
    Transaction.Category<Category.Document> &
    Transaction.Product<Product.Document> &
    {
      loanAccount: Account.Document;
    }>[];
    account: Account.Document;
    recipient?: Recipient.Document;
  }): Transaction.SplitDocument => {
    if (ctx.account.accountType === 'loan') {
      throw 'Account cannot be loan in split transaction';
    }

    const { accounts, categories, products, projects, splits } = (ctx.splits ?? []).reduce<{
      accounts: Dictionary<Account.Document>;
      categories: Dictionary<Category.Document>;
      products: Dictionary<Product.Document>;
      projects: Dictionary<Project.Document>;
      splits: Partial<Transaction.SplitRequestItem>[];
    }>((accumulator, { category, product, project, loanAccount, ...split }) => {
      if (category) {
        split.categoryId = getCategoryId(category);
        accumulator.categories[getCategoryId(category)] = category;
      }

      if (product) {
        split.productId = getProductId(product);
        accumulator.products[getProductId(product)] = product;
      }

      if (project) {
        split.projectId = getProjectId(project);
        accumulator.projects[getProjectId(project)] = project;
      }

      if (loanAccount) {
        split.loanAccountId = getAccountId(loanAccount);
        accumulator.accounts[getAccountId(loanAccount)] = loanAccount;
      }

      accumulator.splits.push(split);

      return accumulator;
    }, {
      accounts: {
        [getAccountId(ctx.account)]: ctx.account,
      },
      categories: {},
      products: {},
      projects: {},
      splits: [],
    }) ?? {};
    const body = createSplitTransactionRequest({
      ...ctx.body,
      accountId: getAccountId(ctx.account),
      recipientId: getRecipientId(ctx.recipient),
    }, ...splits);
    return splitTransactionDocumentConverter.create({
      body,
      accounts,
      categories,
      products,
      projects,
      recipient: ctx.recipient,
    }, Cypress.env('EXPIRES_IN'), true);
  };

  return {
    request: createSplitTransactionRequest,
    document: createSplitTransactionDocument,
    id: (createId<Transaction.Id>),
  };
})();
