import { getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId } from '@household/shared/common/utils';
import { Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { Reassignment } from '@household/test/types';
import { createComparer } from '@household/test/utils';
import { test as baseTest } from '@household/test/fixtures/api.fixture';
import { expect as baseExpect } from '@playwright/test';

export const test = baseTest.extend({});

export const expect = baseExpect.extend({
  toChangeRelatedDocumentsChangedInSplitTransaction(originalDocument: Transaction.SplitDocument, currentDocument: Transaction.SplitDocument, reassignments: {
    recipient?: Reassignment<Recipient.Id>;
    project?: Reassignment<Project.Id>;
    product?: Reassignment<Product.Id>;
    category?: Reassignment<Category.Document>;
  }) {

    const comparer = createComparer((compare) => {
      const splitsComparers = currentDocument.splits.reduce((accumulator, currentValue, index) => {
        const originalSplit = originalDocument.splits[index];
        let expectedQuantity: number;
        let expectedInvoiceNumber: string;
        let expectedBillingStartDate: string;
        let expectedBillingEndDate: string;
        let expectedProduct: Product.Id;

        if (reassignments.category && getCategoryId(originalSplit.category) === getCategoryId(reassignments.category.from)) {
          expectedInvoiceNumber = reassignments.category.from.categoryType === reassignments.category.to?.categoryType ? originalSplit.invoiceNumber : undefined;
          expectedBillingStartDate = reassignments.category.from.categoryType === reassignments.category.to?.categoryType ? originalSplit.billingStartDate?.toISOString() : undefined;
          expectedBillingEndDate = reassignments.category.from.categoryType === reassignments.category.to?.categoryType ? originalSplit.billingEndDate?.toISOString() : undefined;
          expectedQuantity = reassignments.category.from.categoryType === reassignments.category.to?.categoryType ? originalSplit.quantity : undefined;
          expectedProduct = reassignments.category.from.categoryType === reassignments.category.to?.categoryType ? getProductId(originalSplit.product) : undefined;
        } else {
          expectedInvoiceNumber = originalSplit.invoiceNumber;
          expectedBillingStartDate = originalSplit.billingStartDate?.toISOString();
          expectedBillingEndDate = originalSplit.billingEndDate?.toISOString();
          expectedQuantity = getProductId(originalSplit.product) === reassignments.product?.from ? undefined : originalSplit.quantity;
          expectedProduct = getProductId(originalSplit.product) === reassignments.product?.from ? reassignments.product?.to : getProductId(originalSplit.product);
        }

        return {
          ...accumulator,
          [`splits.[${index}].amount`]: compare(currentValue.amount, originalSplit.amount),
          [`splits.[${index}].description`]: compare(currentValue.description, originalSplit.description),
          [`splits.[${index}].product`]: compare(getProductId(currentValue.product), expectedProduct),
          [`splits.[${index}].project`]: compare(getProjectId(currentValue.project), reassignments.project?.from === getProjectId(originalSplit.project) ? reassignments.project?.to : getProjectId(originalSplit.project)),
          [`splits.[${index}].category`]: compare(getCategoryId(currentValue.category), getCategoryId(reassignments.category?.from) === getCategoryId(originalSplit.category) ? getCategoryId(reassignments.category?.to) : getCategoryId(originalSplit.category)),
          [`splits.[${index}].quantity`]: compare(currentValue.quantity, expectedQuantity),
          [`splits.[${index}].billingStartDate`]: compare(currentValue.billingStartDate?.toISOString(), expectedBillingStartDate),
          [`splits.[${index}].billingEndDate`]: compare(currentValue.billingEndDate?.toISOString(), expectedBillingEndDate),
          [`splits.[${index}].invoiceNumber`]: compare(currentValue.invoiceNumber, expectedInvoiceNumber),
        };
      }, {});

      const deferredSplitsComparers = currentDocument.deferredSplits.reduce((accumulator, currentValue, index) => {
        const originalSplit = originalDocument.deferredSplits[index];
        let expectedQuantity: number;
        let expectedInvoiceNumber: string;
        let expectedBillingStartDate: string;
        let expectedBillingEndDate: string;
        let expectedProduct: Product.Id;

        if (reassignments.category && getCategoryId(originalSplit.category) === getCategoryId(reassignments.category.from)) {
          expectedInvoiceNumber = reassignments.category.from.categoryType === reassignments.category.to?.categoryType ? originalSplit.invoiceNumber : undefined;
          expectedBillingStartDate = reassignments.category.from.categoryType === reassignments.category.to?.categoryType ? originalSplit.billingStartDate?.toISOString() : undefined;
          expectedBillingEndDate = reassignments.category.from.categoryType === reassignments.category.to?.categoryType ? originalSplit.billingEndDate?.toISOString() : undefined;
          expectedQuantity = reassignments.category.from.categoryType === reassignments.category.to?.categoryType ? originalSplit.quantity : undefined;
          expectedProduct = reassignments.category.from.categoryType === reassignments.category.to?.categoryType ? getProductId(originalSplit.product) : undefined;
        } else {
          expectedInvoiceNumber = originalSplit.invoiceNumber;
          expectedBillingStartDate = originalSplit.billingStartDate?.toISOString();
          expectedBillingEndDate = originalSplit.billingEndDate?.toISOString();
          expectedQuantity = getProductId(originalSplit.product) === reassignments.product?.from ? undefined : originalSplit.quantity;
          expectedProduct = getProductId(originalSplit.product) === reassignments.product?.from ? reassignments.product?.to : getProductId(originalSplit.product);
        }

        return {
          ...accumulator,
          [`deferredSplits.[${index}].amount`]: compare(currentValue.amount, originalSplit.amount),
          [`deferredSplits.[${index}].description`]: compare(currentValue.description, originalSplit.description),
          [`deferredSplits.[${index}].isSettled`]: compare(currentValue.isSettled, originalSplit.isSettled),
          [`deferredSplits.[${index}].payingAccount`]: compare(getAccountId(currentValue.payingAccount), getAccountId(originalSplit.payingAccount)),
          [`deferredSplits.[${index}].ownerAccount`]: compare(getAccountId(currentValue.ownerAccount), getAccountId(originalSplit.ownerAccount)),
          [`deferredSplits.[${index}].product`]: compare(getProductId(currentValue.product), expectedProduct),
          [`deferredSplits.[${index}].project`]: compare(getProjectId(currentValue.project), reassignments.project?.from === getProjectId(originalSplit.project) ? reassignments.project?.to : getProjectId(originalSplit.project)),
          [`deferredSplits.[${index}].category`]: compare(getCategoryId(currentValue.category), getCategoryId(reassignments.category?.from) === getCategoryId(originalSplit.category) ? getCategoryId(reassignments.category?.to) : getCategoryId(originalSplit.category)),
          [`deferredSplits.[${index}].quantity`]: compare(currentValue.quantity, expectedQuantity),
          [`deferredSplits.[${index}].billingStartDate`]: compare(currentValue.billingStartDate?.toISOString(), expectedBillingStartDate),
          [`deferredSplits.[${index}].billingEndDate`]: compare(currentValue.billingEndDate?.toISOString(), expectedBillingEndDate),
          [`deferredSplits.[${index}].invoiceNumber`]: compare(currentValue.invoiceNumber, expectedInvoiceNumber),
        };
      }, {});

      return {
        amount: compare(currentDocument.amount, originalDocument.amount),
        issuedAt: compare(currentDocument.issuedAt.toISOString(), originalDocument.issuedAt.toISOString()),
        description: compare(currentDocument.description, originalDocument.description),
        account: compare(getAccountId(currentDocument.account), getAccountId(originalDocument.account)),
        transactionType: compare(currentDocument.transactionType, originalDocument.transactionType),
        recipient: compare(getRecipientId(currentDocument.recipient), reassignments.recipient?.from === getRecipientId(originalDocument.recipient) ? reassignments.recipient?.to : getRecipientId(originalDocument.recipient)),
        ...splitsComparers,
        ...deferredSplitsComparers,
      };
    });

    const extraKeys = comparer.extraKeys(currentDocument, [
      '_id',
      'createdAt',
      'expiresAt',
      'updatedAt',
      'splits', 
      'deferredSplits',
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
