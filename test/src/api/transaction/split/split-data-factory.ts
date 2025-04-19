import { addSeconds, getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId } from '@household/shared/common/utils';
import { splitTransactionDocumentConverter } from '@household/shared/dependencies/converters/split-transaction-document-converter';
import { DataFactoryFunction, Dictionary } from '@household/shared/types/common';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { faker } from '@faker-js/faker';
import { createId } from '@household/test/api/utils';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { AccountType } from '@household/shared/enums';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred/deferred-data-factory';

export const splitTransactionDataFactory = (() => {
  const createSplitRequestItem: DataFactoryFunction<Transaction.SplitRequestItem> = (req) => {
    const billingEndDate = faker.date.recent();
    return {
      amount: faker.number.float({
        min: -10000,
        max: 10,
      }),
      description: faker.string.uuid(),
      billingEndDate: billingEndDate.toISOString().split('T')[0],
      billingStartDate: faker.date.recent({
        refDate: addSeconds(-60 * 60 * 24, billingEndDate),
        days: 90,
      }).toISOString()
        .split('T')[0],
      invoiceNumber: faker.finance.accountNumber(),
      quantity: req?.productId ? faker.number.float({
        max: 20,
      }) : undefined,
      productId: undefined,
      projectId: undefined,
      categoryId: undefined,
      ...req,
    };
  };

  const createLoanRequestItem: DataFactoryFunction<Transaction.LoanRequestItem> = (req) => {
    const billingEndDate = faker.date.recent();
    return {
      isSettled: false,
      amount: faker.number.float({
        min: -10000,
        max: 0,
      }),
      description: faker.string.uuid(),
      billingEndDate: billingEndDate.toISOString().split('T')[0],
      billingStartDate: faker.date.recent({
        refDate: addSeconds(-60 * 60 * 24, billingEndDate),
        days: 90,
      }).toISOString()
        .split('T')[0],
      invoiceNumber: faker.finance.accountNumber(),
      quantity: req?.productId ? faker.number.float({
        max: 20,
      }) : undefined,
      productId: undefined,
      projectId: undefined,
      categoryId: undefined,
      loanAccountId: accountDataFactory.id(),
      transactionId: undefined,
      ...req,
    };
  };

  const createSplitTransactionRequest = (req?: Partial<Omit< Transaction.SplitRequest, 'splits' | 'loans'>>, splitsReq?: Partial<Transaction.SplitRequestItem>[], loansReq?: Partial<Transaction.LoanRequestItem>[]): Transaction.SplitRequest => {
    const splits = splitsReq ? splitsReq.map(s => createSplitRequestItem(s)) : [createSplitRequestItem()];
    const loans = loansReq ? loansReq.map(s => createLoanRequestItem(s)) : [createLoanRequestItem()];
    return {
      amount: [
        ...splits,
        ...loans,
      ].reduce((accumulator, currentValue) => {
        return accumulator + currentValue.amount;
      }, 0),
      description: faker.word.words({
        count: {
          min: 1,
          max: 5,
        },
      }),
      issuedAt: faker.date.recent().toISOString(),
      accountId: accountDataFactory.id(),
      recipientId: undefined,
      splits: splits.length > 0 ? splits : undefined,
      loans: loans.length > 0 ? loans : undefined,
      ...req,
    };
  };

  const createSplitTransactionDocument = (ctx: {
    body?: Partial<Omit<Transaction.SplitRequest, 'splits' | 'loans'>>;
    splits?: Partial<Transaction.SplitRequestItem &
    Transaction.Project<Project.Document> &
    Transaction.Category<Category.Document> &
    Transaction.Product<Product.Document>>[];
    loans?: (Partial<Transaction.LoanRequestItem &
    Transaction.Project<Project.Document> &
    Transaction.Category<Category.Document> &
    Transaction.Product<Product.Document>> &
    {
      loanAccount: Account.Document;
    })[];
    account: Account.Document;
    recipient?: Recipient.Document;
  }): Transaction.SplitDocument => {
    if (ctx.account.accountType === AccountType.Loan) {
      throw 'Account cannot be loan in split transaction';
    }

    const accounts: Dictionary<Account.Document> = {
      [getAccountId(ctx.account)]: ctx.account,
    };
    const categories: Dictionary<Category.Document> = {};
    const products: Dictionary<Product.Document> = {};
    const projects: Dictionary<Project.Document> = {};

    const splits = ctx.splits?.map<Partial<Transaction.SplitRequestItem>>(({ category, product, project, ...split }) => {
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

    const loans = ctx.loans?.map<Partial<Transaction.LoanRequestItem>>(({ category, product, project, loanAccount, ...split }) => {
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

    const body = createSplitTransactionRequest({
      ...ctx.body,
      accountId: getAccountId(ctx.account),
      recipientId: getRecipientId(ctx.recipient),
    }, splits, loans);
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
