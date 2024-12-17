import { Recipient } from '@household/shared/types/types';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export const selectRecipients = createFeatureSelector<Recipient.Response[]>('recipients');

export const selectRecipientById = (recipientId: Recipient.Id) => createSelector(selectRecipients, (recipients) => {
  return recipients.find(a => a.recipientId === recipientId);
});
