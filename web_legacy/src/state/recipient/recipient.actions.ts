import { Recipient } from '@household/shared/types/types';
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {} from '@ngrx/effects';

export const recipientApiActions = createActionGroup({
  source: 'Recipient API',
  events: {
    'List recipients initiated': emptyProps(),
    'List recipients completed': props<{recipients: Recipient.Response[]}>(),
    'Create recipient initiated': props<Recipient.Request>(),
    'Create recipient completed': props<Recipient.RecipientId & Recipient.Request>(),
    'Merge recipients initiated': props<{
      sourceRecipientIds: Recipient.Id[];
      targetRecipientId: Recipient.Id;
    }>(),
    'Merge recipients completed': props<{sourceRecipientIds: Recipient.Id[]}>(),
    'Merge recipients failed': props<{sourceRecipientIds: Recipient.Id[]}>(),
    'Update recipient initiated': props<Recipient.RecipientId & Recipient.Request>(),
    'Update recipient completed': props<Recipient.RecipientId & Recipient.Request>(),
    'Delete recipient initiated': props<Recipient.RecipientId>(),
    'Delete recipient completed': props<Recipient.RecipientId>(),
    'Delete recipient failed': props<Recipient.RecipientId>(),
  },
});
