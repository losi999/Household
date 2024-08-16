import { createReducer, on } from '@ngrx/store';
import { recipientApiActions } from 'src/app/recipient/recipient.actions';

export const recipientReducer = createReducer([],
  on(recipientApiActions.retrievedRecipientList, (_state, { recipients }) => {
    return recipients;
  }),
);
