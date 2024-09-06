import { httpErrors } from '@household/api/common/error-handlers';
import { IRecipientService } from '@household/shared/services/recipient-service';
import { Recipient } from '@household/shared/types/types';

export interface IMergeRecipientsService {
  (ctx: {
    body: Recipient.Id[];
  } & Recipient.RecipientId): Promise<void>;
}

export const mergeRecipientsServiceFactory = (
  recipientService: IRecipientService,
): IMergeRecipientsService => {
  return async ({ body, recipientId }) => {
    httpErrors.recipient.mergeTargetAmongSource({
      target: recipientId,
      source: body,
    });

    const recipientIds = [
      recipientId,
      ...new Set(body),
    ];

    const recipients = await recipientService.listRecipientsByIds(recipientIds).catch(httpErrors.recipient.listByIds(recipientIds));

    httpErrors.recipient.multipleNotFound({
      recipients,
      recipientIds,
    });

    await recipientService.mergeRecipients({
      sourceRecipientIds: body,
      targetRecipientId: recipientId,
    }).catch(httpErrors.recipient.merge({
      sourceRecipientIds: body,
      targetRecipientId: recipientId,
    }));
  };
};
