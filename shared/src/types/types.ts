import { categoryTypes, groupByProperties, unitsOfMeasurement } from '@household/shared/constants';
import { Branding, Remove } from '@household/shared/types/common';
import { Types } from 'mongoose';

export namespace Internal {
  export type Id = {
    _id: Types.ObjectId;
  };

  export type ExpiresAt = {
    expiresAt: Date;
  };

  export type CreatedAt = {
    createdAt: Date;
  };

  export type UpdatedAt = {
    updatedAt: Date;
  };
}

export namespace Project {
  export type Id = Branding<string, 'project'>;

  export type ProjectId = {
    projectId: Id;
  };

  type Base = {
    name: string;
    description: string;
  };

  export type Document = Internal.Id
  & Internal.ExpiresAt
  & Partial<Internal.CreatedAt>
  & Partial<Internal.UpdatedAt>
  & Base;

  export type Response = Base
  & ProjectId
  & Remove<Internal.CreatedAt>
  & Remove<Internal.UpdatedAt>
  & Remove<Internal.Id>
  & Remove<Internal.ExpiresAt>;

  export type Request = Base;
}

export namespace Recipient {
  export type Id = Branding<string, 'recipient'>;

  export type RecipientId = {
    recipientId: Id;
  };

  type Base = {
    name: string;
  };

  export type Document = Internal.Id
  & Internal.ExpiresAt
  & Partial<Internal.CreatedAt>
  & Partial<Internal.UpdatedAt>
  & Base;

  export type Response = Base
  & RecipientId
  & Remove<Internal.CreatedAt>
  & Remove<Internal.UpdatedAt>
  & Remove<Internal.Id>
  & Remove<Internal.ExpiresAt>;

  export type Request = Base;
}

export namespace Account {
  export type Id = Branding<string, 'account'>;

  export type AccountId = {
    accountId: Id;
  };

  type IsOpen = {
    isOpen: boolean;
  };

  export type AccountType = 'bankAccount' | 'cash' | 'creditCard' | 'loan' | 'cafeteria';

  type Base = {
    name: string;
    currency: string;
    accountType: AccountType;
  };

  type Balance = {
    balance: number;
  };

  export type Document = Internal.Id
  & Internal.ExpiresAt
  & Partial<Internal.CreatedAt>
  & Partial<Internal.UpdatedAt>
  & Base
  & IsOpen
  & Partial<Balance>;

  export type Response = Base
  & IsOpen
  & Balance
  & AccountId
  & Remove<Internal.CreatedAt>
  & Remove<Internal.UpdatedAt>
  & Remove<Internal.Id>
  & Remove<Internal.ExpiresAt>;

  export type Request = Base;
}

export namespace Category {
  export type Id = Branding<string, 'category'>;

  export type CategoryId = {
    categoryId: Id;
  };

  type FullName = {
    fullName: string;
  };

  export type ParentCategoryId = {
    parentCategoryId: Id;
  };

  type ParentCategory = {
    parentCategory: Document;
  };

  export type CategoryType = {
    categoryType: typeof categoryTypes[number];
  };

  type Base = CategoryType & {
    name: string;
  };

  type Products<T> = {
    products: T[];
  };

  export type Document = Internal.Id
  & Internal.ExpiresAt
  & Partial<Internal.CreatedAt>
  & Partial<Internal.UpdatedAt>
  & Base
  & FullName
  & Remove<ParentCategoryId>
  & ParentCategory
  & Products<Product.Document>;

  export type Response = Base
  & FullName
  & CategoryId
  & Products<Product.Response>
  & Remove<Internal.CreatedAt>
  & Remove<Internal.UpdatedAt>
  & Remove<Internal.Id>
  & Remove<Internal.ExpiresAt>
  & Remove<ParentCategoryId>
  & {
    parentCategory: Category.Response & Remove<ParentCategory>;
  };

  export type Request = Base
  & ParentCategoryId;
}

export namespace Product {
  export type Id = Branding<string, 'product'>;

  export type ProductId = {
    productId: Id;
  };

  type Base = {
    brand: string;
    unitOfMeasurement: typeof unitsOfMeasurement[number];
    measurement: number;
  };

  type FullName = {
    fullName: string;
  };

  export type Document = Internal.Id
  & Internal.ExpiresAt
  & Partial<Internal.CreatedAt>
  & Partial<Internal.UpdatedAt>
  & Base
  & FullName;

  export type Response = Base
  & ProductId
  & FullName
  & Remove<Internal.CreatedAt>
  & Remove<Internal.UpdatedAt>
  & Remove<Internal.Id>
  & Remove<Internal.ExpiresAt>;

  export type Request = Base;
}

export namespace Transaction {
  export type Id = Branding<string, 'transaction'>;

  export type TransactionId = {
    transactionId: Id;
  };

  export type IssuedAt<D extends string | Date> = {
    issuedAt: D;
  };

  type TransactionType<T extends string = never> = {
    transactionType: T;
  };

  export type Base = {
    amount: number;
    description: string;
  };

  export type Quantity = {
    quantity: number;
  };

  export type InventoryItem<P> = Quantity & P;

  export type Inventory<P> = {
    inventory: InventoryItem<P>;
  };

  export type InvoiceItem<D extends string | Date> = {
    invoiceNumber: string;
    billingStartDate: D;
    billingEndDate: D;
  };

  export type Invoice<D extends string | Date> = {
    invoice: InvoiceItem<D>;
  };

  export type TransferAccountId = {
    transferAccountId: Account.Id;
  };

  export type TransferAmount ={
    transferAmount: number;
  };

  export type Category<C extends Category.Document | Category.Response> = {
    category: C;
  };

