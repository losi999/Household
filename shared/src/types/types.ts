import { categoryTypes, fileProcessingStatuses, fileTypes, unitsOfMeasurement } from '@household/shared/constants';
import { Branding, Remove } from '@household/shared/types/common';
import { Types } from 'mongoose';

export namespace Internal {
  export type Id = {
    _id: Types.ObjectId;
  };

  export type Timestamps = {
    expiresAt: Date;
    createdAt?: Date;
    updatedAt?: Date;
  };
}

export namespace Project {
  export type Id = Branding<string, 'project'>;

  export type ProjectId = {
    projectId: Id;
  };

  type Name = {
    name: string;
  };

  type Description = {
    description: string;
  };

  type Base = Name
  & Description;

  export type Document = Internal.Id
  & Internal.Timestamps
  & Base;

  export type Response = Base
  & ProjectId
  & Remove<Internal.Id>
  & Remove<Internal.Timestamps>;

  export type Report = ProjectId
  & Name;

  export type Request = Base;
}

export namespace Recipient {
  export type Id = Branding<string, 'recipient'>;

  export type RecipientId = {
    recipientId: Id;
  };

  type Name = {
    name: string;
  };

  export type Document = Internal.Id
  & Internal.Timestamps
  & Name;

  export type Response = Name
  & RecipientId
  & Remove<Internal.Id>
  & Remove<Internal.Timestamps>;

  export type Report = RecipientId
  & Name;

  export type Request = Name;
}

export namespace Account {
  export type Id = Branding<string, 'account'>;

  export type AccountId = {
    accountId: Id;
  };

  type IsOpen = {
    isOpen: boolean;
  };

  type Name = {
    name: string;
  };

  type Currency = {
    currency: string;
  };

  export type AccountType = {
    accountType: 'bankAccount' | 'cash' | 'creditCard' | 'loan' | 'cafeteria';
  };

  type Owner = {
    owner: string;
  };

  type FullName = {
    fullName: string;
  };

  type Base = Name
  & Currency
  & AccountType
  & Owner;

  type Balance = {
    balance: number;
  };

  export type Document = Internal.Id
  & Internal.Timestamps
  & Base
  & IsOpen
  & Partial<Balance>;

  export type Response = Base
  & IsOpen
  & Balance
  & AccountId
  & FullName
  & Remove<Internal.Id>
  & Remove<Internal.Timestamps>;

  export type Report = AccountId
  & FullName
  & Currency;

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

  export type ParentCategory = {
    parentCategory: Document;
  };

  export type CategoryType = {
    categoryType: typeof categoryTypes[number];
  };

  type Name = {
    name: string;
  };

  type Products<T extends Product.Document | Product.Response> = {
    products: T[];
  };

  export type Document = Internal.Id
  & Internal.Timestamps
  & CategoryType
  & Name
  & FullName
  & Remove<ParentCategoryId>
  & ParentCategory
  & Partial<Products<Product.Document>>;

  export type Report = CategoryId
  & FullName;

  export type ResponseBase = CategoryType
  & Name
  & FullName
  & CategoryId
  & Products<Product.Response>
  & Remove<Internal.Id>
  & Remove<Internal.Timestamps>
  & Remove<ParentCategoryId>
  & Record<'parentCategory', undefined>;

  export type Response = Omit<ResponseBase, 'parentCategory'>
  & {
    parentCategory: ResponseBase;
  };

  export type Request = CategoryType
  & Name
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

  export type FullName = {
    fullName: string;
  };

  export type Document = Internal.Id
  & Internal.Timestamps
  & Base
  & FullName
  & {
    category: Category.Document;
  };

  export type Response = Base
  & ProductId
  & FullName
  & Record<'category', undefined>
  & Remove<Internal.Id>
  & Remove<Internal.Timestamps>;

  export type Report = ProductId
  & FullName
  & Transaction.Quantity;

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

  export type InvoiceNumber = {
    invoiceNumber: string;
  };

  export type InvoiceDate<D extends string | Date> = {
    billingStartDate: D;
    billingEndDate: D;
  };

  export type TransferAccountId = {
    transferAccountId: Account.Id;
  };

  export type TransferAmount ={
    transferAmount: number;
  };

  export type Category<C extends Category.Document | Category.Response | Category.Report> = {
    category: C;
  };

  export type Project<P extends Project.Document | Project.Response | Project.Report> = {
    project: P;
  };

  export type Account<A extends Account.Document | Account.Response | Account.Report> = {
    account: A;
  };

  export type Recipient<R extends Recipient.Document | Recipient.Response | Recipient.Report> = {
    recipient: R;
  };

  export type Product<P extends Product.Document | Product.Response | Product.Report> = {
    product: P;
  };

  type TransferAccount<A extends Account.Document | Account.Response> = {
    transferAccount: A;
  };

  export type PaymentRequest = Account.AccountId
  & Category.CategoryId
  & Project.ProjectId
  & Recipient.RecipientId
  & IssuedAt<string>
  & InvoiceNumber
  & InvoiceDate<string>
  & Quantity
  & Product.ProductId
  & Base;

  export type TransferRequest = Account.AccountId
  & IssuedAt<string>
  & Base
  & TransferAccountId
  & TransferAmount;

