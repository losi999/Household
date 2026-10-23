import { Searchable } from '@household/shared/types/common';
import { Api } from '@household/shared/types/api';
import { Responses } from '@household/shared/types/responses';
import { signalStore, withState } from '@ngrx/signals';
import { withRecipientApiEvents } from '@household/state/recipient/with-recipient-api-events';
import { withRecipientEvents } from '@household/state/recipient/with-recipient-events';
import { withRecipientReducer } from '@household/state/recipient/with-recipient-reducer';
import { inject, ValueProvider, InjectionToken } from '@angular/core';

const RECIPIENT_STORE_INITIAL_STATE = new InjectionToken<RecipientState>('RECIPIENT_STORE_INITIAL_STATE');

export type RecipientState = {
  recipientList: Searchable<Responses.Recipient>[];
  isInProgress: Api.Recipient.Id[];
  selectedRecipient: Responses.Recipient;
};

export const provideRecipientStoreInitialState = (state: RecipientState = {
  isInProgress: [],
  recipientList: [],
  selectedRecipient: undefined,
}): ValueProvider => {
  return {
    provide: RECIPIENT_STORE_INITIAL_STATE,
    useValue: state,
  };
};

export const RecipientStore = signalStore({
  providedIn: 'root',
}, 
withState<RecipientState>(() => {
  const initialState = inject(RECIPIENT_STORE_INITIAL_STATE);

  return initialState;
}),
withRecipientReducer(),
withRecipientApiEvents(),
withRecipientEvents(),
);
