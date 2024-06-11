import { generateMongoId } from '@household/shared/common/utils';
import { addSeconds, createDate, getAccountId, getTransactionId } from '@household/shared/common/utils';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
import { IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { Dictionary } from '@household/shared/types/common';
import { Account, Category, File, Product, Project, Recipient, Transaction } from '@household/shared/types/types';

export interface ITransactionDocumentConverter {
  createDeferredDocument(data: {
    body: Transaction.PaymentRequest;
    payingAccount: Account.Document;
    ownerAccount: Account.Document;
    category: Category.Document;
    recipient: Recipient.Document;
    project: Project.Document;
    product: Product.Document;
  }, expiresIn: number, generateId?: boolean): Transaction.DeferredDocument;
  createReimbursementDocument(data: {
    body: Transaction.PaymentRequest;
    payingAccount: Account.Document;
    ownerAccount: Account.Document;
    category: Category.Document;
    recipient: Recipient.Document;
    project: Project.Document;
    product: Product.Document;
  }, expiresIn: number, generateId?: boolean): Transaction.ReimbursementDocument;
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
    accounts: Dictionary<Account.Document>;
    categories: Dictionary<Category.Document>;
    recipient: Recipient.Document;
    projects: Dictionary<Project.Document>;
    products: Dictionary<Product.Document>;
  }, expiresIn: number, generateId?: boolean): Transaction.SplitDocument;
  createTransferDocument(data: {
    body: Transaction.TransferRequest;
    account: Account.Document;
    transferAccount: Account.Document;
    transactions: Dictionary<Transaction.DeferredDocument>;
  }, expiresIn: number, generateId?: boolean): Transaction.TransferDocument;
  createLoanTransferDocument(data: {
    body: Transaction.TransferRequest;
    account: Account.Document;
    transferAccount: Account.Document;
  }, expiresIn: number, generateId?: boolean): Transaction.LoanTransferDocument;
  createDraftDocument(data: {
    body: Transaction.IssuedAt<Date> & Transaction.Amount & Transaction.Description;
    file: File.Document;
  }, expiresIn: number, generateId?: boolean): Transaction.DraftDocument;
  toResponse(document: Transaction.Document, viewingAccountId?: Account.Id): Transaction.Response;
  toResponseList(documents: Transaction.Document[], viewingAccountId?: Account.Id): Transaction.Response[];
  toReport(document: Transaction.PaymentDocument): Transaction.Report;
  toReportList(documents: (Transaction.PaymentDocument)[]): Transaction.Report[];
}

