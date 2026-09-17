import { Api } from '@household/shared/types/api';
import type { Types } from 'mongoose';
import * as Enum from '@household/shared/enums';

export namespace Documents {
  export type Id = {
    _id: Types.ObjectId;
  };

  type Timestamps = {
    expiresAt: Date;
    createdAt?: Date;
    updatedAt?: Date;
  };

  export type Account = Id & Timestamps & Api.Account.Base & Partial<Api.Account.Balance> & Api.Account.IsOpen;

  export type Project = Id & Timestamps & Api.Project.Base;

  export type Recipient = Id & Timestamps & Api.Recipient.Base;

  export type Category = Id & Timestamps & Api.Category.Base & {
    ancestors: Category[];
    products?: Product[];
  };

  export type Product = Id & Timestamps & Api.Product.Base & Api.Product.FullName & {
    category: Category;
  };
  
  export type PaymentTransaction = Id
    & Timestamps
    & Api.Transaction.Amount
    & Api.Transaction.Description
    & Api.Transaction.IssuedAt<Date>
    & Api.Transaction.InvoiceNumber
    & Api.Transaction.InvoiceDate<Date>
    & Api.Transaction.Quantity
    & Api.Transaction.TransactionType<Enum.TransactionType.Payment>
    & {
      product: Product;
      account: Account;
      category: Category;
      project: Project;
      recipient: Recipient;
    };
  
  export type DeferredTransaction = Id
    & Timestamps
    & Api.Transaction.Amount
    & Api.Transaction.Description
    & Api.Transaction.IssuedAt<Date>
    & Api.Transaction.InvoiceNumber
    & Api.Transaction.InvoiceDate<Date>
    & Api.Transaction.Quantity
    & Api.Transaction.TransactionType<Enum.TransactionType.Deferred>
    & {
      product: Product;
      payingAccount: Account;
      ownerAccount: Account;
      category: Category;
      project: Project;
      recipient: Recipient;
    };
  
  export type ReimbursementTransaction = Id
    & Timestamps
    & Api.Transaction.Amount
    & Api.Transaction.Description
    & Api.Transaction.IssuedAt<Date>
    & Api.Transaction.InvoiceNumber
    & Api.Transaction.InvoiceDate<Date>
    & Api.Transaction.Quantity
    & Api.Transaction.TransactionType<Enum.TransactionType.Reimbursement>
    & {
      product: Product;
      payingAccount: Account;
      ownerAccount: Account;
      category: Category;
      project: Project;
      recipient: Recipient;
    };
  
  export type TransferTransaction = Id
    & Timestamps
    & Api.Transaction.Amount
    & Api.Transaction.Description
    & Api.Transaction.IssuedAt<Date>
    & Api.Transaction.TransactionType<Enum.TransactionType.Transfer>
    & Api.Transaction.TransferAmount
    & {
      account: Account;
      transferAccount: Account;
    };
  
  export type SplitItem = Api.Transaction.Amount
    & Api.Transaction.Description
    & Api.Transaction.InvoiceNumber
    & Api.Transaction.InvoiceDate<Date>
    & Api.Transaction.Quantity
    & {
      product: Product;
      category: Category;
      project: Project;
    };
  
  export type SplitTransaction = Id
    & Timestamps
    & Api.Transaction.Amount
    & Api.Transaction.Description
    & Api.Transaction.IssuedAt<Date>
    & Api.Transaction.TransactionType<Enum.TransactionType.Split>
    & {
      account: Account;
      recipient: Recipient;
      splits: SplitItem[];
      deferredSplits: DeferredTransaction[];
    };
  
  export type DraftTransaction = Id
    & Timestamps
    & Api.Transaction.Amount
    & Api.Transaction.Description
    & Api.Transaction.IssuedAt<Date>
    & Api.Transaction.TransactionType<Enum.TransactionType.Draft>
    & {
      file: File;
      potentialDuplicates?: Exclude<Transaction, DraftTransaction>[];
    };
  
  export type Transaction = PaymentTransaction | TransferTransaction | DeferredTransaction | ReimbursementTransaction | SplitTransaction | DraftTransaction;

  export type RawTransaction = Id
  & Api.Transaction.IssuedAt<Date>
  & Api.Transaction.InvoiceNumber
  & Api.Transaction.InvoiceDate<Date>
  & Api.Transaction.Quantity
  & Api.Transaction.Amount
  & Api.Transaction.Description
  & {
    account: Account;
    category: Category;
    project: Project;
    product: Product;
    recipient: Recipient;
  };

  export type File = Id & Timestamps & Api.File.FileType & Api.File.Timezone & Partial<Api.File.ProcessingStatus> & Partial<Api.File.DraftCount>;

  export type Setting<V extends string | number | boolean = string | number | boolean> = Partial<Id> & Timestamps & Api.Setting.SettingKey & { value: V };

  export type Price = Id
    & Timestamps
    & Api.Price.Base
    & Api.IsArchived;

  type CustomerJobCost = Api.Customer.Job.AdditionalPrice & {
    prices: ({
      price: Price
    } & Api.Customer.Job.Quantity)[];
  };

  export type CustomerJob = Api.Customer.Job.Base & CustomerJobCost;

  export type Customer = Id 
    & Timestamps
    & Api.IsArchived
    & Api.Customer.Base
    & {
      blacklistedCustomers: Customer[];
      jobs: CustomerJob[];
    };

  export type CalendarDay = Partial<Id> // TODO ???
    & Timestamps
    & Api.Calendar.DayType
    & Api.Calendar.Day
    & Api.Calendar.TimeInterval;

  export type CalendarEntry = Id
    & Timestamps
    & Api.Calendar.Entry.Base
    & Api.Calendar.Day
    & Api.Calendar.Entry.EntryType
    & CustomerJobCost
    & {
      resolution: Api.Calendar.Entry.Delay & Api.Calendar.Entry.Status
      transaction: PaymentTransaction;
      customer: Customer;
    };
}
