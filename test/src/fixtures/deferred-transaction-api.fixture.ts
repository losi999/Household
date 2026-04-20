import { createDate, getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId, getTransactionId } from '@household/shared/common/utils';
import { Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { Reassignment } from '@household/test/types';
import { createComparer } from '@household/test/utils';
import { test as baseTest } from '@household/test/fixtures/api.fixture';
import { APIResponse, expect as baseExpect } from '@playwright/test';
import { CategoryType, TransactionType } from '@household/shared/enums';

export const test = baseTest.extend({});

export const expect = baseExpect.extend({
  toHaveBeenSavedAsDeferredTransactionDocument(req: Transaction.PaymentRequest, document: Transaction.DeferredDocument) {
    if (!document) {
      return {
        pass: false,
        message: () => 'expected transaction to be stored in database, but it was not found',
      };
    }

    const comparer = createComparer((compare) => {
      return {
        transactionType: compare(document.transactionType, TransactionType.Deferred),
        description: compare(document.description, req.description),
        amount: compare(document.amount, req.amount),
        issuedAt: compare(document.issuedAt.toISOString(), createDate(req.issuedAt).toISOString()),
        payingAccount: compare(getAccountId(document.payingAccount), req.accountId),
        ownerAccount: compare(getAccountId(document.ownerAccount), req.loanAccountId),
        isSettled: compare(document.isSettled, req.isSettled ?? false),
        remainingAmount: compare(document.remainingAmount, undefined),
        category: compare(getCategoryId(document.category), req.categoryId),
        project: compare(getProjectId(document.project), req.projectId),
        recipient: compare(getRecipientId(document.recipient), req.recipientId),
        quantity: compare(document.quantity, document.category?.categoryType === CategoryType.Inventory ? req.quantity : undefined),
        product: compare(getProductId(document.product), document.category?.categoryType === CategoryType.Inventory ? req.productId : undefined),
        invoiceNumber: compare(document.invoiceNumber, document.category?.categoryType === CategoryType.Invoice ? req.invoiceNumber : undefined),
        billingStartDate: compare(document.billingStartDate?.toISOString(), document.category?.categoryType === CategoryType.Invoice ? createDate(req.billingStartDate)?.toISOString() : undefined),
        billingEndDate: compare(document.billingEndDate?.toISOString(), document.category?.categoryType === CategoryType.Invoice ? createDate(req.billingEndDate)?.toISOString() : undefined),
      };  
    });

    const message = comparer.validate(document, '_id', 'createdAt', 'expiresAt', 'updatedAt');

    return {
      pass: !message,
      message: () => message,
    };
  },
  toHaveRelatedDocumentsChangedInDeferredTransaction(originalDocument: Transaction.DeferredDocument, currentDocument: Transaction.DeferredDocument, reassignments: {
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
        expectedQuantity = getProductId(originalDocument.product) === reassignments.product?.from && !reassignments.product?.to ? undefined : originalDocument.quantity;
        expectedProduct = getProductId(originalDocument.product) === reassignments.product?.from ? reassignments.product?.to : getProductId(originalDocument.product);
      }

      return {
        amount: compare(currentDocument.amount, originalDocument.amount),
        issuedAt: compare(currentDocument.issuedAt.toISOString(), originalDocument.issuedAt.toISOString()),
        description: compare(currentDocument.description, originalDocument.description),
        isSettled: compare(currentDocument.isSettled, originalDocument.isSettled),
        payingAccount: compare(getAccountId(currentDocument.payingAccount), getAccountId(originalDocument.payingAccount)),
        ownerAccount: compare(getAccountId(currentDocument.ownerAccount), getAccountId(originalDocument.ownerAccount)),
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
  async toMatchDeferredTransactionDocument(res: APIResponse, document: Transaction.DeferredDocument, paymentAmount?: number) {
    const response = await res.json() as Transaction.DeferredResponse;
  
    const comparer = createComparer((compare) => {
      const expectedRemainingAmount = Math.abs(document.amount) - (paymentAmount ?? 0);

      return {
        transactionId: compare(response.transactionId, getTransactionId(document)),
        amount: compare(response.amount, document.amount),
        issuedAt: compare(response.issuedAt, document.issuedAt.toISOString()),
        description: compare(response.description, document.description),
        transactionType: compare(response.transactionType, document.transactionType),
        isSettled: compare(response.isSettled, document.isSettled),
        remainingAmount: compare(response.remainingAmount, document.isSettled ? undefined : expectedRemainingAmount),
        // 'account.accountId': compare(response.account.accountId, getAccountId(document.account)),
        // 'account.accountType': compare(response.account.accountType, document.account.accountType),
        // 'account.balance': compare(response.account.balance, document.account.balance),
        // 'account.currency': compare(response.account.currency, document.account.currency),
        // 'account.fullName': compare(response.account.fullName, `${document.account.name} (${document.account.owner})`),
        // 'account.isOpen': compare(response.account.isOpen, document.account.isOpen),
        // 'account.name': compare(response.account.name, document.account.name),
        // 'account.owner': compare(response.account.owner, document.account.owner),
        'category.categoryId': compare(response.category.categoryId, getCategoryId(document.category)),
        'category.categoryType': compare(response.category.categoryType, document.category.categoryType),
        'category.name': compare(response.category.name, document.category.name),
        // 'category.name': compare(response.category.ancestors, document.category.name),
        'category.fullName': compare(response.category.fullName, document.category.name),
        'project.projectId': compare(response.project.projectId, getProjectId(document.project)),
        'project.name': compare(response.project.name, document.project.name),
        'project.description': compare(response.project.description, document.project.description),
        'recipient.recipientId': compare(response.recipient.recipientId, getRecipientId(document.recipient)),
        'recipient.name': compare(response.recipient.name, document.recipient.name), 
        // productId: compare(response.productId, getProductId(document.product)),
        quantity: compare(response.quantity, document.quantity),
        billingStartDate: compare(createDate(response.billingStartDate)?.toISOString(), document.billingStartDate?.toISOString()),
        billingEndDate: compare(createDate(response.billingEndDate)?.toISOString(), document.billingEndDate?.toISOString()),
        invoiceNumber: compare(response.invoiceNumber, document.invoiceNumber),
      };
    });
  
    const message = comparer.validate(response, 'payingAccount', 'ownerAccount', 'category', 'product', 'recipient', 'project');
  
    return {
      pass: !message,
      message: () => message,
    };
  },
});
