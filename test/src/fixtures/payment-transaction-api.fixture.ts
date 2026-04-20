import { createDate, getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId, getTransactionId } from '@household/shared/common/utils';
import { Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { Reassignment } from '@household/test/types';
import { createComparer as cc } from '@household/test/utils';
import { APIResponse, expect as baseExpect } from '@playwright/test';
import { CategoryType, TransactionType } from '@household/shared/enums';
import { validateProjectResponse } from '@household/test/fixtures/project-api.fixture';
import { createComparer2 } from '@household/test/comparer';
import { createComparer } from '@household/test/comparer3';

export const expect = baseExpect.extend({
  toHaveBeenSavedAsPaymentTransactionDocument(req: Transaction.PaymentRequest, document: Transaction.PaymentDocument) {
    if (!document) {
      return {
        pass: false,
        message: () => 'expected transaction to be stored in database, but it was not found',
      };
    }

    const comparer = cc((compare) => {
      return {
        transactionType: compare(document.transactionType, TransactionType.Payment),
        description: compare(document.description, req.description),
        amount: compare(document.amount, req.amount),
        issuedAt: compare(document.issuedAt.toISOString(), createDate(req.issuedAt).toISOString()),
        account: compare(getAccountId(document.account), req.accountId),
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
  toHaveRelatedDocumentsChangedInPaymentTransaction(originalDocument: Transaction.PaymentDocument, currentDocument: Transaction.PaymentDocument, reassignments: {
    recipient?: Reassignment<Recipient.Id>;
    project?: Reassignment<Project.Id>;
    product?: Reassignment<Product.Id>;
    category?: Reassignment<Category.Document>;
  }) {

    const comparer = cc((compare) => {
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

    const comparer = cc((compare) => {
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
  async toMatchPaymentTransactionDocument(res: APIResponse, document: Transaction.PaymentDocument) {
    const response = await res.json() as Transaction.PaymentResponse;
    try {
      const projcomp = createComparer(response.project, {
        projectId: getProjectId(document.project),
        description: document.project.description,
      });

      const comp = createComparer(response, {
        transactionId: getTransactionId(document),
        amount: document.amount,
        issuedAt: document.issuedAt.toISOString(),
        description: document.description,
        transactionType: document.transactionType,
        project: projcomp,
      });

      const errors = comp.validate();
      console.log('errors', errors);
      return {
        pass: false,
        message: () => errors.join('\n'),
      };
  
    } catch (error) {
      console.log('ERR', error);
    }

    const comparer = createComparer2({
      actual: response,
      factory: (actual, compare) => {
      
        return {
          transactionId: compare(actual.transactionId, getTransactionId(document)),
          amount: compare(actual.amount, document.amount),
          issuedAt: compare(actual.issuedAt, document.issuedAt.toISOString()),
          description: compare(actual.description, document.description),
          transactionType: compare(actual.transactionType, document.transactionType),
          // 'account.accountId': compare(actual.account.accountId, getAccountId(document.account)),
          // 'account.accountType': compare(actual.account.accountType, document.account.accountType),
          // 'account.balance': compare(actual.account.balance, document.account.balance),
          // 'account.currency': compare(actual.account.currency, document.account.currency),
          // 'account.fullName': compare(actual.account.fullName, `${document.account.name} (${document.account.owner})`),
          // 'account.isOpen': compare(actual.account.isOpen, document.account.isOpen),
          // 'account.name': compare(response.account.name, document.account.name),
          // 'account.owner': compare(response.account.owner, document.account.owner),
          // 'category.categoryId': compare(response.category.categoryId, getCategoryId(document.category)),
          // 'category.categoryType': compare(response.category.categoryType, document.category.categoryType),
          // 'category.name': compare(response.category.name, document.category.name),
          // // 'category.name': compare(response.category.ancestors, document.category.name),
          // 'category.fullName': compare(response.category.fullName, document.category.name),
          // ...validateProjectResponse(actual.project, document.project).getNormalized('project.'),
          // 'project.projectId': compare(response.project.projectId, getProjectId(document.project)),
          // 'project.name': compare(response.project.name, document.project.name),
          // 'project.description': compare(response.project.description, document.project.description),
          // 'recipient.recipientId': compare(response.recipient.recipientId, getRecipientId(document.recipient)),
          // 'recipient.name': compare(response.recipient.name, document.recipient.name), 
          // // productId: compare(response.productId, getProductId(document.product)),
          // quantity: compare(response.quantity, document.quantity),
          // billingStartDate: compare(createDate(response.billingStartDate)?.toISOString(), document.billingStartDate?.toISOString()),
          // billingEndDate: compare(createDate(response.billingEndDate)?.toISOString(), document.billingEndDate?.toISOString()),
          // invoiceNumber: compare(response.invoiceNumber, document.invoiceNumber),
        };
      },
    });

    try {
      comparer.validate();

      return {
        pass: true,
        message: () => '',
      };
    } catch (error) {
      return {
        pass: false,  
        message: () => error,
      };
    }

    // console.log('normalized', comparer.getNormalized());

    // const message = comparer.validate(response, 'account', 'category', 'product', 'recipient', 'project');

    // return {
    //   pass: !message,
    //   message: () => message,
    // };
  },
});
