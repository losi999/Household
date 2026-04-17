import { getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId } from '@household/shared/common/utils';
import { Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { Reassignment } from '@household/test/types';
import { createComparer } from '@household/test/utils';
import { test as baseTest } from '@household/test/fixtures/api.fixture';
import { expect as baseExpect } from '@playwright/test';

export const test = baseTest.extend({});

export const expect = baseExpect.extend({
  toChangeRelatedDocumentsChangedInPaymentTransaction(originalDocument: Transaction.PaymentDocument, currentDocument: Transaction.PaymentDocument, reassignments: {
    recipient?: Reassignment<Recipient.Id>;
    project?: Reassignment<Project.Id>;
    product?: Reassignment<Product.Id>;
    category?: Reassignment<Category.Document>;
  }) {

    const comparer = createComparer((compare) => {
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
        expectedQuantity = getProductId(originalDocument.product) === reassignments.product?.from ? undefined : originalDocument.quantity;
        expectedProduct = getProductId(originalDocument.product) === reassignments.product?.from ? reassignments.product?.to : getProductId(originalDocument.product);
      }

      return {
        amount: compare(currentDocument.amount, originalDocument.amount),
        issuedAt: compare(currentDocument.issuedAt.toISOString(), originalDocument.issuedAt.toISOString()),
        description: compare(currentDocument.description, originalDocument.description),
        account: compare(getAccountId(currentDocument.account), getAccountId(originalDocument.account)),
        transactionType: compare(currentDocument.transactionType, originalDocument.transactionType),
        product: compare(getProductId(currentDocument.product), expectedProduct),
        project: compare(getProjectId(currentDocument.project), reassignments.project?.from === getProjectId(originalDocument.project) ? reassignments.project?.to : getProjectId(originalDocument.project)),
        recipient: compare(getRecipientId(currentDocument.recipient), reassignments.recipient?.from === getRecipientId(originalDocument.recipient) ? reassignments.recipient?.to : getRecipientId(originalDocument.recipient)),
        category: compare(getCategoryId(currentDocument.category), getCategoryId(reassignments.category?.from) === getCategoryId(originalDocument.category) ? getCategoryId(reassignments.category?.to) : getCategoryId(originalDocument.category)),
        quantity: compare(currentDocument.quantity, expectedQuantity),
        billingStartDate: compare(currentDocument.billingStartDate?.toISOString(), expectedBillingStartDate),
        billingEndDate: compare(currentDocument.billingEndDate?.toISOString(), expectedBillingEndDate),
        invoiceNumber: compare(currentDocument.invoiceNumber, expectedInvoiceNumber),
      };
    });

    const message = comparer.validate(currentDocument, '_id', 'createdAt', 'expiresAt', 'updatedAt');

    return {
      pass: !message,
      message: () => message,
    };
  },
  toBeConvertedToPaymentTransaction(originalDocument: Transaction.DeferredDocument, currentDocument: Transaction.PaymentDocument) {

    const comparer = createComparer((compare) => {
      return {
        amount: compare(currentDocument.amount, originalDocument.amount),
        issuedAt: compare(currentDocument.issuedAt.toISOString(), originalDocument.issuedAt.toISOString()),
        account: compare(getAccountId(currentDocument.account), getAccountId(originalDocument.payingAccount)),
        description: compare(currentDocument.description, originalDocument.description),
        transactionType: compare(currentDocument.transactionType, 'payment'),
        product: compare(getProductId(currentDocument.product), getProductId(originalDocument.product)),
        project: compare(getProjectId(currentDocument.project), getProjectId(originalDocument.project)),
        recipient: compare(getRecipientId(currentDocument.recipient), getRecipientId(originalDocument.recipient)),
        category: compare(getCategoryId(currentDocument.category), getCategoryId(originalDocument.category)),
        quantity: compare(currentDocument.quantity, originalDocument.quantity),
        billingStartDate: compare(currentDocument.billingStartDate?.toISOString(), originalDocument.billingStartDate?.toISOString()),
        billingEndDate: compare(currentDocument.billingEndDate?.toISOString(), originalDocument.billingEndDate?.toISOString()),
        invoiceNumber: compare(currentDocument.invoiceNumber, originalDocument.invoiceNumber),
      };
    });

    const message = comparer.validate(currentDocument, '_id', 'createdAt', 'expiresAt', 'updatedAt');

    return {
      pass: !message,
      message: () => message,
    };
  },
});
