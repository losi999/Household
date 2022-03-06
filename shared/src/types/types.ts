import { Brand, Remove } from '@household/shared/types/common';
import { Types } from 'mongoose'

namespace Internal {
  export type Id = {
    _id: Types.ObjectId;
  };

  export type ExpiresAt = {
    expiresAt: Date;
  }

  export type CreatedAt = {
    createdAt: Date;
  }

  export type UpdatedAt = {
    updatedAt: Date;
  }
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

  type Base = {
    name: string;
    currency: string;
  };

  type Balance = {
    balance: number;
  }

  export type Document = Partial<Internal.Id>
    & Internal.ExpiresAt
    & Partial<Internal.CreatedAt>
    & Partial<Internal.UpdatedAt>
    & Base
    & IsOpen
    & Balance;

  export type Response = Base
    & IsOpen
    & Balance
    & Id
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
  }

  type Base = {
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
    & Remove<Internal.Id>
    & Remove<Internal.ExpiresAt>
    & Partial<Internal.CreatedAt>
    & Partial<Internal.UpdatedAt>
    & ParentCategoryId
    & Remove<ParentCategory>
    & {
      children: Response[];
    };

  export type Request = Base
    & ParentCategoryId;
}

export namespace Transaction {
  export type IdType = Brand<string, 'transaction'>;

  export type Id = {
    transactionId: IdType;
  };

  type IssuedAtText = {
    issuedAt: string;
  };

  type IssuedAtDate = {
    issuedAt: Date;
  };

  type TransactionType<T extends string = never> = {
    transactionType: T;
  };

  type Base = {
    amount: number;
    description: string;

  };

  type TransferAccountId = {
    transferAccountId: Account.IdType;
  };

  type Category = {
    category: Category.Document;
  };

  type Project = {
    project: Project.Document;
  };

  type Account = {
    account: Account.Document;
  };

  type Recipient = {
    recipient: Recipient.Document;
  };

  type TransferAccount = {
    transferAccount: Account.Document;
  };

  export type PaymentRequest = Account.Id
    & Category.Id
    & Project.Id
    & Recipient.Id
    & IssuedAtText
    & Base;

  export type TransferRequest = Account.Id
    & IssuedAtText
    & Base
    & TransferAccountId;

  export type SplitRequest = Account.Id
    & Recipient.Id
    & IssuedAtText
    & Base
    & {
      splits: (Project.Id
        & Category.Id
        & Base)[];
    };

  export type PaymentDocument = Partial<Internal.Id>
    & Internal.ExpiresAt
    & Partial<Internal.CreatedAt>
    & Partial<Internal.UpdatedAt>
    & TransactionType<'payment'>
    & Remove<Account.Id>
    & Account
    & Remove<Category.Id>
    & Category
    & Remove<Project.Id>
    & Project
    & Remove<Recipient.Id>
    & Recipient
    & IssuedAtDate
    & Base;

  export type TransferDocument = Partial<Internal.Id>
    & Internal.ExpiresAt
    & Partial<Internal.CreatedAt>
    & Partial<Internal.UpdatedAt>
    & TransactionType<'transfer'>
    & Remove<Account.Id>
    & Account
    & IssuedAtDate
    & Remove<TransferAccountId>
    & TransferAccount
    & Base;

  export type SplitDocument = Partial<Internal.Id>
    & Internal.ExpiresAt
    & Partial<Internal.CreatedAt>
    & Partial<Internal.UpdatedAt>
    & TransactionType<'split'>
    & Remove<Account.Id>
    & Account
    & Remove<Recipient.Id>
    & Recipient
    & IssuedAtDate
    & Base
    & {
      splits: (Project
        & Category
        & Base)[];
    };

  export type Document = PaymentDocument | TransferDocument | SplitDocument;

  export type PaymentResponse = Id
    & Base
    & IssuedAtText
    & Remove<Internal.Id>
    & Remove<Internal.ExpiresAt>
    & TransactionType<'payment'>
    & {
      account: Account.Response;
      category: Category.Response;
      recipient: Recipient.Response;
      project: Project.Response;
    };

  export type TransferResponse = Id
    & Base
    & IssuedAtText
    & Remove<Internal.Id>
    & Remove<Internal.ExpiresAt>
    & TransactionType<'transfer'>
    & {
      account: Account.Response;
      transferAccount: Account.Response;
    };

  export type SplitResponse = Id
    & Base
    & IssuedAtText
    & Remove<Internal.Id>
    & Remove<Internal.ExpiresAt>
    & TransactionType<'split'>
    & {
      account: Account.Response;
      recipient: Recipient.Response;
      splits: (Base & {
        project: Project.Response;
        category: Category.Response;
      })[];
    };

  export type Response = PaymentResponse | TransferResponse | SplitResponse;
}