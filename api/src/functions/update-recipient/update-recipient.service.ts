import { httpErrors } from '@household/api/common/error-handlers';
import { IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { IRecipientService } from '@household/shared/services/recipient-service';
import { Recipient } from '@household/shared/types/types';

export interface IUpdateRecipientService {
  (ctx: {
    body: Recipient.Request;
    recipientId: Recipient.IdType;
    expiresIn: number;
  }): Promise<void>;
}

export const updateRecipientServiceFactory = (
  recipientService: IRecipientService,
  recipientDocumentConverter: IRecipientDocumentConverter,
): IUpdateRecipientService => {
  return async ({ body, recipientId, expiresIn }) => {
    const queried = await recipientService.getRecipientById(recipientId).catch(httpErrors.recipient.getById({
      recipientId,
    }));

    httpErrors.recipient.notFound(!queried, {
      recipientId,
    });

    const { updatedAt, ...document } = queried;

    const updated = recipientDocumentConverter.update({
      document,
      body,
    }, expiresIn);

    await recipientService.updateRecipient(updated).catch(httpErrors.recipient.update(updated));
  };
};
