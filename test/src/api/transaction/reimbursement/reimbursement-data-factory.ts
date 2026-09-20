import { getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId } from '@household/shared/common/utils';
import { Documents } from '@household/shared/types/documents';
import { reimbursementTransactionDocumentConverter } from '@household/shared/dependencies/converters/reimbursement-transaction-document-converter';
import { AccountType } from '@household/shared/enums';
import { Requests } from '@household/shared/types/requests';
import { testDataFactory } from '@household/shared/common/test-data-factory';

export const reimbursementTransactionDataFactory = (() => {
  const createReimbursementTransactionDocument = (ctx: {
    body?: Partial<Requests.PaymentTransaction>;
    account: Documents.Account;
    loanAccount: Documents.Account;
    category?: Documents.Category;
    product?: Documents.Product;
    project?: Documents.Project;
    recipient?: Documents.Recipient;
  }): Documents.ReimbursementTransaction => {
    if (ctx.account.accountType !== AccountType.Loan) {
      throw 'Paying account type must be loan in reimbursement transaction';
    }

    if (ctx.loanAccount.accountType === AccountType.Loan) {
      throw 'Owner account type cannot be loan in reimbursement transaction';
    }

    if (ctx?.body?.amount >= 0) {
      throw 'Amount must be negative in reimbursement transaction';
    }

    return reimbursementTransactionDocumentConverter.create({
      body: testDataFactory.transaction.request.payment({
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
    }, Number(process.env.EXPIRES_IN), true);
  };

  return {
    id: testDataFactory.transaction.id,
    request: testDataFactory.transaction.request.payment,
    document: createReimbursementTransactionDocument,
  };
})();
