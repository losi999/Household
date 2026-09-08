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
}
