import { Api } from '@household/shared/types/api';
import * as Enum from '@household/shared/enums';

export namespace Requests {
  export type Account = Api.Account.Base;
  export type Project = Api.Project.Base;
  export type Recipient = Api.Recipient.Base;
  export type Category = Api.Category.Base & Api.Category.ParentCategoryId;
  export type Product = Api.Product.Base;
  export type PaymentTransaction = Api.Account.AccountId
  & Api.Category.CategoryId
  & Api.Project.ProjectId
  & Api.Recipient.RecipientId
  & Api.Transaction.IssuedAt<string>
  & Api.Transaction.Amount
  & Api.Transaction.InvoiceNumber
  & Api.Transaction.InvoiceDate<string>
  & Api.Product.ProductId
  & Api.Transaction.Quantity
  & Api.Transaction.Description
  & Api.Transaction.LoanAccountId;

  export type TransferTransaction = Api.Account.AccountId
    & Api.Transaction.IssuedAt<string>
    & Api.Transaction.Amount
    & Api.Transaction.Description
    & Api.Transaction.TransferAccountId
    & Api.Transaction.TransferAmount;

  export type SplitItem = Api.Category.CategoryId
    & Api.Project.ProjectId
    & Api.Transaction.InvoiceNumber
    & Api.Transaction.InvoiceDate<string>
    & Api.Transaction.Quantity
    & Api.Product.ProductId
    & Api.Transaction.Amount
    & Api.Transaction.Description;

  export type LoanItem = Api.Category.CategoryId
    & Api.Project.ProjectId
    & Api.Transaction.InvoiceNumber
    & Api.Transaction.InvoiceDate<string>
    & Api.Transaction.Quantity
    & Api.Product.ProductId
    & Api.Transaction.Amount
    & Api.Transaction.Description
    & Api.Transaction.LoanAccountId
    & Api.Transaction.TransactionId;        

  export type SplitTransaction = Api.Account.AccountId
    & Api.Recipient.RecipientId
    & Api.Transaction.IssuedAt<string>
    & Api.Transaction.Description
    & {
      splits: SplitItem[];
      loans: LoanItem[];
    };    

  export type File = Api.File.Base;
  export type Setting = Api.Setting.Value;
  export type User = Api.User.Email;
  export type Login = Api.User.Email & Api.Auth.Password & Partial<Api.Auth.RequiredUserType>;
  export type ForgotPassword = Api.User.Email;
  export type ConfirmForgotPassword = Api.Auth.Password & Api.Auth.ConfirmationCode;
  export type ConfirmUser = Api.Auth.Password & Api.Auth.TemporaryPassword;
  export type RefreshToken = Api.Auth.RefreshToken;

  export type Report = Api.Report.Filter[];

  export type Price = Api.Price.Base;

  type CustomerJobCost = Api.Customer.Job.AdditionalPrice & {
    prices: (Api.Price.PriceId & Api.Customer.Job.Quantity)[];
  };

  export type CustomerJob = Api.Customer.Job.Base & CustomerJobCost;

  export type Customer = Api.Customer.Base;

  export type CalendarDayVacation = Api.Calendar.DayType<Enum.CalendarDayType.Vacation>;
  export type CalendarDayWorkday = Api.Calendar.DayType<Enum.CalendarDayType.Workday> & Api.Calendar.TimeInterval;

  export type CalendarDay = CalendarDayVacation | CalendarDayWorkday;

  export type CalendarEntryIssue = Api.Calendar.Entry.Base
    & Api.Calendar.Day
    & Api.Calendar.Entry.EntryType<Enum.CalendarEntryType.Issue>;

  export type CalendarEntryPersonal = Api.Calendar.Entry.Base
    & Api.Calendar.Day
    & Api.Calendar.Entry.EntryType<Enum.CalendarEntryType.Personal>;
    
  export type CalendarEntryWork = Api.Calendar.Entry.Base
    & Api.Calendar.Day
    & Api.Customer.CustomerId
    & CustomerJobCost
    & Api.Calendar.Entry.EntryType<Enum.CalendarEntryType.Work>;    

  export type CalendarEntry = CalendarEntryIssue | CalendarEntryPersonal | CalendarEntryWork;

  export type CalendarEntryResolutionPaid = Api.Calendar.Entry.Delay & Api.Transaction.Amount & Api.Calendar.Entry.Status<Enum.CalendarEntryResolutionStatus.Paid>;

  export type CalendarEntryResolutionPendingTransfer = Api.Calendar.Entry.Delay& Api.Calendar.Entry.Status<Enum.CalendarEntryResolutionStatus.PendingTransfer>;

  export type CalendarEntryResolutionNoShow = Api.Calendar.Entry.Status<Enum.CalendarEntryResolutionStatus.NoShow>;

  export type CalendarEntryResolution = CalendarEntryResolutionPaid |CalendarEntryResolutionPendingTransfer | CalendarEntryResolutionNoShow;
}
