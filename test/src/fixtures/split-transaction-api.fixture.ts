import { createDate, getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId, getTransactionId } from '@household/shared/common/utils';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { Reassignment } from '@household/test/types';
import { createComparer } from '@household/test/utils';
import { test as baseTest } from '@household/test/fixtures/api.fixture';
import { APIResponse, expect as baseExpect } from '@playwright/test';
import { CategoryType, TransactionType } from '@household/shared/enums';

export const test = baseTest.extend({});

export const expect = baseExpect.extend({
  toHaveBeenSavedAsSplitTransactionDocument(req: Transaction.SplitRequest, document: Transaction.SplitDocument) {
    if (!document) {
      return {
        pass: false,
        message: () => 'expected transaction to be stored in database, but it was not found',
      };
    }

    const comparer = createComparer((compare) => {
      return {
        transactionType: compare(document.transactionType, TransactionType.Split),
        description: compare(document.description, req.description),
        amount: compare(document.amount, req.amount),
        issuedAt: compare(document.issuedAt.toISOString(), createDate(req.issuedAt).toISOString()),
        account: compare(getAccountId(document.account), req.accountId),
        recipient: compare(getRecipientId(document.recipient), req.recipientId),
        ...document.splits.reduce((accumulator, currentValue, index) => {
          return {
            ...accumulator,
            [`splits.[${index}].amount`]: compare(currentValue.amount, req.splits[index].amount),
            [`splits.[${index}].description`]: compare(currentValue.description, req.splits[index].description),
            [`splits.[${index}].project`]: compare(getProjectId(currentValue.project), req.splits[index].projectId),
            [`splits.[${index}].category`]: compare(getCategoryId(currentValue.category), req.splits[index].categoryId),
            [`splits.[${index}].product`]: compare(getProductId(currentValue.product), currentValue.category?.categoryType === CategoryType.Inventory ? req.splits[index].productId : undefined),
            [`splits.[${index}].quantity`]: compare(currentValue.quantity, currentValue.category?.categoryType === CategoryType.Inventory ? req.splits[index].quantity : undefined),
            [`splits.[${index}].billingStartDate`]: compare(currentValue.billingStartDate?.toISOString(), currentValue.category?.categoryType === CategoryType.Invoice ? createDate(req.splits[index].billingStartDate)?.toISOString() : undefined),
            [`splits.[${index}].billingEndDate`]: compare(currentValue.billingEndDate?.toISOString(), currentValue.category?.categoryType === CategoryType.Invoice ? createDate(req.splits[index].billingEndDate)?.toISOString() : undefined),
            [`splits.[${index}].invoiceNumber`]: compare(currentValue.invoiceNumber, currentValue.category?.categoryType === CategoryType.Invoice ? req.splits[index].invoiceNumber : undefined),
          };
        }, {}),
        ...document.deferredSplits.reduce((accumulator, currentValue, index) => {
          return {
            ...accumulator,
            [`deferredSplits.[${index}].amount`]: compare(currentValue.amount, req.loans[index].amount),
            [`deferredSplits.[${index}].description`]: compare(currentValue.description, req.loans[index].description),
            [`deferredSplits.[${index}].isSettled`]: compare(currentValue.isSettled, req.loans[index].isSettled),
            [`deferredSplits.[${index}].payingAccount`]: compare(getAccountId(currentValue.payingAccount), req.accountId),
            [`deferredSplits.[${index}].ownerAccount`]: compare(getAccountId(currentValue.ownerAccount), req.loans[index].loanAccountId),
            [`deferredSplits.[${index}].project`]: compare(getProjectId(currentValue.project), req.loans[index].projectId),
            [`deferredSplits.[${index}].category`]: compare(getCategoryId(currentValue.category), req.loans[index].categoryId),
            [`deferredSplits.[${index}].product`]: compare(getProductId(currentValue.product), currentValue.category?.categoryType === CategoryType.Inventory ? req.loans[index].productId : undefined),
            [`deferredSplits.[${index}].quantity`]: compare(currentValue.quantity, currentValue.category?.categoryType === CategoryType.Inventory ? req.loans[index].quantity : undefined),
            [`deferredSplits.[${index}].billingStartDate`]: compare(currentValue.billingStartDate?.toISOString(), currentValue.category?.categoryType === CategoryType.Invoice ? createDate(req.loans[index].billingStartDate)?.toISOString() : undefined),
            [`deferredSplits.[${index}].billingEndDate`]: compare(currentValue.billingEndDate?.toISOString(), currentValue.category?.categoryType === CategoryType.Invoice ? createDate(req.loans[index].billingEndDate)?.toISOString() : undefined),
            [`deferredSplits.[${index}].invoiceNumber`]: compare(currentValue.invoiceNumber, currentValue.category?.categoryType === CategoryType.Invoice ? req.loans[index].invoiceNumber : undefined),
          };
        }, {}),
      };  
    });

    const message = comparer.validate(document, '_id', 'createdAt', 'expiresAt', 'updatedAt', 'splits', 'deferredSplits');

    return {
      pass: !message,
      message: () => message,
    };
  },
  toHaveRelatedDocumentsChangedInSplitTransaction(originalDocument: Transaction.SplitDocument, currentDocument: Transaction.SplitDocument, reassignments: {
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
          expectedQuantity = getProductId(originalSplit.product) === reassignments.product?.from && !reassignments.product?.to ? undefined : originalSplit.quantity;
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
          expectedQuantity = getProductId(originalSplit.product) === reassignments.product?.from && !reassignments.product?.to ? undefined : originalSplit.quantity;
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

    const message = comparer.validate(currentDocument, '_id', 'createdAt', 'expiresAt', 'updatedAt', 'splits', 'deferredSplits');

    return {
      pass: !message,
      message: () => message,
    };
  },
  toHaveBeenConvertedToRegularSplitItems(originalDocument: Transaction.SplitDocument, currentDocument: Transaction.SplitDocument, deletedAccountId: Account.Id) {
    const comparer = createComparer((compare) => {
      const splitsComparers = currentDocument.splits.reduce((accumulator, currentValue, index) => {
        const originalSplit = originalDocument.splits[index] ?? originalDocument.deferredSplits.find(x => getAccountId(x.ownerAccount) === deletedAccountId);

        return {
          ...accumulator,
          [`splits.[${index}].amount`]: compare(currentValue.amount, originalSplit.amount),
          [`splits.[${index}].description`]: compare(currentValue.description, originalSplit.description),
          [`splits.[${index}].product`]: compare(getProductId(currentValue.product), getProductId(originalSplit.product)),
          [`splits.[${index}].project`]: compare(getProjectId(currentValue.project), getProjectId(originalSplit.project)),
          [`splits.[${index}].category`]: compare(getCategoryId(currentValue.category), getCategoryId(originalSplit.category)),
          [`splits.[${index}].quantity`]: compare(currentValue.quantity, originalSplit.quantity),
          [`splits.[${index}].billingStartDate`]: compare(currentValue.billingStartDate?.toISOString(), originalSplit.billingStartDate?.toISOString()),
          [`splits.[${index}].billingEndDate`]: compare(currentValue.billingEndDate?.toISOString(), originalSplit.billingEndDate?.toISOString()),
          [`splits.[${index}].invoiceNumber`]: compare(currentValue.invoiceNumber, originalSplit.invoiceNumber),
        };
      }, {});

      const deferredSplitsComparers = currentDocument.deferredSplits.reduce((accumulator, currentValue, index) => {
        const originalSplit = originalDocument.deferredSplits.find(s => getTransactionId(s) === getTransactionId(currentValue));

        return {
          ...accumulator,
          [`deferredSplits.[${index}].amount`]: compare(currentValue.amount, originalSplit.amount),
          [`deferredSplits.[${index}].description`]: compare(currentValue.description, originalSplit.description),
          [`deferredSplits.[${index}].isSettled`]: compare(currentValue.isSettled, originalSplit.isSettled),
          [`deferredSplits.[${index}].payingAccount`]: compare(getAccountId(currentValue.payingAccount), getAccountId(originalSplit.payingAccount)),
          [`deferredSplits.[${index}].ownerAccount`]: compare(getAccountId(currentValue.ownerAccount), getAccountId(originalSplit.ownerAccount)),
          [`deferredSplits.[${index}].product`]: compare(getProductId(currentValue.product), getProductId(originalSplit.product)),
          [`deferredSplits.[${index}].project`]: compare(getProjectId(currentValue.project), getProjectId(originalSplit.project)),
          [`deferredSplits.[${index}].category`]: compare(getCategoryId(currentValue.category), getCategoryId(originalSplit.category)),
          [`deferredSplits.[${index}].quantity`]: compare(currentValue.quantity, originalSplit.quantity),
          [`deferredSplits.[${index}].billingStartDate`]: compare(currentValue.billingStartDate?.toISOString(), originalSplit.billingStartDate?.toISOString()),
          [`deferredSplits.[${index}].billingEndDate`]: compare(currentValue.billingEndDate?.toISOString(), originalSplit.billingEndDate?.toISOString()),
          [`deferredSplits.[${index}].invoiceNumber`]: compare(currentValue.invoiceNumber, originalSplit.invoiceNumber),
        };
      }, {});

      return {
        amount: compare(currentDocument.amount, originalDocument.amount),
        issuedAt: compare(currentDocument.issuedAt.toISOString(), originalDocument.issuedAt.toISOString()),
        description: compare(currentDocument.description, originalDocument.description),
        account: compare(getAccountId(currentDocument.account), getAccountId(originalDocument.account)),
        transactionType: compare(currentDocument.transactionType, originalDocument.transactionType),
        recipient: compare(getRecipientId(currentDocument.recipient), getRecipientId(originalDocument.recipient)),
        ...splitsComparers,
        ...deferredSplitsComparers,
      };
    });

    const message = comparer.validate(currentDocument, '_id', 'createdAt', 'expiresAt', 'updatedAt', 'splits', 'deferredSplits');

    return {
      pass: !message,
      message: () => message,
    };
  },
  async toMatchSplitTransactionDocument(res: APIResponse, document: Transaction.SplitDocument, repayments?: Record<Transaction.Id, number>) {
    const response = await res.json() as Transaction.SplitResponse;
  
    const comparer = createComparer((compare) => {
      return {
        transactionId: compare(response.transactionId, getTransactionId(document)),
        amount: compare(response.amount, document.amount),
        issuedAt: compare(response.issuedAt, document.issuedAt.toISOString()),
        description: compare(response.description, document.description),
        transactionType: compare(response.transactionType, document.transactionType),
        'account.accountId': compare(response.account.accountId, getAccountId(document.account)),
        'account.accountType': compare(response.account.accountType, document.account.accountType),
        'account.balance': compare(response.account.balance, document.account.balance),
        'account.currency': compare(response.account.currency, document.account.currency),
        'account.fullName': compare(response.account.fullName, `${document.account.name} (${document.account.owner})`),
        'account.isOpen': compare(response.account.isOpen, document.account.isOpen),
        'account.name': compare(response.account.name, document.account.name),
        'account.owner': compare(response.account.owner, document.account.owner),
        'recipient.recipientId': compare(response.recipient.recipientId, getRecipientId(document.recipient)),
        'recipient.name': compare(response.recipient.name, document.recipient.name), 
        // 'category.categoryId': compare(response.category.categoryId, getCategoryId(document.category)),
        // 'category.categoryType': compare(response.category.categoryType, document.category.categoryType),
        // 'category.name': compare(response.category.name, document.category.name),
        // // 'category.name': compare(response.category.ancestors, document.category.name),
        // 'category.fullName': compare(response.category.fullName, document.category.name),
        // 'project.projectId': compare(response.project.projectId, getProjectId(document.project)),
        // 'project.name': compare(response.project.name, document.project.name),
        // 'project.description': compare(response.project.description, document.project.description),
        // // productId: compare(response.productId, getProductId(document.product)),
        // quantity: compare(response.quantity, document.quantity),
        // billingStartDate: compare(createDate(response.billingStartDate)?.toISOString(), document.billingStartDate?.toISOString()),
        // billingEndDate: compare(createDate(response.billingEndDate)?.toISOString(), document.billingEndDate?.toISOString()),
        // invoiceNumber: compare(response.invoiceNumber, document.invoiceNumber),
      };
    });
  
    const message = comparer.validate(response, 'account', 'splits', 'deferredSplits', 'recipient');
  
    return {
      pass: !message,
      message: () => message,
    };
  },
});
