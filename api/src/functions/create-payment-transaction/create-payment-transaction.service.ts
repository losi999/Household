import { httpErrors } from '@household/api/common/error-handlers';
import { getAccountId, getTransactionId } from '@household/shared/common/utils';
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

export interface ICreatePaymentTransactionService {
  (ctx: {
    body: Transaction.PaymentRequest;
    expiresIn: number;
  }): Promise<Transaction.Id>;
}

export const createPaymentTransactionServiceFactory = (
  accountService: IAccountService,
  projectService: IProjectService,
  categoryService: ICategoryService,
  recipientService: IRecipientService,
  productService: IProductService,
  transactionService: ITransactionService,
  paymentTransactionDocumentConverter: IPaymentTransactionDocumentConverter,
  reimbursementTransactionDocumentConverter: IReimbursementTransactionDocumentConverter,
  deferredTransactionDocumentConverter: IDeferredTransactionDocumentConverter,
): ICreatePaymentTransactionService => {
  return async ({ body, expiresIn }) => {
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

    httpErrors.account.notFound({
      account: account,
      accountId,
    }, 400);

    httpErrors.account.notFound({
      accountId: loanAccountId,
      account: loanAccount,
    }, 400);

    httpErrors.category.notFound({
      categoryId,
      category: category,
    }, 400);

    httpErrors.project.notFound({
      projectId,
      project: project,
    }, 400);

    httpErrors.recipient.notFound({
      recipientId,
      recipient: recipient,
    }, 400);

    if (category?.categoryType === 'inventory' && productId) {
      httpErrors.product.notFound({
        product: product,
        productId,
      }, 400);

      httpErrors.product.categoryRelation({
        product,
        categoryId,
      });
    }

    let document: Transaction.PaymentDocument | Transaction.DeferredDocument | Transaction.ReimbursementDocument;

    if (!body.loanAccountId) {
      httpErrors.transaction.invalidLoanAccountType(account);

      document = paymentTransactionDocumentConverter.create({
        body,
        account,
        category,
        project,
        recipient,
        product,
      }, expiresIn);
    } else {
      if (account.accountType === 'loan') {
        httpErrors.transaction.invalidLoanAccountType(loanAccount);

        document = reimbursementTransactionDocumentConverter.create({
          body,
          payingAccount: account,
          ownerAccount: loanAccount,
          category,
          project,
          recipient,
          product,
        }, expiresIn);
      } else {
        document = deferredTransactionDocumentConverter.create({
          body,
          payingAccount: account,
          ownerAccount: loanAccount,
          category,
          project,
          recipient,
          product,
        }, expiresIn);
      }
    }

    const saved = await transactionService.saveTransaction(document).catch(httpErrors.transaction.save(document));

    return getTransactionId(saved);
  };
};
