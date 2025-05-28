import { httpErrors } from '@household/api/common/error-handlers';
import { pushUnique, toDictionary } from '@household/shared/common/utils';
import { ISplitTransactionDocumentConverter } from '@household/shared/converters/split-transaction-document-converter';
import { CategoryType } from '@household/shared/enums';
import { IAccountService } from '@household/shared/services/account-service';
import { ICategoryService } from '@household/shared/services/category-service';
import { IProductService } from '@household/shared/services/product-service';
import { IProjectService } from '@household/shared/services/project-service';
import { IRecipientService } from '@household/shared/services/recipient-service';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Account, Category, Product, Project, Transaction } from '@household/shared/types/types';

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
  splitTransactionDocumentConverter: ISplitTransactionDocumentConverter,
): IUpdateToSplitTransactionService => {
  return async ({ body, transactionId, expiresIn }) => {
    const queriedDocument = await transactionService.getTransactionById(transactionId).catch(httpErrors.transaction.getById({
      transactionId,
    }));

    httpErrors.transaction.notFound({
      transaction: queriedDocument,
      transactionId,
    });

    const { accountId, recipientId } = body;
    const splits = body.splits ?? [];
    const loans = body.loans ?? [];
    let total = 0;
    const categoryIds: Category.Id[] = [];
    const projectIds: Project.Id[] = [];
    const productIds: Product.Id[] = [];
    const accountIds: Account.Id[] = [accountId];

    splits.forEach(({ amount, categoryId, productId, projectId }) => {
      total += amount;
      pushUnique(categoryIds, categoryId);
      pushUnique(projectIds, projectId);
      pushUnique(productIds, productId);
    });

    loans.forEach(({ amount, categoryId, productId, projectId, loanAccountId }) => {
      httpErrors.transaction.sameAccountLoan({
        accountId,
        loanAccountId,
      });
      total += amount;
      pushUnique(categoryIds, categoryId);
      pushUnique(projectIds, projectId);
      pushUnique(productIds, productId);
      pushUnique(accountIds, loanAccountId);
    });

    httpErrors.transaction.sumOfSplits({
      body,
      total,
    });

    const [
      accountList,
      categoryList,
      projectList,
      recipient,
      productList,
    ] = await Promise.all([
      accountService.findAccountsByIds(accountIds),
      categoryService.findCategoriesByIds(categoryIds),
      projectService.findProjectsByIds(projectIds),
      recipientService.findRecipientById(recipientId),
      productService.listProductsByIds(productIds),
    ]).catch(httpErrors.common.getRelatedData({
      accountIds,
      categoryIds,
      productIds,
      projectIds,
      recipientId,
    }));

    httpErrors.account.multipleNotFound({
      accounts: accountList,
      accountIds,
    });

    httpErrors.category.multipleNotFound({
      categoryIds,
      categories: categoryList,
    });

    httpErrors.project.multipleNotFound({
      projectIds,
      projects: projectList,
    });

    httpErrors.recipient.notFound({
      recipientId,
      recipient,
    }, 400);

    const categories = toDictionary(categoryList, '_id');
    const projects = toDictionary(projectList, '_id');
    const products = toDictionary(productList, '_id');
    const accounts = toDictionary(accountList, '_id');

    [
      ...splits,
      ...loans,
    ].forEach((split) => {
      const { categoryId, productId } = split;
      const category = categories[categoryId];
      const product = products[productId];
      if (category?.categoryType === CategoryType.Inventory && productId) {

        httpErrors.product.notFound({
          productId,
          product,
        }, 400);

        httpErrors.product.categoryRelation({
          categoryId,
          product,
        });
      }
    });

    httpErrors.transaction.invalidLoanAccountType(accounts[body.accountId]);

    const update = splitTransactionDocumentConverter.update({
      body,
      accounts,
      categories,
      products,
      projects,
      recipient,
    }, expiresIn);

    await transactionService.updateTransaction(transactionId, update).catch(httpErrors.transaction.update(update));
  };
};
