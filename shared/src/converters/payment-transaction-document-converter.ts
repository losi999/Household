import { generateMongoId } from '@household/shared/common/mongoose-utils';
import { getAccountId, getCategoryId } from '@household/shared/common/utils';
import { addSeconds, createDate, getTransactionId } from '@household/shared/common/utils';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
import { IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { CategoryType, TransactionType } from '@household/shared/enums';
import { DocumentUpdate, Unset } from '@household/shared/types/common';
import { Account, Calendar, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { UpdateQuery } from 'mongoose';
import { default as moment } from 'moment-timezone';

export interface IPaymentTransactionDocumentConverter {
  create(data: {
    body: Transaction.PaymentRequest;
    account: Account.Document;
    category: Category.Document;
    recipient: Recipient.Document;
    project: Project.Document;
    product: Product.Document;
  }, expiresIn: number, generateId?: boolean): Transaction.PaymentDocument;
  createFromEntry(data: {
    account: Account.Document;
    category: Category.Document;
    calendarEntry: Calendar.Entry.Document;
  } & Transaction.Amount, expiresIn: number): Transaction.PaymentDocument;
  update(data: {
    body: Transaction.PaymentRequest;
    account: Account.Document;
    category: Category.Document;
    recipient: Recipient.Document;
    project: Project.Document;
    product: Product.Document;
  }, expiresIn: number): DocumentUpdate<Transaction.Document>;
  toResponse(document: Transaction.PaymentDocument): Transaction.PaymentResponse;
  toResponseList(documents: Transaction.PaymentDocument[]): Transaction.PaymentResponse[];
}

export const paymentTransactionDocumentConverterFactory = (
  accountDocumentConverter: IAccountDocumentConverter,
  projectDocumentConverter: IProjectDocumentConverter,
  categoryDocumentConverter: ICategoryDocumentConverter,
  recipientDocumentConverter: IRecipientDocumentConverter,
  productDocumentConverter: IProductDocumentConverter,
): IPaymentTransactionDocumentConverter => {
  const transactionType = TransactionType.Payment;
  const defaultUnset: Unset<Transaction.Document, Transaction.PaymentDocument> = {
    transferAccount: true,
    transferAmount: true,
    file: true,
    potentialDuplicates: true,
    isSettled: true,
    ownerAccount: true,
    payingAccount: true,
    payments: true,
    remainingAmount: true,
    deferredSplits: true,
    splits: true,
  };

  const instance: IPaymentTransactionDocumentConverter = {
    create: ({ body: { issuedAt, quantity, invoiceNumber, billingEndDate, billingStartDate, amount, description }, account, project, category, recipient, product }, expiresIn, generateId) => {
      return {
        account,
        amount,
        description,
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
    createFromEntry: ({ account, category, amount, calendarEntry }, expiresIn) => {
      const issuedAt = moment.tz(calendarEntry.day, 'Europe/Budapest'); 
      issuedAt.set({
        hour: Math.floor(calendarEntry.end / 4),
        minute: (calendarEntry.end % 4) * 15,
      });

      return instance.create({
        account,
        body: {
          accountId: getAccountId(account),
          amount,
          categoryId: getCategoryId(category),
          issuedAt: issuedAt.utc()
            .toISOString(),
          description: calendarEntry.title,
          productId: undefined,
          projectId: undefined,
          recipientId: undefined,
          loanAccountId: undefined,
          quantity: undefined,
          isSettled: undefined,
          billingEndDate: undefined,
          billingStartDate: undefined,
          invoiceNumber: undefined,
        },
        category,
        product: undefined,
        project: undefined,
        recipient: undefined,
      }, expiresIn, true);
    },
    update: ({ body: { issuedAt, quantity, invoiceNumber, billingEndDate, billingStartDate, amount, description }, account, project, category, recipient, product }, expiresIn) => {
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
        update: {
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
            account,
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
        },
      };
    },
    toResponse: ({ _id, issuedAt, account, billingEndDate, billingStartDate, product, project, category, recipient, amount, description, invoiceNumber, quantity, transactionType }) => {
      return {
        amount,
        description,
        invoiceNumber,
        quantity,
        transactionType,
        transactionId: getTransactionId(_id),
        issuedAt: issuedAt.toISOString(),
        account: accountDocumentConverter.toResponse(account),
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
