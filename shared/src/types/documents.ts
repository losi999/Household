import { Api } from '@household/shared/types/api';
import { Internal } from '@household/shared/types/types';
import type { Types } from 'mongoose';
import * as Enum from '@household/shared/enums';

export namespace Documents {
  type Id = {
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
  
  export type PaymentTransaction = Internal.Id
    & Internal.Timestamps
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
  
  export type DeferredTransaction = Internal.Id
    & Internal.Timestamps
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
  
  export type ReimbursementTransaction = Internal.Id
    & Internal.Timestamps
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
  
  export type TransferTransaction = Internal.Id
    & Internal.Timestamps
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
  
  export type SplitTransaction = Internal.Id
    & Internal.Timestamps
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
  
  export type DraftTransaction = Internal.Id
    & Internal.Timestamps
    & Api.Transaction.Amount
    & Api.Transaction.Description
    & Api.Transaction.IssuedAt<Date>
    & Api.Transaction.TransactionType<Enum.TransactionType.Draft>
    & {
      file: File;
      potentialDuplicates?: Exclude<Transaction, DraftTransaction>[];
    };
  
  export type Transaction = PaymentTransaction | TransferTransaction | DeferredTransaction | ReimbursementTransaction | SplitTransaction | DraftTransaction;

  export type RawTransaction = Internal.Id
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
}
