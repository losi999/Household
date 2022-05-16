import { addSeconds } from '@household/shared/common/utils';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { Account, Category, Project, Recipient, Transaction } from '@household/shared/types/types';

export interface ITransactionDocumentConverter {
  createPaymentDocument(data: {
    body: Transaction.PaymentRequest;
    account: Account.Document;
    category: Category.Document;
    recipient: Recipient.Document;
    project: Project.Document;
  }, expiresIn: number,): Transaction.PaymentDocument;
  createSplitDocument(data: {
    body: Transaction.SplitRequest;
    account: Account.Document;
    categories: Category.Document[];
    recipient: Recipient.Document;
    projects: Project.Document[];
  }, expiresIn: number): Transaction.SplitDocument;
  createTransferDocument(data: {
    body: Transaction.TransferRequest;
    account: Account.Document;
    transferAccount: Account.Document;
  }, expiresIn: number): Transaction.TransferDocument;
  updatePaymentDocument(data: {
    document: Transaction.Document;
    body: Transaction.PaymentRequest;
    account: Account.Document;
    category: Category.Document;
    recipient: Recipient.Document;
    project: Project.Document;
  }, expiresIn: number,): Transaction.PaymentDocument;
  updateSplitDocument(data: {
    document: Transaction.Document;
    body: Transaction.SplitRequest;
    account: Account.Document;
    categories: Category.Document[];
    recipient: Recipient.Document;
    projects: Project.Document[];
  }, expiresIn: number): Transaction.SplitDocument;
  updateTransferDocument(data: {
    document: Transaction.Document;
    body: Transaction.TransferRequest;
    account: Account.Document;
    transferAccount: Account.Document;
  }, expiresIn: number): Transaction.TransferDocument;
  toResponse(document: Transaction.Document, mainAccountId?: Account.IdType): Transaction.Response;
  toResponseList(documents: Transaction.Document[], mainAccountId?: Account.IdType): Transaction.Response[];
}

export const transactionDocumentConverterFactory = (
  accountDocumentConverter: IAccountDocumentConverter,
  projectDocumentConverter: IProjectDocumentConverter,
  categoryDocumentConverter: ICategoryDocumentConverter,
  recipientDocumentConverter: IRecipientDocumentConverter,
): ITransactionDocumentConverter => {
  const toResponseInvoice = (doc: Transaction.Invoice<Date>['invoice']): Transaction.Invoice<string>['invoice'] => {
    return doc ? {
      invoiceNumber: doc.invoiceNumber,
      billingEndDate: doc.billingEndDate.toISOString().split('T')[0],
      billingStartDate: doc.billingStartDate.toISOString().split('T')[0],
    } : undefined;
  };

  const toDocumentInvoice = (req: Transaction.Invoice<string>['invoice']): Transaction.Invoice<Date>['invoice'] => {
    return {
      invoiceNumber: req.invoiceNumber,
      billingEndDate: new Date(req.billingEndDate),
      billingStartDate: new Date(req.billingStartDate),
    };
  };

  const toResponsePayment = (doc: Transaction.PaymentDocument): Transaction.PaymentResponse => {
    return {
      ...doc,
      createdAt: undefined,
      updatedAt: undefined,
      transactionId: doc._id.toString() as Transaction.IdType,
      issuedAt: doc.issuedAt.toISOString(),
      _id: undefined,
      expiresAt: undefined,
      account: accountDocumentConverter.toResponse(doc.account),
      category: doc.category ? categoryDocumentConverter.toResponse(doc.category) : undefined,
      recipient: doc.recipient ? recipientDocumentConverter.toResponse(doc.recipient) : undefined,
      project: doc.project ? projectDocumentConverter.toResponse(doc.project) : undefined,
      invoice: toResponseInvoice(doc.invoice),
    };
  };

  const toResponseSplit = (doc: Transaction.SplitDocument): Transaction.SplitResponse => {
    return {
      ...doc,
      createdAt: undefined,
      updatedAt: undefined,
      transactionId: doc._id.toString() as Transaction.IdType,
      issuedAt: doc.issuedAt.toISOString(),
      _id: undefined,
      expiresAt: undefined,
      account: accountDocumentConverter.toResponse(doc.account),
      recipient: doc.recipient ? recipientDocumentConverter.toResponse(doc.recipient) : undefined,
      splits: doc.splits.map((s) => {
        return {
          amount: s.amount,
          description: s.description,
          inventory: s.inventory,
          invoice: toResponseInvoice(s.invoice),
          category: s.category ? categoryDocumentConverter.toResponse(s.category) : undefined,
          project: s.project ? projectDocumentConverter.toResponse(s.project) : undefined,
        };
      }),
    };
  };

  const toResponseTransfer = (doc: Transaction.TransferDocument, mainAccountId: Account.IdType): Transaction.TransferResponse => {
    return {
      ...doc,
      createdAt: undefined,
      updatedAt: undefined,
      transactionId: doc._id.toString() as Transaction.IdType,
      issuedAt: doc.issuedAt.toISOString(),
      _id: undefined,
      expiresAt: undefined,
      amount: mainAccountId === doc.transferAccount._id.toString() ? doc.amount * -1 : doc.amount,
      account: mainAccountId === doc.transferAccount._id.toString() ? accountDocumentConverter.toResponse(doc.transferAccount) : accountDocumentConverter.toResponse(doc.account),
      transferAccount: mainAccountId === doc.transferAccount._id.toString() ? accountDocumentConverter.toResponse(doc.account) : accountDocumentConverter.toResponse(doc.transferAccount),
    };
  };

  const instance: ITransactionDocumentConverter = {
    createPaymentDocument: ({ body, account, project, category, recipient }, expiresIn): Transaction.PaymentDocument => {
      return {
        ...body,
        account,
        category,
        project,
        recipient,
        issuedAt: new Date(body.issuedAt),
        transactionType: 'payment',
        inventory: category?.categoryType === 'inventory' ? body.inventory : undefined,
        invoice: category?.categoryType === 'invoice' ? toDocumentInvoice(body.invoice) : undefined,
        accountId: undefined,
        categoryId: undefined,
        projectId: undefined,
        recipientId: undefined,
        _id: undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    createSplitDocument: ({ body, account, projects, categories, recipient }, expiresIn): Transaction.SplitDocument => {
      return {
        ...body,
        account,
        recipient,
        transactionType: 'split',
        issuedAt: new Date(body.issuedAt),
        splits: body.splits.map((s) => {
          const category = categories.find(x => x._id.toString() === s.categoryId);
          return {
            category,
            amount: s.amount,
            description: s.description,
            project: projects.find(x => x._id.toString() === s.projectId),
            inventory: category?.categoryType === 'inventory' ? s.inventory : undefined,
            invoice: category?.categoryType === 'invoice' ? toDocumentInvoice(s.invoice) : undefined,
          };
        }),
        accountId: undefined,
        recipientId: undefined,
        _id: undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    createTransferDocument: ({ body, account, transferAccount }, expiresIn): Transaction.TransferDocument => {
      return {
        ...body,
        account,
        transferAccount,
        issuedAt: new Date(body.issuedAt),
        transactionType: 'transfer',
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
  };

  return instance;
};
