import { httpErrors } from '@household/api/common/error-handlers';
import { getCategoryId, getTransactionId, toDictionary } from '@household/shared/common/utils';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { IAccountService } from '@household/shared/services/account-service';
import { ICategoryService } from '@household/shared/services/category-service';
import { IProductService } from '@household/shared/services/product-service';
import { IProjectService } from '@household/shared/services/project-service';
import { IRecipientService } from '@household/shared/services/recipient-service';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Category, Product, Project, Transaction } from '@household/shared/types/types';

export interface ICreateSplitTransactionService {
  (ctx: {
    body: Transaction.SplitRequest;
    expiresIn: number;
  }): Promise<Transaction.Id>;
}

export const createSplitTransactionServiceFactory = (
  accountService: IAccountService,
  projectService: IProjectService,
  categoryService: ICategoryService,
  recipientService: IRecipientService,
  productService: IProductService,
  transactionService: ITransactionService,
  transactionDocumentConverter: ITransactionDocumentConverter,
): ICreateSplitTransactionService => {
  return async ({ body, expiresIn }) => {
    let total = 0;
    const categoryIds: Category.Id[] = [];
    const projectIds: Project.Id[] = [];
    const productIds: Product.Id[] = [];

    body.splits.forEach(({ amount, categoryId, productId, projectId }) => {
      total += amount;
      if (categoryId && !categoryIds.includes(categoryId)) {
        categoryIds.push(categoryId);
      }
      if (projectId && !projectIds.includes(projectId)) {
        projectIds.push(projectId);
      }
      if (productId && !productIds.includes(productId)) {
        productIds.push(productId);
      }
    });

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

    body.splits.forEach(({ categoryId, productId }) => {
      const category = categories[categoryId];
      if (category?.categoryType === 'inventory' && productId) {
        const product = products[productId];

        httpErrors.product.notFound(!product && !!productId, {
          productId,
        }, 400);

        httpErrors.product.categoryRelation(getCategoryId(product.category) !== categoryId, {
          categoryId: categoryId,
          productId,
        });
      }
    });

    const document = transactionDocumentConverter.createSplitDocument({
      body,
      account,
      recipient,
      categories,
      projects,
      products,
    }, expiresIn);

    const saved = await transactionService.saveTransaction(document).catch(httpErrors.transaction.save(document));

    return getTransactionId(saved);
  };
};
