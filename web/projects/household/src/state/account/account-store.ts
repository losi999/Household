import { Api } from '@household/shared/types/api';
import { Searchable } from '@household/shared/types/common';
import { Responses } from '@household/shared/types/responses';
import { signalStore, withState } from '@ngrx/signals';
import { withAccountApiEvents } from '@household/state/account/with-account-api-events';
import { withAccountEvents } from '@household/state/account/with-account-events';
import { withAccountReducer } from '@household/state/account/with-account-reducer';
import { inject, ValueProvider, InjectionToken } from '@angular/core';

const ACCOUNT_STORE_INITIAL_STATE = new InjectionToken<AccountState>('ACCOUNT_STORE_INITIAL_STATE');

export type AccountState = {
  accountList: Searchable<Responses.Account>[];
  isInProgress: Api.Account.Id[];
  selectedAccount: Responses.Account;
};

export const provideAccountStoreInitialState = (state: AccountState = {
  accountList: [],
  isInProgress: [],
  selectedAccount: undefined,
}): ValueProvider => {
  return {
    provide: ACCOUNT_STORE_INITIAL_STATE,
    useValue: state,
  };
};

export const AccountStore = signalStore({
  providedIn: 'root',
},
withState<AccountState>(() => {
  const initialState = inject(ACCOUNT_STORE_INITIAL_STATE);

  return initialState;
}),
withAccountReducer(),
withAccountApiEvents(),
withAccountEvents(),
);
