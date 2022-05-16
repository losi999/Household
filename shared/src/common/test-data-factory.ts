import { Account, Category, Project, Recipient, Transaction } from '@household/shared/types/types';

export const createAccountId = (id?: string): Account.IdType => {
  return (id ?? 'accountId') as Account.IdType;
};

export const createCategoryId = (id?: string): Category.IdType => {
  return (id ?? 'categoryId') as Category.IdType;
};

export const createProjectId = (id?: string): Project.IdType => {
  return (id ?? 'projectId') as Project.IdType;
};

export const createRecipientId = (id?: string): Recipient.IdType => {
  return (id ?? 'recipientId') as Recipient.IdType;
};

export const createTransactionId = (id?: string): Transaction.IdType => {
  return (id ?? 'transactionId') as Transaction.IdType;
};

export const createAccountDocument = (doc?: Partial<Account.Document>): Account.Document => {
  return {
    accountType: 'bankAccount',
    name: 'account name',
    currency: 'Ft',
    expiresAt: undefined,
    isOpen: true,
    ...doc,
  };
};

export const createProjectDocument = (doc?: Partial<Project.Document>): Project.Document => {
  return {
    name: 'project name',
    description: 'project description',
    expiresAt: undefined,
    ...doc,
  };
};
export const createCategoryDocument = (doc?: Partial<Category.Document>): Category.Document => {
  return {
    name: 'category name',
    expiresAt: undefined,
    parentCategory: undefined,
    parentCategoryId: undefined,
    fullName: 'category name',
    categoryType: 'regular',
    ...doc,
  };
};
export const createRecipientDocument = (doc?: Partial<Recipient.Document>): Recipient.Document => {
  return {
    name: 'recipient name',
    expiresAt: undefined,
    ...doc,
  };
};

export const createPaymentTransactionDocument = (doc?: Partial<Transaction.PaymentDocument>): Transaction.PaymentDocument => {
  return {
    transactionType: 'payment',
    amount: 100,
    description: 'transaction description',
    inventory: undefined,
    invoice: undefined,
    issuedAt: new Date(),
    expiresAt: undefined,
    accountId: undefined,
    categoryId: undefined,
    projectId: undefined,
    recipientId: undefined,
    account: createAccountDocument(),
    category: createCategoryDocument(),
    project: createProjectDocument(),
    recipient: createRecipientDocument(),
    ...doc,
  };
};

export const createSplitTransactionDocument = (doc?: Partial<Transaction.SplitDocument>, ...splits: Partial<Transaction.SplitDocument['splits'][number]>[]): Transaction.SplitDocument => {
  return {
    transactionType: 'split',
    amount: Math.max(splits.length, 1),
    description: 'transaction description',
    issuedAt: new Date(),
    expiresAt: undefined,
    accountId: undefined,
    recipientId: undefined,
    account: createAccountDocument(),
    recipient: createRecipientDocument(),
    splits: splits.length > 0 ? splits.map((s) => {
      return {
        amount: 1,
        category: createCategoryDocument(),
        project: createProjectDocument(),
        description: 'split description',
        inventory: undefined,
        invoice: undefined,
        ...s,
      };
    }) : [
      {
        amount: 1,
        category: createCategoryDocument(),
        project: createProjectDocument(),
        description: 'split description',
        inventory: undefined,
        invoice: undefined,
      },
    ],
    ...doc,
  };
};

export const createTransferTransactionDocument = (doc?: Partial<Transaction.TransferDocument>): Transaction.TransferDocument => {
  return {
    transactionType: 'transfer',
    amount: 100,
    description: 'transaction description',
    issuedAt: new Date(),
    expiresAt: undefined,
    accountId: undefined,
    transferAccountId: undefined,
    account: createAccountDocument(),
    transferAccount: createAccountDocument(),
    ...doc,
  };
};

export const createAccountRequest = (req?: Partial<Account.Request>): Account.Request => {
  return {
    accountType: 'bankAccount',
    name: 'account name',
    currency: 'Ft',
    ...req,
  };
};

export const createProjectRequest = (req?: Partial<Project.Request>): Project.Request => {
  return {
    name: 'project name',
    description: 'project description',
    ...req,
  };
};
export const createCategoryRequest = (req?: Partial<Category.Request>): Category.Request => {
  return {
    name: 'category name',
    parentCategoryId: 'parentCategoryId' as Category.IdType,
    categoryType: 'regular',
    ...req,
  };
};
export const createRecipientRequest = (req?: Partial<Recipient.Request>): Recipient.Request => {
  return {
    name: 'recipient name',
    ...req,
  };
};

export const createPaymentTransactionRequest = (req?: Partial<Transaction.PaymentRequest>): Transaction.PaymentRequest => {
  return {
    amount: 100,
    description: 'transaction description',
    inventory: undefined,
    invoice: undefined,
    issuedAt: new Date().toISOString(),
    accountId: 'accountId' as Account.IdType,
    categoryId: 'categoryId' as Category.IdType,
    projectId: 'projectId' as Project.IdType,
    recipientId: 'recipientId' as Recipient.IdType,
    ...req,
  };
};

