import { addDays, addSeconds, createDate, dateToISODateString } from '@household/shared/common/utils';
import { AccountType, CalendarDayType, CalendarEntryResolutionStatus, CalendarEntryType, CategoryType, FileType, SettingKey, TransactionType, UserType } from '@household/shared/enums';
import { DataFactoryFunction, DocumentUpdate, RecursivePartial } from '@household/shared/types/common';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { Documents } from '@household/shared/types/documents';
import { faker } from '@faker-js/faker';
import { DAY_LENGTH, priceUnitsOfMeasurement, unitsOfMeasurement, WORKDAY_END, WORKDAY_START } from '@household/shared/constants';

const createId = <I>(id?: string): I => (id ?? faker.database.mongodbObjectId()) as I;

const createReportAccountFilter: DataFactoryFunction<Api.Report.AccountFilter> = (req) => {
  return {
    filterType: 'account',
    include: faker.datatype.boolean(),
    items: [createAccountId()],
    ...req,
  };
};

const createReportCategoryFilter: DataFactoryFunction<Api.Report.CategoryFilter> = (req) => {
  return {
    filterType: 'category',
    include: faker.datatype.boolean(),
    items: [createCategoryId()],
    ...req,
  };
};

const createReportProjectFilter: DataFactoryFunction<Api.Report.ProjectFilter> = (req) => {
  return {
    filterType: 'project',
    include: faker.datatype.boolean(),
    items: [createProjectId()],
    ...req,
  };
};

const createReportProductFilter: DataFactoryFunction<Api.Report.ProductFilter> = (req) => {
  return {
    filterType: 'product',
    include: faker.datatype.boolean(),
    items: [createProductId()],
    ...req,
  };
};

const createReportRecipientFilter: DataFactoryFunction<Api.Report.RecipientFilter> = (req) => {
  return {
    filterType: 'recipient',
    include: faker.datatype.boolean(),
    items: [createRecipientId()],
    ...req,
  };
};

const createReportIssuedAtFilter: DataFactoryFunction<Api.Report.IssuedAtFilter> = (req) => {
  const to = faker.date.recent();
  return {
    filterType: 'issuedAt',
    include: true,
    from: faker.date.recent({
      refDate: addSeconds(-60 * 60 * 24, to),
      days: 90,
    }).toISOString(),
    to: to.toISOString(),
    ...req,
  };
};

const createDocumentUpdate: DataFactoryFunction<DocumentUpdate<any>> = (update) => {
  return {
    update: {
      $set: {
        someProperty: 123,
      },
    },
    ...update,
  };
};

const createLoginRequest: DataFactoryFunction<Requests.Login> = (req) => {
  return {
    email: faker.internet.email(),
    password: faker.internet.password(),
    ...req,
  };
};

const createUserRequest: DataFactoryFunction<Requests.User> = (req) => {
  return {
    email: faker.internet.email(),
    ...req,
  };
};

const createConfirmUserRequest: DataFactoryFunction<Requests.ConfirmUser> = (req) => {
  return {
    temporaryPassword: faker.internet.password(),
    password: faker.internet.password(),
    ...req,
  };
};

const createConfirmForgotPasswordRequest: DataFactoryFunction<Requests.ConfirmForgotPassword> = (req) => {
  return {
    confirmationCode: `${faker.number.int({
      min: 100000,
      max: 999999,
    })}`,
    password: faker.internet.password(),
    ...req,
  };
};

