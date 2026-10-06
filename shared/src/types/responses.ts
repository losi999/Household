import { Api } from '@household/shared/types/api';
import * as Enum from '@household/shared/enums';

export namespace Responses {
  export type Account = Api.Account.Base &
    Api.Account.IsOpen &
    Api.Account.AccountId &
    Api.Account.FullName &
    Api.Account.Balance;

  export type AccountLean = Api.Account.Base &
    Api.Account.IsOpen &
    Api.Account.AccountId &
    Api.Account.FullName;

  export type AccountReport = Api.Account.AccountId &
    Api.Account.FullName &
    Api.Account.Currency;

  export type Project = Api.Project.Base &
    Api.Project.ProjectId;

  export type ProjectReport = Api.Project.ProjectId &
    Api.Project.Name;

  export type Recipient = Api.Recipient.Base &
    Api.Recipient.RecipientId;

  export type RecipientReport = Api.Recipient.RecipientId &
    Api.Recipient.Name;

  type CategoryLean = Api.Category.CategoryType 
    & Api.Category.Name 
    & Api.Category.CategoryId 
    & Api.Category.FullName; 

  export type Category = CategoryLean
    & {
      parentCategory: CategoryLean;
    };

  export type CategoryReport = Api.Category.CategoryId &
    Api.Category.FullName;

  export type GenericProduct = Api.Product.ProductId
    & Api.Product.ProductType<Enum.ProductType.Generic> 
    & Api.Product.Name;
  export type SpecificProduct = Api.Product.ProductId
    & Api.Product.ProductType<Enum.ProductType.Specific> 
    & Api.Product.UnitOfMeasurement
    & Api.Product.Measurement
    & Api.Product.Name
    & Api.Product.FullName
    & {
      genericProduct: GenericProduct;
    };
  export type VariantProduct = Api.Product.ProductId
    & Api.Product.ProductType<Enum.ProductType.Variant> 
    & Api.Product.Name
    & {
      genericProduct: GenericProduct;
      specificProduct: SpecificProduct;
    };    

  export type Product = GenericProduct | SpecificProduct | VariantProduct;

  export type ProductReport = Api.Product.ProductId &
    Api.Product.FullName;

  export type ProductTree = (GenericProduct & {
    children: (Omit<SpecificProduct, 'genericProduct'> & {
      children: Omit<VariantProduct, 'genericProduct' | 'specificProduct'>[];
    })[];
  });

  export type PaymentTransaction = Api.Transaction.TransactionId
    & Api.Transaction.Amount
    & Api.Transaction.Description
    & Api.Transaction.IssuedAt<string>
    & Api.Transaction.InvoiceNumber
    & Api.Transaction.InvoiceDate<string>
    & Api.Transaction.Quantity
    & Api.Transaction.TransactionType<Enum.TransactionType.Payment>
    & {
      product: Product;
      account: AccountLean;
      category: Category;
      project: Project;
      recipient: Recipient;
    };

  export type DeferredTransaction = Api.Transaction.TransactionId
    & Api.Transaction.Amount
    & Api.Transaction.Description
    & Api.Transaction.IssuedAt<string>
    & Api.Transaction.InvoiceNumber
    & Api.Transaction.InvoiceDate<string>
    & Api.Transaction.Quantity
    & Api.Transaction.TransactionType<Enum.TransactionType.Deferred>
    & {
      product: Product;
      payingAccount: AccountLean;
      ownerAccount: AccountLean;
      category: Category;
      project: Project;
      recipient: Recipient;
    };

  export type ReimbursementTransaction = Api.Transaction.TransactionId
    & Api.Transaction.Amount
    & Api.Transaction.Description
    & Api.Transaction.IssuedAt<string>
    & Api.Transaction.InvoiceNumber
    & Api.Transaction.InvoiceDate<string>
    & Api.Transaction.Quantity
    & Api.Transaction.TransactionType<Enum.TransactionType.Reimbursement>
    & {
      product: Product;
      payingAccount: AccountLean;
      ownerAccount: AccountLean;
      category: Category;
      project: Project;
      recipient: Recipient;
    };

  export type TransferTransaction = Api.Transaction.TransactionId
    & Api.Transaction.Amount
    & Api.Transaction.Description
    & Api.Transaction.IssuedAt<string>
    & Api.Transaction.TransactionType<Enum.TransactionType.Transfer>
    & Api.Transaction.TransferAmount
    & {
      account: AccountLean;
      transferAccount: AccountLean;
    };

