import { httpErrors } from '@household/api/common/error-handlers';
import { isCategoryId, isProductId, isProjectId, isRecipientId } from '@household/shared/common/type-guards';
import { getProductId, getTransactionId } from '@household/shared/common/utils';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
import { IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { IAccountService } from '@household/shared/services/account-service';
import { ICategoryService } from '@household/shared/services/category-service';
import { IProductService } from '@household/shared/services/product-service';
import { IProjectService } from '@household/shared/services/project-service';
import { IRecipientService } from '@household/shared/services/recipient-service';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';

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
  categoryDocumentConverter: ICategoryDocumentConverter,
  projectDocumentConverter: IProjectDocumentConverter,
  recipientDocumentConverter: IRecipientDocumentConverter,
  productDocumentConverter: IProductDocumentConverter,
): ICreatePaymentTransactionService => {
  return async ({ body, expiresIn }) => {
    const { accountId } = body;
    let categoryId: Category.Id;
    let parentCategoryId: Category.Id;
    let projectId: Project.Id;
    let recipientId: Recipient.Id;
    let productId: Product.Id;
    let categoryRequest: Category.Request;
    let projectRequest: Project.Request;
    let recipientRequest: Recipient.Request;
    let productRequest: Product.Request;

    if (isCategoryId(body.category)) {
      categoryId = body.category.categoryId;
    } else {
      categoryRequest = body.category;
      parentCategoryId = body.category.parentCategoryId;
    }

    if (isProjectId(body.project)) {
      projectId = body.project.projectId;
    } else {
      projectRequest = body.project;
    }

    if (isRecipientId(body.recipient)) {
      recipientId = body.recipient.recipientId;
    } else {
      recipientRequest = body.recipient;
    }

    if (body.inventory) {
      if (isProductId(body.inventory.product)) {
        productId = body.inventory.product.productId;
      } else {
        productRequest = body.inventory.product;
      }
    }

    const [
      account,
      category,
      parentCategory,
      project,
      recipient,
      product,
    ] = await Promise.all([
      accountService.getAccountById(accountId),
      categoryService.getCategoryById(categoryId),
      categoryService.getCategoryById(parentCategoryId),
      projectService.getProjectById(projectId),
      recipientService.getRecipientById(recipientId),
      productService.getProductById(productId),
    ]).catch(httpErrors.common.getRelatedData({
      accountId,
      categoryId,
      parentCategoryId,
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

    httpErrors.category.parentNotFound(!parentCategory && !!parentCategoryId, {
      parentCategoryId,
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

      httpErrors.product.categoryRelation(!category.products.find(product => getProductId(product) === productId), {
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

    const categoryDocuments = categoryRequest ? [
      categoryDocumentConverter.create({
        body: categoryRequest,
        parentCategory,
      }, expiresIn),
    ] : undefined;
    const projectDocuments = projectRequest ? [projectDocumentConverter.create(projectRequest, expiresIn)] : undefined;
    const recipientDocuments = recipientRequest ? [recipientDocumentConverter.create(recipientRequest, expiresIn)] : undefined;
    const productDocuments = productRequest ? [productDocumentConverter.create(productRequest, expiresIn)] : undefined;

    const saved = await transactionService.saveTransaction(document, {
      categories: categoryDocuments,
      projects: projectDocuments,
      recipients: recipientDocuments,
      products: productDocuments,
    }).catch(httpErrors.transaction.save(document));

    return getTransactionId(saved);
  };
};
