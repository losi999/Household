import { httpErrors } from '@household/api/common/error-handlers';
import { IRecipientService } from '@household/shared/services/recipient-service';
import { Recipient } from '@household/shared/types/types';

export interface IMergeRecipientsService {
  (ctx: {
    body: Recipient.Id[];
  } & Recipient.RecipientId): Promise<unknown>;
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

    const recipients = await recipientService.findRecipientsByIds(recipientIds).catch(httpErrors.recipient.listByIds(recipientIds));

    httpErrors.recipient.multipleNotFound({
      recipients,
      recipientIds,
    });

    return recipientService.mergeRecipients({
      sourceRecipientIds: body,
      targetRecipientId: recipientId,
    }).catch(httpErrors.recipient.merge({
      sourceRecipientIds: body,
      targetRecipientId: recipientId,
    }));
  };
};