export const transactionDocumentConverterFactory = (
  accountDocumentConverter: IAccountDocumentConverter,
  projectDocumentConverter: IProjectDocumentConverter,
  categoryDocumentConverter: ICategoryDocumentConverter,
  recipientDocumentConverter: IRecipientDocumentConverter,
  productDocumentConverter: IProductDocumentConverter,
): ITransactionDocumentConverter => {
  const toResponsePayment = (doc: Transaction.PaymentDocument): Transaction.PaymentResponse => {
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
      billingEndDate: doc.billingEndDate?.toISOString().split('T')[0],
      billingStartDate: doc.billingStartDate?.toISOString().split('T')[0],
      product: doc.product ? productDocumentConverter.toResponse(doc.product) : undefined,
      category: doc.category ? categoryDocumentConverter.toResponse(doc.category) : undefined,
      recipient: doc.recipient ? recipientDocumentConverter.toResponse(doc.recipient) : undefined,
      project: doc.project ? projectDocumentConverter.toResponse(doc.project) : undefined,
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
      accounts: undefined,
      account: accountDocumentConverter.toResponse(doc.accounts.mainAccount),
      recipient: doc.recipient ? recipientDocumentConverter.toResponse(doc.recipient) : undefined,
      splits: doc.splits.map((s) => {
        return {
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
      }),
    };
  };

  const toResponseTransfer = (doc: Transaction.TransferDocument, viewingAccountId: Account.Id): Transaction.TransferResponse => {
    return {
      ...doc,
      createdAt: undefined,
      updatedAt: undefined,
      transactionId: getTransactionId(doc),
      issuedAt: doc.issuedAt.toISOString(),
      _id: undefined,
      expiresAt: undefined,
      accounts: undefined,
      amount: viewingAccountId === getAccountId(doc.accounts.transferAccount) ? doc.transferAmount : doc.amount,
      transferAmount: viewingAccountId === getAccountId(doc.accounts.transferAccount) ? doc.amount : doc.transferAmount,
      account: viewingAccountId === getAccountId(doc.accounts.transferAccount) ? accountDocumentConverter.toResponse(doc.accounts.transferAccount) : accountDocumentConverter.toResponse(doc.accounts.mainAccount),
      transferAccount: viewingAccountId === getAccountId(doc.accounts.transferAccount) ? accountDocumentConverter.toResponse(doc.accounts.mainAccount) : accountDocumentConverter.toResponse(doc.accounts.transferAccount),
    };
  };

  const instance: ITransactionDocumentConverter = {
    createDeferredDocument: ({ body, payingAccount, ownerAccount, project, category, recipient, product }, expiresIn, generateId): Transaction.DeferredDocument => {
      return {
        ...body,
        amount: Math.abs(body.amount) * -1,
        accounts: {
          payingAccount,
          ownerAccount,
        },
        recipient: recipient ?? undefined,
        category: category ?? undefined,
        project: project ?? undefined,
        issuedAt: new Date(body.issuedAt),
        transactionType: 'deferred',
        quantity: category?.categoryType === 'inventory' ? body.quantity : undefined,
        product: category?.categoryType === 'inventory' ? product ?? undefined : undefined,
        invoiceNumber: category?.categoryType === 'invoice' ? body.invoiceNumber : undefined,
        billingEndDate: category?.categoryType === 'invoice' ? createDate(body.billingEndDate) : undefined,
        billingStartDate: category?.categoryType === 'invoice' ? createDate(body.billingStartDate) : undefined,
        accountId: undefined,
        categoryId: undefined,
        projectId: undefined,
        recipientId: undefined,
        productId: undefined,
        loanAccountId: undefined,
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    createReimbursementDocument: ({ body, payingAccount, ownerAccount, project, category, recipient, product }, expiresIn, generateId): Transaction.ReimbursementDocument => {
      return {
        ...body,
        amount: Math.abs(body.amount) * -1,
        accounts: {
          payingAccount,
          ownerAccount,
        },
        recipient: recipient ?? undefined,
        category: category ?? undefined,
        project: project ?? undefined,
        issuedAt: new Date(body.issuedAt),
        transactionType: 'reimbursement',
        quantity: category?.categoryType === 'inventory' ? body.quantity : undefined,
        product: category?.categoryType === 'inventory' ? product ?? undefined : undefined,
        invoiceNumber: category?.categoryType === 'invoice' ? body.invoiceNumber : undefined,
        billingEndDate: category?.categoryType === 'invoice' ? createDate(body.billingEndDate) : undefined,
        billingStartDate: category?.categoryType === 'invoice' ? createDate(body.billingStartDate) : undefined,
        accountId: undefined,
        categoryId: undefined,
        projectId: undefined,
        recipientId: undefined,
        productId: undefined,
        loanAccountId: undefined,
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    createPaymentDocument: ({ body, account, project, category, recipient, product }, expiresIn, generateId) => {
      return {
        ...body,
        splits: 123,
        accounts: {
          mainAccount: account ?? undefined,
        },
        recipient: recipient ?? undefined,
        category: category ?? undefined,
        project: project ?? undefined,
        issuedAt: new Date(body.issuedAt),
        transactionType: 'payment',
        quantity: category?.categoryType === 'inventory' ? body.quantity : undefined,
        product: category?.categoryType === 'inventory' ? product ?? undefined : undefined,
        invoiceNumber: category?.categoryType === 'invoice' ? body.invoiceNumber : undefined,
        billingEndDate: category?.categoryType === 'invoice' ? createDate(body.billingEndDate) : undefined,
        billingStartDate: category?.categoryType === 'invoice' ? createDate(body.billingStartDate) : undefined,
        accountId: undefined,
        categoryId: undefined,
        projectId: undefined,
        recipientId: undefined,
        productId: undefined,
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    createSplitDocument: ({ body, accounts, projects, categories, recipient, products }, expiresIn, generateId): Transaction.SplitDocument => {

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
            return instance.createDeferredDocument({
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
    createTransferDocument: ({ body, account, transferAccount, transactions }, expiresIn, generateId): Transaction.TransferDocument => {
      return {
        ...body,
        transferAmount: body.transferAmount ?? body.amount * -1,
        accounts: {
          mainAccount: account,
          transferAccount: transferAccount,
        },
        payments: body.payments?.map(p => {
          return {
            amount: Math.min(p.amount, Math.abs(transactions[p.transactionId].remainingAmount)),
            transaction: transactions[p.transactionId],
          };
        }),
        issuedAt: new Date(body.issuedAt),
        transactionType: 'transfer',
        _id: generateId ? generateMongoId() : undefined,
        accountId: undefined,
        transferAccountId: undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    createLoanTransferDocument: ({ body, account, transferAccount }, expiresIn, generateId): Transaction.LoanTransferDocument => {
      return {
        amount: body.amount,
        description: body.description,
        accounts: {
          mainAccount: account,
          transferAccount: transferAccount,
        },
        issuedAt: new Date(body.issuedAt),
        transactionType: 'loanTransfer',
        _id: generateId ? generateMongoId() : undefined,
        accountId: undefined,
        transferAccountId: undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    createDraftDocument: ({ body, file }, expiresIn, generateId): Transaction.DraftDocument => {
      return {
        ...body,
        file,
        transactionType: 'draft',
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    toResponse: (doc, viewingAccountId): Transaction.Response => {
      switch (doc.transactionType) {
        case 'payment': return toResponsePayment(doc);
        case 'split': return toResponseSplit(doc);
        case 'transfer': return toResponseTransfer(doc, viewingAccountId);
        default: return undefined;
      }
    },
    toResponseList: (docs, mainAccountId) => docs.map(d => instance.toResponse(d, mainAccountId)),
    toReport: (document): Transaction.Report => {
      return {
        amount: document.amount,
        transactionId: getTransactionId(document),
        issuedAt: document.issuedAt.toISOString(),
        description: document.description,
        account: accountDocumentConverter.toReport(document.accounts.mainAccount),
        category: categoryDocumentConverter.toReport(document.category),
        product: productDocumentConverter.toReport({
          quantity: document.quantity,
          document: document.product,
        }),
        project: projectDocumentConverter.toReport(document.project),
        recipient: recipientDocumentConverter.toReport(document.recipient),
      };

    },
    toReportList: documents => documents.map(d => instance.toReport(d)),
  };

  return instance;
};
