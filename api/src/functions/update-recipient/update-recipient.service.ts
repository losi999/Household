import { httpErrors } from '@household/api/common/error-handlers';
import { IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { IRecipientService } from '@household/shared/services/recipient-service';
import { Recipient } from '@household/shared/types/types';

export interface IUpdateRecipientService {
  (ctx: {
    body: Recipient.Request;
    recipientId: Recipient.Id;
    expiresIn: number;
  }): Promise<unknown>;
}

export const updateRecipientServiceFactory = (
  recipientService: IRecipientService,
  recipientDocumentConverter: IRecipientDocumentConverter,
): IUpdateRecipientService => {
  return async ({ body, recipientId, expiresIn }) => {
    const queried = await recipientService.findRecipientById(recipientId).catch(httpErrors.recipient.getById({
      recipientId,
    }));

    httpErrors.recipient.notFound({
      recipient: queried,
      recipientId,
    });

    const update = recipientDocumentConverter.update(body, expiresIn);

    return recipientService.updateRecipient(recipientId, update).catch(httpErrors.recipient.update({
      recipientId,
      update,
    }));
  };
};
