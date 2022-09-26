import { Account, Auth, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { Types } from 'mongoose';

export const generateMongoId = (): Types.ObjectId => new Types.ObjectId();

export const createAccountId = (id?: string): Account.IdType => {
  return (id ?? generateMongoId().toString()) as Account.IdType;
};

export const createCategoryId = (id?: string): Category.IdType => {
  return (id ?? generateMongoId().toString()) as Category.IdType;
};

export const createProjectId = (id?: string): Project.IdType => {
  return (id ?? generateMongoId().toString()) as Project.IdType;
};

export const createRecipientId = (id?: string): Recipient.IdType => {
  return (id ?? generateMongoId().toString()) as Recipient.IdType;
};

export const createTransactionId = (id?: string): Transaction.IdType => {
  return (id ?? generateMongoId().toString()) as Transaction.IdType;
};

export const createProductId = (id?: string): Product.IdType => {
  return (id ?? generateMongoId().toString()) as Product.IdType;
};

export const createAccountDocument = (doc?: Partial<Account.Document>): Account.Document => {
  return {
    _id: generateMongoId(),
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
    _id: generateMongoId(),
    name: 'project name',
    description: 'project description',
    expiresAt: undefined,
    ...doc,
  };
};
export const createCategoryDocument = (doc?: Partial<Category.Document>): Category.Document => {
  return {
    _id: generateMongoId(),
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
    _id: generateMongoId(),
    name: 'recipient name',
    expiresAt: undefined,
    ...doc,
  };
};

export const createProductDocument = (doc?: Partial<Product.Document>): Product.Document => {
  return {
    _id: generateMongoId(),
    brand: 'product brand',
    measurement: 300,
    unitOfMeasurement: 'g',
    category: createCategoryDocument(),
    expiresAt: undefined,
    ...doc,
  };
};

export const createInventoryDocument = (req?: Partial<Transaction.InventoryItem<Transaction.Product<Product.Document>>>): Transaction.InventoryItem<Transaction.Product<Product.Document>> => {
  return {
    product: createProductDocument(),
    quantity: 100,
    ...req,
  };
};

export const createInvoiceDocument = (req?: Partial<Transaction.InvoiceItem<Date>>): Transaction.InvoiceItem<Date> => {
  return {
    invoiceNumber: 'inv123',
    billingEndDate: new Date(2022, 3, 10),
    billingStartDate: new Date(2022, 3, 2),
    ...req,
  };
};

export const createPaymentTransactionDocument = (doc?: Partial<Transaction.PaymentDocument>): Transaction.PaymentDocument => {
  return {
    _id: generateMongoId(),
    transactionType: 'payment',
    amount: 100,
    description: 'transaction description',
    inventory: createInventoryDocument(),
    invoice: createInvoiceDocument(),
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

export const createSplitDocumentIem = (req?: Partial<Transaction.SplitDocumentItem>): Transaction.SplitDocumentItem => {
  return {
    amount: 1,
    category: createCategoryDocument(),
    project: createProjectDocument(),
    description: 'split description',
    inventory: createInventoryDocument(),
    invoice: createInvoiceDocument(),
    ...req,
  };
};

export const createSplitTransactionDocument = (doc?: Partial<Transaction.SplitDocument>): Transaction.SplitDocument => {
  return {
    _id: generateMongoId(),
    transactionType: 'split',
    amount: doc?.splits?.length ?? 1,
    description: 'transaction description',
    issuedAt: new Date(),
    expiresAt: undefined,
    accountId: undefined,
    recipientId: undefined,
    account: createAccountDocument(),
    recipient: createRecipientDocument(),
    splits: [createSplitDocumentIem()],
    ...doc,
  };
};

export const createTransferTransactionDocument = (doc?: Partial<Transaction.TransferDocument>): Transaction.TransferDocument => {
  return {
    _id: generateMongoId(),
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
    parentCategoryId: createCategoryId(),
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

export const createProductRequest = (req?: Partial<Product.Request>): Product.Request => {
  return {
    brand: 'product brand',
    measurement: 300,
    unitOfMeasurement: 'g',
    ...req,
  };
};

export const createInventoryRequest = (req?: Partial<Transaction.InventoryItem<Product.Id>>): Transaction.InventoryItem<Product.Id> => {
  return {
    productId: createProductId(),
    quantity: 100,
    ...req,
  };
};

export const createInvoiceRequest = (req?: Partial<Transaction.InvoiceItem<string>>): Transaction.InvoiceItem<string> => {
  return {
    invoiceNumber: 'inv123',
    billingEndDate: '2022-03-21',
    billingStartDate: '2022-01-01',
    ...req,
  };
};

export const createPaymentTransactionRequest = (req?: Partial<Transaction.PaymentRequest>): Transaction.PaymentRequest => {
  return {
    amount: 100,
    description: 'transaction description',
    inventory: createInventoryRequest(),
    invoice: createInvoiceRequest(),
    issuedAt: new Date().toISOString(),
    accountId: createAccountId(),
    categoryId: createCategoryId(),
    projectId: createProjectId(),
    recipientId: createRecipientId(),
    ...req,
  };
};

export const createSplitRequestIem = (req?: Partial<Transaction.SplitRequestItem>): Transaction.SplitRequestItem => {
  return {
    amount: 1,
    categoryId: createCategoryId(),
    projectId: createProjectId(),
    description: 'split description',
    inventory: createInventoryRequest(),
    invoice: createInvoiceRequest(),
    ...req,
  };
};

export const createSplitTransactionRequest = (req?: Partial<Transaction.SplitRequest>): Transaction.SplitRequest => {
  return {
    amount: req?.splits?.length ?? 1,
    description: 'transaction description',
    issuedAt: new Date().toISOString(),
    accountId: createAccountId(),
    recipientId: createRecipientId(),
    splits: [createSplitRequestIem()],
    ...req,
  };
};

export const createTransferTransactionRequest = (req?: Partial<Transaction.TransferRequest>): Transaction.TransferRequest => {
  return {
    amount: 100,
    description: 'transaction description',
    issuedAt: new Date().toISOString(),
    accountId: createAccountId(),
    transferAccountId: createAccountId(),
    ...req,
  };
};

export const createLoginRequest = (req?: Partial<Auth.Login.Request>): Auth.Login.Request => {
  return {
    email: 'aaa@email.com',
    password: 'password123',
    ...req,
  };
};

export const createAccountResponse = (resp?: Partial<Account.Response>): Account.Response => {
  return {
    accountType: 'bankAccount',
    name: 'account name',
    currency: 'Ft',
    balance: 123,
    accountId: createAccountId(),
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
    projectId: createProjectId(),
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
    categoryId: createCategoryId(),
    name: 'category name',
    expiresAt: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    _id: undefined,
    parentCategory: undefined,
    fullName: 'category name',
    categoryType: 'regular',
    parentCategoryId: undefined,
    products: undefined, // TODO
    ...resp,
  };
};
export const createRecipientResponse = (resp?: Partial<Recipient.Response>): Recipient.Response => {
  return {
    recipientId: createRecipientId(),
    name: 'recipient name',
    expiresAt: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    _id: undefined,
    ...resp,
  };
};

export const createProductResponse = (doc?: Partial<Product.Response>): Product.Response => {
  return {
    productId: createProductId(),
    brand: 'product brand',
    measurement: 300,
    unitOfMeasurement: 'g',
    expiresAt: undefined,
    category: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    _id: undefined,
    ...doc,
  };
};

export const createInventoryResponse = (req?: Partial<Transaction.InventoryItem<Transaction.Product<Product.Response>>>): Transaction.InventoryItem<Transaction.Product<Product.Response>> => {
  return {
    product: createProductResponse(),
    quantity: 100,
    ...req,
  };
};

export const createInvoiceResponse = (req?: Partial<Transaction.InvoiceItem<string>>): Transaction.InvoiceItem<string> => {
  return {
    invoiceNumber: 'inv123',
    billingEndDate: '2022-03-10',
    billingStartDate: '2022-03-01',
    ...req,
  };
};

export const createPaymentTransactionResponse = (resp?: Partial<Transaction.PaymentResponse>): Transaction.PaymentResponse => {
  return {
    transactionId: createTransactionId(),
    transactionType: 'payment',
    amount: 100,
    description: 'transaction description',
    inventory: createInventoryResponse(),
    invoice: createInvoiceResponse(),
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

export const createSplitResponseIem = (req?: Partial<Transaction.SplitResponseItem>): Transaction.SplitResponseItem => {
  return {
    amount: 1,
    category: createCategoryResponse(),
    project: createProjectResponse(),
    description: 'split description',
    inventory: createInventoryResponse(),
    invoice: createInvoiceResponse(),
    ...req,
  };
};

export const createSplitTransactionResponse = (resp?: Partial<Transaction.SplitResponse>): Transaction.SplitResponse => {
  return {
    transactionId: createTransactionId(),
    transactionType: 'split',
    amount: resp?.splits?.length ?? 1,
    description: 'transaction description',
    issuedAt: new Date().toISOString(),
    expiresAt: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    _id: undefined,
    account: createAccountResponse(),
    recipient: createRecipientResponse(),
    splits: [createSplitResponseIem()],
    ...resp,
  };
};

export const createTransferTransactionResponse = (resp?: Partial<Transaction.TransferResponse>): Transaction.TransferResponse => {
  return {
    transactionId: createTransactionId(),
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
