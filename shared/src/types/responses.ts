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

  export type CategoryAncestor = Api.Category.CategoryType &
    Api.Category.Name &
    Api.Category.CategoryId;

  export type CategoryParent = CategoryAncestor &
    Api.Category.FullName;

  export type Category = CategoryAncestor &
    Api.Category.FullName & {
      ancestors: CategoryAncestor[];
      parentCategory: CategoryParent;
    };

  export type CategoryReport = Api.Category.CategoryId &
    Api.Category.FullName;

  export type Product = Api.Product.Base &
    Api.Product.ProductId &
    Api.Product.FullName;

  export type ProductReport = Api.Product.ProductId &
    Api.Product.FullName;

  export type ProductGroupedResponse = Api.Category.CategoryId &
    Api.Category.FullName & {
      products: Product[];
    };

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
      account: Account;
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
      payingAccount: Account;
      ownerAccount: Account;
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
      payingAccount: Account;
      ownerAccount: Account;
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
      account: Account;
      transferAccount: Account;
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
      account: Account;
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
}
