import { generateMongoId } from '@household/shared/common/utils';
import { AccountType, CalendarDayType, CalendarEntryResolutionStatus, CalendarEntryType, CategoryType, FileType, SettingKey, TransactionType, UserType } from '@household/shared/enums';
import { DocumentUpdate } from '@household/shared/types/common';
import { Account, Auth, Calendar, Category, Customer, File, Price, Product, Project, Recipient, Report, Setting, Transaction, User } from '@household/shared/types/types';
import type { UpdateQuery } from 'mongoose';

const amount = -100;

type DataFactoryFunction<T> = (input?: Partial<T>) => T;

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

export const createSettingKey = (key?: string): SettingKey => {
  return (key ?? 'defaultKey') as SettingKey;
};

export const createAccountDocument: DataFactoryFunction<Account.Document> = (doc) => {
  return {
    _id: generateMongoId(),
    accountType: AccountType.BankAccount,
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
    categoryType: CategoryType.Regular,
    ancestors: [],
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

export const createTransactionRawReport: DataFactoryFunction<Transaction.RawReport> = (doc) => {
  return {
    _id: generateMongoId(),
    amount,
    description: 'transaction description',
    product: createProductDocument(),
    quantity: 100,
    invoiceNumber: 'inv123',
    billingEndDate: new Date(2022, 3, 10),
    billingStartDate: new Date(2022, 3, 2),
    issuedAt: new Date(),
    account: createAccountDocument(),
    category: createCategoryDocument(),
    project: createProjectDocument(),
    recipient: createRecipientDocument(),
    ...doc,
  };
};

export const createPaymentTransactionDocument: DataFactoryFunction<Transaction.PaymentDocument> = (doc) => {
  return {
    _id: generateMongoId(),
    transactionType: TransactionType.Payment,
    amount,
    description: 'transaction description',
    product: createProductDocument(),
    quantity: 100,
    invoiceNumber: 'inv123',
    billingEndDate: new Date(2022, 3, 10),
    billingStartDate: new Date(2022, 3, 2),
    issuedAt: new Date(),
    expiresAt: undefined,
    account: createAccountDocument(),
    category: createCategoryDocument(),
    project: createProjectDocument(),
    recipient: createRecipientDocument(),
    ...doc,
  };
};

export const createDeferredTransactionDocument: DataFactoryFunction<Transaction.DeferredDocument> = (doc) => {
  return {
    _id: generateMongoId(),
    transactionType: TransactionType.Deferred,
    amount,
    description: 'transaction description',
    product: createProductDocument(),
    quantity: 100,
    invoiceNumber: 'inv123',
    billingEndDate: new Date(2022, 3, 10),
    billingStartDate: new Date(2022, 3, 2),
    issuedAt: new Date(),
    expiresAt: undefined,
    payingAccount: createAccountDocument(),
    category: createCategoryDocument(),
    project: createProjectDocument(),
    recipient: createRecipientDocument(),
    ownerAccount: createAccountDocument(),
    isSettled: false,
    remainingAmount: 100,
    ...doc,
  };
};

export const createReimbursementTransactionDocument: DataFactoryFunction<Transaction.ReimbursementDocument> = (doc) => {
  return {
    _id: generateMongoId(),
    transactionType: TransactionType.Reimbursement,
    amount,
    description: 'transaction description',
    product: createProductDocument(),
    quantity: 100,
    invoiceNumber: 'inv123',
    billingEndDate: new Date(2022, 3, 10),
    billingStartDate: new Date(2022, 3, 2),
    issuedAt: new Date(),
    expiresAt: undefined,
    payingAccount: createAccountDocument(),
    category: createCategoryDocument(),
    project: createProjectDocument(),
    recipient: createRecipientDocument(),
    ownerAccount: createAccountDocument(),
    ...doc,
  };
};

export const createSplitDocumentItem: DataFactoryFunction<Transaction.SplitDocumentItem> = (doc) => {
  return {
    amount,
    category: createCategoryDocument(),
    project: createProjectDocument(),
    description: 'split description',
    product: createProductDocument(),
    quantity: 100,
    invoiceNumber: 'inv123',
    billingEndDate: new Date(2022, 3, 10),
    billingStartDate: new Date(2022, 3, 2),
    ...doc,
  };
};

export const createSplitTransactionDocument: DataFactoryFunction<Transaction.SplitDocument> = (doc) => {
  return {
    _id: generateMongoId(),
    transactionType: TransactionType.Split,
    amount: ((doc?.splits?.length ?? 0) + (doc?.deferredSplits?.length ?? 0)) * amount || amount,
    description: 'transaction description',
    issuedAt: new Date(),
    expiresAt: undefined,
    account: createAccountDocument(),
    recipient: createRecipientDocument(),
    splits: [createSplitDocumentItem()],
    deferredSplits: undefined,
    ...doc,
  };
};

export const createTransferTransactionDocument: DataFactoryFunction<Transaction.TransferDocument> = (doc) => {
  return {
    _id: generateMongoId(),
    transactionType: TransactionType.Transfer,
    amount,
    description: 'transaction description',
    issuedAt: new Date(),
    expiresAt: undefined,
    account: createAccountDocument(),
    transferAccount: createAccountDocument(),
    transferAmount: 1200,
    payments: [],
    ...doc,
  };
};

export const createDraftTransactionDocument: DataFactoryFunction<Transaction.DraftDocument> = (doc) => {
  return {
    _id: generateMongoId(),
    transactionType: TransactionType.Draft,
    amount,
    description: 'transaction description',
    issuedAt: new Date(),
    expiresAt: undefined,
    file: createFileDocument(),
    ...doc,
  };
};

export const createDraftTransactionResponse: DataFactoryFunction<Transaction.DraftResponse> = (doc) => {
  return {
    transactionId: createTransactionId(),
    transactionType: TransactionType.Draft,
    amount,
    description: 'transaction description',
    issuedAt: new Date().toISOString(),
    potentialDuplicates: [],
    ...doc,
  };
};

export const createAccountRequest: DataFactoryFunction<Account.Request> = (req) => {
  return {
    accountType: AccountType.BankAccount,
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
    categoryType: CategoryType.Regular,
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
    amount,
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
    loanAccountId: undefined,
    isSettled: undefined,
    ...req,
  };
};

export const createSplitRequestItem: DataFactoryFunction<Transaction.SplitRequestItem> = (req) => {
  return {
    amount,
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

export const createLoanRequestItem: DataFactoryFunction<Transaction.LoanRequestItem> = (req) => {
  return {
    amount,
    categoryId: createCategoryId(),
    projectId: createProjectId(),
    description: 'split description',
    productId: createProductId(),
    quantity: 100,
    invoiceNumber: 'inv123',
    billingEndDate: '2022-03-21',
    billingStartDate: '2022-01-01',
    loanAccountId: createAccountId(),
    isSettled: undefined,
    transactionId: undefined,
    ...req,
  };
};

export const createSplitTransactionRequest: DataFactoryFunction<Transaction.SplitRequest> = (req) => {
  return {
    amount: ((req?.loans?.length ?? 0) + (req?.splits?.length ?? 0)) * amount || amount * 2,
    description: 'transaction description',
    issuedAt: new Date().toISOString(),
    accountId: createAccountId(),
    recipientId: createRecipientId(),
    splits: [createSplitRequestItem()],
    loans: [createLoanRequestItem()],
    ...req,
  };
};

export const createTransferTransactionRequest: DataFactoryFunction<Transaction.TransferRequest> = (req) => {
  return {
    amount,
    transferAmount: 1200,
    description: 'transaction description',
    issuedAt: new Date().toISOString(),
    accountId: createAccountId(),
    transferAccountId: createAccountId(),
    payments: undefined,
    ...req,
  };
};

export const createTransferPaymentItemRequest: DataFactoryFunction<Transaction.TransactionId & Transaction.Amount> = (req) => {
  return {
    amount: 10,
    transactionId: createTransactionId(),
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

export const createConfirmUserRequest: DataFactoryFunction<Auth.ConfirmUser.Request> = (req) => {
  return {
    temporaryPassword: 'temp123',
    password: 'password123',
    ...req,
  };
};

export const createConfirmForgotPasswordRequest: DataFactoryFunction<Auth.ConfirmForgotPassword.Request> = (req) => {
  return {
    confirmationCode: '123456',
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
    accountType: AccountType.BankAccount,
    name: 'account name',
    currency: 'Ft',
    balance: 123,
    owner: 'owner1',
    fullName: resp ? `${resp.name} (${resp.owner})` : 'account name (owner1)',
    accountId: createAccountId(),
    isOpen: true,
    ...resp,
  };
};

export const createProjectResponse: DataFactoryFunction<Project.Response> = (resp) => {
  return {
    projectId: createProjectId(),
    name: 'project name',
    description: 'project description',
    ...resp,
  };
};

export const createSettingRequest: DataFactoryFunction<Setting.Request> = (doc) => {
  return {
    value: 123,
    ...doc,
  };
};

export const createSettingDocument: DataFactoryFunction<Setting.Document> = (doc) => {
  return {
    settingKey: createSettingKey(),
    value: 123,
    expiresAt: undefined,
    ...doc,
  };
};

export const createSettingResponse: DataFactoryFunction<Setting.Response> = (resp) => {
  return {
    settingKey: createSettingKey(),
    value: 123,
    ...resp,
  };
};

export const createCategoryResponseBase: DataFactoryFunction<Category.ResponseAncestor> = (resp) => {
  return {
    categoryId: createCategoryId(),
    name: 'category name',
    categoryType: CategoryType.Regular,
    ...resp,
  };
};

export const createCategoryResponse: DataFactoryFunction<Category.Response> = (resp) => {
  return {
    categoryId: createCategoryId(),
    name: 'category name',
    parentCategory: undefined,
    fullName: 'category name',
    categoryType: CategoryType.Regular,
    ancestors: [],
    ...resp,
  };
};
export const createRecipientResponse: DataFactoryFunction<Recipient.Response> = (resp) => {
  return {
    recipientId: createRecipientId(),
    name: 'recipient name',
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
    ...resp,
  };
};

export const createProductGroupedResponse: DataFactoryFunction<Product.GroupedResponse> = (resp) => {
  return {
    fullName: 'category:name',
    categoryId: createCategoryId(),
    products: [createProductResponse()],
    ...resp,
  };
};

export const createPaymentTransactionResponse: DataFactoryFunction<Transaction.PaymentResponse> = (resp) => {
  return {
    transactionId: createTransactionId(),
    transactionType: TransactionType.Payment,
    amount,
    description: 'transaction description',
    product: createProductResponse(),
    quantity: 100,
    invoiceNumber: 'inv123',
    billingEndDate: '2022-03-10',
    billingStartDate: '2022-03-01',
    issuedAt: new Date().toISOString(),
    account: createAccountResponse(),
    category: createCategoryResponse(),
    project: createProjectResponse(),
    recipient: createRecipientResponse(),
    ...resp,
  };
};

export const createDeferredTransactionResponse: DataFactoryFunction<Transaction.DeferredResponse> = (resp) => {
  return {
    transactionId: createTransactionId(),
    transactionType: TransactionType.Deferred,
    amount,
    description: 'transaction description',
    product: createProductResponse(),
    quantity: 100,
    invoiceNumber: 'inv123',
    billingEndDate: '2022-03-10',
    billingStartDate: '2022-03-01',
    issuedAt: new Date().toISOString(),
    ownerAccount: createAccountResponse(),
    payingAccount: createAccountResponse(),
    category: createCategoryResponse(),
    project: createProjectResponse(),
    recipient: createRecipientResponse(),
    isSettled: false,
    remainingAmount: 100,
    ...resp,
  };
};

export const createReimbursementTransactionResponse: DataFactoryFunction<Transaction.ReimbursementResponse> = (resp) => {
  return {
    transactionId: createTransactionId(),
    transactionType: TransactionType.Reimbursement,
    amount,
    description: 'transaction description',
    product: createProductResponse(),
    quantity: 100,
    invoiceNumber: 'inv123',
    billingEndDate: '2022-03-10',
    billingStartDate: '2022-03-01',
    issuedAt: new Date().toISOString(),
    ownerAccount: createAccountResponse(),
    payingAccount: createAccountResponse(),
    category: createCategoryResponse(),
    project: createProjectResponse(),
    recipient: createRecipientResponse(),
    ...resp,
  };
};

export const createSplitResponseItem: DataFactoryFunction<Transaction.SplitResponseItem> = (resp) => {
  return {
    amount,
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
    transactionType: TransactionType.Split,
    amount: ((resp?.splits?.length ?? 0) + (resp?.deferredSplits?.length ?? 0)) * amount || amount,
    description: 'transaction description',
    issuedAt: new Date().toISOString(),
    account: createAccountResponse(),
    recipient: createRecipientResponse(),
    splits: [createSplitResponseItem()],
    deferredSplits: undefined,
    ...resp,
  };
};

export const createTransferTransactionResponse: DataFactoryFunction<Transaction.TransferResponse> = (resp) => {
  return {
    transactionId: createTransactionId(),
    transactionType: TransactionType.Transfer,
    amount,
    transferAmount: 1200,
    description: 'transaction description',
    issuedAt: new Date().toISOString(),
    account: createAccountResponse(),
    transferAccount: createAccountResponse(),
    payments: [],
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
    amount,
    description: 'description',
    issuedAt: new Date().toISOString(),
    account: createAccountReport(),
    category: createCategoryReport(),
    product: createProductReport(),
    quantity: 100,
    project: createProjectReport(),
    recipient: createRecipientReport(),
    invoiceNumber: 'inv123',
    billingEndDate: '2022-03-10',
    billingStartDate: '2022-03-01',
    ...rep,
  };
};

export const createFileRequest: DataFactoryFunction<File.Request> = (req) => {
  return {
    timezone: 'Europe/Budapest',
    fileType: FileType.Otp,
    ...req,
  };
};

export const createFileDocument: DataFactoryFunction<File.Document> = (doc) => {
  return {
    _id: generateMongoId(),
    expiresAt: undefined,
    timezone: 'Europe/Budapest',
    fileType: FileType.Otp,
    ...doc,
  };
};

export const createFileResponse: DataFactoryFunction<File.Response> = (doc) => {
  return {
    fileId: createFileId(),
    draftCount: 0,
    fileType: FileType.Otp,
    uploadedAt: new Date().toISOString(),
    ...doc,
  };
};

//deprecated
export const createDocumentUpdate: DataFactoryFunction<UpdateQuery<any>> = (update) => {
  return {
    $set: {
      someProperty: 123,
    },
    ...update,
  };
};

export const createDocumentUpdate2: DataFactoryFunction<DocumentUpdate<any>> = (update) => {
  return {
    update: {
      $set: {
        someProperty: 123,
      },
    },
    ...update,
  };
};

export const createUserResponse: DataFactoryFunction<User.Response> = (resp) => {
  return {
    email: 'user@email.com',
    status: 'CONFIRMED',
    groups: [UserType.Editor],
    ...resp,
  };
};

const createPriceId = (id?: string): Price.Id => {
  return (id ?? generateMongoId().toString()) as Price.Id;
};

const createPriceBase: DataFactoryFunction<Price.Base> = (req) => {
  return {
    name: 'price name',
    amount: 3000,
    ...req,
  };
};

const createPriceRequest: DataFactoryFunction<Price.Request> = (req) => {
  return {
    name: 'price name',
    amount: 3000,
    unitOfMeasurement: 'db',
    ...req,
  };
};

const createPriceDocument: DataFactoryFunction<Price.Document> = (doc) => {
  return {
    _id: generateMongoId(),
    name: 'price name',
    amount: 3000,
    unitOfMeasurement: 'db',
    isArchived: false,
    expiresAt: undefined,
    ...doc,
  };
};

const createPriceResponse: DataFactoryFunction<Price.Response> = (resp) => {
  return {
    priceId: createPriceId(),
    name: 'price name',
    amount: 3000,
    unitOfMeasurement: 'db',
    ...resp,
  };
};

export const priceDataFactory = {
  id: createPriceId,
  base: createPriceBase,
  request: createPriceRequest,
  document: createPriceDocument,
  response: createPriceResponse,
};

const createCustomerId = (id?: string): Customer.Id => {
  return (id ?? generateMongoId().toString()) as Customer.Id;
};

const createCustomerRequest: DataFactoryFunction<Customer.Request> = (req) => {
  return {
    name: 'customer name',
    description: 'customer description',
    rating: 3,
    isGroup: false,
    ...req,
  };
};

const createCustomerDocument: DataFactoryFunction<Customer.Document> = (doc) => {
  return {
    _id: generateMongoId(),
    name: 'customer name',
    description: 'customer description',
    rating: 3,
    isGroup: false,
    jobs: [createCustomerJobDocument()],
    blacklistedCustomers: [],
    expiresAt: undefined,
    ...doc,
  };
};

const createCustomerResponse: DataFactoryFunction<Customer.Response> = (resp) => {
  return {
    customerId: createCustomerId(),
    name: 'customer name',
    description: 'customer description',
    rating: 3,
    isGroup: false,
    jobs: [createCustomerJobResponse()],
    blacklistedCustomers: [],
    ...resp,
  };
};

const createCustomerJobRequest: DataFactoryFunction<Customer.Job.Request> = (data) => {
  return {
    name: 'job name',
    duration: 4,
    prices: [
      {
        priceId: createPriceId(),
        quantity: 1,
      },
    ],
    description: 'job description',
    ...data,
  };
};

const createCustomerJobDocument: DataFactoryFunction<Customer.Job.Document> = (data) => {
  return {
    name: 'job name',
    duration: 5,
    prices: [
      {
        price: createPriceDocument(),
        quantity: 1,
      },
    ],
    description: 'job description',
    ...data,
  };
};

const createCustomerJobResponse: DataFactoryFunction<Customer.Job.Response> = (data) => {
  return {
    name: 'vágás',
    duration: 60,
    prices: [
      {
        ...createPriceResponse(),
        quantity: 1,
      },
    ],
    description: 'job description',
    ...data,
  };
};

const createCustomeJobPriceDocument: DataFactoryFunction<Customer.Job.Document['prices'][number]> = (data) => {
  return {
    amount: 3000,
    name: 'price name',
    ...data,
  };
};

const createCustomeJobPriceResponse: DataFactoryFunction<Customer.Job.Response['prices'][number]> = (data) => {
  return {
    amount: 3000,
    name: 'price name',
    ...data,
  };
};

const createCustomerJobPriceRequest: DataFactoryFunction<Customer.Job.ListedPrice<Price.PriceId>> = (req) => {
  return {
    priceId: createPriceId(),
    quantity: 2,
    ...req,
  };
};

export const customerDataFactory = {
  id: createCustomerId,
  request: createCustomerRequest,
  document: createCustomerDocument,
  response: createCustomerResponse,
  jobRequest: createCustomerJobRequest,
  jobDocument: createCustomerJobDocument,
  jobPriceRequest: createCustomerJobPriceRequest,
  jobPriceDocument: createCustomeJobPriceDocument,
  jobPriceResponse: createCustomeJobPriceResponse,
};

const createCalendarEntryId = (id?: string): Calendar.Entry.Id => {
  return (id ?? generateMongoId().toString()) as Calendar.Entry.Id;
};

const createCalendarPersonalEntryRequest: DataFactoryFunction<Calendar.Entry.PersonalEntryRequest> = (req) => {
  return {
    day: '2025-10-10',
    description: 'entry description',
    title: 'entry title',
    end: 50,
    start: 10,
    entryType: CalendarEntryType.Personal,
    ...req,
  };
};

const createCalendarIssueEntryRequest: DataFactoryFunction<Calendar.Entry.IssueEntryRequest> = (req) => {
  return {
    day: '2025-10-10',
    description: 'entry description',
    title: 'entry title',
    end: 50,
    start: 10,
    entryType: CalendarEntryType.Issue,
    ...req,
  };
};

const createCalendarWorkEntryRequest: DataFactoryFunction<Calendar.Entry.WorkEntryRequest> = (req) => {
  return {
    day: '2025-10-10',
    description: 'entry description',
    title: 'entry title',
    end: 50,
    start: 10,
    entryType: CalendarEntryType.Work,
    customerId: createCustomerId(),
    prices: [
      createCustomerJobPriceRequest(),
      createPriceBase(),
    ],
    ...req,
  };
};

const createCalendarEntryDocument: DataFactoryFunction<Calendar.Entry.Document> = (data) => {
  return {
    day: '2025-10-10',
    description: 'entry description',
    title: 'entry title',
    end: 50,
    start: 10,
    entryType: CalendarEntryType.Issue,
    _id: generateMongoId(),
    customer: undefined,
    expiresAt: undefined,
    resolution: undefined,
    prices: undefined,
    transaction: undefined,
    ...data,
  };
};

const createCalendarEntryResponseBase: DataFactoryFunction<Calendar.Entry.ResponseBase> = (data) => {
  return {
    calendarEntryId: createCalendarEntryId(),
    day: '2025-10-10',
    description: 'entry description',
    title: 'entry title',
    end: 50,
    start: 10,
    ...data,
  };
};

const createCalendarPersonalEntryResponse: DataFactoryFunction<Calendar.Entry.PersonalEntryResponse> = (data) => {
  return {
    calendarEntryId: createCalendarEntryId(),
    day: '2025-10-10',
    description: 'entry description',
    title: 'entry title',
    end: 50,
    start: 10,
    entryType: CalendarEntryType.Personal,
    ...data,
  };
};

const createCalendarIssueEntryResponse: DataFactoryFunction<Calendar.Entry.IssueEntryResponse> = (data) => {
  return {
    calendarEntryId: createCalendarEntryId(),
    day: '2025-10-10',
    description: 'entry description',
    title: 'entry title',
    end: 50,
    start: 10,
    entryType: CalendarEntryType.Issue,
    ...data,
  };
};

const createCalendarWorkEntryResponse: DataFactoryFunction<Calendar.Entry.WorkEntryResponse> = (data) => {
  return {
    calendarEntryId: createCalendarEntryId(),
    day: '2025-10-10',
    description: 'entry description',
    title: 'entry title',
    end: 50,
    start: 10,
    entryType: CalendarEntryType.Work,
    customer: createCustomerResponse(),
    resolution: undefined,
    prices: undefined,
    ...data,
  };
};

const createCalendarEntryResolutionRequest: DataFactoryFunction<Calendar.Entry.ResolutionRequest> = (data) => {
  return {
    status: CalendarEntryResolutionStatus.Paid,
    amount: 3000,
    delay: 15,
    ...data,
  };
};

export const calendarEntryDataFactory = {
  id: createCalendarEntryId,
  workRequest: createCalendarWorkEntryRequest,
  issueRequest: createCalendarIssueEntryRequest,
  personalRequest: createCalendarPersonalEntryRequest,
  document: createCalendarEntryDocument,
  responseBase: createCalendarEntryResponseBase,
  personalResponse: createCalendarPersonalEntryResponse,
  issueResponse: createCalendarIssueEntryResponse,
  workResponse: createCalendarWorkEntryResponse,
  resolutionRequest: createCalendarEntryResolutionRequest,
};

const createCalendarWorkdayRequest: DataFactoryFunction<Calendar.Day.WorkdayRequest> = (req) => {
  return {
    dayType: CalendarDayType.Workday,
    end: 50,
    start: 10,
    ...req,
  };
};

const createCalendarVacationRequest: DataFactoryFunction<Calendar.Day.VacationRequest> = (req) => {
  return {
    dayType: CalendarDayType.Vacation,
    ...req,
  };
};

const createCalendarDayDocument: DataFactoryFunction<Calendar.Day.Document> = (data) => {
  return {
    dayType: CalendarDayType.Workday,
    day: '2025-10-11',
    start: 10,
    end: 50,
    expiresAt: undefined,
    ...data,
  };
};

const createCalendarDayResponse: DataFactoryFunction<Calendar.Day.Response> = (data) => {
  return {
    dayType: CalendarDayType.Vacation,
    day: '2025-10-11',
    entries: [],
    ...data as Calendar.Day.Response,
  };
};

export const calendarDayDataFactory = {
  workdayRequest: createCalendarWorkdayRequest,
  vacationRequest: createCalendarVacationRequest,
  document: createCalendarDayDocument,
  response: createCalendarDayResponse,
};
