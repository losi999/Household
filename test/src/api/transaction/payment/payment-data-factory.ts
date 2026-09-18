import { getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId } from '@household/shared/common/utils';
import { paymentTransactionDocumentConverter } from '@household/shared/dependencies/converters/payment-transaction-document-converter';
import { Documents } from '@household/shared/types/documents';
import { AccountType } from '@household/shared/enums';
import { Requests } from '@household/shared/types/requests';
import { testDataFactory } from '@household/shared/common/test-data-factory';

export const paymentTransactionDataFactory = (() => {
  const createPaymentTransactionDocument = (ctx: {
    body?: Partial<Requests.PaymentTransaction>;
    account: Documents.Account;
    category?: Documents.Category;
    product?: Documents.Product;
    project?: Documents.Project;
    recipient?: Documents.Recipient;
  }): Documents.PaymentTransaction => {
    if (ctx.account.accountType === AccountType.Loan) {
      throw 'Account cannot be loan in payment transaction';
    }

    return paymentTransactionDocumentConverter.create({
      body: testDataFactory.transaction.request.payment({
        ...ctx.body,
        accountId: getAccountId(ctx.account),
        categoryId: getCategoryId(ctx.category),
        productId: getProductId(ctx.product),
        projectId: getProjectId(ctx.project),
        recipientId: getRecipientId(ctx.recipient),
      }),
      account: ctx.account,
      category: ctx.category,
      product: ctx.product,
      project: ctx.project,
      recipient: ctx.recipient,
    }, Number(process.env.EXPIRES_IN), true);
  };

  return {
    request: testDataFactory.transaction.request.payment,
    document: createPaymentTransactionDocument,
    id: testDataFactory.transaction.id,
  };
})();
