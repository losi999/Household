import { createDate, getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId, getTransactionId } from '@household/shared/common/utils';
import { Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { Reassignment } from '@household/test/types';
import { Comparer } from '@household/test/comparer';
import { test as baseTest } from '@household/test/fixtures/api.fixture';
import { APIResponse, expect as baseExpect } from '@playwright/test';
import { CategoryType, TransactionType } from '@household/shared/enums';
import { validateAccountResponse } from '@household/test/fixtures/account-api.fixture';
import { validateCategoryResponse } from '@household/test/fixtures/category-api.fixture';
import { validateProductResponse } from '@household/test/fixtures/product-api.fixture';
import { validateProjectResponse } from '@household/test/fixtures/project-api.fixture';
import { validateRecipientResponse } from '@household/test/fixtures/recipient-api.fixture';

export const test = baseTest.extend({});

export const validateDeferredTransactionResponse = (response: Transaction.DeferredResponse, document: Transaction.DeferredDocument, paymentAmount: number) => {
  const expectedRemainingAmount = Math.abs(document.amount) - (paymentAmount ?? 0);

  return new Comparer(response, {
    transactionId: getTransactionId(document),
    amount: document.amount,
    issuedAt: document.issuedAt?.toISOString(),
    description: document.description,
    transactionType: document.transactionType,
    project: validateProjectResponse(response.project, document.project),
    payingAccount: validateAccountResponse(response.payingAccount, document.payingAccount),
    ownerAccount: validateAccountResponse(response.ownerAccount, document.ownerAccount),
    recipient: validateRecipientResponse(response.recipient, document.recipient),
    category: validateCategoryResponse(response.category, document.category),
    product: validateProductResponse(response.product, document.product),
    remainingAmount: document.isSettled ? undefined : expectedRemainingAmount,
    isSettled: document.isSettled,
    quantity: document.quantity,
    billingStartDate: document.billingStartDate?.toISOString().split('T')[0],
    billingEndDate: document.billingEndDate?.toISOString().split('T')[0],
    invoiceNumber: document.invoiceNumber,
  });
};

export const expect = baseExpect.extend({
  toHaveBeenSavedAsDeferredTransactionDocument(req: Transaction.PaymentRequest, document: Transaction.DeferredDocument) {
    if (!document) {
      return {
        pass: false,
        message: () => 'Expected transaction to be stored in database, but it was not found',
      };
    }

    const comparer = new Comparer(document, {
      transactionType: TransactionType.Deferred,
      description: req.description,
      amount: req.amount,
      issuedAt: createDate(req.issuedAt).toISOString(),
      payingAccount: req.accountId,
      ownerAccount: req.loanAccountId,
      isSettled: req.isSettled ?? false,
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
      message: () => `Expected deferred transaction to be stored in database, but it was not:\n${errors.join('\n')}`,
    };
  },
  toHaveRelatedDocumentsChangedInDeferredTransaction(originalDocument: Transaction.DeferredDocument, currentDocument: Transaction.DeferredDocument, reassignments: {
    recipient?: Reassignment<Recipient.Id>;
    project?: Reassignment<Project.Id>;
    product?: Reassignment<Product.Id>;
    category?: Reassignment<Category.Document>;
  }) {
    let expectedQuantity: number;
    let expectedInvoiceNumber: string;
    let expectedBillingStartDate: string;
    let expectedBillingEndDate: string;
    let expectedProduct: Product.Id;

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
      payingAccount: getAccountId(originalDocument.payingAccount),
      ownerAccount: getAccountId(originalDocument.ownerAccount),
      isSettled: originalDocument.isSettled,
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
      message: () => `Expected document to match deferred transaction, but it did not:\n${errors.join('\n')}`,
    };
  },
  async toContainMatchingDeferredTransactionDocument(received: APIResponse, document: Transaction.DeferredDocument, paymentAmount?: number) {
    const response = await received.json() as Transaction.DeferredResponse[];

    const matchingResponse = response.find(r => r.transactionId === getTransactionId(document));

    if (!matchingResponse) {
      return {
        pass: false,
        message: () => `Expected response to contain a deferred transaction with id ${getTransactionId(document)}, but it was not found`,
      };
    }

    const comparer = validateDeferredTransactionResponse(matchingResponse, document, paymentAmount);
    
    const errors = comparer.validate();
        
    return {
      pass: errors.length === 0,
      message: () => `Expected response to match deferred transaction document, but it did not:\n${errors.join('\n')}`,
    };  
  },
  async toMatchDeferredTransactionDocument(res: APIResponse, document: Transaction.DeferredDocument, paymentAmount?: number) {
    const response = await res.json() as Transaction.DeferredResponse;

    const comparer = validateDeferredTransactionResponse(response, document, paymentAmount);
    
    const errors = comparer.validate();
        
    return {
      pass: errors.length === 0,
      message: () => `Expected response to match payment transaction document, but it did not:\n${errors.join('\n')}`,
    };  
  },
});
