
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';

export const recipientEvents = eventGroup({
  source: 'Recipient',
  events: {
    createRecipient: type<void>(),
    updateRecipient: type<Api.Recipient.RecipientId & Responses.Recipient>(),
    deleteRecipient: type<Responses.Recipient>(),
    mergeRecipients: type<Responses.Recipient>(),
    openRecipientListItemSubmenu: type<Responses.Recipient>(),
  },
});

export const recipientApiEvents = eventGroup({
  source: 'Recipient API',
  events: {
    listRecipientsInitiated: type<void>(),
    listRecipientsCompleted: type<Responses.Recipient[]>(),
    createRecipientInitiated: type<Requests.Recipient>(),
    createRecipientCompleted: type<Api.Recipient.RecipientId & Requests.Recipient>(),
    updateRecipientInitiated: type<Api.Recipient.RecipientId & Requests.Recipient>(),
    updateRecipientCompleted: type<Api.Recipient.RecipientId & Requests.Recipient>(),
    updateRecipientFailed: type<Api.Recipient.RecipientId>(),
    deleteRecipientInitiated: type<Api.Recipient.RecipientId>(),
    deleteRecipientCompleted: type<Api.Recipient.RecipientId>(),
    deleteRecipientFailed: type<Api.Recipient.RecipientId>(),
    mergeRecipientsInitiated: type<{
      sourceRecipientIds: Api.Recipient.Id[];
      targetRecipientId: Api.Recipient.Id;
    }>(),
    mergeRecipientsCompleted: type<{
      sourceRecipientIds: Api.Recipient.Id[];
    }>(),
    mergeRecipientsFailed: type<{
      sourceRecipientIds: Api.Recipient.Id[];
    }>(),
  },
});

