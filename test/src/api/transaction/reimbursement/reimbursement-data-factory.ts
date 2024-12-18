import { getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId } from '@household/shared/common/utils';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { reimbursementTransactionDocumentConverter } from '@household/shared/dependencies/converters/reimbursement-transaction-document-converter';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';

export const reimbursementTransactionDataFactory = (() => {
  const createReimbursementTransactionDocument = (ctx: {
    body?: Partial<Transaction.PaymentRequest>;
    account: Account.Document;
    loanAccount: Account.Document;
    category?: Category.Document;
    product?: Product.Document;
    project?: Project.Document;
    recipient?: Recipient.Document;
  }): Transaction.ReimbursementDocument => {
    if (ctx.account.accountType !== 'loan') {
      throw 'Paying account type must be loan in reimbursement transaction';
    }

    if (ctx.loanAccount.accountType === 'loan') {
      throw 'Owner account type cannot be loan in reimbursement transaction';
    }

    return reimbursementTransactionDocumentConverter.create({
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
    document: createReimbursementTransactionDocument,
  };
})();
