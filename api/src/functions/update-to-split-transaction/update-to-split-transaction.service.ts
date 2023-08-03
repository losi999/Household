import { httpErrors } from '@household/api/common/error-handlers';
import { getProductId, toDictionary } from '@household/shared/common/utils';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { IAccountService } from '@household/shared/services/account-service';
import { ICategoryService } from '@household/shared/services/category-service';
import { IProductService } from '@household/shared/services/product-service';
import { IProjectService } from '@household/shared/services/project-service';
import { IRecipientService } from '@household/shared/services/recipient-service';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Transaction } from '@household/shared/types/types';

export interface IUpdateToSplitTransactionService {
  (ctx: {
    body: Transaction.SplitRequest;
    transactionId: Transaction.Id;
    expiresIn: number;
  }): Promise<void>;
}

export const updateToSplitTransactionServiceFactory = (
  accountService: IAccountService,
  projectService: IProjectService,
  categoryService: ICategoryService,
  recipientService: IRecipientService,
  productService: IProductService,
  transactionService: ITransactionService,
  transactionDocumentConverter: ITransactionDocumentConverter,
): IUpdateToSplitTransactionService => {
  return async ({ body, transactionId, expiresIn }) => {
    const document = await transactionService.getTransactionById(transactionId).catch(httpErrors.transaction.getById({
      transactionId,
    }));

    httpErrors.transaction.notFound(!document, {
      transactionId,
    });

    const categoryIds = [...new Set(body.splits.map(s => s.categoryId).filter(s => s))];
    const projectIds = [...new Set(body.splits.map(s => s.projectId).filter(s => s))];
    const productIds = [...new Set(body.splits.map(s => s.inventory?.productId).filter(s => s))];

    const total = body.splits.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.amount;
    }, 0);

    httpErrors.transaction.sumOfSplits(total !== body.amount, body);

    const { accountId, recipientId } = body;

    const [
      account,
      categoryList,
      projectList,
      recipient,
      productList,
    ] = await Promise.all([
      accountService.getAccountById(accountId),
      categoryService.listCategoriesByIds(categoryIds),
      projectService.listProjectsByIds(projectIds),
      recipientService.getRecipientById(recipientId),
      productService.listProductsByIds(productIds),
    ]).catch(httpErrors.common.getRelatedData({
      accountId,
      categoryIds,
      productIds,
      projectIds,
      recipientId,
    }));

    httpErrors.account.notFound(!account, {
      accountId,
    }, 400);

    httpErrors.category.multipleNotFound(categoryIds.length !== categoryList.length, {
      categoryIds,
    });

    httpErrors.project.multipleNotFound(projectIds.length !== projectList.length, {
      projectIds,
    });

    httpErrors.recipient.notFound(!recipient && !!recipientId, {
      recipientId,
    }, 400);

    const categories = toDictionary(categoryList, '_id');
    const projects = toDictionary(projectList, '_id');
    const products = toDictionary(productList, '_id');

    body.splits.forEach((s) => {
      const category = categories[s.categoryId];
      if (category?.categoryType === 'inventory' && s.inventory) {
        const productId = s.inventory.productId;
        const product = products[productId];

        httpErrors.product.notFound(!product && !!productId, {
          productId,
        }, 400);

        httpErrors.product.categoryRelation(!category.products.find(product => getProductId(product) === productId), {
          categoryId: s.categoryId,
          productId,
        });
      }
    });

    const updated = transactionDocumentConverter.updateSplitDocument({
      body,
      account,
      projects,
      categories,
      recipient,
      products,
      document,
    }, expiresIn);

    await transactionService.updateTransaction(updated).catch(httpErrors.transaction.update(updated));
  };
};
