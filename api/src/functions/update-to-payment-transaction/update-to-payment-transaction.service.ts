import { httpErrors } from '@household/api/common/error-handlers';
import { getAccountId, getCategoryId } from '@household/shared/common/utils';
import { IDeferredTransactionDocumentConverter } from '@household/shared/converters/deferred-transaction-document-converter';
import { IPaymentTransactionDocumentConverter } from '@household/shared/converters/payment-transaction-document-converter';
import { IReimbursementTransactionDocumentConverter } from '@household/shared/converters/reimbursement-transaction-document-converter';
import { IAccountService } from '@household/shared/services/account-service';
import { ICategoryService } from '@household/shared/services/category-service';
import { IProductService } from '@household/shared/services/product-service';
import { IProjectService } from '@household/shared/services/project-service';
import { IRecipientService } from '@household/shared/services/recipient-service';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Transaction } from '@household/shared/types/types';

export interface IUpdateToPaymentTransactionService {
  (ctx: {
    body: Transaction.PaymentRequest;
    transactionId: Transaction.Id;
    expiresIn: number;
  }): Promise<void>;
}

export const updateToPaymentTransactionServiceFactory = (
  accountService: IAccountService,
  projectService: IProjectService,
  categoryService: ICategoryService,
  recipientService: IRecipientService,
  productService: IProductService,
  transactionService: ITransactionService,
  paymentTransactionDocumentConverter: IPaymentTransactionDocumentConverter,
  reimbursementTransactionDocumentConverter: IReimbursementTransactionDocumentConverter,
  deferredTransactionDocumentConverter: IDeferredTransactionDocumentConverter,
): IUpdateToPaymentTransactionService => {
  return async ({ body, transactionId, expiresIn }) => {
    const queriedDocument = await transactionService.getTransactionById(transactionId).catch(httpErrors.transaction.getById({
      transactionId,
    }));

    httpErrors.transaction.notFound(!queriedDocument, {
      transactionId,
    });

    const { accountId, categoryId, projectId, recipientId, productId, loanAccountId } = body;

    httpErrors.transaction.sameAccountLoan({
      accountId,
      loanAccountId,
    });

    const [
      accounts,
      category,
      project,
      recipient,
      product,
    ] = await Promise.all([
      accountService.listAccountsByIds([
        accountId,
        loanAccountId,
      ]),
      categoryService.getCategoryById(categoryId),
      projectService.getProjectById(projectId),
      recipientService.getRecipientById(recipientId),
      productService.getProductById(productId),
    ]).catch(httpErrors.common.getRelatedData({
      accountId,
      loanAccountId,
      categoryId,
      productId,
      projectId,
      recipientId,
    }));

    const account = accounts.find(a => getAccountId(a) === accountId);
    const loanAccount = accounts.find(a => getAccountId(a) === loanAccountId);

    httpErrors.account.notFound(!account, {
      accountId,
    }, 400);

    httpErrors.account.notFound(!loanAccount && !!loanAccountId, {
      accountId: loanAccountId,
    }, 400);

    httpErrors.category.notFound(!category && !!categoryId, {
      categoryId,
    }, 400);

    httpErrors.project.notFound(!project && !!projectId, {
      projectId,
    }, 400);

    httpErrors.recipient.notFound(!recipient && !!recipientId, {
      recipientId,
    }, 400);

    if (category?.categoryType === 'inventory' && productId) {
      httpErrors.product.notFound(!product, {
        productId,
      }, 400);

      httpErrors.product.categoryRelation(getCategoryId(product.category) !== categoryId, {
        productId,
        categoryId,
      });
    }

    if (!body.loanAccountId) {
      const { _id, ...document } = paymentTransactionDocumentConverter.create({
        body,
        account,
        category,
        project,
        recipient,
        product,
      }, expiresIn);

      await transactionService.replaceTransaction(transactionId, document);
    } else {
      const payingAccount = body.amount < 0 ? account : loanAccount;
      const ownerAccount = body.amount < 0 ? loanAccount : account;

      const { _id, ...document } = payingAccount.accountType === 'loan' ? reimbursementTransactionDocumentConverter.create({
        body,
        payingAccount,
        ownerAccount,
        category,
        project,
        recipient,
        product,
      }, expiresIn) : deferredTransactionDocumentConverter.create({
        body,
        payingAccount,
        ownerAccount,
        category,
        project,
        recipient,
        product,
      }, expiresIn);

      await transactionService.replaceTransaction(transactionId, document);
    }
  };
};
