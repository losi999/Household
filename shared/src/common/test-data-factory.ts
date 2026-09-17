import { addDays, dateToISODateString } from '@household/shared/common/utils';
import { AccountType, CalendarDayType, CalendarEntryResolutionStatus, CalendarEntryType, CategoryType, FileType, SettingKey, TransactionType, UserType } from '@household/shared/enums';
import { DocumentUpdate } from '@household/shared/types/common';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { Documents } from '@household/shared/types/documents';
import { faker } from '@faker-js/faker';
import { DAY_LENGTH, priceUnitsOfMeasurement, WORKDAY_END, WORKDAY_START } from '@household/shared/constants';

const createId = <I>(id?: string): I => (id ?? faker.database.mongodbObjectId()) as I;

const amount = -100;

type DataFactoryFunction<T> = (input?: Partial<T>) => T;

export const createAccountId = (id?: string): Api.Account.Id => {
  return createId(id);
};

export const createCategoryId = (id?: string): Api.Category.Id => {
  return createId(id);
};

export const createProjectId = (id?: string): Api.Project.Id => {
  return createId(id);
};

export const createRecipientId = (id?: string): Api.Recipient.Id => {
  return createId(id);
};

export const createTransactionId = (id?: string): Api.Transaction.Id => {
  return createId(id);
};

export const createProductId = (id?: string): Api.Product.Id => {
  return createId(id);
};

export const createFileId = (id?: string): Api.File.Id => {
  return createId(id);
};

export const createSettingKey = (key?: string): SettingKey => {
  return (key ?? 'defaultKey') as SettingKey;
};

export const createAccountDocument: DataFactoryFunction<Documents.Account> = (doc) => {
  return {
    _id: createId(),
    accountType: AccountType.BankAccount,
    name: 'account name',
    currency: 'Ft',
    expiresAt: undefined,
    isOpen: true,
    owner: 'owner1',
    ...doc,
  };
};
export const createProjectDocument: DataFactoryFunction<Documents.Project> = (doc) => {
  return {
    _id: createId(),
    name: 'project name',
    description: 'project description',
    expiresAt: undefined,
    ...doc,
  };
};
export const createCategoryDocument: DataFactoryFunction<Documents.Category> = (doc) => {
  return {
    _id: createId(),
    name: 'category name',
    expiresAt: undefined,
    categoryType: CategoryType.Regular,
    ancestors: [],
    ...doc,
  };
};
export const createRecipientDocument: DataFactoryFunction<Documents.Recipient> = (doc) => {
  return {
    _id: createId(),
    name: 'recipient name',
    expiresAt: undefined,
    ...doc,
  };
};

export const createProductDocument: DataFactoryFunction<Documents.Product> = (doc) => {
  return {
    _id: createId(),
    brand: 'product brand',
    measurement: 300,
    unitOfMeasurement: 'g',
    expiresAt: undefined,
    fullName: doc ? `${doc.brand} ${doc.measurement} ${doc.unitOfMeasurement}` : 'product brand 300 g',
    category: createCategoryDocument(),
    ...doc,
  };
};

