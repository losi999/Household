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
    create: ({ body: { issuedAt, amount, description, isSettled, quantity, invoiceNumber, billingEndDate, billingStartDate }, payingAccount, ownerAccount, project, category, recipient, product }, expiresIn, generateId) => {
      return {
        amount,
        description,
        payingAccount,
        ownerAccount,
        recipient: recipient ?? undefined,
        category: category ?? undefined,
        project: project ?? undefined,
        issuedAt: createDate(issuedAt),
        transactionType: 'deferred',
        isSettled: isSettled ?? false,
        quantity: category?.categoryType === 'inventory' ? quantity : undefined,
        product: category?.categoryType === 'inventory' ? product ?? undefined : undefined,
        invoiceNumber: category?.categoryType === 'invoice' ? invoiceNumber : undefined,
        billingEndDate: category?.categoryType === 'invoice' ? createDate(billingEndDate) : undefined,
        billingStartDate: category?.categoryType === 'invoice' ? createDate(billingStartDate) : undefined,
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    toResponse: ({ amount, description, invoiceNumber, isSettled, quantity, transactionType, issuedAt, payingAccount, ownerAccount, billingEndDate, billingStartDate, product, category, recipient, project, remainingAmount, _id }) => {
      return {
        amount,
        description,
        invoiceNumber,
        isSettled,
        quantity,
        transactionType,
        transactionId: getTransactionId(_id),
        issuedAt: issuedAt?.toISOString(),
        payingAccount: payingAccount ? accountDocumentConverter.toResponse(payingAccount) : undefined,
        ownerAccount: ownerAccount ? accountDocumentConverter.toResponse(ownerAccount) : undefined,
        billingEndDate: billingEndDate?.toISOString().split('T')[0],
        billingStartDate: billingStartDate?.toISOString().split('T')[0],
        product: product ? productDocumentConverter.toResponse(product) : undefined,
        category: category ? categoryDocumentConverter.toResponse(category) : undefined,
        recipient: recipient ? recipientDocumentConverter.toResponse(recipient) : undefined,
        project: project ? projectDocumentConverter.toResponse(project) : undefined,
        remainingAmount,
      };
    },
    toResponseList: (docs) => docs.map(d => instance.toResponse(d)),
  };

  return instance;
};
