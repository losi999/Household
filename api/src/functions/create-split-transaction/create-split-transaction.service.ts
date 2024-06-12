import { httpErrors } from '@household/api/common/error-handlers';
import { getCategoryId, getTransactionId, pushUnique, toDictionary } from '@household/shared/common/utils';
import { ISplitTransactionDocumentConverter } from '@household/shared/converters/split-transaction-document-converter';
import { IAccountService } from '@household/shared/services/account-service';
import { ICategoryService } from '@household/shared/services/category-service';
import { IProductService } from '@household/shared/services/product-service';
import { IProjectService } from '@household/shared/services/project-service';
import { IRecipientService } from '@household/shared/services/recipient-service';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Account, Category, Product, Project, Transaction } from '@household/shared/types/types';

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
  splitTransactionDocumentConverter: ISplitTransactionDocumentConverter,
): ICreateSplitTransactionService => {
  return async ({ body, expiresIn }) => {
    const { accountId, recipientId } = body;
    let total = 0;
    const categoryIds: Category.Id[] = [];
    const projectIds: Project.Id[] = [];
    const productIds: Product.Id[] = [];
    const accountIds: Account.Id[] = [accountId];

    body.splits.forEach(({ amount, categoryId, productId, projectId, loanAccountId }) => {
      httpErrors.transaction.sameAccountLoan({
        accountId,
        loanAccountId,
      });
      httpErrors.transaction.positiveSplitAmountLoan({
        amount,
        loanAccountId,
      });
      total += amount;
      pushUnique(categoryIds, categoryId);
      pushUnique(projectIds, projectId);
      pushUnique(productIds, productId);
      pushUnique(accountIds, loanAccountId);
    });

    httpErrors.transaction.sumOfSplits(total !== body.amount, body);

    const [
      accountList,
      categoryList,
      projectList,
      recipient,
      productList,
    ] = await Promise.all([
      accountService.listAccountsByIds(accountIds),
      categoryService.listCategoriesByIds(categoryIds),
      projectService.listProjectsByIds(projectIds),
      recipientService.getRecipientById(recipientId),
      productService.listProductsByIds(productIds),
    ]).catch(httpErrors.common.getRelatedData({
      accountIds,
      categoryIds,
      productIds,
      projectIds,
      recipientId,
    }));

    httpErrors.account.multipleNotFound(accountIds.length !== accountList.length, {
      accountIds,
    });

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
    const accounts = toDictionary(accountList, '_id');

    body.splits.forEach((split) => {
      const { categoryId, productId } = split;
      const category = categories[categoryId];
      const product = products[productId];
      if (category?.categoryType === 'inventory' && productId) {

        httpErrors.product.notFound(!product && !!productId, {
          productId,
        }, 400);

        httpErrors.product.categoryRelation(getCategoryId(product.category) !== categoryId, {
          categoryId,
          productId,
        });
      }
    });

    const document = splitTransactionDocumentConverter.create({
      body,
      accounts,
      recipient,
      categories,
      projects,
      products,
    }, expiresIn);

    console.log(document);

    const saved = await transactionService.saveTransaction(document).catch(httpErrors.transaction.save(document));

    return getTransactionId(saved);
  };
};
