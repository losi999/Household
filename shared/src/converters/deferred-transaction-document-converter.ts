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
  update(data: {
    body: Transaction.PaymentRequest;
    payingAccount: Account.Document;
    ownerAccount: Account.Document;
    category: Category.Document;
    recipient: Recipient.Document;
    project: Project.Document;
    product: Product.Document;
  }, expiresIn: number): UpdateQuery<Transaction.Document>;
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
  const transactionType = TransactionType.Deferred;
  const defaultUnset: Unset<Transaction.Document, Transaction.DeferredDocument> = {
    transferAccount: true,
    transferAmount: true,
    file: true,
    hasDuplicate: true,
    payments: true,
    deferredSplits: true,
    splits: true,
    account: true,
  };

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
        transactionType,
        isSettled: isSettled ?? false,
        quantity: category?.categoryType === CategoryType.Inventory ? quantity : undefined,
        product: category?.categoryType === CategoryType.Inventory ? product ?? undefined : undefined,
        invoiceNumber: category?.categoryType === CategoryType.Invoice ? invoiceNumber : undefined,
        billingEndDate: category?.categoryType === CategoryType.Invoice ? createDate(billingEndDate) : undefined,
        billingStartDate: category?.categoryType === CategoryType.Invoice ? createDate(billingStartDate) : undefined,
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    update: ({ body: { issuedAt, quantity, invoiceNumber, billingEndDate, billingStartDate, amount, description, isSettled }, payingAccount, ownerAccount, project, category, recipient, product }, expiresIn) => {
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
          isSettled: isSettled ?? false,
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
        payingAccount: payingAccount ? accountDocumentConverter.toLeanResponse(payingAccount) : undefined,
        ownerAccount: ownerAccount ? accountDocumentConverter.toLeanResponse(ownerAccount) : undefined,
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
