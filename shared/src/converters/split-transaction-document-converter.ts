import { generateMongoId } from '@household/shared/common/mongoose-utils';
import { addSeconds, createDate, getTransactionId } from '@household/shared/common/utils';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { IDeferredTransactionDocumentConverter } from '@household/shared/converters/deferred-transaction-document-converter';
import { IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
import { IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { CategoryType, TransactionType } from '@household/shared/enums';
import { Dictionary, DocumentUpdate, Unset } from '@household/shared/types/common';
import { Documents } from '@household/shared/types/documents';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { Types, UpdateQuery } from 'mongoose';

export interface ISplitTransactionDocumentConverter {
  create(data: {
    body: Requests.SplitTransaction;
    accounts: Dictionary<Documents.Account>;
    categories: Dictionary<Documents.Category>;
    recipient: Documents.Recipient;
    projects: Dictionary<Documents.Project>;
    products: Dictionary<Documents.Product>;
  }, expiresIn: number, generateId?: boolean): Documents.SplitTransaction;
  update(data: {
    body: Requests.SplitTransaction;
    accounts: Dictionary<Documents.Account>;
    categories: Dictionary<Documents.Category>;
    recipient: Documents.Recipient;
    projects: Dictionary<Documents.Project>;
    products: Dictionary<Documents.Product>;
  }, expiresIn: number): DocumentUpdate<Documents.Transaction>;
  toResponse(document: Documents.SplitTransaction): Responses.SplitTransaction;
  toResponseList(documents: Documents.SplitTransaction[]): Responses.SplitTransaction[];
}

export const splitTransactionDocumentConverterFactory = (
  accountDocumentConverter: IAccountDocumentConverter,
  projectDocumentConverter: IProjectDocumentConverter,
  categoryDocumentConverter: ICategoryDocumentConverter,
  recipientDocumentConverter: IRecipientDocumentConverter,
  productDocumentConverter: IProductDocumentConverter,
  deferredTransactionDocumentConverter: IDeferredTransactionDocumentConverter,
): ISplitTransactionDocumentConverter => {
  const transactionType = TransactionType.Split;
  const defaultUnset: Unset<Documents.Transaction, Documents.SplitTransaction> = {
    transferAccount: true,
    transferAmount: true,
    file: true,
    potentialDuplicates: true,
    ownerAccount: true,
    payingAccount: true,
    billingEndDate: true,
    billingStartDate: true,
    category: true,
    invoiceNumber: true,
    product: true,
    project: true,
    quantity: true,
  };

  const createSplitDocumentItem = (s: Requests.SplitItem, category: Documents.Category, project: Documents.Project, product: Documents.Product): Documents.SplitItem => {
    return {
      amount: s.amount,
      description: s.description,
      project,
      category,
      quantity: category?.categoryType === CategoryType.Inventory ? s.quantity : undefined,
      product: category?.categoryType === CategoryType.Inventory ? product : undefined,
      invoiceNumber: category?.categoryType === CategoryType.Invoice ? s.invoiceNumber : undefined,
      billingEndDate: category?.categoryType === CategoryType.Invoice ? createDate(s.billingEndDate) : undefined,
      billingStartDate: category?.categoryType === CategoryType.Invoice ? createDate(s.billingStartDate) : undefined,
    };
  };

  const instance: ISplitTransactionDocumentConverter = {
    create: ({ body, accounts, projects, categories, recipient, products }, expiresIn, generateId) => {
      return {
        amount: body.amount,
        description: body.description,
        account: accounts[body.accountId],
        recipient: recipient ?? undefined,
        transactionType,
        issuedAt: new Date(body.issuedAt),
        splits: body.splits?.map((s) => createSplitDocumentItem(s, categories[s.categoryId], projects[s.projectId], products[s.productId])) ?? [],
        deferredSplits: body.loans?.map((s) => {
          const category = categories[s.categoryId];

          const deferredDocument = deferredTransactionDocumentConverter.create({
            body: {
              ...s,
              accountId: body.accountId,
              issuedAt: undefined,
              recipientId: undefined,
            },
            category,
            ownerAccount: accounts[s.loanAccountId],
            payingAccount: accounts[body.accountId],
            product: products[s.productId],
            project: projects[s.projectId],
            recipient,
          }, expiresIn, generateId);

          return deferredDocument;
        }) ?? [],
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    update: ({ body: { accountId, amount, description, issuedAt, loans, splits }, accounts, projects, categories, recipient, products }, expiresIn) => {
      const optionalSet: UpdateQuery<Documents.Transaction>['$set'] = {
        recipient,
        description,
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
            account: accounts[accountId],
            recipient,
            transactionType,
            issuedAt: new Date(issuedAt),
            expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
            splits: splits?.map((s) => createSplitDocumentItem(s, categories[s.categoryId], projects[s.projectId], products[s.productId])) ?? [],
            deferredSplits: loans?.map((s) => {
              const category = categories[s.categoryId];

              const deferredDocument = deferredTransactionDocumentConverter.create({
                body: {
                  ...s,
                  accountId: accountId,
                  issuedAt: undefined,
                  recipientId: undefined,
                },
                category,
                ownerAccount: accounts[s.loanAccountId],
                payingAccount: accounts[accountId],
                product: products[s.productId],
                project: projects[s.projectId],
                recipient,
              }, expiresIn);

              if (s.transactionId) {
                deferredDocument._id = new Types.ObjectId(s.transactionId);
              }

              return deferredDocument;
            }) ?? [],
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
    toResponse: ({ amount, description, transactionType, _id, issuedAt, account, recipient, splits, deferredSplits }) => {
      return {
        amount,
        description,
        transactionType,
        transactionId: getTransactionId(_id),
        issuedAt: issuedAt.toISOString(),
        account: accountDocumentConverter.toResponse(account),
        recipient: recipient ? recipientDocumentConverter.toResponse(recipient) : undefined,
        splits: splits?.map(s => ({
          amount: s.amount,
          description: s.description,
          invoiceNumber: s.invoiceNumber,
          quantity: s.quantity,
          billingEndDate: s.billingEndDate?.toISOString().split('T')[0],
          billingStartDate: s.billingStartDate?.toISOString().split('T')[0],
          product: s.product ? productDocumentConverter.toResponse(s.product) : undefined,
          category: s.category ? categoryDocumentConverter.toResponse(s.category) : undefined,
          project: s.project ? projectDocumentConverter.toResponse(s.project) : undefined,
        })),
        deferredSplits: deferredSplits?.map(s => deferredTransactionDocumentConverter.toResponse(s)),
      };
    },
    toResponseList: (docs) => docs.map(d => instance.toResponse(d)),
  };

  return instance;
};
