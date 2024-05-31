import { Account, Auth, Category, File, Product, Project, Recipient, Report, Transaction } from '@household/shared/types/types';
import { Types, UpdateQuery } from 'mongoose';

type DataFactoryFunction<T> = (input?: Partial<T>) => T;

export const generateMongoId = (): Types.ObjectId => new Types.ObjectId();

export const createAccountId = (id?: string): Account.Id => {
  return (id ?? generateMongoId().toString()) as Account.Id;
};

export const createCategoryId = (id?: string): Category.Id => {
  return (id ?? generateMongoId().toString()) as Category.Id;
};

export const createProjectId = (id?: string): Project.Id => {
  return (id ?? generateMongoId().toString()) as Project.Id;
};

export const createRecipientId = (id?: string): Recipient.Id => {
  return (id ?? generateMongoId().toString()) as Recipient.Id;
};

export const createTransactionId = (id?: string): Transaction.Id => {
  return (id ?? generateMongoId().toString()) as Transaction.Id;
};

export const createProductId = (id?: string): Product.Id => {
  return (id ?? generateMongoId().toString()) as Product.Id;
};

export const createFileId = (id?: string): File.Id => {
  return (id ?? generateMongoId().toString()) as File.Id;
};

export const createAccountDocument: DataFactoryFunction<Account.Document> = (doc) => {
  return {
    _id: generateMongoId(),
    accountType: 'bankAccount',
    name: 'account name',
    currency: 'Ft',
    expiresAt: undefined,
    isOpen: true,
    owner: 'owner1',
    ...doc,
  };
};
export const createProjectDocument: DataFactoryFunction<Project.Document> = (doc) => {
  return {
    _id: generateMongoId(),
    name: 'project name',
    description: 'project description',
    expiresAt: undefined,
    ...doc,
  };
};
export const createCategoryDocument: DataFactoryFunction<Category.Document> = (doc) => {
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
export const createRecipientDocument: DataFactoryFunction<Recipient.Document> = (doc) => {
  return {
    _id: generateMongoId(),
    name: 'recipient name',
    expiresAt: undefined,
    ...doc,
  };
};

export const createProductDocument: DataFactoryFunction<Product.Document> = (doc) => {
  return {
    _id: generateMongoId(),
    brand: 'product brand',
    measurement: 300,
    unitOfMeasurement: 'g',
    expiresAt: undefined,
    fullName: doc ? `${doc.brand} ${doc.measurement} ${doc.unitOfMeasurement}` : 'product brand 300 g',
    category: createCategoryDocument(),
    ...doc,
  };
};

export const createPaymentTransactionDocument: DataFactoryFunction<Transaction.PaymentDocument> = (doc) => {
  return {
    _id: generateMongoId(),
    transactionType: 'payment',
    amount: 100,
    description: 'transaction description',
    product: createProductDocument(),
    quantity: 100,
    invoiceNumber: 'inv123',
    billingEndDate: new Date(2022, 3, 10),
    billingStartDate: new Date(2022, 3, 2),
    issuedAt: new Date(),
    expiresAt: undefined,
    accountId: undefined,
    categoryId: undefined,
    projectId: undefined,
    recipientId: undefined,
    productId: undefined,
    account: createAccountDocument(),
    category: createCategoryDocument(),
    project: createProjectDocument(),
    recipient: createRecipientDocument(),
    ...doc,
  };
};

export const createSplitDocumentItem: DataFactoryFunction<Transaction.SplitDocumentItem> = (doc) => {
  return {
    amount: 1,
    category: createCategoryDocument(),
    project: createProjectDocument(),
    description: 'split description',
    product: createProductDocument(),
    quantity: 100,
    invoiceNumber: 'inv123',
    billingEndDate: new Date(2022, 3, 10),
    billingStartDate: new Date(2022, 3, 2),
    categoryId: undefined,
    projectId: undefined,
    productId: undefined,
    ...doc,
  };
};

export const createSplitTransactionDocument: DataFactoryFunction<Transaction.SplitDocument> = (doc) => {
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
    splits: [createSplitDocumentItem()],
    ...doc,
  };
};

export const createTransferTransactionDocument: DataFactoryFunction<Transaction.TransferDocument> = (doc) => {
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
    transferAmount: -1200,
    ...doc,
  };
};

