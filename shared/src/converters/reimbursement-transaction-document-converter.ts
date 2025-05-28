import { generateMongoId } from '@household/shared/common/utils';
import { addSeconds, createDate, getTransactionId } from '@household/shared/common/utils';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
import { IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { CategoryType, TransactionType } from '@household/shared/enums';
import { Unset } from '@household/shared/types/common';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { UpdateQuery } from 'mongoose';

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
  update(data: {
    body: Transaction.PaymentRequest;
    payingAccount: Account.Document;
    ownerAccount: Account.Document;
    category: Category.Document;
    recipient: Recipient.Document;
    project: Project.Document;
    product: Product.Document;
  }, expiresIn: number): UpdateQuery<Transaction.Document>;
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
  const transactionType = TransactionType.Reimbursement;
  const defaultUnset: Unset<Transaction.Document, Transaction.ReimbursementDocument> = {
    transferAccount: true,
    transferAmount: true,
    file: true,
    hasDuplicate: true,
    isSettled: true,
    payments: true,
    remainingAmount: true,
    deferredSplits: true,
    splits: true,
    account: true,
  };

  const instance: IReimbursementTransactionDocumentConverter = {
    create: ({ body: { amount, description, issuedAt, quantity, invoiceNumber, billingEndDate, billingStartDate }, payingAccount, ownerAccount, project, category, recipient, product }, expiresIn, generateId) => {
      return {
        amount,
        description,
        payingAccount,
        ownerAccount,
        recipient,
        category,
        project,
        issuedAt: new Date(issuedAt),
        transactionType,
        quantity: category?.categoryType === CategoryType.Inventory ? quantity : undefined,
        product: category?.categoryType === CategoryType.Inventory ? product ?? undefined : undefined,
        invoiceNumber: category?.categoryType === CategoryType.Invoice ? invoiceNumber : undefined,
        billingEndDate: category?.categoryType === CategoryType.Invoice ? createDate(billingEndDate) : undefined,
        billingStartDate: category?.categoryType === CategoryType.Invoice ? createDate(billingStartDate) : undefined,
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    update: ({ body: { issuedAt, quantity, invoiceNumber, billingEndDate, billingStartDate, amount, description }, payingAccount, ownerAccount, project, category, recipient, product }, expiresIn) => {
      const optionalSet: UpdateQuery<Transaction.Document>['$set'] = {
        recipient,
        category,
        project,
        description,
        quantity: category?.categoryType === CategoryType.Inventory ? quantity : undefined,
        product: category?.categoryType === CategoryType.Inventory ? product ?? undefined : undefined,
        invoiceNumber: category?.categoryType === CategoryType.Invoice ? invoiceNumber : undefined,
        billingEndDate: category?.categoryType === CategoryType.Invoice ? createDate(billingEndDate) : undefined,
        billingStartDate: category?.categoryType === CategoryType.Invoice ? createDate(billingStartDate) : undefined,
      };

      return {
        $unset: {
          ...defaultUnset,
          ...Object.entries(optionalSet).reduce((accumulator, [
            key,
            value,
          ]) => {
            if (value) {
              return accumulator;
            }

            return {
              ...accumulator,
              [key]: true,
            };
          }, {}),
        },
        $set: {
          amount,
          payingAccount,
          ownerAccount,
          issuedAt: new Date(issuedAt),
          transactionType,
          expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
          ...Object.entries(optionalSet).reduce((accumulator, [
            key,
            value,
          ]) => {
            if (value) {
              return {
                ...accumulator,
                [key]: value,
              };
            }

            return accumulator;
          }, {}),
        },
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
        payingAccount: accountDocumentConverter.toLeanResponse(payingAccount),
        ownerAccount: accountDocumentConverter.toLeanResponse(ownerAccount),
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
