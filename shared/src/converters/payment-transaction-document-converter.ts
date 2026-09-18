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
import { Documents } from '@household/shared/types/documents';
import { UpdateQuery } from 'mongoose';
import { default as moment } from 'moment-timezone';
import { Requests } from '@household/shared/types/requests';
import { Api } from '@household/shared/types/api';
import { Responses } from '@household/shared/types/responses';

export interface IPaymentTransactionDocumentConverter {
  create(data: {
    body: Requests.PaymentTransaction;
    account: Documents.Account;
    category: Documents.Category;
    recipient: Documents.Recipient;
    project: Documents.Project;
    product: Documents.Product;
  }, expiresIn: number, generateId?: boolean): Documents.PaymentTransaction;
  createFromEntry(data: {
    account: Documents.Account;
    category: Documents.Category;
    calendarEntry: Documents.CalendarEntry;
  } & Api.Transaction.Amount, expiresIn: number): Documents.PaymentTransaction;
  update(data: {
    body: Requests.PaymentTransaction;
    account: Documents.Account;
    category: Documents.Category;
    recipient: Documents.Recipient;
    project: Documents.Project;
    product: Documents.Product;
  }, expiresIn: number): DocumentUpdate<Documents.Transaction>;
  toResponse(document: Documents.PaymentTransaction): Responses.PaymentTransaction;
  toResponseList(documents: Documents.PaymentTransaction[]): Responses.PaymentTransaction[];
}

export const paymentTransactionDocumentConverterFactory = (
  accountDocumentConverter: IAccountDocumentConverter,
  projectDocumentConverter: IProjectDocumentConverter,
  categoryDocumentConverter: ICategoryDocumentConverter,
  recipientDocumentConverter: IRecipientDocumentConverter,
  productDocumentConverter: IProductDocumentConverter,
): IPaymentTransactionDocumentConverter => {
  const transactionType = TransactionType.Payment;
  const defaultUnset: Unset<Documents.Transaction, Documents.PaymentTransaction> = {
    transferAccount: true,
    transferAmount: true,
    file: true,
    potentialDuplicates: true,
    ownerAccount: true,
    payingAccount: true,
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
      const optionalSet: UpdateQuery<Documents.Transaction>['$set'] = {
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
