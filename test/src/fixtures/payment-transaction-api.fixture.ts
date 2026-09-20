import { createDate, getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId, getTransactionId } from '@household/shared/common/utils';
import { Documents } from '@household/shared/types/documents';
import { Api } from '@household/shared/types/api';
import { Reassignment } from '@household/test/types';
import { APIResponse, expect as baseExpect } from '@playwright/test';
import { CategoryType, TransactionType } from '@household/shared/enums';
import { validateProjectResponse } from '@household/test/fixtures/project-api.fixture';
import { Comparer } from '@household/test/comparer';
import { validateAccountLeanResponse } from '@household/test/fixtures/account-api.fixture';
import { validateRecipientResponse } from '@household/test/fixtures/recipient-api.fixture';
import { validateCategoryResponse } from '@household/test/fixtures/category-api.fixture';
import { validateProductResponse } from '@household/test/fixtures/product-api.fixture';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';

export const validatePaymentTransactionResponse = (response: Responses.PaymentTransaction, document: Documents.PaymentTransaction) => {
  return new Comparer(response, {
    transactionId: getTransactionId(document),
    amount: document.amount,
    issuedAt: document.issuedAt.toISOString(),
    description: document.description,
    transactionType: document.transactionType,
    project: validateProjectResponse(response.project, document.project),
    account: validateAccountLeanResponse(response.account, document.account),
    recipient: validateRecipientResponse(response.recipient, document.recipient),
    category: validateCategoryResponse(response.category, document.category),
    product: validateProductResponse(response.product, document.product),
    quantity: document.quantity,
    billingStartDate: document.billingStartDate?.toISOString().split('T')[0],
    billingEndDate: document.billingEndDate?.toISOString().split('T')[0],
    invoiceNumber: document.invoiceNumber,
  });
};

