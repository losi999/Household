import { unitsOfMeasurement } from '@household/shared/constants';
import { Branding } from '@household/shared/types/common';
import { Types } from 'mongoose';
import * as Enum from '@household/shared/enums';
import { UserStatusType } from '@aws-sdk/client-cognito-identity-provider';

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
  & ProjectId;

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
  & RecipientId;

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
    accountType: Enum.AccountType;
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
  & FullName;

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

  export type FullName = {
    fullName: string;
  };

  export type ParentCategoryId = {
    parentCategoryId: Id;
  };

  export type ParentCategory = {
    parentCategory: Document;
  };

  export type CategoryType = {
    categoryType: Enum.CategoryType;
  };

  type Name = {
    name: string;
  };

  export type Document = Internal.Id
  & Internal.Timestamps
  & CategoryType
  & Name
  & {
    ancestors: Document[];
    products?: Product.Document[];
  };

  export type Report = CategoryId
  & FullName;

  export type ResponseAncestor = CategoryType
  & Name
  & CategoryId;

  export type ResponseParent = ResponseAncestor & FullName;

  export type Response = ResponseAncestor
  & FullName
  & {
    ancestors: ResponseAncestor[];
    parentCategory: ResponseParent;
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
  & FullName;

  export type GroupedResponse = Category.FullName & Category.CategoryId & {
    products: Response[];
  };

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

  export type TransactionType<T extends Enum.TransactionType> = {
    transactionType: T;
  };

  export type LoanAccountId = {
    loanAccountId: Account.Id;
  };

  export type Amount = {
    amount: number;
  };

  export type Description = {
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

  type RemainingAmount = {
    remainingAmount: number;
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

  export type TransferAccount<A extends Account.Document | Account.Response> = {
    transferAccount: A;
  };

  export type PayingAccount<A extends Account.Document |Account.Response> = {
    payingAccount: A;
  };

  export type OwnerAccount<A extends Account.Document | Account.Response> = {
    ownerAccount: A;
  };

  export type IsSettled = {
    isSettled: boolean;
  };

  type Payments = {
    payments?: {
      transaction: Transaction.DeferredDocument;
      amount: number;
    }[]
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
  & Amount
  & Description
  & LoanAccountId
  & IsSettled;

  export type TransferRequest = Account.AccountId
  & IssuedAt<string>
  & Amount
  & Description
  & TransferAccountId
  & TransferAmount
  & {
    payments: (TransactionId & Amount)[];
  };

  export type SplitRequestItem = Category.CategoryId
  & Project.ProjectId
  & InvoiceNumber
  & InvoiceDate<string>
  & Quantity
  & Product.ProductId
  & Amount
  & Description;

  export type LoanRequestItem = Category.CategoryId
  & Project.ProjectId
  & InvoiceNumber
  & InvoiceDate<string>
  & Quantity
  & Product.ProductId
  & Amount
  & Description
  & LoanAccountId
  & IsSettled
  & TransactionId;

  export type SplitRequest = Account.AccountId
  & Recipient.RecipientId
  & IssuedAt<string>
  & Amount
  & Description
  & {
    splits: SplitRequestItem[];
    loans: LoanRequestItem[];
  };

  export type DraftDocument<D extends Date | string = Date> = Internal.Id
  & Internal.Timestamps
  & TransactionType<Enum.TransactionType.Draft>
  & Amount
  & Description
  & IssuedAt<D> & {
    file: File.Document
    hasDuplicate?: boolean;
  };

  type LoanDocument<D extends Date | string = Date> = Internal.Id
  & Internal.Timestamps
  & Category<Category.Document>
  & Project<Project.Document>
  & Recipient<Recipient.Document>
  & IssuedAt<D>
  & InvoiceNumber
  & InvoiceDate<D>
  & Quantity
  & Product<Product.Document>
  & Amount
  & Description
  & PayingAccount<Account.Document>
  & OwnerAccount<Account.Document>;

  export type DeferredDocument<D extends Date | string = Date> = LoanDocument<D>
  & TransactionType<Enum.TransactionType.Deferred>
  & IsSettled
  & Partial<RemainingAmount>;

  export type ReimbursementDocument<D extends Date | string = Date> = LoanDocument<D>
  & TransactionType<Enum.TransactionType.Reimbursement>;

  export type PaymentDocument<D extends Date | string = Date> = Internal.Id
  & Internal.Timestamps
  & TransactionType<Enum.TransactionType.Payment>
  & Account<Account.Document>
  & Category<Category.Document>
  & Project<Project.Document>
  & Recipient<Recipient.Document>
  & IssuedAt<D>
  & InvoiceNumber
  & InvoiceDate<D>
  & Quantity
  & Product<Product.Document>
  & Amount
  & Description;

  export type TransferDocument<D extends Date | string = Date> = Internal.Id
  & Internal.Timestamps
  & TransactionType<Enum.TransactionType.Transfer>
  & Account<Account.Document>
  & TransferAccount<Account.Document>
  & IssuedAt<D>
  & TransferAmount
  & Amount
  & Description
  & Payments;

  export type SplitDocumentItem<D extends Date | string = Date> = Project<Project.Document>
  & Category<Category.Document>
  & InvoiceNumber
  & InvoiceDate<D>
  & Quantity
  & Product<Product.Document>
  & Amount
  & Description;

  export type Splits<D extends Date | string = Date> = {
    splits: SplitDocumentItem<D>[];
    deferredSplits: DeferredDocument<D>[];
  };

  export type SplitDocument<D extends Date | string = Date> = Internal.Id
  & Internal.Timestamps
  & TransactionType<Enum.TransactionType.Split>
  & Account<Account.Document>
  & Recipient<Recipient.Document>
  & IssuedAt<D>
  & Amount
  & Description
  & Splits<D>;

  export type RawReport = Internal.Id
  & Account<Account.Document>
  & Category<Category.Document>
  & Project<Project.Document>
  & Recipient<Recipient.Document>
  & IssuedAt<Date>
  & InvoiceNumber
  & InvoiceDate<Date>
  & Quantity
  & Product<Product.Document>
  & Amount
  & Description;

  export type Document<D extends Date | string = Date > = PaymentDocument<D> | TransferDocument<D> | SplitDocument<D> | DraftDocument<D> | DeferredDocument<D> | ReimbursementDocument<D>;

  export type PaymentResponse = TransactionId
  & Amount
  & Description
  & IssuedAt<string>
  & InvoiceNumber
  & InvoiceDate<string>
  & Quantity
  & Product<Product.Response>
  & TransactionType<Enum.TransactionType.Payment>
  & Account<Account.Response>
  & Category<Category.Response>
  & Project<Project.Response>
  & Recipient<Recipient.Response>;

  export type DeferredResponse = TransactionId
  & Amount
  & Description
  & IssuedAt<string>
  & InvoiceNumber
  & InvoiceDate<string>
  & Quantity
  & IsSettled
  & Product<Product.Response>
  & TransactionType<Enum.TransactionType.Deferred>
  & PayingAccount<Account.Response>
  & OwnerAccount<Account.Response>
  & Category<Category.Response>
  & Project<Project.Response>
  & Recipient<Recipient.Response>
  & RemainingAmount;

  export type ReimbursementResponse = TransactionId
  & Amount
  & Description
  & IssuedAt<string>
  & InvoiceNumber
  & InvoiceDate<string>
  & Quantity
  & Product<Product.Response>
  & TransactionType<Enum.TransactionType.Reimbursement>
  & PayingAccount<Account.Response>
  & OwnerAccount<Account.Response>
  & Category<Category.Response>
  & Project<Project.Response>
  & Recipient<Recipient.Response>;

  export type TransferResponse = TransactionId
  & Amount
  & Description
  & IssuedAt<string>
  & TransactionType<Enum.TransactionType.Transfer>
  & Account<Account.Response>
  & TransferAccount<Account.Response>
  & TransferAmount
  & {
    payments: ({
      transaction: Transaction.DeferredResponse;
    } & Amount)[];
  };

  export type SplitResponseItem = Amount
  & Description
  & InvoiceNumber
  & InvoiceDate<string>
  & Quantity
  & Product<Product.Response>
  & Project<Project.Response>
  & Category<Category.Response>;

  export type SplitResponse = TransactionId
  & Amount
  & Description
  & IssuedAt<string>
  & TransactionType<Enum.TransactionType.Split>
  & Account<Account.Response>
  & Recipient<Recipient.Response>
  & {
    splits: SplitResponseItem[];
    deferredSplits: DeferredResponse[];
  };

  export type DraftResponse = TransactionId
  & Amount
  & Description
  & IssuedAt<string>
  & TransactionType<Enum.TransactionType.Draft>
  & {
    hasDuplicate: boolean;
  };

  export type Response = PaymentResponse | TransferResponse | SplitResponse | DeferredResponse | ReimbursementResponse;

  export type Report = TransactionId
  & Amount
  & Description
  & IssuedAt<string>
  & Account<Account.Report>
  & Category<Category.Report>
  & Project<Project.Report>
  & Recipient<Recipient.Report>
  & Product<Product.Report>
  & InvoiceNumber
  & InvoiceDate<string>;
}

export namespace Report {
  type FilterBase<T extends string> = {
    include: boolean;
    filterType: T
  };

  export type IssuedAtFilter = FilterBase<'issuedAt'> & {
    from: string;
    to: string;
  };

  export type AccountFilter = FilterBase<'account'> & {
    items: Account.Id[];
  };

  export type CategoryFilter = FilterBase<'category'> & {
    items: Category.Id[];
  };

  export type ProjectFilter = FilterBase<'project'> & {
    items: Project.Id[];
  };

  export type ProductFilter = FilterBase<'product'> & {
    items: Product.Id[];
  };

  export type RecipientFilter =FilterBase<'recipient'> & {
    items: Recipient.Id[];
  };

  export type CatalogItemFilter = AccountFilter | CategoryFilter | ProjectFilter | ProductFilter | RecipientFilter;

  export type Filter = IssuedAtFilter | CatalogItemFilter;

  export type Request = Filter[];
}

export namespace Setting {
  export type Id = Branding<string, 'settings'>;

  type Base = {
    value: string | number | boolean;
  };

  export type SettingKey = {
    settingKey: Id;
  };

  export type Request = Base;

  export type Document = Base
  & SettingKey
  & Internal.Timestamps;

  export type Response = Base & SettingKey;
}

export namespace User {
  export type Email = {
    email: string
  };

  export type Request = Email;

  export type Response = Email & {
    status: UserStatusType;
  };
}

export namespace Auth {
  export type Password = {
    password: string;
  };

  type IdTokenResponse = {
    idToken: string;
  };

  export namespace ConfirmUser {
    export type Request = Password & {
      temporaryPassword: string;
    };
  }

  export namespace Login {
    export type Request = User.Email
    & Password;

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

  export type FileType = {
    fileType: Enum.FileType;
  };

  export type Timezone = {
    timezone: string;
  };

  export type Url = {
    url: string;
  };

  export type ProcessingStatus = {
    processingStatus: Enum.FileProcessingStatus;
  };

  export type DraftCount = {
    draftCount: number;
  };

  export type Request = FileType & Timezone;
  export type Document = Internal.Id
  & Internal.Timestamps
  & FileType
  & Timezone
  & Partial<ProcessingStatus>
  & Partial<DraftCount>;

  export type Response = FileId
  & FileType
  & DraftCount
  & {
    uploadedAt: string;
  };
}

export namespace Common {
  export type Pagination<P extends string | number> = {
    pageSize: P;
    pageNumber: P;
  };
}
