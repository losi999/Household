import { generateMongoId } from '@household/shared/common/test-data-factory';
import { addSeconds, getAccountId, getTransactionId } from '@household/shared/common/utils';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
import { IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { Dictionary } from '@household/shared/types/common';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';

export interface ITransactionDocumentConverter {
  createPaymentDocument(data: {
    body: Transaction.PaymentRequest;
    account: Account.Document;
    category: Category.Document;
    recipient: Recipient.Document;
    project: Project.Document;
    product: Product.Document;
  }, expiresIn: number, generateId?: boolean): Transaction.PaymentDocument;
  createSplitDocument(data: {
    body: Transaction.SplitRequest;
    account: Account.Document;
    categories: Dictionary<Category.Document>;
    recipient: Recipient.Document;
    projects: Dictionary<Project.Document>;
    products: Dictionary<Product.Document>;
  }, expiresIn: number, generateId?: boolean): Transaction.SplitDocument;
  createTransferDocument(data: {
    body: Transaction.TransferRequest;
    account: Account.Document;
    transferAccount: Account.Document;
  }, expiresIn: number, generateId?: boolean): Transaction.TransferDocument;
  updatePaymentDocument(data: {
    document: Transaction.Document;
    body: Transaction.PaymentRequest;
    account: Account.Document;
    category: Category.Document;
    recipient: Recipient.Document;
    project: Project.Document;
    product: Product.Document;
  }, expiresIn: number,): Transaction.PaymentDocument;
  updateSplitDocument(data: {
    document: Transaction.Document;
    body: Transaction.SplitRequest;
    account: Account.Document;
    categories: Dictionary<Category.Document>;
    recipient: Recipient.Document;
    projects: Dictionary<Project.Document>;
    products: Dictionary<Product.Document>;
  }, expiresIn: number): Transaction.SplitDocument;
  updateTransferDocument(data: {
    document: Transaction.Document;
    body: Transaction.TransferRequest;
    account: Account.Document;
    transferAccount: Account.Document;
  }, expiresIn: number): Transaction.TransferDocument;
  toResponse(document: Transaction.Document, mainAccountId?: Account.Id): Transaction.Response;
  toResponseList(documents: Transaction.Document[], mainAccountId?: Account.Id): Transaction.Response[];
  toReportResponseItem(document: Transaction.PaymentDocument | Transaction.SplitDocument): Transaction.ReportTransactionItem[];
  toReportResponseItemList(documents: (Transaction.PaymentDocument | Transaction.SplitDocument)[]): Transaction.ReportTransactionItem[];
}

export const transactionDocumentConverterFactory = (
  accountDocumentConverter: IAccountDocumentConverter,
  projectDocumentConverter: IProjectDocumentConverter,
  categoryDocumentConverter: ICategoryDocumentConverter,
  recipientDocumentConverter: IRecipientDocumentConverter,
  productDocumentConverter: IProductDocumentConverter,
): ITransactionDocumentConverter => {
  const toResponseInvoice = ({ invoice }: Transaction.Invoice<Date>): Transaction.Invoice<string> => {
    return invoice ? {
      invoice: {
        invoiceNumber: invoice.invoiceNumber,
        billingEndDate: invoice.billingEndDate.toISOString().split('T')[0],
        billingStartDate: invoice.billingStartDate.toISOString().split('T')[0],
      },
    } : undefined;
  };

  const toDocumentInvoice = ({ invoice }: Transaction.Invoice<string>): Transaction.Invoice<Date> => {
    return invoice ? {
      invoice: {
        invoiceNumber: invoice.invoiceNumber,
        billingEndDate: new Date(invoice.billingEndDate),
        billingStartDate: new Date(invoice.billingStartDate),
      },
    } : undefined;
  };

  const toResponseInventory = ({ inventory }: Transaction.Inventory<Product.Document>): Transaction.Inventory<Product.Response> => {
    return inventory ? {
      inventory: {
        quantity: inventory.quantity,
        product: productDocumentConverter.toResponse(inventory.product),
      },
    } : undefined;
  };

  const toDocumentInventory = ({ inventory }: Transaction.InventoryRequest, product: Product.Document): Transaction.Inventory<Product.Document> => {
    return inventory ? {
      inventory: {
        quantity: inventory.quantity,
        product: product ?? undefined,
      },
    } : undefined;
  };

  const toResponsePayment = (doc: Transaction.PaymentDocument): Transaction.PaymentResponse => {
    return {
      ...doc,
      createdAt: undefined,
      updatedAt: undefined,
      transactionId: getTransactionId(doc),
      issuedAt: doc.issuedAt.toISOString(),
      _id: undefined,
      expiresAt: undefined,
      account: accountDocumentConverter.toResponse(doc.account),
      category: doc.category ? categoryDocumentConverter.toResponse(doc.category) : undefined,
      recipient: doc.recipient ? recipientDocumentConverter.toResponse(doc.recipient) : undefined,
      project: doc.project ? projectDocumentConverter.toResponse(doc.project) : undefined,
      ...toResponseInvoice(doc),
      ...toResponseInventory(doc),
    };
  };

  const toResponseSplit = (doc: Transaction.SplitDocument): Transaction.SplitResponse => {
    return {
      ...doc,
      createdAt: undefined,
      updatedAt: undefined,
      transactionId: getTransactionId(doc),
      issuedAt: doc.issuedAt.toISOString(),
      _id: undefined,
      expiresAt: undefined,
      account: accountDocumentConverter.toResponse(doc.account),
      recipient: doc.recipient ? recipientDocumentConverter.toResponse(doc.recipient) : undefined,
      splits: doc.splits.map((s) => {
        return {
          amount: s.amount,
          description: s.description,
          ...toResponseInvoice(s),
          ...toResponseInventory(s),
          category: s.category ? categoryDocumentConverter.toResponse(s.category) : undefined,
          project: s.project ? projectDocumentConverter.toResponse(s.project) : undefined,
        };
      }),
    };
  };

  const toResponseTransfer = (doc: Transaction.TransferDocument, mainAccountId: Account.Id): Transaction.TransferResponse => {
    return {
      ...doc,
      createdAt: undefined,
      updatedAt: undefined,
      transactionId: getTransactionId(doc),
      issuedAt: doc.issuedAt.toISOString(),
      _id: undefined,
      expiresAt: undefined,
      amount: mainAccountId === getAccountId(doc.transferAccount) ? doc.transferAmount : doc.amount,
      transferAmount: mainAccountId === getAccountId(doc.transferAccount) ? doc.amount : doc.transferAmount,
      account: mainAccountId === getAccountId(doc.transferAccount) ? accountDocumentConverter.toResponse(doc.transferAccount) : accountDocumentConverter.toResponse(doc.account),
      transferAccount: mainAccountId === getAccountId(doc.transferAccount) ? accountDocumentConverter.toResponse(doc.account) : accountDocumentConverter.toResponse(doc.transferAccount),
    };
  };

  const instance: ITransactionDocumentConverter = {
    createPaymentDocument: ({ body, account, project, category, recipient, product }, expiresIn, generateId) => {
      return {
        ...body,
        account: account ?? undefined,
        recipient: recipient ?? undefined,
        category: category ?? undefined,
        project: project ?? undefined,
        issuedAt: new Date(body.issuedAt),
        transactionType: 'payment',
        ...(category?.categoryType === 'inventory' && toDocumentInventory(body, product)),
        ...(category?.categoryType === 'invoice' && toDocumentInvoice(body)),
        accountId: undefined,
        categoryId: undefined,
        projectId: undefined,
        recipientId: undefined,
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    createSplitDocument: ({ body, account, projects, categories, recipient, products }, expiresIn, generateId): Transaction.SplitDocument => {
      return {
        ...body,
        account: account ?? undefined,
        recipient: recipient ?? undefined,
        transactionType: 'split',
        issuedAt: new Date(body.issuedAt),
        splits: body.splits.map((s) => {
          const category = categories[s.categoryId];
          return {
            category: category ?? undefined,
            amount: s.amount,
            description: s.description,
            project: projects[s.projectId],
            ...(category?.categoryType === 'inventory' && toDocumentInventory(s, products[s.inventory?.productId])),
            ...(category?.categoryType === 'invoice' && toDocumentInvoice(s)),
            projectId: undefined,
            categoryId: undefined,
          };
        }),
        accountId: undefined,
        recipientId: undefined,
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    createTransferDocument: ({ body, account, transferAccount }, expiresIn, generateId): Transaction.TransferDocument => {
      return {
        ...body,
        account: account,
        transferAccount: transferAccount,
        issuedAt: new Date(body.issuedAt),
        transactionType: 'transfer',
        _id: generateId ? generateMongoId() : undefined,
        accountId: undefined,
        transferAccountId: undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    updatePaymentDocument: ({ document, ...restOfData }, expiresIn): Transaction.PaymentDocument => {
      return {
        ...instance.createPaymentDocument(restOfData, expiresIn),
        _id: document._id,
        createdAt: document.createdAt,
      };
    },
    updateSplitDocument: ({ document, ...restOfData }, expiresIn): Transaction.SplitDocument => {
      return {
        ...instance.createSplitDocument(restOfData, expiresIn),
        _id: document._id,
        createdAt: document.createdAt,
      };
    },
    updateTransferDocument: ({ document, ...restOfData }, expiresIn): Transaction.TransferDocument => {
      return {
        ...instance.createTransferDocument(restOfData, expiresIn),
        _id: document._id,
        createdAt: document.createdAt,
      };
    },
    toResponse: (doc, mainAccountId): Transaction.Response => {
      switch (doc.transactionType) {
        case 'payment': return toResponsePayment(doc);
        case 'split': return toResponseSplit(doc);
        case 'transfer': return toResponseTransfer(doc, mainAccountId);
        default: return undefined;
      }
    },
    toResponseList: (docs, mainAccountId) => docs.map(d => instance.toResponse(d, mainAccountId)),
    toReportResponseItem: (document): Transaction.ReportTransactionItem[] => {
      if (document.transactionType === 'payment') {
        return [
          {
            amount: document.amount,
            transactionId: getTransactionId(document),
            issuedAt: document.issuedAt,
            projectName: document.project?.name,
            categoryName: document.category?.fullName,
            recipientName: document.recipient?.name,
            accountName: document.account.name,
            description: document.description,
          },
        ];
      }

      return document.splits.map(s => ({
        accountName: document.account.name,
        transactionId: getTransactionId(document),
        amount: s.amount,
        issuedAt: document.issuedAt,
        recipientName: document.recipient?.name,
        description: s.description,
        projectName: s.project?.name,
        categoryName: s.category?.fullName,
      }));
    },
    toReportResponseItemList: documents => documents.flatMap(d => instance.toReportResponseItem(d)),
  };

  return instance;
};