  export type SplitRequestItem = Category.CategoryId
  & Project.ProjectId
  & InvoiceNumber
  & InvoiceDate<string>
  & Quantity
  & Product.ProductId
  & Base;

  export type SplitRequest = Account.AccountId
  & Recipient.RecipientId
  & IssuedAt<string>
  & Base
  & {
    splits: SplitRequestItem[];
  };

  export type DraftDocument<D extends Date | string = Date> = Internal.Id
  & Internal.Timestamps
  & TransactionType<'draft'>
  & Base
  & IssuedAt<D> & {
    file: File.Document
  };

  export type PaymentDocument<D extends Date | string = Date> = Internal.Id
  & Internal.Timestamps
  & TransactionType<'payment'>
  & Remove<Account.AccountId>
  & Remove<Category.CategoryId>
  & Remove<Project.ProjectId>
  & Remove<Recipient.RecipientId>
  & Remove<Product.ProductId>
  & Account<Account.Document>
  & Category<Category.Document>
  & Project<Project.Document>
  & Recipient<Recipient.Document>
  & IssuedAt<D>
  & InvoiceNumber
  & InvoiceDate<D>
  & Quantity
  & Product<Product.Document>
  & Base;

  export type TransferDocument<D extends Date | string = Date> = Internal.Id
  & Internal.Timestamps
  & TransactionType<'transfer'>
  & Remove<Account.AccountId>
  & Account<Account.Document>
  & IssuedAt<D>
  & Remove<TransferAccountId>
  & TransferAccount<Account.Document>
  & TransferAmount
  & Base;

  export type SplitDocumentItem<D extends Date | string = Date> = Project<Project.Document>
  & Category<Category.Document>
  & Remove<Project.ProjectId>
  & Remove<Category.CategoryId>
  & Remove<Product.ProductId>
  & InvoiceNumber
  & InvoiceDate<D>
  & Quantity
  & Product<Product.Document>
  & Base;

  export type SplitDocument<D extends Date | string = Date> = Internal.Id
  & Internal.Timestamps
  & TransactionType<'split'>
  & Remove<Account.AccountId>
  & Remove<Recipient.RecipientId>
  & Account<Account.Document>
  & Recipient<Recipient.Document>
  & IssuedAt<D>
  & Base
  & {
    splits: SplitDocumentItem<D>[];
  };

  export type Document<D extends Date | string = Date > = PaymentDocument<D> | TransferDocument<D> | SplitDocument<D> | DraftDocument<D>;

  export type PaymentResponse = TransactionId
  & Base
  & IssuedAt<string>
  & InvoiceNumber
  & InvoiceDate<string>
  & Quantity
  & Product<Product.Response>
  & Remove<Internal.Id>
  & Remove<Internal.Timestamps>
  & TransactionType<'payment'>
  & Account<Account.Response>
  & Category<Category.Response>
  & Project<Project.Response>
  & Recipient<Recipient.Response>;

  export type TransferResponse = TransactionId
  & Base
  & IssuedAt<string>
  & Remove<Internal.Id>
  & Remove<Internal.Timestamps>
  & TransactionType<'transfer'>
  & Account<Account.Response>
  & TransferAccount<Account.Response>
  & TransferAmount;

  export type SplitResponseItem = Base
  & InvoiceNumber
  & InvoiceDate<string>
  & Quantity
  & Product<Product.Response>
  & Project<Project.Response>
  & Category<Category.Response>;

  export type SplitResponse = TransactionId
  & Base
  & IssuedAt<string>
  & Remove<Internal.Id>
  & Remove<Internal.Timestamps>
  & TransactionType<'split'>
  & Account<Account.Response>
  & Recipient<Recipient.Response>
  & {
    splits: SplitResponseItem[];
  };

  export type Response = PaymentResponse | TransferResponse | SplitResponse;

  export type Report = TransactionId
  & Base
  & IssuedAt<string>
  & Account<Account.Report>
  & Category<Category.Report>
  & Project<Project.Report>
  & Recipient<Recipient.Report>
  & Product<Product.Report>;
}

export namespace Report {
  type Filters = {
    accountIds: Account.Id[];
    categoryIds: Category.Id[];
    projectIds: Project.Id[];
    productIds: Product.Id[];
    recipientIds: Recipient.Id[];
    issuedAtFrom: string;
    issuedAtTo: string;
  };

  export type Request = Filters;
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

export namespace File {
  export type Id = Branding<string, 'file'>;

  export type FileId = {
    fileId: Id;
  };

  export type Type = {
    type: typeof fileTypes[number];
  };

  export type Timezone = {
    timezone: string;
  };

  export type Url = {
    url: string;
  };

  export type ProcessingStatus = {
    processingStatus: typeof fileProcessingStatuses[number];
  };

  // export type FileName = {
  //   fileName: string;
  // };

  export type Request = Type & Timezone;
  export type Document = Internal.Id
  & Internal.Timestamps
  & Type
  & Timezone
  & Partial<ProcessingStatus>;
}

export namespace Common {
  export type Pagination<P extends string | number> = {
    pageSize: P;
    pageNumber: P;
  };
}
