import { generateMongoId } from '@household/shared/common/utils';
import { addSeconds, createDate, getTransactionId } from '@household/shared/common/utils';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { IDeferredTransactionDocumentConverter } from '@household/shared/converters/deferred-transaction-document-converter';
import { IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
import { IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { Dictionary } from '@household/shared/types/common';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';

export interface ISplitTransactionDocumentConverter {
  create(data: {
    body: Transaction.SplitRequest;
    accounts: Dictionary<Account.Document>;
    categories: Dictionary<Category.Document>;
    recipient: Recipient.Document;
    projects: Dictionary<Project.Document>;
    products: Dictionary<Product.Document>;
  }, expiresIn: number, generateId?: boolean): Transaction.SplitDocument;
  toResponse(document: Transaction.SplitDocument): Transaction.SplitResponse;
  toResponseList(documents: Transaction.SplitDocument[]): Transaction.SplitResponse[];
}

export const splitTransactionDocumentConverterFactory = (
  accountDocumentConverter: IAccountDocumentConverter,
  projectDocumentConverter: IProjectDocumentConverter,
  categoryDocumentConverter: ICategoryDocumentConverter,
  recipientDocumentConverter: IRecipientDocumentConverter,
  productDocumentConverter: IProductDocumentConverter,
  deferredTransactionDocumentConverter: IDeferredTransactionDocumentConverter,
): ISplitTransactionDocumentConverter => {

  const instance: ISplitTransactionDocumentConverter = {
    create: ({ body, accounts, projects, categories, recipient, products }, expiresIn, generateId): Transaction.SplitDocument => {
      return {
        ...body,
        accounts: {
          mainAccount: accounts[body.accountId] ?? undefined,
        },
        recipient: recipient ?? undefined,
        transactionType: 'split',
        issuedAt: new Date(body.issuedAt),
        splits: body.splits.map((s) => {
          const category = categories[s.categoryId];

          if (s.loanAccountId) {
            return deferredTransactionDocumentConverter.create({
              body: {
                ...s,
                accountId: body.accountId,
                issuedAt: body.issuedAt,
                recipientId: body.recipientId,
              },
              category,
              ownerAccount: accounts[s.loanAccountId],
              payingAccount: accounts[body.accountId],
              product: products[s.productId],
              project: projects[s.projectId],
              recipient,
            }, expiresIn, true);

          }

          return {
            _id: undefined,
            transactionType: 'split',
            category: category ?? undefined,
            amount: s.amount,
            description: s.description,
            project: projects[s.projectId],
            quantity: category?.categoryType === 'inventory' ? s.quantity : undefined,
            product: category?.categoryType === 'inventory' ? products[s.productId] : undefined,
            invoiceNumber: category?.categoryType === 'invoice' ? s.invoiceNumber : undefined,
            billingEndDate: category?.categoryType === 'invoice' ? createDate(s.billingEndDate) : undefined,
            billingStartDate: category?.categoryType === 'invoice' ? createDate(s.billingStartDate) : undefined,
            projectId: undefined,
            categoryId: undefined,
            productId: undefined,
          };
        }),
        accountId: undefined,
        recipientId: undefined,
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    toResponse: (doc): Transaction.SplitResponse => {
      return {
        ...doc,
        createdAt: undefined,
        updatedAt: undefined,
        transactionId: getTransactionId(doc),
        issuedAt: doc.issuedAt.toISOString(),
        _id: undefined,
        expiresAt: undefined,
        accounts: undefined,
        account: accountDocumentConverter.toResponse(doc.accounts.mainAccount),
        recipient: doc.recipient ? recipientDocumentConverter.toResponse(doc.recipient) : undefined,
        splits: doc.splits.map((s) => {
          switch (s.transactionType) {
            case 'deferred': return deferredTransactionDocumentConverter.toResponse(s);
            case 'split': return {
              amount: s.amount,
              description: s.description,
              invoiceNumber: s.invoiceNumber,
              quantity: s.quantity,
              billingEndDate: s.billingEndDate?.toISOString().split('T')[0],
              billingStartDate: s.billingStartDate?.toISOString().split('T')[0],
              product: s.product ? productDocumentConverter.toResponse(s.product) : undefined,
              category: s.category ? categoryDocumentConverter.toResponse(s.category) : undefined,
              project: s.project ? projectDocumentConverter.toResponse(s.project) : undefined,
            };
          }
        }),
      };
    },
    toResponseList: (docs) => docs.map(d => instance.toResponse(d)),
  };

  return instance;
};
