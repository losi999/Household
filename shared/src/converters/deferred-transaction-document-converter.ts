import { generateMongoId } from '@household/shared/common/mongoose-utils';
import { addSeconds, createDate, getTransactionId } from '@household/shared/common/utils';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
import { IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { CategoryType, TransactionType } from '@household/shared/enums';
import { DocumentUpdate, Unset } from '@household/shared/types/common';
import { Documents } from '@household/shared/types/documents';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { UpdateQuery } from 'mongoose';

export interface IDeferredTransactionDocumentConverter {
  create(data: {
    body: Requests.PaymentTransaction;
    payingAccount: Documents.Account;
    ownerAccount: Documents.Account;
    category: Documents.Category;
    recipient: Documents.Recipient;
    project: Documents.Project;
    product: Documents.Product;
  }, expiresIn: number, generateId?: boolean): Documents.DeferredTransaction;
  update(data: {
    body: Requests.PaymentTransaction;
    payingAccount: Documents.Account;
    ownerAccount: Documents.Account;
    category: Documents.Category;
    recipient: Documents.Recipient;
    project: Documents.Project;
    product: Documents.Product;
  }, expiresIn: number): DocumentUpdate<Documents.Transaction>;
  toResponse(document: Documents.DeferredTransaction): Responses.DeferredTransaction;
  toResponseList(documents: Documents.DeferredTransaction[]): Responses.DeferredTransaction[];
}

export const deferredTransactionDocumentConverterFactory = (
  accountDocumentConverter: IAccountDocumentConverter,
  projectDocumentConverter: IProjectDocumentConverter,
  categoryDocumentConverter: ICategoryDocumentConverter,
  recipientDocumentConverter: IRecipientDocumentConverter,
  productDocumentConverter: IProductDocumentConverter,
): IDeferredTransactionDocumentConverter => {
  const transactionType = TransactionType.Deferred;
  const defaultUnset: Unset<Documents.Transaction, Documents.DeferredTransaction> = {
    transferAccount: true,
    transferAmount: true,
    file: true,
    potentialDuplicates: true,
    deferredSplits: true,
    splits: true,
    account: true,
  };

  const instance: IDeferredTransactionDocumentConverter = {
    create: ({ body: { issuedAt, amount, description, quantity, invoiceNumber, billingEndDate, billingStartDate }, payingAccount, ownerAccount, project, category, recipient, product }, expiresIn, generateId) => {
      return {
        amount,
        description,
        payingAccount,
        ownerAccount,
        recipient: recipient ?? undefined,
        category: category ?? undefined,
        project: project ?? undefined,
        issuedAt: createDate(issuedAt),
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
        },
      };
    },
    toResponse: ({ amount, description, invoiceNumber, quantity, transactionType, issuedAt, payingAccount, ownerAccount, billingEndDate, billingStartDate, product, category, recipient, project, _id }) => {
      return {
        amount,
        description,
        invoiceNumber,
        quantity,
        transactionType,
        transactionId: getTransactionId(_id),
        issuedAt: issuedAt?.toISOString(),
        payingAccount: payingAccount ? accountDocumentConverter.toResponseLean(payingAccount) : undefined,
        ownerAccount: ownerAccount ? accountDocumentConverter.toResponseLean(ownerAccount) : undefined,
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
