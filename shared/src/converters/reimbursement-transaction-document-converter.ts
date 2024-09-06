import { generateMongoId } from '@household/shared/common/utils';
import { addSeconds, createDate, getTransactionId } from '@household/shared/common/utils';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
import { IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';

export interface IReimbursementTransactionDocumentConverter {
  create(data: {
    body: Transaction.PaymentRequest;
    payingAccount: Account.Document;
    ownerAccount: Account.Document;
    category: Category.Document;
    recipient: Recipient.Document;
    project: Project.Document;
    product: Product.Document;
  }, expiresIn: number, generateId?: boolean): Transaction.ReimbursementDocument;
  toResponse(document: Transaction.ReimbursementDocument): Transaction.ReimbursementResponse;
  toResponseList(documents: Transaction.ReimbursementDocument[]): Transaction.ReimbursementResponse[];
}

export const reimbursementTransactionDocumentConverterFactory = (
  accountDocumentConverter: IAccountDocumentConverter,
  projectDocumentConverter: IProjectDocumentConverter,
  categoryDocumentConverter: ICategoryDocumentConverter,
  recipientDocumentConverter: IRecipientDocumentConverter,
  productDocumentConverter: IProductDocumentConverter,
): IReimbursementTransactionDocumentConverter => {
  const instance: IReimbursementTransactionDocumentConverter = {
    create: ({ body: { amount, description, issuedAt, quantity, invoiceNumber, billingEndDate, billingStartDate }, payingAccount, ownerAccount, project, category, recipient, product }, expiresIn, generateId) => {
      return {
        amount,
        description,
        payingAccount,
        ownerAccount,
        recipient: recipient ?? undefined,
        category: category ?? undefined,
        project: project ?? undefined,
        issuedAt: new Date(issuedAt),
        transactionType: 'reimbursement',
        quantity: category?.categoryType === 'inventory' ? quantity : undefined,
        product: category?.categoryType === 'inventory' ? product ?? undefined : undefined,
        invoiceNumber: category?.categoryType === 'invoice' ? invoiceNumber : undefined,
        billingEndDate: category?.categoryType === 'invoice' ? createDate(billingEndDate) : undefined,
        billingStartDate: category?.categoryType === 'invoice' ? createDate(billingStartDate) : undefined,
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    toResponse: ({ amount, description, invoiceNumber, quantity, transactionType, _id, issuedAt, payingAccount, ownerAccount, billingEndDate, billingStartDate, product, category, project, recipient }) => {
      return {
        amount,
        description,
        invoiceNumber,
        quantity,
        transactionType,
        transactionId: getTransactionId(_id),
        issuedAt: issuedAt.toISOString(),
        payingAccount: accountDocumentConverter.toResponse(payingAccount),
        ownerAccount: accountDocumentConverter.toResponse(ownerAccount),
        billingEndDate: billingEndDate?.toISOString().split('T')[0],
        billingStartDate: billingStartDate?.toISOString().split('T')[0],
        product: product ? productDocumentConverter.toResponse(product) : undefined,
        category: category ? categoryDocumentConverter.toResponse(category) : undefined,
        recipient: recipient ? recipientDocumentConverter.toResponse(recipient) : undefined,
        project: project ? projectDocumentConverter.toResponse(project) : undefined,
      };
    },
    toResponseList: (docs) => docs.map(d => instance.toResponse(d)),
  };

  return instance;
};
