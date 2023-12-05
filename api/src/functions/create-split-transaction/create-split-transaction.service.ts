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

    for (const s of body.splits) {
      total += s.amount;
      if (s.categoryId && !categoryIds.includes(s.categoryId)) {
        categoryIds.push(s.categoryId);
      }
      if (s.projectId && !projectIds.includes(s.projectId)) {
        projectIds.push(s.projectId);
      }
      if (s.inventory?.productId && !productIds.includes(s.inventory.productId)) {
        productIds.push(s.inventory.productId);
      }
    }

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
      const productId = s.inventory?.productId;
      if (category?.categoryType === 'inventory' && productId) {
        const product = products[productId];

        httpErrors.product.notFound(!product && !!productId, {
          productId,
        }, 400);

        httpErrors.product.categoryRelation(getCategoryId(product.category) !== s.categoryId, {
          categoryId: s.categoryId,
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
