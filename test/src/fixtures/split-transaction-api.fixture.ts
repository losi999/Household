import { createDate, getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId, getTransactionId } from '@household/shared/common/utils';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { Reassignment } from '@household/test/types';
import { test as baseTest } from '@household/test/fixtures/api.fixture';
import { APIResponse, expect as baseExpect } from '@playwright/test';
import { CategoryType, TransactionType } from '@household/shared/enums';
import { validateProjectResponse } from '@household/test/fixtures/project-api.fixture';
import { Comparer } from '@household/test/comparer';
import { validateAccountResponse } from '@household/test/fixtures/account-api.fixture';
import { validateRecipientResponse } from '@household/test/fixtures/recipient-api.fixture';
import { validateCategoryResponse } from '@household/test/fixtures/category-api.fixture';
import { validateProductResponse } from '@household/test/fixtures/product-api.fixture';

export const test = baseTest.extend({});

const validateSplitTransactionResponse = (response: Transaction.SplitResponse, document: Transaction.SplitDocument, repayments?: Record<Transaction.Id, number>) => {
  return new Comparer(response, {
    transactionId: getTransactionId(document),
    amount: document.amount,
    issuedAt: document.issuedAt.toISOString(),
    description: document.description,
    transactionType: document.transactionType,
    account: validateAccountResponse(response.account, document.account),
    recipient: validateRecipientResponse(response.recipient, document.recipient),
    splits: response.splits.map((splitResponseItem, index) => {
      const splitDocument = document.splits[index];

      return new Comparer(splitResponseItem, {
        amount: splitDocument.amount,
        description: splitDocument.description,
        project: validateProjectResponse(splitResponseItem.project, splitDocument.project),
        category: validateCategoryResponse(splitResponseItem.category, splitDocument.category),
        product: validateProductResponse(splitResponseItem.product, splitDocument.product),
        quantity: splitDocument.quantity,
        billingStartDate: splitDocument.billingStartDate?.toISOString().split('T')[0],
        billingEndDate: splitDocument.billingEndDate?.toISOString().split('T')[0],
        invoiceNumber: splitDocument.invoiceNumber,
      });
    }),
    deferredSplits: response.deferredSplits.map((deferredSplitResponseItem, index) => {
      const deferredSplitDocument = document.deferredSplits[index];

      return new Comparer(deferredSplitResponseItem, {
        amount: deferredSplitDocument.amount,
        transactionType: deferredSplitDocument.transactionType,
        transactionId: getTransactionId(deferredSplitDocument),
        remainingAmount: deferredSplitDocument.isSettled ? undefined : (Math.abs(deferredSplitDocument.amount) - (repayments?.[getTransactionId(deferredSplitDocument)] ?? 0)),
        description: deferredSplitDocument.description,
        isSettled: deferredSplitDocument.isSettled,
        payingAccount: validateAccountResponse(deferredSplitResponseItem.payingAccount, deferredSplitDocument.payingAccount),
        ownerAccount: validateAccountResponse(deferredSplitResponseItem.ownerAccount, deferredSplitDocument.ownerAccount),
        project: validateProjectResponse(deferredSplitResponseItem.project, deferredSplitDocument.project),
        category: validateCategoryResponse(deferredSplitResponseItem.category, deferredSplitDocument.category),
        product: validateProductResponse(deferredSplitResponseItem.product, deferredSplitDocument.product),
        quantity: deferredSplitDocument.quantity,
        billingStartDate: deferredSplitDocument.billingStartDate?.toISOString().split('T')[0],
        billingEndDate: deferredSplitDocument.billingEndDate?.toISOString().split('T')[0],
        invoiceNumber: deferredSplitDocument.invoiceNumber,
      });
    }),
  });
};

