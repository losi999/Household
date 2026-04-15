import { getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId } from '@household/shared/common/utils';
import { Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { Reassignment } from '@household/test/api/types';
import { createComparer } from '@household/test/api/utils';
import { test as baseTest } from '@household/test/fixtures/api.fixture';
import { expect as baseExpect } from '@playwright/test';

export const test = baseTest.extend({});

export const expect = baseExpect.extend({
  toChangeRelatedDocumentsChangedInDeferredTransaction(originalDocument: Transaction.DeferredDocument, currentDocument: Transaction.DeferredDocument, reassignments: {
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

      if (reassignments.category && getCategoryId(originalDocument.category) === getCategoryId(reassignments.category.from)) {
        expectedInvoiceNumber = reassignments.category.from.categoryType === reassignments.category.to.categoryType ? originalDocument.invoiceNumber : undefined;
        expectedBillingStartDate = reassignments.category.from.categoryType === reassignments.category.to.categoryType ? originalDocument.billingStartDate?.toISOString() : undefined;
        expectedBillingEndDate = reassignments.category.from.categoryType === reassignments.category.to.categoryType ? originalDocument.billingEndDate?.toISOString() : undefined;
        expectedQuantity = reassignments.category.from.categoryType === reassignments.category.to.categoryType ? originalDocument.quantity : undefined;
      } else {
        expectedInvoiceNumber = originalDocument.invoiceNumber;
        expectedBillingStartDate = originalDocument.billingStartDate?.toISOString();
        expectedBillingEndDate = originalDocument.billingEndDate?.toISOString();
        expectedQuantity = getProductId(originalDocument.product) === reassignments.product?.from ? undefined : originalDocument.quantity;
      }

      return {
        amount: compare(currentDocument.amount, originalDocument.amount),
        issuedAt: compare(currentDocument.issuedAt.toISOString(), originalDocument.issuedAt.toISOString()),
        description: compare(currentDocument.description, originalDocument.description),
        isSettled: compare(currentDocument.isSettled, originalDocument.isSettled),
        payingAccount: compare(getAccountId(currentDocument.payingAccount), getAccountId(originalDocument.payingAccount)),
        ownerAccount: compare(getAccountId(currentDocument.ownerAccount), getAccountId(originalDocument.ownerAccount)),
        transactionType: compare(currentDocument.transactionType, originalDocument.transactionType),
        product: compare(getProductId(currentDocument.product), reassignments.product?.from === getProductId(originalDocument.product) ? reassignments.product?.to : getProductId(originalDocument.product)),
        project: compare(getProjectId(currentDocument.project), reassignments.project?.from === getProjectId(originalDocument.project) ? reassignments.project?.to : getProjectId(originalDocument.project)),
        recipient: compare(getRecipientId(currentDocument.recipient), reassignments.recipient?.from === getRecipientId(originalDocument.recipient) ? reassignments.recipient?.to : getRecipientId(originalDocument.recipient)),
        category: compare(getCategoryId(currentDocument.category), getCategoryId(reassignments.category?.from) === getCategoryId(originalDocument.category) ? getCategoryId(reassignments.category?.to) : getCategoryId(originalDocument.category)),
        quantity: compare(currentDocument.quantity, expectedQuantity),
        billingStartDate: compare(currentDocument.billingStartDate?.toISOString(), expectedBillingStartDate),
        billingEndDate: compare(currentDocument.billingEndDate?.toISOString(), expectedBillingEndDate),
        invoiceNumber: compare(currentDocument.invoiceNumber, expectedInvoiceNumber),
      };
    });

    const extraKeys = comparer.extraKeys(currentDocument, [
      '_id',
      'createdAt',
      'expiresAt',
      'updatedAt',
    ]);

    if (extraKeys.length > 0) {
      return {
        pass: false,
        message: () => `expected document to have no additional properties, but got extra properties: ${extraKeys.join(', ')}`,
      };
    }

    const notMatchingProperties = comparer.notMatchingProperties();

    if (notMatchingProperties.length > 0) {
      return {
        pass: false,
        message: () => `expected document to only contain specified changes, but the following properties did not match: ${notMatchingProperties.join(', ')}`,
      };
    }

    return {
      pass: true,
      message: () => '',
    };
  },
});