  export type Project<P extends Project.Document | Project.Response> = {
    project: P;
  };

  export type Account<A extends Account.Document | Account.Response> = {
    account: A;
  };

  export type Recipient<R extends Recipient.Document | Recipient.Response> = {
    recipient: R;
  };

  type TransferAccount<A extends Account.Document | Account.Response> = {
    transferAccount: A;
  };

  export type Product<P extends Product.Document | Product.Response> = {
    product: P;
  };

  export type PaymentRequest = Account.AccountId
  & Category.CategoryId
  & Project.ProjectId
  & Recipient.RecipientId
  & IssuedAt<string>
  & Invoice<string>
  & Inventory<Product.ProductId>
  & Base;

  export type TransferRequest = Account.AccountId
  & IssuedAt<string>
  & Base
  & TransferAccountId
  & TransferAmount;

  export type SplitRequestItem = Project.ProjectId
  & Category.CategoryId
  & Invoice<string>
  & Inventory<Product.ProductId>
  & Base;

  export type SplitRequest = Account.AccountId
  & Recipient.RecipientId
  & IssuedAt<string>
  & Base
  & {
    splits: SplitRequestItem[];
  };

  export type PaymentDocument = Internal.Id
  & Internal.ExpiresAt
  & Partial<Internal.CreatedAt>
  & Partial<Internal.UpdatedAt>
  & TransactionType<'payment'>
  & Remove<Account.AccountId>
  & Account<Account.Document>
  & Remove<Category.CategoryId>
  & Category<Category.Document>
  & Remove<Project.ProjectId>
  & Project<Project.Document>
  & Remove<Recipient.RecipientId>
  & Recipient<Recipient.Document>
  & IssuedAt<Date>
  & Invoice<Date>
  & Inventory<Product<Product.Document>>
  & Base;

  export type TransferDocument = Internal.Id
  & Internal.ExpiresAt
  & Partial<Internal.CreatedAt>
  & Partial<Internal.UpdatedAt>
  & TransactionType<'transfer'>
  & Remove<Account.AccountId>
  & Account<Account.Document>
  & IssuedAt<Date>
  & Remove<TransferAccountId>
  & TransferAccount<Account.Document>
  & TransferAmount
  & Base;

  export type SplitDocumentItem = Project<Project.Document>
  & Category<Category.Document>
  & Invoice<Date>
  & Inventory<Product<Product.Document>>
  & Base;

  export type SplitDocument = Internal.Id
  & Internal.ExpiresAt
  & Partial<Internal.CreatedAt>
  & Partial<Internal.UpdatedAt>
  & TransactionType<'split'>
  & Remove<Account.AccountId>
  & Account<Account.Document>
  & Remove<Recipient.RecipientId>
  & Recipient<Recipient.Document>
  & IssuedAt<Date>
  & Base
  & {
    splits: SplitDocumentItem[];
  };

  export type Document = PaymentDocument | TransferDocument | SplitDocument;

  export type PaymentResponse = TransactionId
  & Base
  & IssuedAt<string>
  & Invoice<string>
  & Inventory<Product<Product.Response>>
  & Remove<Internal.CreatedAt>
  & Remove<Internal.UpdatedAt>
  & Remove<Internal.Id>
  & Remove<Internal.ExpiresAt>
  & TransactionType<'payment'>
  & Account<Account.Response>
  & Category<Category.Response>
  & Project<Project.Response>
  & Recipient<Recipient.Response>;

  export type TransferResponse = TransactionId
  & Base
  & IssuedAt<string>
  & Remove<Internal.CreatedAt>
  & Remove<Internal.UpdatedAt>
  & Remove<Internal.Id>
  & Remove<Internal.ExpiresAt>
  & TransactionType<'transfer'>
  & Account<Account.Response>
  & TransferAccount<Account.Response>
  & TransferAmount;

  export type SplitResponseItem = Base
  & Invoice<string>
  & Inventory<Product<Product.Response>>
  & Project<Project.Response>
  & Category<Category.Response>;

  export type SplitResponse = TransactionId
  & Base
  & IssuedAt<string>
  & Remove<Internal.CreatedAt>
  & Remove<Internal.UpdatedAt>
  & Remove<Internal.Id>
  & Remove<Internal.ExpiresAt>
  & TransactionType<'split'>
  & Account<Account.Response>
  & Recipient<Recipient.Response>
  & {
    splits: SplitResponseItem[];
  };

  export type Response = PaymentResponse | TransferResponse | SplitResponse;

  export type ReportRequest = {
    groupedBy: typeof groupByProperties[number]
    accounts: Account.Id[];
    categories: Category.Id[];
    projects: Project.Id[];
    recipients: Recipient.Id[];
    issuedAtFrom: string;
    issuedAtTo: string;
  };

  export type ReportTransactionItem = TransactionId
  & Base
  & IssuedAt<Date>
  & {
    projectName: string;
    categoryName: string;
    recipientName: string;
    accountName: string;
  };

  export type ReportResponse = {
    [group: string]: {
      totalAmount: number;
      transactions: ReportTransactionItem[];
    };
  };
}

export namespace Auth {
  type IdTokenResponse = {
    idToken: string;
  };

  export namespace Registration {
    export type Request = {
      email: string;
      displayName: string;
      password: string;
    };
  }

  export namespace Login {

    export type Request = {
      email: string;
      password: string;
    };

    export type Response = IdTokenResponse & {
      refreshToken: string;
    };
  }

  export namespace RefreshToken {
    export type Request = {
      refreshToken: string;
    };

    export type Response = IdTokenResponse;
  }
}

export namespace Common {
  export type Pagination<P> = {
    pageSize: P;
    pageNumber: P;
  };
}
