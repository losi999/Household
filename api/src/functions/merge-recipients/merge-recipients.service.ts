import { httpErrors } from '@household/api/common/error-handlers';
import { IRecipientService } from '@household/shared/services/recipient-service';
import { Api } from '@household/shared/types/api';

export interface IMergeRecipientsService {
  (ctx: {
    body: Api.Recipient.Id[];
  } & Api.Recipient.RecipientId): Promise<unknown>;
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
