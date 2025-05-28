import { httpErrors } from '@household/api/common/error-handlers';
import { getAccountId } from '@household/shared/common/utils';
import { IDeferredTransactionDocumentConverter } from '@household/shared/converters/deferred-transaction-document-converter';
import { IPaymentTransactionDocumentConverter } from '@household/shared/converters/payment-transaction-document-converter';
import { IReimbursementTransactionDocumentConverter } from '@household/shared/converters/reimbursement-transaction-document-converter';
import { AccountType, CategoryType } from '@household/shared/enums';
import { IAccountService } from '@household/shared/services/account-service';
import { ICategoryService } from '@household/shared/services/category-service';
import { IProductService } from '@household/shared/services/product-service';
import { IProjectService } from '@household/shared/services/project-service';
import { IRecipientService } from '@household/shared/services/recipient-service';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Transaction } from '@household/shared/types/types';
import { UpdateQuery } from 'mongoose';

export interface IUpdateToPaymentTransactionService {
  (ctx: {
    body: Transaction.PaymentRequest;
    transactionId: Transaction.Id;
    expiresIn: number;
  }): Promise<unknown>;
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

    httpErrors.transaction.notFound({
      transaction: queriedDocument,
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
      accountService.findAccountsByIds([
        accountId,
        loanAccountId,
      ]),
      categoryService.getCategoryById(categoryId),
      projectService.findProjectById(projectId),
      recipientService.findRecipientById(recipientId),
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
      account,
      accountId,
    }, 400);

    httpErrors.account.notFound({
      accountId: loanAccountId,
      account: loanAccount,
    }, 400);

    httpErrors.category.notFound({
      category,
      categoryId,
    }, 400);

    httpErrors.project.notFound({
      projectId,
      project,
    }, 400);

    httpErrors.recipient.notFound({
      recipientId,
      recipient,
    }, 400);

    if (category?.categoryType === CategoryType.Inventory && productId) {
      httpErrors.product.notFound({
        productId,
        product,
      }, 400);

      httpErrors.product.categoryRelation({
        product,
        categoryId,
      });
    }

    let update: UpdateQuery<Transaction.Document>;

    if (!body.loanAccountId) {
      httpErrors.transaction.invalidLoanAccountType(account);

      update = paymentTransactionDocumentConverter.update({
        body,
        account,
        category,
        project,
        recipient,
        product,
      }, expiresIn);
    } else {

      if (account.accountType === AccountType.Loan) {
        httpErrors.transaction.invalidLoanAccountType(loanAccount);

        update = reimbursementTransactionDocumentConverter.update({
          body,
          payingAccount: account,
          ownerAccount: loanAccount,
          category,
          project,
          recipient,
          product,
        }, expiresIn);
      } else {
        update = deferredTransactionDocumentConverter.update({
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

    return transactionService.updateTransaction(transactionId, update).catch(httpErrors.transaction.update(update));
  };
};
