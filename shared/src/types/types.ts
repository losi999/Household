import { categoryTypes, unitsOfMeasurement } from '@household/shared/constants';
import { Brand, Remove } from '@household/shared/types/common';
import { Types } from 'mongoose';

namespace Internal {
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
  export type IdType = Brand<string, 'project'>;

  export type Id = {
    projectId: IdType;
  };

  type Base = {
    name: string;
    description: string;
  };

  export type Document = Partial<Internal.Id>
  & Internal.ExpiresAt
  & Partial<Internal.CreatedAt>
  & Partial<Internal.UpdatedAt>
  & Base;

  export type Response = Base
  & Id
  & Remove<Internal.CreatedAt>
  & Remove<Internal.UpdatedAt>
  & Remove<Internal.Id>
  & Remove<Internal.ExpiresAt>;

  export type Request = Base;
}

export namespace Recipient {
  export type IdType = Brand<string, 'recipient'>;

  export type Id = {
    recipientId: IdType;
  };

  type Base = {
    name: string;
  };

  export type Document = Partial<Internal.Id>
  & Internal.ExpiresAt
  & Partial<Internal.CreatedAt>
  & Partial<Internal.UpdatedAt>
  & Base;

  export type Response = Base
  & Id
  & Remove<Internal.CreatedAt>
  & Remove<Internal.UpdatedAt>
  & Remove<Internal.Id>
  & Remove<Internal.ExpiresAt>;

  export type Request = Base;
}

export namespace Account {
  export type IdType = Brand<string, 'account'>;

  export type Id = {
    accountId: IdType;
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

  export type Document = Partial<Internal.Id>
  & Internal.ExpiresAt
  & Partial<Internal.CreatedAt>
  & Partial<Internal.UpdatedAt>
  & Base
  & IsOpen
  & Partial<Balance>;

  export type Response = Base
  & IsOpen
  & Balance
  & Id
  & Remove<Internal.CreatedAt>
  & Remove<Internal.UpdatedAt>
  & Remove<Internal.Id>
  & Remove<Internal.ExpiresAt>;

  export type Request = Base;
}

export namespace Category {
  export type IdType = Brand<string, 'category'>;

  export type Id = {
    categoryId: IdType;
  };

  type FullName = {
    fullName: string;
  };

  type ParentCategoryId = {
    parentCategoryId: IdType;
  };

  type ParentCategory = {
    parentCategory: Document;
  };

  type Base = {
    categoryType: typeof categoryTypes[number];
    name: string;
  };

  export type Document = Partial<Internal.Id>
  & Internal.ExpiresAt
  & Partial<Internal.CreatedAt>
  & Partial<Internal.UpdatedAt>
  & Base
  & FullName
  & Remove<ParentCategoryId>
  & ParentCategory;

  export type Response = Base
  & FullName
  & Id
  & Remove<Internal.CreatedAt>
  & Remove<Internal.UpdatedAt>
  & Remove<Internal.Id>
  & Remove<Internal.ExpiresAt>
  & {
    parentCategory: Category.Response;
  };

  export type Request = Base
  & ParentCategoryId;
}

export namespace Transaction {
  export type IdType = Brand<string, 'transaction'>;

  export type Id = {
    transactionId: IdType;
  };

  type IssuedAt<D extends string | Date> = {
    issuedAt: D;
  };

  type TransactionType<T extends string = never> = {
    transactionType: T;
  };

  type Base = {
    amount: number;
    description: string;
  };

  export type Inventory = {
    inventory: {
      quantity: number;
      brand: string;
      unitOfMeasurement: typeof unitsOfMeasurement[number];
      measurement: number;
    };
  };

  export type Invoice<D extends string | Date> = {
    invoice: {
      invoiceNumber: string;
      billingStartDate: D;
      billingEndDate: D;
    };
  };

  type TransferAccountId = {
    transferAccountId: Account.IdType;
  };

  type Category<C extends Category.Document | Category.Response> = {
    category: C;
  };

  type Project<P extends Project.Document | Project.Response> = {
    project: P;
  };

  type Account<A extends Account.Document | Account.Response> = {
    account: A;
  };

  type Recipient<R extends Recipient.Document | Recipient.Response> = {
    recipient: R;
  };

  type TransferAccount<A extends Account.Document | Account.Response> = {
    transferAccount: A;
  };

  export type PaymentRequest = Account.Id
  & Category.Id
  & Project.Id
  & Recipient.Id
  & IssuedAt<string>
  & Invoice<string>
  & Inventory
  & Base;

  export type TransferRequest = Account.Id
  & IssuedAt<string>
  & Base
  & TransferAccountId;

  type SplitRequestItem = Project.Id
  & Category.Id
  & Invoice<string>
  & Inventory
  & Base;

  export type SplitRequest = Account.Id
  & Recipient.Id
  & IssuedAt<string>
  & Base
  & {
    splits: SplitRequestItem[];
  };

  export type PaymentDocument = Partial<Internal.Id>
  & Internal.ExpiresAt
  & Partial<Internal.CreatedAt>
  & Partial<Internal.UpdatedAt>
  & TransactionType<'payment'>
  & Remove<Account.Id>
  & Account<Account.Document>
  & Remove<Category.Id>
  & Category<Category.Document>
  & Remove<Project.Id>
  & Project<Project.Document>
  & Remove<Recipient.Id>
  & Recipient<Recipient.Document>
  & IssuedAt<Date>
  & Invoice<Date>
  & Inventory
  & Base;

  export type TransferDocument = Partial<Internal.Id>
  & Internal.ExpiresAt
  & Partial<Internal.CreatedAt>
  & Partial<Internal.UpdatedAt>
  & TransactionType<'transfer'>
  & Remove<Account.Id>
  & Account<Account.Document>
  & IssuedAt<Date>
  & Remove<TransferAccountId>
  & TransferAccount<Account.Document>
  & Base;

  type SplitDocumentItem = Project<Project.Document>
  & Category<Category.Document>
  & Invoice<Date>
  & Inventory
  & Base;

  export type SplitDocument = Partial<Internal.Id>
  & Internal.ExpiresAt
  & Partial<Internal.CreatedAt>
  & Partial<Internal.UpdatedAt>
  & TransactionType<'split'>
  & Remove<Account.Id>
  & Account<Account.Document>
  & Remove<Recipient.Id>
  & Recipient<Recipient.Document>
  & IssuedAt<Date>
  & Base
  & {
    splits: SplitDocumentItem[];
  };

  export type Document = PaymentDocument | TransferDocument | SplitDocument;

  export type PaymentResponse = Id
  & Base
  & IssuedAt<string>
  & Invoice<string>
  & Inventory
  & Remove<Internal.CreatedAt>
  & Remove<Internal.UpdatedAt>
  & Remove<Internal.Id>
  & Remove<Internal.ExpiresAt>
  & TransactionType<'payment'>
  & Account<Account.Response>
  & Category<Category.Response>
  & Project<Project.Response>
  & Recipient<Recipient.Response>;

  export type TransferResponse = Id
  & Base
  & IssuedAt<string>
  & Remove<Internal.CreatedAt>
  & Remove<Internal.UpdatedAt>
  & Remove<Internal.Id>
  & Remove<Internal.ExpiresAt>
  & TransactionType<'transfer'>
  & Account<Account.Response>
  & TransferAccount<Account.Response>;

  export type SplitResponseItem = Base
  & Invoice<string>
  & Inventory
  & Project<Project.Response>
  & Category<Category.Response>;

  export type SplitResponse = Id
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
}

export namespace Auth {
  type IdTokenResponse = {
    idToken: string;
  };

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
