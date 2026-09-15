import { Api } from '@household/shared/types/api';

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
}