const createUserResponse: DataFactoryFunction<Responses.User> = (resp) => {
  return {
    email: faker.internet.email(),
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

const createAccountId = (id?: string): Api.Account.Id => {
  return (id ?? createId().toString()) as Api.Account.Id;
};

const createAccountRequest: DataFactoryFunction<Requests.Account> = (req) => {
  return {
    accountType: faker.helpers.arrayElement(Object.values(AccountType).filter(a => a !== AccountType.Loan)),
    name: `${faker.finance.accountName()} ${faker.finance.accountNumber()}`,
    currency: faker.finance.currencySymbol(),
    owner: faker.person.firstName(),
    ...req,
  };
};

const createAccountDocument: DataFactoryFunction<Documents.Account> = (doc) => {
  return {
    _id: createId(),
    ...createAccountRequest(),
    expiresAt: undefined,
    isOpen: faker.datatype.boolean(),
    ...doc,
  };
};

const createAccountResponse: DataFactoryFunction<Responses.Account> = (resp) => {
  const base = createAccountRequest();

  return {
    ...base,
    balance: faker.number.int(),
    fullName: `${resp?.name ?? base.name} (${resp?.owner ?? base.owner})`,
    accountId: createAccountId(),
    isOpen: faker.datatype.boolean(),
    ...resp,
  };
};

const createAccountReport: DataFactoryFunction<Responses.AccountReport> = (rep) => {
  const base = createAccountRequest();

  return {
    accountId: createAccountId(),
    currency: faker.finance.currencySymbol(),
    fullName: `${base.name} (${base.owner})`,
    ...rep,
  };
};

const createRecipientId = (id?: string): Api.Recipient.Id => {
  return (id ?? createId().toString()) as Api.Recipient.Id;
};

const createRecipientRequest: DataFactoryFunction<Requests.Recipient> = (req) => {
  return {
    name: `${faker.company.name()} ${faker.string.uuid()}`,
    ...req,
  };
};

const createRecipientDocument: DataFactoryFunction<Documents.Recipient> = (doc) => {
  return {
    _id: createId(),
    ...createRecipientRequest(),
    expiresAt: undefined,
    ...doc,
  };
};

const createRecipientResponse: DataFactoryFunction<Responses.Recipient> = (resp) => {
  return {
    recipientId: createRecipientId(),
    ...createRecipientRequest(),
    ...resp,
  };
};

const createRecipientReport: DataFactoryFunction<Responses.RecipientReport> = (rep) => {
  return {
    recipientId: createRecipientId(),
    ...createRecipientRequest(),
    ...rep,
  };
};

const createCategoryId = (id?: string): Api.Category.Id => {
  return (id ?? createId().toString()) as Api.Category.Id;
};

const createCategoryRequest: DataFactoryFunction<Requests.Category> = (req) => {
  return {
    name: `${faker.company.name()} ${faker.string.uuid()}`,
    categoryType: faker.helpers.enumValue(CategoryType),
    parentCategoryId: createCategoryId(),
    ...req,
  };
};

const createCategoryDocument: DataFactoryFunction<Documents.Category> = (doc) => {
  const { name, categoryType } = createCategoryRequest();

  return {
    _id: createId(),
    name,
    categoryType,
    expiresAt: undefined,
    ancestors: [],
    ...doc,
  };
};

const createCategoryResponse: DataFactoryFunction<Responses.Category> = (resp) => {
  const { name, categoryType } = createCategoryRequest();
  
  return {
    categoryId: createCategoryId(),
    name,
    categoryType,
    fullName: name,
    parentCategory: undefined,
    ancestors: [],
    ...resp,
  };
};

const createCategoryReport: DataFactoryFunction<Responses.CategoryReport> = (rep) => {
  return {
    categoryId: createCategoryId(),
    fullName: `${faker.company.name()} ${faker.string.uuid()}`,
    ...rep,
  };
};

const createProductId = (id?: string): Api.Product.Id => {
  return (id ?? createId().toString()) as Api.Product.Id;
};

const createProductRequest: DataFactoryFunction<Requests.Product> = (req) => {
  return {
    brand: faker.commerce.productName(),
    measurement: faker.number.float({
      min: 0,
      max: 10000,
    }),
    unitOfMeasurement: faker.helpers.arrayElement(unitsOfMeasurement),
    ...req,
  };
};

const createProductDocument: DataFactoryFunction<Documents.Product> = (doc) => {
  const base = createProductRequest();

  return {
    _id: createId(),
    ...base,
    expiresAt: undefined,
    fullName: `${doc?.brand ?? base.brand} ${doc?.measurement ?? base.measurement} ${doc?.unitOfMeasurement ?? base.unitOfMeasurement}`,
    category: createCategoryDocument(),
    ...doc,
  };
};

const createProductResponse: DataFactoryFunction<Responses.Product> = (resp) => {
  const base = createProductRequest();
  
  return {
    productId: createProductId(),
    ...base,
    fullName: `${resp?.brand ?? base.brand} ${resp?.measurement ?? base.measurement} ${resp?.unitOfMeasurement ?? base.unitOfMeasurement}`,
    ...resp,
  };
};

const createProductGroupedResponse: DataFactoryFunction<Responses.ProductGroupedResponse> = (resp) => {
  const { name } = createCategoryRequest();

  return {
    fullName: name,
    categoryId: createCategoryId(),
    products: [createProductResponse()],
    ...resp,
  };
};

const createProductReport: DataFactoryFunction<Responses.ProductReport> = (rep) => {
  const base = createProductRequest();

  return {
    productId: createProductId(),
    fullName: `${base.brand} ${base.measurement} ${base.unitOfMeasurement}`,
    ...rep,
  };
};

const createProjectId = (id?: string): Api.Project.Id => {
  return (id ?? createId().toString()) as Api.Project.Id;
};

const createProjectRequest: DataFactoryFunction<Requests.Project> = (req) => {
  return {
    name: `${faker.commerce.department()} ${faker.string.uuid()}`,
    description: faker.word.words({
      count: {
        min: 1,
        max: 5,
      },
    }),
    ...req,
  };
};

const createProjectDocument: DataFactoryFunction<Documents.Project> = (doc) => {
  return {
    _id: createId(),
    ...createProjectRequest(),
    expiresAt: undefined,
    ...doc,
  };
};

const createProjectResponse: DataFactoryFunction<Responses.Project> = (resp) => {
  return {
    projectId: createProjectId(),
    ...createProjectRequest(),
    ...resp,
  };
};

const createProjectReport: DataFactoryFunction<Responses.ProjectReport> = (rep) => {
  return {
    projectId: createProjectId(),
    name: `${faker.commerce.department()} ${faker.string.uuid()}`,
    ...rep,
  };
};

const createTransactionId = (id?: string): Api.Transaction.Id => {
  return (id ?? createId().toString()) as Api.Transaction.Id;
};

const createPaymentTransactionRequest: DataFactoryFunction<Requests.PaymentTransaction> = (req) => {
  const billingEndDate = faker.date.recent();

  return {
    amount: faker.number.float({
      min: -10000,
      max: req?.loanAccountId ? 0 : 10000,
    }),
    billingEndDate: billingEndDate.toISOString().split('T')[0],
    billingStartDate: faker.date.recent({
      refDate: addSeconds(-60 * 60 * 24, billingEndDate),
      days: 90,
    }).toISOString()
      .split('T')[0],
    invoiceNumber: faker.finance.accountNumber(),
    description: faker.word.words({
      count: {
        min: 1,
        max: 5,
      },
    }),
    issuedAt: faker.date.recent().toISOString(),
    quantity: faker.number.float({
      max: 20,
    }),
    accountId: createAccountId(),
    productId: createProductId(),
    categoryId: createCategoryId(),
    projectId: createProjectId(),
    recipientId: createRecipientId(),
    loanAccountId: undefined,
    ...req,
  };
};

const createPaymentTransactionDocument: DataFactoryFunction<Documents.PaymentTransaction> = (doc) => {
  const { amount, description, quantity, invoiceNumber, billingEndDate, billingStartDate, issuedAt } = createPaymentTransactionRequest();

  return {
    _id: createId(),
    transactionType: TransactionType.Payment,
    amount,
    description,
    quantity,
    invoiceNumber,
    billingEndDate: createDate(billingEndDate),
    billingStartDate: createDate(billingStartDate),
    issuedAt: createDate(issuedAt),
    product: createProductDocument(),
    account: createAccountDocument(),
    category: createCategoryDocument(),
    project: createProjectDocument(),
    recipient: createRecipientDocument(),
    expiresAt: undefined,
    ...doc,
  };
};

const createPaymentTransactionResponse: DataFactoryFunction<Responses.PaymentTransaction> = (resp) => {
  const { amount, description, quantity, invoiceNumber, billingEndDate, billingStartDate, issuedAt } = createPaymentTransactionRequest();

  return {
    transactionId: createTransactionId(),
    transactionType: TransactionType.Payment,
    amount,
    description,
    quantity,
    invoiceNumber,
    billingEndDate,
    billingStartDate,
    issuedAt,
    product: createProductResponse(),
    account: createAccountResponse(),
    category: createCategoryResponse(),
    project: createProjectResponse(),
    recipient: createRecipientResponse(),
    ...resp,
  };
};

const createDeferredTransactionDocument: DataFactoryFunction<Documents.DeferredTransaction> = (doc) => {
  const { description, quantity, invoiceNumber, billingEndDate, billingStartDate, issuedAt } = createPaymentTransactionRequest();

  return {
    _id: createId(),
    transactionType: TransactionType.Deferred,
    amount: faker.number.float({
      min: -10000,
      max: 0,
    }),
    description,
    quantity,
    invoiceNumber,
    billingEndDate: createDate(billingEndDate),
    billingStartDate: createDate(billingStartDate),
    issuedAt: createDate(issuedAt),
    product: createProductDocument(),
    payingAccount: createAccountDocument(),
    category: createCategoryDocument(),
    project: createProjectDocument(),
    recipient: createRecipientDocument(),
    ownerAccount: createAccountDocument(),
    expiresAt: undefined,
    ...doc,
  };
};

const createDeferredTransactionResponse: DataFactoryFunction<Responses.DeferredTransaction> = (resp) => {
  const { description, quantity, invoiceNumber, billingEndDate, billingStartDate, issuedAt } = createPaymentTransactionRequest();

  return {
    transactionId: createTransactionId(),
    transactionType: TransactionType.Deferred,
    amount: faker.number.float({
      min: -10000,
      max: 0,
    }),
    description,
    quantity,
    invoiceNumber,
    billingEndDate,
    billingStartDate,
    issuedAt,
    product: createProductResponse(),
    ownerAccount: createAccountResponse(),
    payingAccount: createAccountResponse(),
    category: createCategoryResponse(),
    project: createProjectResponse(),
    recipient: createRecipientResponse(),
    ...resp,
  };
};

const createReimbursementTransactionDocument: DataFactoryFunction<Documents.ReimbursementTransaction> = (doc) => {
  const { description, quantity, invoiceNumber, billingEndDate, billingStartDate, issuedAt } = createPaymentTransactionRequest();

  return {
    _id: createId(),
    transactionType: TransactionType.Reimbursement,
    amount: faker.number.float({
      min: -10000,
      max: 0,
    }),
    description,
    quantity,
    invoiceNumber,
    billingEndDate: createDate(billingEndDate),
    billingStartDate: createDate(billingStartDate),
    issuedAt: createDate(issuedAt),
    product: createProductDocument(),
    expiresAt: undefined,
    payingAccount: createAccountDocument(),
    category: createCategoryDocument(),
    project: createProjectDocument(),
    recipient: createRecipientDocument(),
    ownerAccount: createAccountDocument(),
    ...doc,
  };
};

const createReimbursementTransactionResponse: DataFactoryFunction<Responses.ReimbursementTransaction> = (resp) => {
  const { description, quantity, invoiceNumber, billingEndDate, billingStartDate, issuedAt } = createPaymentTransactionRequest();

  return {
    transactionId: createTransactionId(),
    transactionType: TransactionType.Reimbursement,
    amount: faker.number.float({
      min: -10000,
      max: 0,
    }),
    description,
    quantity,
    invoiceNumber,
    billingEndDate,
    billingStartDate,
    issuedAt,
    product: createProductResponse(),
    ownerAccount: createAccountResponse(),
    payingAccount: createAccountResponse(),
    category: createCategoryResponse(),
    project: createProjectResponse(),
    recipient: createRecipientResponse(),
    ...resp,
  };
};

const createSplitRequestItem: DataFactoryFunction<Requests.SplitItem> = (req) => {
  const billingEndDate = faker.date.recent();

  return {
    amount: faker.number.float({
      min: -10000,
      max: 10000,
    }),
    description: faker.word.words({
      count: {
        min: 1,
        max: 5,
      },
    }),
    billingEndDate: billingEndDate.toISOString().split('T')[0],
    billingStartDate: faker.date.recent({
      refDate: addSeconds(-60 * 60 * 24, billingEndDate),
      days: 90,
    }).toISOString()
      .split('T')[0],
    invoiceNumber: faker.finance.accountNumber(),
    quantity: faker.number.float({
      max: 20,
    }),
    categoryId: createCategoryId(),
    projectId: createProjectId(),
    productId: createProductId(),
    ...req,
  };
};

const createLoanRequestItem: DataFactoryFunction<Requests.LoanItem> = (req) => {
  const billingEndDate = faker.date.recent();

  return {
    amount: faker.number.float({
      min: -10000,
      max: 0,
    }),
    description: faker.word.words({
      count: {
        min: 1,
        max: 5,
      },
    }),
    billingEndDate: billingEndDate.toISOString().split('T')[0],
    billingStartDate: faker.date.recent({
      refDate: addSeconds(-60 * 60 * 24, billingEndDate),
      days: 90,
    }).toISOString()
      .split('T')[0],
    invoiceNumber: faker.finance.accountNumber(),
    quantity: faker.number.float({
      max: 20,
    }),
    categoryId: createCategoryId(),
    projectId: createProjectId(),
    productId: createProductId(),
    loanAccountId: createAccountId(),
    transactionId: undefined,
    ...req,
  };
};

const createSplitTransactionRequest = (req?: RecursivePartial<Requests.SplitTransaction>): Requests.SplitTransaction => {
  const loanRequests = Object.hasOwn(req ?? {}, 'loans') ? req.loans?.map(l => createLoanRequestItem(l)) : [createLoanRequestItem()];

  const splitRequests = Object.hasOwn(req ?? {}, 'splits') ? req.splits?.map(l => createSplitRequestItem(l)) : [createSplitRequestItem()];

  return {
    description: faker.word.words({
      count: {
        min: 1,
        max: 5,
      },
    }),
    issuedAt: faker.date.recent().toISOString(),
    accountId: createAccountId(),
    recipientId: createRecipientId(),
    ...req,
    splits: splitRequests,
    loans: loanRequests,
  };
};

const createSplitDocumentItem: DataFactoryFunction<Documents.SplitItem> = (doc) => {
  const { amount, description, billingEndDate, billingStartDate, invoiceNumber, quantity } = createSplitRequestItem();

  return {
    amount,
    description,
    billingEndDate: createDate(billingEndDate),
    billingStartDate: createDate(billingStartDate),
    invoiceNumber,
    quantity,
    category: createCategoryDocument(),
    project: createProjectDocument(),
    product: createProductDocument(),
    ...doc,
  };
};

const createSplitTransactionDocument = (doc?: RecursivePartial<Omit<Documents.SplitTransaction, 'amount'>>): Documents.SplitTransaction => {
  const deferredDocuments = Object.hasOwn(doc ?? {}, 'deferredSplits') ? doc.deferredSplits?.map(d => createDeferredTransactionDocument(d)) : [createDeferredTransactionDocument()];

  const splitDocuments = Object.hasOwn(doc ?? {}, 'splits') ? doc.splits?.map(l => createSplitDocumentItem(l)) : [createSplitDocumentItem()];

  const amount = [
    ...(deferredDocuments ?? []),
    ...(splitDocuments ?? []),
  ].reduce((accumulator, currentValue) => {
    return accumulator + currentValue.amount;
  }, 0);

  return {
    _id: createId(),
    transactionType: TransactionType.Split,
    description: faker.word.words({
      count: {
        min: 1,
        max: 5,
      },
    }),
    issuedAt: faker.date.recent(),
    expiresAt: undefined,
    account: createAccountDocument(),
    recipient: createRecipientDocument(),
    ...doc,
    amount,
    splits: splitDocuments,
    deferredSplits: deferredDocuments,
  };
};

const createSplitResponseItem: DataFactoryFunction<Responses.SplitItem> = (resp) => {
  const { amount, description, billingEndDate, billingStartDate, invoiceNumber, quantity } = createSplitRequestItem();

  return {
    amount,
    description,
    billingEndDate,
    billingStartDate,
    invoiceNumber,
    quantity,
    category: createCategoryResponse(),
    project: createProjectResponse(),
    product: createProductResponse(),
    ...resp,
  };
};

const createSplitTransactionResponse = (resp?: RecursivePartial<Omit<Responses.SplitTransaction, 'amount'>>): Responses.SplitTransaction => {
  const deferredResponses = Object.hasOwn(resp ?? {}, 'deferredSplits') ? resp.deferredSplits?.map(d => createDeferredTransactionResponse(d)) : [createDeferredTransactionResponse()];

  const splitResponses = Object.hasOwn(resp ?? {}, 'splits') ? resp.splits?.map(l => createSplitResponseItem(l)) : [createSplitResponseItem()];

  const amount = [
    ...(deferredResponses ?? []),
    ...(splitResponses ?? []),
  ].reduce((accumulator, currentValue) => {
    return accumulator + currentValue.amount;
  }, 0);

  return {
    transactionId: createTransactionId(),
    transactionType: TransactionType.Split,
    description: faker.word.words({
      count: {
        min: 1,
        max: 5,
      },
    }),
    issuedAt: faker.date.recent().toISOString(),
    account: createAccountResponse(),
    recipient: createRecipientResponse(),
    ...resp,
    amount,
    splits: splitResponses,
    deferredSplits: deferredResponses,
  };
};

const createTransferTransactionRequest: DataFactoryFunction<Requests.TransferTransaction> = (req) => {
  const amount = req?.amount ?? faker.number.float({
    min: -10000,
    max: 0,
  });
  
  return {
    amount,
    transferAmount: faker.number.float({
      max: 10000,
      min: 0,
    }),
    description: faker.word.words({
      count: {
        min: 1,
        max: 5,
      },
    }),
    issuedAt: faker.date.recent().toISOString(),
    accountId: createAccountId(),
    transferAccountId: createAccountId(),
    ...req,
  };
};

const createTransferTransactionDocument: DataFactoryFunction<Documents.TransferTransaction> = (doc) => {
  const { amount, description, issuedAt, transferAmount } = createTransferTransactionRequest();

  return {
    _id: createId(),
    transactionType: TransactionType.Transfer,
    amount,
    description,
    issuedAt: createDate(issuedAt),
    transferAmount, 
    expiresAt: undefined,
    account: createAccountDocument(),
    transferAccount: createAccountDocument(),
    ...doc,
  };
};

const createTransferTransactionResponse: DataFactoryFunction<Responses.TransferTransaction> = (resp) => {
  const { amount, description, issuedAt, transferAmount } = createTransferTransactionRequest();

  return {
    transactionId: createTransactionId(),
    transactionType: TransactionType.Transfer,
    amount,
    description,
    issuedAt,
    transferAmount,
    account: createAccountResponse(),
    transferAccount: createAccountResponse(),
    ...resp,
  };
};

const createDraftTransactionDocument: DataFactoryFunction<Documents.DraftTransaction> = (doc) => {
  return {
    _id: createId(),
    transactionType: TransactionType.Draft,
    amount: faker.number.float({
      min: -10000,
      max: 10000,
    }),
    description: faker.word.words({
      count: {
        min: 1,
        max: 5,
      },
    }),
    issuedAt: faker.date.recent(),
    expiresAt: undefined,
    file: createFileDocument(),
    ...doc,
  };
};

const createDraftTransactionResponse: DataFactoryFunction<Responses.DraftTransaction> = (doc) => {
  return {
    transactionId: createTransactionId(),
    transactionType: TransactionType.Draft,
    amount: faker.number.float({
      min: -10000,
      max: 10000,
    }),
    description: faker.word.words({
      count: {
        min: 1,
        max: 5,
      },
    }),
    issuedAt: faker.date.recent().toISOString(),
    potentialDuplicates: [],
    ...doc,
  };
};

const createTransactionRawReport: DataFactoryFunction<Documents.RawTransaction> = (doc) => {
  const { amount, description, quantity, invoiceNumber, billingEndDate, billingStartDate, issuedAt } = createPaymentTransactionRequest(); 

  return {
    _id: createId(),
    amount,
    description,
    quantity,
    invoiceNumber,
    billingEndDate: createDate(billingEndDate),
    billingStartDate: createDate(billingStartDate),
    issuedAt: createDate(issuedAt),
    product: createProductDocument(),
    account: createAccountDocument(),
    category: createCategoryDocument(),
    project: createProjectDocument(),
    recipient: createRecipientDocument(),
    ...doc,
  };
};

const createTransactionReport: DataFactoryFunction<Responses.TransactionReport> = (rep) => {
  const { amount, description, quantity, invoiceNumber, billingEndDate, billingStartDate, issuedAt } = createPaymentTransactionRequest(); 

  return {
    transactionId: createTransactionId(),
    amount,
    description,
    quantity,
    invoiceNumber,
    billingEndDate,
    billingStartDate,
    issuedAt,
    account: createAccountReport(),
    category: createCategoryReport(),
    product: createProductReport(),
    project: createProjectReport(),
    recipient: createRecipientReport(),
    ...rep,
  };
};

const createFileId = (id?: string): Api.File.Id => {
  return (id ?? createId().toString()) as Api.File.Id;
};

const createFileRequest: DataFactoryFunction<Requests.File> = (req) => {
  return {
    timezone: 'Europe/Budapest',
    fileType: faker.helpers.enumValue(FileType),
    ...req,
  };
};

const createFileDocument: DataFactoryFunction<Documents.File> = (doc) => {
  return {
    _id: createId(),
    ...createFileRequest(),
    expiresAt: undefined,
    ...doc,
  };
};

const createFileResponse: DataFactoryFunction<Responses.File> = (doc) => {
  const { fileType } = createFileRequest();

  return {
    fileId: createFileId(),
    fileType,
    draftCount: faker.number.int(),
    uploadedAt: new Date().toISOString(),
    ...doc,
  };
};

const createSettingKey = (key?: string): SettingKey => {
  return (key ?? faker.string.uuid()) as SettingKey;
};

const createSettingRequest: DataFactoryFunction<Requests.Setting> = (doc) => {
  return {
    value: faker.string.uuid(),
    ...doc,
  };
};

const createSettingDocument: DataFactoryFunction<Documents.Setting> = (doc) => {
  return {
    settingKey: createSettingKey(),
    value: faker.string.uuid(),
    expiresAt: undefined,
    ...doc,
  };
};

const createSettingResponse: DataFactoryFunction<Responses.Setting> = (resp) => {
  return {
    settingKey: createSettingKey(),
    value: faker.string.uuid(),
    ...resp,
  };
};

export const testDataFactory = {
  documentUpdate: createDocumentUpdate,
  account: {
    id: createAccountId,
    request: createAccountRequest,
    document: createAccountDocument,
    response: createAccountResponse,
    report: createAccountReport,
  },
  recipient: {
    id: createRecipientId,
    request: createRecipientRequest,
    document: createRecipientDocument,
    response: createRecipientResponse,
    report: createRecipientReport,
  },
  project: {
    id: createProjectId,
    request: createProjectRequest,
    document: createProjectDocument,
    response: createProjectResponse,
    report: createProjectReport,
  },
  category: {
    id: createCategoryId,
    request: createCategoryRequest,
    document: createCategoryDocument,
    response: createCategoryResponse,
    report: createCategoryReport,
  },
  product: {
    id: createProductId,
    request: createProductRequest,
    document: createProductDocument,
    response: createProductResponse,
    groupedResponse: createProductGroupedResponse,
    report: createProductReport,
  },
  transaction: {
    id: createTransactionId,
    request: {
      payment: createPaymentTransactionRequest,
      transfer: createTransferTransactionRequest,
      split: createSplitTransactionRequest,
    },
    document: {
      payment: createPaymentTransactionDocument,
      deferred: createDeferredTransactionDocument,
      reimbursement: createReimbursementTransactionDocument,
      transfer: createTransferTransactionDocument,
      split: createSplitTransactionDocument,
      draft: createDraftTransactionDocument,
      report: createTransactionRawReport,
    },
    response: {
      payment: createPaymentTransactionResponse,
      deferred: createDeferredTransactionResponse,
      reimbursement: createReimbursementTransactionResponse,
      transfer: createTransferTransactionResponse,
      split: createSplitTransactionResponse,
      draft: createDraftTransactionResponse,
    },
    report: createTransactionReport,
  },
  file: {
    id: createFileId,
    request: createFileRequest,
    document: createFileDocument,
    response: createFileResponse,
  },
  setting: {
    key: createSettingKey,
    request: createSettingRequest,
    document: createSettingDocument,
    response: createSettingResponse,
  },
  user: {
    request: {
      user: createUserRequest,
      confirmUser: createConfirmUserRequest,
    },
    response: {
      user: createUserResponse,
    },
  },
  auth: {
    request: {
      login: createLoginRequest,
      confirmForgotPassword: createConfirmForgotPasswordRequest,
    },
  },
  report: {
    filter: {
      account: createReportAccountFilter,
      category: createReportCategoryFilter,
      project: createReportProjectFilter,
      product: createReportProductFilter,
      recipient: createReportRecipientFilter,
      issuedAt: createReportIssuedAtFilter,
    },
  },
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
