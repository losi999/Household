import { generateMongoId } from '@household/shared/common/utils';
import { addSeconds, createDate, getTransactionId } from '@household/shared/common/utils';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
import { IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';

export interface IDeferredTransactionDocumentConverter {
  create(data: {
    body: Transaction.PaymentRequest;
    payingAccount: Account.Document;
    ownerAccount: Account.Document;
    category: Category.Document;
    recipient: Recipient.Document;
    project: Project.Document;
    product: Product.Document;
  }, expiresIn: number, generateId?: boolean): Transaction.DeferredDocument;
  toResponse(document: Transaction.DeferredDocument): Transaction.DeferredResponse;
  toResponseList(documents: Transaction.DeferredDocument[]): Transaction.DeferredResponse[];
}

export const deferredTransactionDocumentConverterFactory = (
  accountDocumentConverter: IAccountDocumentConverter,
  projectDocumentConverter: IProjectDocumentConverter,
  categoryDocumentConverter: ICategoryDocumentConverter,
  recipientDocumentConverter: IRecipientDocumentConverter,
  productDocumentConverter: IProductDocumentConverter,
): IDeferredTransactionDocumentConverter => {
  const instance: IDeferredTransactionDocumentConverter = {
    create: ({ body, payingAccount, ownerAccount, project, category, recipient, product }, expiresIn, generateId) => {
      return {
        ...body,
        payingAccount,
        ownerAccount,
        recipient: recipient ?? undefined,
        category: category ?? undefined,
        project: project ?? undefined,
        issuedAt: body.issuedAt ? new Date(body.issuedAt) : undefined,
        transactionType: 'deferred',
        isSettled: body.isSettled ?? false,
        quantity: category?.categoryType === 'inventory' ? body.quantity : undefined,
        product: category?.categoryType === 'inventory' ? product ?? undefined : undefined,
        invoiceNumber: category?.categoryType === 'invoice' ? body.invoiceNumber : undefined,
        billingEndDate: category?.categoryType === 'invoice' ? createDate(body.billingEndDate) : undefined,
        billingStartDate: category?.categoryType === 'invoice' ? createDate(body.billingStartDate) : undefined,
        accountId: undefined,
        categoryId: undefined,
        projectId: undefined,
        recipientId: undefined,
        loanAccountId: undefined,
        productId: undefined,
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    toResponse: (doc): Transaction.DeferredResponse => {
      return {
        ...doc,
        createdAt: undefined,
        updatedAt: undefined,
        transactionId: getTransactionId(doc),
        issuedAt: doc.issuedAt?.toISOString(),
        _id: undefined,
        expiresAt: undefined,
        payingAccount: doc.payingAccount ? accountDocumentConverter.toResponse(doc.payingAccount) : undefined,
        ownerAccount: doc.ownerAccount ? accountDocumentConverter.toResponse(doc.ownerAccount) : undefined,
        billingEndDate: doc.billingEndDate?.toISOString().split('T')[0],
        billingStartDate: doc.billingStartDate?.toISOString().split('T')[0],
        product: doc.product ? productDocumentConverter.toResponse(doc.product) : undefined,
        category: doc.category ? categoryDocumentConverter.toResponse(doc.category) : undefined,
        recipient: doc.recipient ? recipientDocumentConverter.toResponse(doc.recipient) : undefined,
        project: doc.project ? projectDocumentConverter.toResponse(doc.project) : undefined,
        remainingAmount: doc.remainingAmount,
      };
    },
    toResponseList: (docs) => docs.map(d => instance.toResponse(d)),
  };

  return instance;
};