export const createTransactionRawReport: DataFactoryFunction<Documents.RawTransaction> = (doc) => {
  return {
    _id: createId(),
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

export const createPaymentTransactionDocument: DataFactoryFunction<Documents.PaymentTransaction> = (doc) => {
  return {
    _id: createId(),
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

export const createDeferredTransactionDocument: DataFactoryFunction<Documents.DeferredTransaction> = (doc) => {
  return {
    _id: createId(),
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
    ...doc,
  };
};

export const createReimbursementTransactionDocument: DataFactoryFunction<Documents.ReimbursementTransaction> = (doc) => {
  return {
    _id: createId(),
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

export const createSplitDocumentItem: DataFactoryFunction<Documents.SplitItem> = (doc) => {
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

export const createSplitTransactionDocument: DataFactoryFunction<Documents.SplitTransaction> = (doc) => {
  return {
    _id: createId(),
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

export const createTransferTransactionDocument: DataFactoryFunction<Documents.TransferTransaction> = (doc) => {
  return {
    _id: createId(),
    transactionType: TransactionType.Transfer,
    amount,
    description: 'transaction description',
    issuedAt: new Date(),
    expiresAt: undefined,
    account: createAccountDocument(),
    transferAccount: createAccountDocument(),
    transferAmount: 1200,
    ...doc,
  };
};

export const createDraftTransactionDocument: DataFactoryFunction<Documents.DraftTransaction> = (doc) => {
  return {
    _id: createId(),
    transactionType: TransactionType.Draft,
    amount,
    description: 'transaction description',
    issuedAt: new Date(),
    expiresAt: undefined,
    file: createFileDocument(),
    ...doc,
  };
};

export const createDraftTransactionResponse: DataFactoryFunction<Responses.DraftTransaction> = (doc) => {
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

export const createAccountRequest: DataFactoryFunction<Requests.Account> = (req) => {
  return {
    accountType: AccountType.BankAccount,
    name: 'account name',
    currency: 'Ft',
    owner: 'owner1',
    ...req,
  };
};

export const createProjectRequest: DataFactoryFunction<Requests.Project> = (req) => {
  return {
    name: 'project name',
    description: 'project description',
    ...req,
  };
};
export const createCategoryRequest: DataFactoryFunction<Requests.Category> = (req) => {
  return {
    name: 'category name',
    parentCategoryId: createCategoryId(),
    categoryType: CategoryType.Regular,
    ...req,
  };
};
export const createRecipientRequest: DataFactoryFunction<Requests.Recipient> = (req) => {
  return {
    name: 'recipient name',
    ...req,
  };
};

export const createProductRequest: DataFactoryFunction<Requests.Product> = (req) => {
  return {
    brand: 'product brand',
    measurement: 300,
    unitOfMeasurement: 'g',
    ...req,
  };
};

export const createPaymentTransactionRequest: DataFactoryFunction<Requests.PaymentTransaction> = (req) => {
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
    ...req,
  };
};

export const createSplitRequestItem: DataFactoryFunction<Requests.SplitItem> = (req) => {
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

export const createLoanRequestItem: DataFactoryFunction<Requests.LoanItem> = (req) => {
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
    transactionId: undefined,
    ...req,
  };
};

export const createSplitTransactionRequest: DataFactoryFunction<Requests.SplitTransaction> = (req) => {
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

export const createTransferTransactionRequest: DataFactoryFunction<Requests.TransferTransaction> = (req) => {
  return {
    amount,
    transferAmount: 1200,
    description: 'transaction description',
    issuedAt: new Date().toISOString(),
    accountId: createAccountId(),
    transferAccountId: createAccountId(),
    ...req,
  };
};

/** @deprecated */
export const createTransferPaymentItemRequest: DataFactoryFunction<Api.Transaction.TransactionId & Api.Transaction.Amount> = (req) => {
  return {
    amount: 10,
    transactionId: createTransactionId(),
    ...req,
  };
};

export const createLoginRequest: DataFactoryFunction<Requests.Login> = (req) => {
  return {
    email: 'aaa@email.com',
    password: 'password123',
    ...req,
  };
};

export const createConfirmUserRequest: DataFactoryFunction<Requests.ConfirmUser> = (req) => {
  return {
    temporaryPassword: 'temp123',
    password: 'password123',
    ...req,
  };
};

export const createConfirmForgotPasswordRequest: DataFactoryFunction<Requests.ConfirmForgotPassword> = (req) => {
  return {
    confirmationCode: '123456',
    password: 'password123',
    ...req,
  };
};

export const createReportAccountFilter: DataFactoryFunction<Api.Report.AccountFilter> = (req) => {
  return {
    filterType: 'account',
    include: true,
    items: [createAccountId()],
    ...req,
  };
};

export const createReportCategoryFilter: DataFactoryFunction<Api.Report.CategoryFilter> = (req) => {
  return {
    filterType: 'category',
    include: true,
    items: [createCategoryId()],
    ...req,
  };
};

export const createReportProjectFilter: DataFactoryFunction<Api.Report.ProjectFilter> = (req) => {
  return {
    filterType: 'project',
    include: true,
    items: [createProjectId()],
    ...req,
  };
};

export const createReportProductFilter: DataFactoryFunction<Api.Report.ProductFilter> = (req) => {
  return {
    filterType: 'product',
    include: true,
    items: [createProductId()],
    ...req,
  };
};

export const createReportRecipientFilter: DataFactoryFunction<Api.Report.RecipientFilter> = (req) => {
  return {
    filterType: 'recipient',
    include: true,
    items: [createRecipientId()],
    ...req,
  };
};

export const createReportIssuedAtFilter: DataFactoryFunction<Api.Report.IssuedAtFilter> = (req) => {
  return {
    filterType: 'issuedAt',
    include: true,
    from: new Date(2023, 1, 1, 0, 0, 0).toISOString(),
    to: new Date(2024, 1, 1, 0, 0, 0).toISOString(),
    ...req,
  };
};

export const createAccountResponse: DataFactoryFunction<Responses.Account> = (resp) => {
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

export const createProjectResponse: DataFactoryFunction<Responses.Project> = (resp) => {
  return {
    projectId: createProjectId(),
    name: 'project name',
    description: 'project description',
    ...resp,
  };
};

export const createSettingRequest: DataFactoryFunction<Requests.Setting> = (doc) => {
  return {
    value: 123,
    ...doc,
  };
};

export const createSettingDocument: DataFactoryFunction<Documents.Setting> = (doc) => {
  return {
    settingKey: createSettingKey(),
    value: 123,
    expiresAt: undefined,
    ...doc,
  };
};

export const createSettingResponse: DataFactoryFunction<Responses.Setting> = (resp) => {
  return {
    settingKey: createSettingKey(),
    value: 123,
    ...resp,
  };
};

export const createCategoryResponseBase: DataFactoryFunction<Responses.CategoryAncestor> = (resp) => {
  return {
    categoryId: createCategoryId(),
    name: 'category name',
    categoryType: CategoryType.Regular,
    ...resp,
  };
};

export const createCategoryResponse: DataFactoryFunction<Responses.Category> = (resp) => {
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
export const createRecipientResponse: DataFactoryFunction<Responses.Recipient> = (resp) => {
  return {
    recipientId: createRecipientId(),
    name: 'recipient name',
    ...resp,
  };
};

export const createProductResponse: DataFactoryFunction<Responses.Product> = (resp) => {
  return {
    productId: createProductId(),
    brand: 'product brand',
    measurement: 300,
    unitOfMeasurement: 'g',
    fullName: resp ? `${resp.brand} ${resp.measurement} ${resp.unitOfMeasurement}` : 'product brand 300 g',
    ...resp,
  };
};

export const createProductGroupedResponse: DataFactoryFunction<Responses.ProductGroupedResponse> = (resp) => {
  return {
    fullName: 'category:name',
    categoryId: createCategoryId(),
    products: [createProductResponse()],
    ...resp,
  };
};

export const createPaymentTransactionResponse: DataFactoryFunction<Responses.PaymentTransaction> = (resp) => {
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

export const createDeferredTransactionResponse: DataFactoryFunction<Responses.DeferredTransaction> = (resp) => {
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
    ...resp,
  };
};

export const createReimbursementTransactionResponse: DataFactoryFunction<Responses.ReimbursementTransaction> = (resp) => {
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

export const createSplitResponseItem: DataFactoryFunction<Responses.SplitItem> = (resp) => {
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

export const createSplitTransactionResponse: DataFactoryFunction<Responses.SplitTransaction> = (resp) => {
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

export const createTransferTransactionResponse: DataFactoryFunction<Responses.TransferTransaction> = (resp) => {
  return {
    transactionId: createTransactionId(),
    transactionType: TransactionType.Transfer,
    amount,
    transferAmount: 1200,
    description: 'transaction description',
    issuedAt: new Date().toISOString(),
    account: createAccountResponse(),
    transferAccount: createAccountResponse(),
    ...resp,
  };
};

export const createAccountReport: DataFactoryFunction<Responses.AccountReport> = (rep) => {
  return {
    accountId: createAccountId(),
    currency: 'Ft',
    fullName: 'acc name',
    ...rep,
  };
};

export const createCategoryReport: DataFactoryFunction<Responses.CategoryReport> = (rep) => {
  return {
    categoryId: createCategoryId(),
    fullName: 'category:name',
    ...rep,
  };
};

export const createProjectReport: DataFactoryFunction<Responses.ProjectReport> = (rep) => {
  return {
    projectId: createProjectId(),
    name: 'project name',
    ...rep,
  };
};

export const createProductReport: DataFactoryFunction<Responses.ProductReport> = (rep) => {
  return {
    productId: createProductId(),
    fullName: 'product name 100 g',
    ...rep,
  };
};

export const createRecipientReport: DataFactoryFunction<Responses.RecipientReport> = (rep) => {
  return {
    recipientId: createRecipientId(),
    name: 'recipient name',
    ...rep,
  };
};

export const createTransactionReport: DataFactoryFunction<Responses.TransactionReport> = (rep) => {
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

export const createFileRequest: DataFactoryFunction<Requests.File> = (req) => {
  return {
    timezone: 'Europe/Budapest',
    fileType: FileType.Otp,
    ...req,
  };
};

export const createFileDocument: DataFactoryFunction<Documents.File> = (doc) => {
  return {
    _id: createId(),
    expiresAt: undefined,
    timezone: 'Europe/Budapest',
    fileType: FileType.Otp,
    ...doc,
  };
};

export const createFileResponse: DataFactoryFunction<Responses.File> = (doc) => {
  return {
    fileId: createFileId(),
    draftCount: 0,
    fileType: FileType.Otp,
    uploadedAt: new Date().toISOString(),
    ...doc,
  };
};

export const createDocumentUpdate: DataFactoryFunction<DocumentUpdate<any>> = (update) => {
  return {
    update: {
      $set: {
        someProperty: 123,
      },
    },
    ...update,
  };
};

export const createUserResponse: DataFactoryFunction<Responses.User> = (resp) => {
  return {
    email: 'user@email.com',
    status: 'CONFIRMED',
    groups: [UserType.Editor],
    ...resp,
  };
};

const createPriceId = createId<Api.Price.Id>;

const createPriceRequest: DataFactoryFunction<Requests.Price> = (req) => {
  return {
    name: `${faker.commerce.department()} ${faker.string.uuid()}`,
    amount: faker.number.int({
      min: 1,
      max: 10000,
    }),
    unitOfMeasurement: faker.helpers.arrayElement(priceUnitsOfMeasurement),
    ...req,
  };
};

const createPriceDocument: DataFactoryFunction<Documents.Price> = (doc) => {
  return {
    _id: createId(),
    ...createPriceRequest(),
    isArchived: false,
    expiresAt: undefined,
    ...doc,
  };
};

const createPriceResponse: DataFactoryFunction<Responses.Price> = (resp) => {
  return {
    priceId: createPriceId(),
    ...createPriceRequest(),
    ...resp,
  };
};

const createCustomerId = createId<Api.Customer.Id>;

const createCustomerRequest: DataFactoryFunction<Requests.Customer> = (req) => {
  return {
    name: `${faker.person.firstName()} ${faker.string.uuid()}`,
    description: faker.word.words({
      count: {
        min: 1,
        max: 5,
      },
    }),
    isGroup: faker.datatype.boolean(),
    rating: faker.number.int({
      min: 1,
      max: 5,
    }),
    ...req,
  };
};

const createCustomerDocument = (ctx?: {
  body?: Partial<Requests.Customer>
  jobs?: {
    body?: Partial<Omit<Requests.CustomerJob, 'prices'>>;
    prices?: (Api.Customer.Job.Quantity & {price?: Documents.Price})[];
  }[];
  blacklistedCustomers?: Documents.Customer[];
}): Documents.Customer => {
  return {
    _id: createId(),
    ...createCustomerRequest(),
    jobs: ctx?.jobs?.map<Documents.CustomerJob>((j) => {
      return {
        ...createCustomerJobRequest(),
        ...j.body,
        prices: j.prices?.map((p) => {
          return {
            price: createPriceDocument(),
            quantity: faker.number.int({
              min: 1,
              max: 5,
            }),
            ...p,
          };
        }) ?? [
          {
            price: createPriceDocument(),
            quantity: faker.number.int({
              min: 1,
              max: 5,
            }),
          },
        ],
      };
    }) ?? [],
    isArchived: false,
    blacklistedCustomers: ctx?.blacklistedCustomers ?? [],
    expiresAt: undefined,
    ...ctx?.body,
  };
};

const createCustomerResponse: DataFactoryFunction<Responses.Customer> = (resp) => {
  return {
    customerId: createCustomerId(),
    ...createCustomerRequest(),
    jobs: [createCustomerJobResponse()],
    blacklistedCustomers: [],
    isArchived: false,
    ...resp,
  };
};

const createCustomerJobRequest = (ctx?: {
  body?: Partial<Omit<Requests.CustomerJob, 'prices'>>;
  prices?: Partial<Api.Price.PriceId & Api.Customer.Job.Quantity>[];
}): Requests.CustomerJob => {
  return {
    name: `${faker.company.buzzVerb()} ${faker.string.uuid()}`,
    description: faker.word.words({
      count: {
        min: 1,
        max: 5,
      },
    }),
    duration: faker.number.int({
      min: 1,
      max: DAY_LENGTH,
    }),
    additionalPrice: faker.number.int({
      min: -5000,
      max: 5000,
    }),
    prices: ctx?.prices?.map((p) => {
      return {
        priceId: createPriceId(),
        quantity: faker.number.int({
          min: 1,
          max: 5,
        }),
        ...p,
      };
    }) ?? [
      {
        priceId: createPriceId(),
        quantity: faker.number.int({
          min: 1,
          max: 5,
        }),
      },
    ],
    ...ctx?.body,
  };
};

const createCustomerJobResponse: DataFactoryFunction<Responses.CustomerJob> = (data) => {
  const name = `${faker.company.buzzVerb()} ${faker.string.uuid()}`;
  return {
    name,
    title: name,
    duration: faker.number.int({
      min: 1,
      max: DAY_LENGTH,
    }),
    additionalPrice: faker.number.int({
      min: -5000,
      max: 5000,
    }),
    prices: [
      {
        ...createPriceResponse(),
        quantity: faker.number.int({
          min: 1,
          max: 5,
        }),
      },
    ],
    description: faker.word.words({
      count: {
        min: 1,
        max: 5,
      },
    }),
    ...data,
  };
};

const createPastCalendarDay = () => {
  return dateToISODateString(faker.date.recent({
    days: 50,
  }));
};

const createFutureCalendarDay = () => {
  return dateToISODateString(faker.date.soon({
    days: 50,
    refDate: addDays(1),
  }));
};

const createFutureWorkday = () => {
  const date = faker.date.soon({
    days: 50,
    refDate: addDays(1),
  });

  if (date.getDay() === 6) {
    return dateToISODateString(addDays(-1, date));
  }

  if (date.getDay() === 0) {
    return dateToISODateString(addDays(1, date));
  }

  return dateToISODateString(date);
};

const createFutureWeekend = () => {
  const date = faker.date.soon({
    days: 50,
    refDate: addDays(1),
  });

  const day = date.getDay();

  if (day === 0 || day === 6) {
    return dateToISODateString(date);
  }

  const distanceToPreviousSunday = day;
  const distanceToNextSaturday = 6 - day;
  const nearestWeekendOffset = distanceToPreviousSunday <= distanceToNextSaturday ? -distanceToPreviousSunday : distanceToNextSaturday;

  return dateToISODateString(addDays(nearestWeekendOffset, date));
};

const createCalendarEntryId = (id?: string): Api.Calendar.Entry.Id => {
  return (id ?? createId().toString()) as Api.Calendar.Entry.Id;
};

const createCalendarPersonalEntryRequest: DataFactoryFunction<Requests.CalendarEntryPersonal> = (req) => {
  const start = faker.number.int({
    min: WORKDAY_START,
    max: WORKDAY_END - 1,
  });
  return {
    day: createFutureCalendarDay(),
    description: faker.word.words({
      count: {
        min: 1,
        max: 5,
      },
    }),
    start,
    end: faker.number.int({
      min: start + 1,
      max: WORKDAY_END,
    }),
    entryType: CalendarEntryType.Personal,
    title: faker.company.buzzVerb(),
    ...req,
  };
};

const createCalendarIssueEntryRequest: DataFactoryFunction<Requests.CalendarEntryIssue> = (req) => {
  const start = faker.number.int({
    min: WORKDAY_START,
    max: WORKDAY_END - 1,
  });
  return {
    day: createFutureCalendarDay(),
    description: faker.word.words({
      count: {
        min: 1,
        max: 5,
      },
    }),
    start,
    end: faker.number.int({
      min: start + 1,
      max: WORKDAY_END,
    }),
    entryType: CalendarEntryType.Issue,
    title: faker.company.buzzVerb(),
    ...req,
  };
};

const createCalendarWorkEntryRequest = (ctx?: {
  body?: Partial<Omit<Requests.CalendarEntryWork, 'prices'>>;
  prices?: Partial<Api.Price.PriceId & Api.Customer.Job.Quantity>[];
}): Requests.CalendarEntryWork => {
  const start = faker.number.int({
    min: WORKDAY_START,
    max: WORKDAY_END - 1,
  });

  return {
    day: createFutureCalendarDay(),
    description: faker.word.words({
      count: {
        min: 1,
        max: 5,
      },
    }),
    start,
    end: faker.number.int({
      min: start + 1,
      max: WORKDAY_END,
    }),
    entryType: CalendarEntryType.Work,
    title: faker.company.buzzVerb(),
    customerId: createCustomerId(),
    additionalPrice: faker.number.int({
      min: -5000,
      max: 5000,
    }),
    prices: ctx?.prices?.map((p) => {
      return {
        priceId: createPriceId(),
        quantity: faker.number.int({
          min: 1,
          max: 5,
        }),
        ...p,
      };
    }),
    ...ctx?.body,
  };
};

const createCalendarEntryDocument: DataFactoryFunction<Documents.CalendarEntry> = (data) => {

  return {
    ...createCalendarPersonalEntryRequest(),
    _id: createId(),
    customer: undefined,
    expiresAt: undefined,
    resolution: undefined,
    prices: undefined,
    transaction: undefined,
    additionalPrice: undefined,
    ...data,
  };
};

const createCalendarEntryResponseBase: DataFactoryFunction<Responses.CalendarEntryLean> = (data) => {
  const { entryType, ...base } = createCalendarPersonalEntryRequest();
  return {
    calendarEntryId: createCalendarEntryId(),
    ...base,
    ...data,
  };
};

const createCalendarPersonalEntryResponse: DataFactoryFunction<Responses.CalendarEntryPersonal> = (data) => {
  return {
    calendarEntryId: createCalendarEntryId(),
    ...createCalendarPersonalEntryRequest(),
    ...data,
  };
};

const createCalendarIssueEntryResponse: DataFactoryFunction<Responses.CalendarEntryIssue> = (data) => {
  return {
    calendarEntryId: createCalendarEntryId(),
    ...createCalendarIssueEntryRequest(),
    ...data,
  };
};

const createCalendarWorkEntryResponseBase: DataFactoryFunction<Responses.CalendarEntryWorkLean> = (data) => {
  const { customerId, prices, ...req } = createCalendarWorkEntryRequest();
  return {
    calendarEntryId: createCalendarEntryId(),
    ...req,
    resolution: undefined,
    ...data,
  };
};

const createCalendarWorkEntryResponse: DataFactoryFunction<Responses.CalendarEntryWork> = (data) => {
  const { customerId, prices, ...req } = createCalendarWorkEntryRequest();
  return {
    calendarEntryId: createCalendarEntryId(),
    ...req,
    customer: createCustomerResponse(),
    resolution: undefined,
    prices: undefined,
    ...data,
  };
};

const createCalendarEntryResolutionRequest: DataFactoryFunction<Requests.CalendarEntryResolution> = (data) => {
  const status = data?.status ?? CalendarEntryResolutionStatus.Paid;
    
  return {
    status,
    amount: status === CalendarEntryResolutionStatus.Paid ? faker.number.int({
      min: 1,
      max: 10000,
    }) : undefined, 
    delay: status !== CalendarEntryResolutionStatus.NoShow ? faker.number.int({
      min: 1,
      max: 30,
    }) : undefined,
    ...data,
  };
};

const createCalendarWorkdayRequest: DataFactoryFunction<Requests.CalendarDayWorkday> = (req) => {
  const start = faker.number.int({
    min: WORKDAY_START,
    max: WORKDAY_END - 1,
  });

  return {
    dayType: CalendarDayType.Workday,
    start,
    end: faker.number.int({
      min: start + 1,
      max: WORKDAY_END,
    }),
    ...req,
  };
};

const createCalendarVacationRequest = (): Requests.CalendarDayVacation => {
  return {
    dayType: CalendarDayType.Vacation,
  };
};

const createCalendarDayDocument: DataFactoryFunction<Documents.CalendarDay> = (data) => {
  return {
    ...createCalendarWorkdayRequest(),
    day: createFutureCalendarDay(),
    expiresAt: undefined,
    ...data,
  };
};

const createCalendarWorkdayResponse: DataFactoryFunction<Responses.CalendarDayWorkday> = (data) => {
  return {
    ...createCalendarWorkdayRequest(),
    day: createPastCalendarDay(),
    entries: [],
    ...data,
  };
};

const createCalendarWeekendResponse: DataFactoryFunction<Responses.CalendarDayWeekend> = (data) => {
  return {
    ...createCalendarWorkdayRequest(),
    day: createPastCalendarDay(),
    dayType: CalendarDayType.Weekend,
    entries: [],
    ...data,
  };
};

const createCalendarVacationResponse: DataFactoryFunction<Responses.CalendarDayVacation> = (data) => {
  return {
    dayType: CalendarDayType.Vacation,
    day: createPastCalendarDay(),
    entries: [],
    ...data,
  };
};

const createCalendarHolidayResponse: DataFactoryFunction<Responses.CalendarDayHoliday> = (data) => {
  return {
    dayType: CalendarDayType.Holiday,
    day: createPastCalendarDay(),
    entries: [],
    ...data,
  };
};

export const testDataFactory = {
  price: {
    id: createPriceId,
    request: createPriceRequest,
    document: createPriceDocument,
    response: createPriceResponse,
  },
  customer: {
    id: createCustomerId,
    request: createCustomerRequest,
    document: createCustomerDocument,
    response: createCustomerResponse,
    job: {
      request: createCustomerJobRequest,
      response: createCustomerJobResponse,
    },
  },
  calendar: {
    day: {
      pastDay: createPastCalendarDay,
      futureDay: createFutureCalendarDay,
      futureWorkday: createFutureWorkday,
      futureWeekend: createFutureWeekend,
      request: {
        workday: createCalendarWorkdayRequest,
        vacation: createCalendarVacationRequest,
      },
      document: createCalendarDayDocument,
      response: {
        vacation: createCalendarVacationResponse,
        holiday: createCalendarHolidayResponse,
        workday: createCalendarWorkdayResponse,
        weekend: createCalendarWeekendResponse,
      },
    },
    entry: {
      id: createCalendarEntryId,
      request: {
        work: createCalendarWorkEntryRequest,
        issue: createCalendarIssueEntryRequest,
        personal: createCalendarPersonalEntryRequest,
      },
      document: createCalendarEntryDocument,
      response: {
        base: createCalendarEntryResponseBase,
        personal: createCalendarPersonalEntryResponse,
        issue: createCalendarIssueEntryResponse,
        workBase: createCalendarWorkEntryResponseBase,
        work: createCalendarWorkEntryResponse,
      },
      resolution: {
        request: createCalendarEntryResolutionRequest,
      },
    },
  },
};
