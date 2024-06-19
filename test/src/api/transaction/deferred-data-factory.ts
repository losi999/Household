import { getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId } from '@household/shared/common/utils';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { deferredTransactionDocumentConverter } from '@household/shared/dependencies/converters/deferred-transaction-document-converter';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment-data-factory';
import { faker } from '@faker-js/faker';

export const deferredTransactionDataFactory = (() => {
  const createDeferredTransactionDocument = (ctx: {
    body?: Partial<Transaction.PaymentRequest>;
    account: Account.Document;
    loanAccount: Account.Document;
    category?: Category.Document;
    product?: Product.Document;
    project?: Project.Document;
    recipient?: Recipient.Document;
  }): Transaction.DeferredDocument => {
    if (ctx.account.accountType === 'loan') {
      throw 'Paying account type cannot be loan in deferred transaction';
    }

    return deferredTransactionDocumentConverter.create({
      body: paymentTransactionDataFactory.request({
        ...ctx.body,
        amount: ctx.body?.amount < 0 ? ctx.body.amount : faker.number.float({
          min: -10000,
          max: 0,
        }),
        accountId: getAccountId(ctx.account),
        loanAccountId: getAccountId(ctx.loanAccount),
        categoryId: getCategoryId(ctx.category),
        productId: getProductId(ctx.product),
        projectId: getProjectId(ctx.project),
        recipientId: getRecipientId(ctx.recipient),
      }),
      payingAccount: ctx.account,
      ownerAccount: ctx.loanAccount,
      category: ctx.category,
      product: ctx.product,
      project: ctx.project,
      recipient: ctx.recipient,
    }, Cypress.env('EXPIRES_IN'), true);
  };

  return {
    document: createDeferredTransactionDocument,
  };
})();
