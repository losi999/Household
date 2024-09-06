import { Clean } from '@household/shared/types/common';
import { Recipient } from '@household/shared/types/types';
import { createReducer, on } from '@ngrx/store';
import { recipientApiActions } from '@household/web/state/recipient/recipient.actions';

export const recipientReducer = createReducer<Clean<Recipient.Response>[]>([],
  on(recipientApiActions.listRecipientsCompleted, (_state, { recipients }) => {
    return recipients;
  }),
  on(recipientApiActions.createRecipientCompleted, recipientApiActions.updateRecipientCompleted, (_state, { recipientId, name }) => {

    return _state.filter(p => p.recipientId !== recipientId)
      .concat({
        recipientId,
        name,
      })
      .toSorted((a, b) => a.name.localeCompare(b.name, 'hu', {
        sensitivity: 'base',
      }));
  }),
  on(recipientApiActions.deleteRecipientCompleted, (_state, { recipientId }) => {
    return _state.filter(p => p.recipientId !== recipientId);
  }),
  on(recipientApiActions.mergeRecipientsCompleted, (_state, { sourceRecipientIds }) => {
    return _state.filter(p => !sourceRecipientIds.includes(p.recipientId));
  }),
);
