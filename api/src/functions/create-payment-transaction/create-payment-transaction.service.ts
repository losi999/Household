import { httpErrors } from '@household/api/common/error-handlers';
import { getCategoryId, getTransactionId } from '@household/shared/common/utils';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
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
  transactionDocumentConverter: ITransactionDocumentConverter,
): ICreatePaymentTransactionService => {
  return async ({ body, expiresIn }) => {
    const { accountId, categoryId, projectId, recipientId, productId } = body;

    const [
      account,
      category,
      project,
      recipient,
      product,
    ] = await Promise.all([
      accountService.getAccountById(accountId),
      categoryService.getCategoryById(categoryId),
      projectService.getProjectById(projectId),
      recipientService.getRecipientById(recipientId),
      productService.getProductById(productId),
    ]).catch(httpErrors.common.getRelatedData({
      accountId,
      categoryId,
      productId,
      projectId,
      recipientId,
    }));

    httpErrors.account.notFound(!account, {
      accountId,
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

    const document = transactionDocumentConverter.createPaymentDocument({
      body,
      account,
      category,
      project,
      recipient,
      product,
    }, expiresIn);

    const saved = await transactionService.saveTransaction(document).catch(httpErrors.transaction.save(document));

    return getTransactionId(saved);
  };
};
