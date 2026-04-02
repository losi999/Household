import { getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId } from '@household/shared/common/utils';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { deferredTransactionDocumentConverter } from '@household/shared/dependencies/converters/deferred-transaction-document-converter';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { AccountType } from '@household/shared/enums';

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
    if (ctx.account.accountType === AccountType.Loan) {
      throw 'Paying account type cannot be loan in deferred transaction';
    }

    return deferredTransactionDocumentConverter.create({
      body: paymentTransactionDataFactory.request({
        ...ctx.body,
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
    id: paymentTransactionDataFactory.id,
    request: paymentTransactionDataFactory.request,
    document: createDeferredTransactionDocument,
  };
})();