export const createDraftTransactionDocument: DataFactoryFunction<Transaction.DraftDocument> = (doc) => {
  return {
    _id: generateMongoId(),
    transactionType: 'draft',
    amount: 100,
    description: 'transaction description',
    issuedAt: new Date(),
    expiresAt: undefined,
    file: createFileDocument(),
    ...doc,
  };
};

export const createAccountRequest: DataFactoryFunction<Account.Request> = (req) => {
  return {
    accountType: 'bankAccount',
    name: 'account name',
    currency: 'Ft',
    owner: 'owner1',
    ...req,
  };
};

export const createProjectRequest: DataFactoryFunction<Project.Request> = (req) => {
  return {
    name: 'project name',
    description: 'project description',
    ...req,
  };
};
export const createCategoryRequest: DataFactoryFunction<Category.Request> = (req) => {
  return {
    name: 'category name',
    parentCategoryId: createCategoryId(),
    categoryType: 'regular',
    ...req,
  };
};
export const createRecipientRequest: DataFactoryFunction<Recipient.Request> = (req) => {
  return {
    name: 'recipient name',
    ...req,
  };
};

export const createProductRequest: DataFactoryFunction<Product.Request> = (req) => {
  return {
    brand: 'product brand',
    measurement: 300,
    unitOfMeasurement: 'g',
    ...req,
  };
};

export const createPaymentTransactionRequest: DataFactoryFunction<Transaction.PaymentRequest> = (req) => {
  return {
    amount: 100,
    description: 'transaction description',
    productId: createProductId(),
    quantity: 100,
    invoiceNumber: 'inv123',
    billingEndDate: '2022-03-21',
    billingStartDate: '2022-01-01',
    issuedAt: new Date().toISOString(),
    accountId: createAccountId(),
    categoryId: createCategoryId(),
    projectId: createProjectId(),
    recipientId: createRecipientId(),
    ...req,
  };
};

export const createSplitRequestIem: DataFactoryFunction<Transaction.SplitRequestItem> = (req) => {
  return {
    amount: 1,
    categoryId: createCategoryId(),
    projectId: createProjectId(),
    description: 'split description',
    productId: createProductId(),
    quantity: 100,
    invoiceNumber: 'inv123',
    billingEndDate: '2022-03-21',
    billingStartDate: '2022-01-01',
    ...req,
  };
};

