import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { Searchable } from '@household/shared/types/common';
import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';

export const accountEvents = eventGroup({
  source: 'Account',
  events: {
    createAccount: type<void>(),
    updateAccount: type<Responses.Account>(),
    deleteAccount: type<Responses.Account>(),
    openAccount: type<Responses.Account>(),
    closeAccount: type<Responses.Account>(),
    openAccountListItemSubmenu: type<Responses.Account>(),
    selectAccount: type<Searchable<Responses.Account>[] | undefined>(),
    accountSelected: type<Responses.Account>(),
  },
});

export const accountApiEvents = eventGroup({
  source: 'Account API',
  events: {
    listAccountsInitiated: type<void>(),
    listAccountsCompleted: type<Responses.Account[]>(),
    createAccountInitiated: type<Requests.Account>(),
    createAccountCompleted: type<Api.Account.AccountId & Requests.Account>(),
    updateAccountInitiated: type<Api.Account.AccountId & Requests.Account>(),
    updateAccountCompleted: type<Api.Account.AccountId & Requests.Account>(),
    updateAccountFailed: type<Api.Account.AccountId>(),
    deleteAccountInitiated: type<Api.Account.AccountId>(),
    deleteAccountCompleted: type<Api.Account.AccountId>(),
    deleteAccountFailed: type<Api.Account.AccountId>(),
    openAccountInitiated: type<Api.Account.AccountId>(),
    openAccountCompleted: type<Api.Account.AccountId>(),
    openAccountFailed: type<Api.Account.AccountId>(),
    closeAccountInitiated: type<Api.Account.AccountId>(),
    closeAccountCompleted: type<Api.Account.AccountId>(),
    closeAccountFailed: type<Api.Account.AccountId>(),
  },
});