export const expect = baseExpect.extend({
  toHaveBeenSavedAsPaymentTransactionDocument(req: Requests.PaymentTransaction, document: Documents.PaymentTransaction) {
    if (!document) {
      return {
        pass: false,
        message: () => 'Expected transaction to be stored in database, but it was not found',
      };
    }

    const comparer = new Comparer(document, {
      transactionType: TransactionType.Payment,
      description: req.description,
      amount: req.amount,
      issuedAt: createDate(req.issuedAt).toISOString(),
      account: req.accountId,
      category: req.categoryId,
      project: req.projectId,
      recipient: req.recipientId,
      quantity: document.category?.categoryType === CategoryType.Inventory ? req.quantity : undefined,
      product: document.category?.categoryType === CategoryType.Inventory ? req.productId : undefined,
      invoiceNumber: document.category?.categoryType === CategoryType.Invoice ? req.invoiceNumber : undefined,
      billingStartDate: document.category?.categoryType === CategoryType.Invoice ? createDate(req.billingStartDate)?.toISOString() : undefined,
      billingEndDate: document.category?.categoryType === CategoryType.Invoice ? createDate(req.billingEndDate)?.toISOString() : undefined,
    }, '_id', 'createdAt', 'expiresAt', 'updatedAt');

    const errors = comparer.validate();

    return {
      pass: !errors.length,
      message: () => `Expected payment transaction to be stored in database, but it was not:\n${errors.join('\n')}`,
    };
  },
  toHaveRelatedDocumentsChangedInPaymentTransaction(originalDocument: Documents.PaymentTransaction, currentDocument: Documents.PaymentTransaction, reassignments: {
    recipient?: Reassignment<Api.Recipient.Id>;
    project?: Reassignment<Api.Project.Id>;
    product?: Reassignment<Api.Product.Id>;
    category?: Reassignment<Documents.Category>;
  }) {

    let expectedQuantity: number;
    let expectedInvoiceNumber: string;
    let expectedBillingStartDate: string;
    let expectedBillingEndDate: string;
    let expectedProduct: Api.Product.Id;

    if (reassignments.category && getCategoryId(originalDocument.category) === getCategoryId(reassignments.category.from)) { 
      expectedInvoiceNumber = reassignments.category.from.categoryType === reassignments.category.to?.categoryType ? originalDocument.invoiceNumber : undefined;
      expectedBillingStartDate = reassignments.category.from.categoryType === reassignments.category.to?.categoryType ? originalDocument.billingStartDate?.toISOString() : undefined;
      expectedBillingEndDate = reassignments.category.from.categoryType === reassignments.category.to?.categoryType ? originalDocument.billingEndDate?.toISOString() : undefined;
      expectedQuantity = reassignments.category.from.categoryType === reassignments.category.to?.categoryType ? originalDocument.quantity : undefined;
      expectedProduct = reassignments.category.from.categoryType === reassignments.category.to?.categoryType ? getProductId(originalDocument.product) : undefined;
    } else {
      expectedInvoiceNumber = originalDocument.invoiceNumber;
      expectedBillingStartDate = originalDocument.billingStartDate?.toISOString();
      expectedBillingEndDate = originalDocument.billingEndDate?.toISOString();
      expectedQuantity = getProductId(originalDocument.product) === reassignments.product?.from && !reassignments.product?.to ? undefined : originalDocument.quantity;
      expectedProduct = getProductId(originalDocument.product) === reassignments.product?.from ? reassignments.product?.to : getProductId(originalDocument.product);
    }
    const comparer = new Comparer(currentDocument, {
      amount: originalDocument.amount,
      issuedAt: originalDocument.issuedAt.toISOString(),
      description: originalDocument.description,
      account: getAccountId(originalDocument.account),
      transactionType: originalDocument.transactionType,
      product: expectedProduct,
      project: reassignments.project?.from === getProjectId(originalDocument.project) ? reassignments.project?.to : getProjectId(originalDocument.project),
      recipient: reassignments.recipient?.from === getRecipientId(originalDocument.recipient) ? reassignments.recipient?.to : getRecipientId(originalDocument.recipient),
      category: getCategoryId(reassignments.category?.from) === getCategoryId(originalDocument.category) ? getCategoryId(reassignments.category?.to) : getCategoryId(originalDocument.category),
      quantity: expectedQuantity,
      billingStartDate: expectedBillingStartDate,
      billingEndDate: expectedBillingEndDate,
      invoiceNumber: expectedInvoiceNumber,
    }, '_id', 'createdAt', 'expiresAt', 'updatedAt');

    const errors = comparer.validate();

    return {
      pass: errors.length === 0,
      message: () => `Expected document to match payment transaction, but it did not:\n${errors.join('\n')}`,
    };
  },
  toBeConvertedToPaymentTransaction(originalDocument: Documents.DeferredTransaction, currentDocument: Documents.PaymentTransaction) {

    const comparer = new Comparer(currentDocument, {
      amount: originalDocument.amount,
      issuedAt: originalDocument.issuedAt.toISOString(),
      description: originalDocument.description,
      account: getAccountId(originalDocument.payingAccount),
      transactionType: TransactionType.Payment,
      product: getProductId(originalDocument.product),
      project: getProjectId(originalDocument.project),
      recipient: getRecipientId(originalDocument.recipient),
      category: getCategoryId(originalDocument.category),
      quantity: originalDocument.quantity,
      billingStartDate: originalDocument.billingStartDate?.toISOString(),
      billingEndDate: originalDocument.billingEndDate?.toISOString(),
      invoiceNumber: originalDocument.invoiceNumber,
    }, '_id', 'createdAt', 'expiresAt', 'updatedAt');

    const errors = comparer.validate();

    return {
      pass: errors.length === 0,
      message: () => `Expected document to match payment transaction, but it did not:\n${errors.join('\n')}`,
    };
  },
  async toContainMatchingPaymentTransactionDocument(received: APIResponse, document: Documents.PaymentTransaction) {
    const response = await received.json() as Responses.PaymentTransaction[];

    const matchingResponse = response.find(r => r.transactionId === getTransactionId(document));

    if (!matchingResponse) {
      return {
        pass: false,
        message: () => `Expected response to contain a transaction with id ${getTransactionId(document)}, but it was not found`,
      };
    }

    const comparer = validatePaymentTransactionResponse(matchingResponse, document);

    const errors = comparer.validate();

    return {
      pass: errors.length === 0,
      message: () => `Expected response to match payment transaction document, but it did not:\n${errors.join('\n')}`,
    };
  },
  async toMatchPaymentTransactionDocument(res: APIResponse, document: Documents.PaymentTransaction) {
    const response = await res.json() as Responses.PaymentTransaction;

    const comparer = validatePaymentTransactionResponse(response, document);

    const errors = comparer.validate();
    
    return {
      pass: errors.length === 0,
      message: () => `Expected response to match payment transaction document, but it did not:\n${errors.join('\n')}`,
    };  
  },
});