export const createSplitTransactionRequest = (req?: Partial<Transaction.SplitRequest>, ...splits: Partial<Transaction.SplitRequest['splits'][number]>[]): Transaction.SplitRequest => {
  return {
    amount: Math.max(splits.length, 1),
    description: 'transaction description',
    issuedAt: new Date().toISOString(),
    accountId: 'accountId' as Account.IdType,
    recipientId: 'recipientId' as Recipient.IdType,
    splits: splits.length > 0 ? splits.map((s) => {
      return {
        amount: 1,
        categoryId: 'categoryId' as Category.IdType,
        projectId: 'projectId' as Project.IdType,
        description: 'split description',
        inventory: undefined,
        invoice: undefined,
        ...s,
      };
    }) : [
      {
        amount: 1,
        categoryId: 'categoryId' as Category.IdType,
        projectId: 'projectId' as Project.IdType,
        description: 'split description',
        inventory: undefined,
        invoice: undefined,
      },
    ],
    ...req,
  };
};

export const createTransferTransactionRequest = (req?: Partial<Transaction.TransferRequest>): Transaction.TransferRequest => {
  return {
    amount: 100,
    description: 'transaction description',
    issuedAt: new Date().toISOString(),
    accountId: 'accountId' as Account.IdType,
    transferAccountId: 'transferAccountId' as Account.IdType,
    ...req,
  };
};

export const createAccountResponse = (resp?: Partial<Account.Response>): Account.Response => {
  return {
    accountType: 'bankAccount',
    name: 'account name',
    currency: 'Ft',
    balance: 123,
    accountId: 'accountId' as Account.IdType,
    expiresAt: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    _id: undefined,
    isOpen: true,
    ...resp,
  };
};

export const createProjectResponse = (resp?: Partial<Project.Response>): Project.Response => {
  return {
    projectId: 'projectId' as Project.IdType,
    name: 'project name',
    description: 'project description',
    expiresAt: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    _id: undefined,
    ...resp,
  };
};
export const createCategoryResponse = (resp?: Partial<Category.Response>): Category.Response => {
  return {
    categoryId: 'categoryId' as Category.IdType,
    name: 'category name',
    expiresAt: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    _id: undefined,
    parentCategory: undefined,
    fullName: 'category name',
    categoryType: 'regular',
    ...resp,
  };
};
export const createRecipientResponse = (resp?: Partial<Recipient.Response>): Recipient.Response => {
  return {
    recipientId: 'recipientId' as Recipient.IdType,
    name: 'recipient name',
    expiresAt: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    _id: undefined,
    ...resp,
  };
};

export const createPaymentTransactionResponse = (resp?: Partial<Transaction.PaymentResponse>): Transaction.PaymentResponse => {
  return {
    transactionId: 'transactionId' as Transaction.IdType,
    transactionType: 'payment',
    amount: 100,
    description: 'transaction description',
    inventory: undefined,
    invoice: undefined,
    issuedAt: new Date().toISOString(),
    expiresAt: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    _id: undefined,
    account: createAccountResponse(),
    category: createCategoryResponse(),
    project: createProjectResponse(),
    recipient: createRecipientResponse(),
    ...resp,
  };
};

export const createSplitTransactionResponse = (resp?: Partial<Transaction.SplitResponse>, ...splits: Partial<Transaction.SplitResponse['splits'][number]>[]): Transaction.SplitResponse => {
  return {
    transactionId: 'transactionId' as Transaction.IdType,
    transactionType: 'split',
    amount: Math.max(splits.length, 1),
    description: 'transaction description',
    issuedAt: new Date().toISOString(),
    expiresAt: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    _id: undefined,
    account: createAccountResponse(),
    recipient: createRecipientResponse(),
    splits: splits.length > 0 ? splits.map((s) => {
      return {
        amount: 1,
        category: createCategoryResponse(),
        project: createProjectResponse(),
        description: 'split description',
        inventory: undefined,
        invoice: undefined,
        ...s,
      };
    }) : [
      {
        amount: 1,
        category: createCategoryResponse(),
        project: createProjectResponse(),
        description: 'split description',
        inventory: undefined,
        invoice: undefined,
      },
    ],
    ...resp,
  };
};

export const createTransferTransactionResponse = (resp?: Partial<Transaction.TransferResponse>): Transaction.TransferResponse => {
  return {
    transactionId: 'transactionId' as Transaction.IdType,
    transactionType: 'transfer',
    amount: 100,
    description: 'transaction description',
    issuedAt: new Date().toISOString(),
    expiresAt: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    _id: undefined,
    account: createAccountResponse(),
    transferAccount: createAccountResponse(),
    ...resp,
  };
};