  export type SplitItem = Api.Transaction.Amount
    & Api.Transaction.Description
    & Api.Transaction.InvoiceNumber
    & Api.Transaction.InvoiceDate<string>
    & Api.Transaction.Quantity
    & {
      product: Product;
      category: Category;
      project: Project;
    };

  export type SplitTransaction = Api.Transaction.TransactionId
    & Api.Transaction.Amount
    & Api.Transaction.Description
    & Api.Transaction.IssuedAt<string>
    & Api.Transaction.TransactionType<Enum.TransactionType.Split>
    & {
      account: AccountLean;
      recipient: Recipient;
      splits: SplitItem[];
      deferredSplits: DeferredTransaction[];
    };

  export type DraftTransaction = Api.Transaction.TransactionId
    & Api.Transaction.Amount
    & Api.Transaction.Description
    & Api.Transaction.IssuedAt<string>
    & Api.Transaction.TransactionType<Enum.TransactionType.Draft>
    & {
      potentialDuplicates: Transaction[];
    };

  export type Transaction = PaymentTransaction | TransferTransaction | DeferredTransaction | ReimbursementTransaction | SplitTransaction;

  export type TransactionReport = Api.Transaction.TransactionId
    & Api.Transaction.Amount
    & Api.Transaction.Description
    & Api.Transaction.IssuedAt<string>
    & Api.Transaction.Quantity
    & Api.Transaction.InvoiceNumber
    & Api.Transaction.InvoiceDate<string>
    & {
      product: ProductReport;
      account: AccountReport;
      category: CategoryReport;
      project: ProjectReport;
      recipient: RecipientReport;
    };

  export type File = Api.File.FileId &
    Api.File.FileType &
    Api.File.DraftCount &
    Api.File.UploadedAt;

  export type FileUploadUrl = Api.File.FileId &
    Api.File.Url;

  export type Setting = Api.Setting.SettingKey &
    Api.Setting.Value;

  export type User = Api.User.Email &
    Api.User.Status &
    Api.User.Groups;

  export type Login = Api.Auth.IdToken &
    Api.Auth.RefreshToken;

  export type RefreshToken = Api.Auth.IdToken;

  export type Price = Api.Price.PriceId & Api.Price.Base;

  export type CustomerJobCost = Api.Customer.Job.AdditionalPrice & {
    prices: (Price & Api.Customer.Job.Quantity)[];
  };

  export type CustomerJob = Api.Customer.Job.Base 
    & Api.Customer.Job.Title 
    & CustomerJobCost;

  export type CustomerLean = Api.Customer.CustomerId & Api.Customer.Base;

  export type Customer = CustomerLean
    & Api.IsArchived
    & {
      jobs: CustomerJob[];
      blacklistedCustomers: CustomerLean[];
    };

  type CalendarDayLean = Api.Calendar.Day & {
    entries: CalendarEntry[];
  };

  export type CalendarDayRegular = Api.Calendar.DayType<Enum.CalendarDayType.Regular> & Api.Calendar.TimeInterval & CalendarDayLean;
  export type CalendarDayVacation = Api.Calendar.DayType<Enum.CalendarDayType.Vacation> & CalendarDayLean;
  export type CalendarDayHoliday = Api.Calendar.DayType<Enum.CalendarDayType.Holiday> & CalendarDayLean;

  export type CalendarDay = CalendarDayRegular | CalendarDayVacation | CalendarDayHoliday;

  export type CalendarEntryLean = Api.Calendar.Entry.Base
    & Api.Calendar.Day
    & Api.Calendar.Entry.CalendarEntryId;

  export type CalendarEntryWorkLean = CalendarEntryLean & {
    resolution: Api.Calendar.Entry.Delay & Api.Calendar.Entry.Status;
  };

  export type CalendarEntryPersonal = CalendarEntryLean
    & Api.Calendar.Entry.EntryType<Enum.CalendarEntryType.Personal>;

  export type CalendarEntryIssue = CalendarEntryLean
    & Api.Calendar.Entry.EntryType<Enum.CalendarEntryType.Issue>;    

  export type CalendarEntryWork = CalendarEntryWorkLean
    & CustomerJobCost
    & {
      customer: Customer;
    }
    & Api.Calendar.Entry.EntryType<Enum.CalendarEntryType.Work>;    

  export type CalendarEntry = CalendarEntryPersonal | CalendarEntryIssue | CalendarEntryWork;
}