export const createSplitTransactionRequest: DataFactoryFunction<Transaction.SplitRequest> = (req) => {
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

export const createTransferTransactionRequest: DataFactoryFunction<Transaction.TransferRequest> = (req) => {
  return {
    amount: 100,
    transferAmount: -1200,
    description: 'transaction description',
    issuedAt: new Date().toISOString(),
    accountId: createAccountId(),
    transferAccountId: createAccountId(),
    ...req,
  };
};

export const createLoginRequest: DataFactoryFunction<Auth.Login.Request> = (req) => {
  return {
    email: 'aaa@email.com',
    password: 'password123',
    ...req,
  };
};

export const createReportAccountFilter: DataFactoryFunction<Report.AccountFilter> = (req) => {
  return {
    filterType: 'account',
    include: true,
    items: [createAccountId()],
    ...req,
  };
};

export const createReportCategoryFilter: DataFactoryFunction<Report.CategoryFilter> = (req) => {
  return {
    filterType: 'category',
    include: true,
    items: [createCategoryId()],
    ...req,
  };
};

export const createReportProjectFilter: DataFactoryFunction<Report.ProjectFilter> = (req) => {
  return {
    filterType: 'project',
    include: true,
    items: [createProjectId()],
    ...req,
  };
};

export const createReportProductFilter: DataFactoryFunction<Report.ProductFilter> = (req) => {
  return {
    filterType: 'product',
    include: true,
    items: [createProductId()],
    ...req,
  };
};

export const createReportRecipientFilter: DataFactoryFunction<Report.RecipientFilter> = (req) => {
  return {
    filterType: 'recipient',
    include: true,
    items: [createRecipientId()],
    ...req,
  };
};

export const createReportIssuedAtFilter: DataFactoryFunction<Report.IssuedAtFilter> = (req) => {
  return {
    filterType: 'issuedAt',
    include: true,
    from: new Date(2023, 1, 1, 0, 0, 0).toISOString(),
    to: new Date(2024, 1, 1, 0, 0, 0).toISOString(),
    ...req,
  };
};

export const createAccountResponse: DataFactoryFunction<Account.Response> = (resp) => {
  return {
    accountType: 'bankAccount',
    name: 'account name',
    currency: 'Ft',
    balance: 123,
    owner: 'owner1',
    fullName: resp ? `${resp.name} (${resp.owner})` : 'account name (owner1)',
    accountId: createAccountId(),
    expiresAt: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    _id: undefined,
    isOpen: true,
    ...resp,
  };
};

export const createProjectResponse: DataFactoryFunction<Project.Response> = (resp) => {
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
export const createCategoryResponse: DataFactoryFunction<Category.Response> = (resp) => {
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
    products: [createProductResponse()],
    ...resp,
  };
};
export const createRecipientResponse: DataFactoryFunction<Recipient.Response> = (resp) => {
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

export const createProductResponse: DataFactoryFunction<Product.Response> = (resp) => {
  return {
    productId: createProductId(),
    brand: 'product brand',
    measurement: 300,
    unitOfMeasurement: 'g',
    fullName: resp ? `${resp.brand} ${resp.measurement} ${resp.unitOfMeasurement}` : 'product brand 300 g',
    expiresAt: undefined,
    category: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    _id: undefined,
    ...resp,
  };
};

export const createPaymentTransactionResponse: DataFactoryFunction<Transaction.PaymentResponse> = (resp) => {
  return {
    transactionId: createTransactionId(),
    transactionType: 'payment',
    amount: 100,
    description: 'transaction description',
    product: createProductResponse(),
    quantity: 100,
    invoiceNumber: 'inv123',
    billingEndDate: '2022-03-10',
    billingStartDate: '2022-03-01',
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

export const createSplitResponseIem: DataFactoryFunction<Transaction.SplitResponseItem> = (resp) => {
  return {
    amount: 1,
    category: createCategoryResponse(),
    project: createProjectResponse(),
    description: 'split description',
    product: createProductResponse(),
    quantity: 100,
    invoiceNumber: 'inv123',
    billingEndDate: '2022-03-10',
    billingStartDate: '2022-03-01',
    ...resp,
  };
};

export const createSplitTransactionResponse: DataFactoryFunction<Transaction.SplitResponse> = (resp) => {
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

export const createTransferTransactionResponse: DataFactoryFunction<Transaction.TransferResponse> = (resp) => {
  return {
    transactionId: createTransactionId(),
    transactionType: 'transfer',
    amount: 100,
    transferAmount: -1200,
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

export const createAccountReport: DataFactoryFunction<Account.Report> = (rep) => {
  return {
    accountId: createAccountId(),
    currency: 'Ft',
    fullName: 'acc name',
    ...rep,
  };
};

export const createCategoryReport: DataFactoryFunction<Category.Report> = (rep) => {
  return {
    categoryId: createCategoryId(),
    fullName: 'category:name',
    ...rep,
  };
};

export const createProjectReport: DataFactoryFunction<Project.Report> = (rep) => {
  return {
    projectId: createProjectId(),
    name: 'acc name',
    ...rep,
  };
};

export const createProductReport: DataFactoryFunction<Product.Report> = (rep) => {
  return {
    productId: createProductId(),
    fullName: 'product name 100 g',
    quantity: 1,
    ...rep,
  };
};

export const createRecipientReport: DataFactoryFunction<Recipient.Report> = (rep) => {
  return {
    recipientId: createRecipientId(),
    name: 'acc name',
    ...rep,
  };
};

export const createTransactionReport: DataFactoryFunction<Transaction.Report> = (rep) => {
  return {
    transactionId: createTransactionId(),
    amount: 100,
    description: 'description',
    issuedAt: new Date().toISOString(),
    account: createAccountReport(),
    category: createCategoryReport(),
    product: createProductReport(),
    project: createProjectReport(),
    recipient: createRecipientReport(),
    ...rep,
  };
};

export const createFileRequest: DataFactoryFunction<File.Request> = (req) => {
  return {
    timezone: 'Europe/Budapest',
    type: 'otp',
    ...req,
  };
};

export const createFileDocument: DataFactoryFunction<File.Document> = (doc) => {
  return {
    _id: generateMongoId(),
    expiresAt: undefined,
    timezone: 'Europe/Budapest',
    type: 'otp',
    ...doc,
  };
};

export const createDocumentUpdate: DataFactoryFunction<UpdateQuery<any>> = (update) => {
  return {
    $set: {
      someProperty: 123,
    },
    ...update,
  };
};