export const expect = baseExpect.extend({
  toHaveBeenSavedAsSplitTransactionDocument(req: Transaction.SplitRequest, document: Transaction.SplitDocument) {
    if (!document) {
      return {
        pass: false,
        message: () => 'expected transaction to be stored in database, but it was not found',
      };
    }

    const comparer = new Comparer(document, {
      transactionType: TransactionType.Split,
      description: req.description,
      amount: req.amount,
      issuedAt: createDate(req.issuedAt).toISOString(),
      account: req.accountId,
      recipient: req.recipientId,
      splits: document.splits.map((splitDocument, index) => {
        const splitRequest = req.splits[index];

        return new Comparer(splitDocument, {
          amount: splitRequest.amount,
          description: splitRequest.description,
          project: splitRequest.projectId,
          category: splitRequest.categoryId,
          product: splitDocument.category?.categoryType === CategoryType.Inventory ? splitRequest.productId : undefined,
          quantity: splitDocument.category?.categoryType === CategoryType.Inventory ? splitRequest.quantity : undefined,
          billingStartDate: splitDocument.category?.categoryType === CategoryType.Invoice ? createDate(splitRequest.billingStartDate)?.toISOString() : undefined,
          billingEndDate: splitDocument.category?.categoryType === CategoryType.Invoice ? createDate(splitRequest.billingEndDate)?.toISOString() : undefined,
          invoiceNumber: splitDocument.category?.categoryType === CategoryType.Invoice ? splitRequest.invoiceNumber : undefined,
        });
      }),
      deferredSplits: document.deferredSplits.map((splitDocument, index) => {
        const splitRequest = req.loans[index];

        return new Comparer(splitDocument, {
          transactionType: TransactionType.Deferred,
          payingAccount: req.accountId,
          ownerAccount: splitRequest.loanAccountId,
          isSettled: splitRequest.isSettled ?? false,
          amount: splitRequest.amount,
          description: splitRequest.description,
          project: splitRequest.projectId,
          category: splitRequest.categoryId,
          product: splitDocument.category?.categoryType === CategoryType.Inventory ? splitRequest.productId : undefined,
          quantity: splitDocument.category?.categoryType === CategoryType.Inventory ? splitRequest.quantity : undefined,
          billingStartDate: splitDocument.category?.categoryType === CategoryType.Invoice ? createDate(splitRequest.billingStartDate)?.toISOString() : undefined,
          billingEndDate: splitDocument.category?.categoryType === CategoryType.Invoice ? createDate(splitRequest.billingEndDate)?.toISOString() : undefined,
          invoiceNumber: splitDocument.category?.categoryType === CategoryType.Invoice ? splitRequest.invoiceNumber : undefined,
        }, '_id');
      }),
    }, '_id', 'createdAt', 'expiresAt', 'updatedAt');

    const errors = comparer.validate();

    return {
      pass: !errors.length,
      message: () => `Expected split transaction to be stored in database, but it was not:\n${errors.join('\n')}`,
    };
  },
  toHaveRelatedDocumentsChangedInSplitTransaction(originalDocument: Transaction.SplitDocument, currentDocument: Transaction.SplitDocument, reassignments: {
    recipient?: Reassignment<Recipient.Id>;
    project?: Reassignment<Project.Id>;
    product?: Reassignment<Product.Id>;
    category?: Reassignment<Category.Document>;
  }) {

    const comparer = new Comparer(currentDocument, {
      amount: originalDocument.amount,
      issuedAt: originalDocument.issuedAt.toISOString(),
      description: originalDocument.description,
      account: getAccountId(originalDocument.account),
      transactionType: originalDocument.transactionType,
      recipient: reassignments.recipient?.from === getRecipientId(originalDocument.recipient) ? reassignments.recipient?.to : getRecipientId(originalDocument.recipient),
      splits: currentDocument.splits.map((splitDocument, index) => {
        const originalSplit = originalDocument.splits[index];
        let expectedQuantity: number;
        let expectedInvoiceNumber: string;
        let expectedBillingStartDate: string;
        let expectedBillingEndDate: string;
        let expectedProduct: Product.Id;
        let expectedCategory: Category.Id;

        if (reassignments.category && getCategoryId(originalSplit.category) === getCategoryId(reassignments.category.from)) {
          expectedInvoiceNumber = reassignments.category.from.categoryType === reassignments.category.to?.categoryType ? originalSplit.invoiceNumber : undefined;
          expectedBillingStartDate = reassignments.category.from.categoryType === reassignments.category.to?.categoryType ? originalSplit.billingStartDate?.toISOString() : undefined;
          expectedBillingEndDate = reassignments.category.from.categoryType === reassignments.category.to?.categoryType ? originalSplit.billingEndDate?.toISOString() : undefined;
          expectedQuantity = reassignments.category.from.categoryType === reassignments.category.to?.categoryType ? originalSplit.quantity : undefined;
          expectedProduct = reassignments.category.from.categoryType === reassignments.category.to?.categoryType ? getProductId(originalSplit.product) : undefined;
          expectedCategory = getCategoryId(reassignments.category.to);
        } else {
          expectedInvoiceNumber = originalSplit.invoiceNumber;
          expectedBillingStartDate = originalSplit.billingStartDate?.toISOString();
          expectedBillingEndDate = originalSplit.billingEndDate?.toISOString();
          expectedQuantity = getProductId(originalSplit.product) === reassignments.product?.from && !reassignments.product?.to ? undefined : originalSplit.quantity;
          expectedProduct = getProductId(originalSplit.product) === reassignments.product?.from ? reassignments.product?.to : getProductId(originalSplit.product);
          expectedCategory = getCategoryId(originalSplit.category);
        }

        return new Comparer(splitDocument, {
          amount: originalSplit.amount,
          description: originalSplit.description,
          project: reassignments.project?.from === getProjectId(originalSplit.project) ? reassignments.project?.to : getProjectId(originalSplit.project),
          category: expectedCategory,
          product: expectedProduct,
          quantity: expectedQuantity,
          billingStartDate: expectedBillingStartDate,
          billingEndDate: expectedBillingEndDate,
          invoiceNumber: expectedInvoiceNumber,
        });
      }),
      deferredSplits: currentDocument.deferredSplits.map((splitDocument, index) => {
        const originalSplit = originalDocument.deferredSplits[index];
        let expectedQuantity: number;
        let expectedInvoiceNumber: string;
        let expectedBillingStartDate: string;
        let expectedBillingEndDate: string;
        let expectedProduct: Product.Id;
        let expectedCategory: Category.Id;

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
          expectedCategory = getCategoryId(originalSplit.category);
        }

        return new Comparer(splitDocument, {
          amount: originalSplit.amount,
          transactionType: originalSplit.transactionType,
          isSettled: originalSplit.isSettled,
          payingAccount: getAccountId(originalSplit.payingAccount),
          ownerAccount: getAccountId(originalSplit.ownerAccount),
          description: originalSplit.description,
          project: reassignments.project?.from === getProjectId(originalSplit.project) ? reassignments.project?.to : getProjectId(originalSplit.project),
          category: expectedCategory,
          product: expectedProduct,
          quantity: expectedQuantity,
          billingStartDate: expectedBillingStartDate,
          billingEndDate: expectedBillingEndDate,
          invoiceNumber: expectedInvoiceNumber,
        }, '_id');
      }),
    }, '_id', 'createdAt', 'expiresAt', 'updatedAt');

    const errors = comparer.validate();

    return {
      pass: errors.length === 0,
      message: () => `Expected document to match split transaction, but it did not:\n${errors.join('\n')}`,
    };
  },
  toHaveBeenConvertedToRegularSplitItems(originalDocument: Transaction.SplitDocument, currentDocument: Transaction.SplitDocument, deletedAccountId: Account.Id) {
    const comparer = new Comparer(currentDocument, {
      amount: originalDocument.amount,
      issuedAt: originalDocument.issuedAt.toISOString(),
      description: originalDocument.description,
      account: getAccountId(originalDocument.account),
      transactionType: originalDocument.transactionType,
      recipient: getRecipientId(originalDocument.recipient),
      splits: currentDocument.splits.map((splitDocument, index) => {
        const originalSplit = originalDocument.splits[index] ?? originalDocument.deferredSplits.find(x => getAccountId(x.ownerAccount) === deletedAccountId);

        return new Comparer(splitDocument, {
          amount: originalSplit.amount,
          description: originalSplit.description,
          product: getProductId(originalSplit.product),
          project: getProjectId(originalSplit.project),
          category: getCategoryId(originalSplit.category),
          quantity: originalSplit.quantity,
          billingStartDate: originalSplit.billingStartDate?.toISOString(),
          billingEndDate: originalSplit.billingEndDate?.toISOString(),
          invoiceNumber: originalSplit.invoiceNumber,
        });
      }),
      deferredSplits: currentDocument.deferredSplits.map((splitDocument) => {
        const originalSplit = originalDocument.deferredSplits.find(s => getTransactionId(s) === getTransactionId(splitDocument));

        return new Comparer(splitDocument, {
          amount: originalSplit.amount,
          transactionType: originalSplit.transactionType,
          isSettled: originalSplit.isSettled,
          payingAccount: getAccountId(originalSplit.payingAccount),
          ownerAccount: getAccountId(originalSplit.ownerAccount),
          description: originalSplit.description,
          product: getProductId(originalSplit.product),
          project: getProjectId(originalSplit.project),
          category: getCategoryId(originalSplit.category),
          quantity: originalSplit.quantity,
          billingStartDate: originalSplit.billingStartDate?.toISOString(),
          billingEndDate: originalSplit.billingEndDate?.toISOString(),
          invoiceNumber: originalSplit.invoiceNumber,
        }, '_id');
      }),
    }, '_id', 'createdAt', 'expiresAt', 'updatedAt');

    const errors = comparer.validate();

    return {
      pass: errors.length === 0,
      message: () => `Expected document to match split transaction, but it did not:\n${errors.join('\n')}`,
    };
  },
  async toContainMatchingSplitTransactionDocument(received: APIResponse, document: Transaction.SplitDocument, repayments?: Record<Transaction.Id, number>) {
    const response = await received.json() as Transaction.SplitResponse[];

    const matchingResponse = response.find(r => r.transactionId === getTransactionId(document));

    if (!matchingResponse) {
      return {
        pass: false,
        message: () => `Expected response to contain a split transaction with id ${getTransactionId(document)}, but it was not found`,
      };
    }

    const comparer = validateSplitTransactionResponse(matchingResponse, document, repayments);

    const errors = comparer.validate();
    
    return {
      pass: errors.length === 0,
      message: () => `Expected response to match split transaction document, but it did not:\n${errors.join('\n')}`,
    };  
  },
  async toMatchSplitTransactionDocument(res: APIResponse, document: Transaction.SplitDocument, repayments?: Record<Transaction.Id, number>) {
    const response = await res.json() as Transaction.SplitResponse;
  
    const comparer = validateSplitTransactionResponse(response, document, repayments);

    const errors = comparer.validate();
    
    return {
      pass: errors.length === 0,
      message: () => `Expected response to match split transaction document, but it did not:\n${errors.join('\n')}`,
    };  
  },
});
