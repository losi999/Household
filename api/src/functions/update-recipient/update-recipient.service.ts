import { httpError } from '@household/shared/common/utils';
import { IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { IDatabaseService } from '@household/shared/services/database-service';
import { Recipient } from '@household/shared/types/types';

export interface IUpdateRecipientService {
  (ctx: {
    body: Recipient.Request;
    recipientId: Recipient.IdType;
    expiresIn: number;
  }): Promise<void>;
}

export const updateRecipientServiceFactory = (
  databaseService: IDatabaseService,
  recipientDocumentConverter: IRecipientDocumentConverter,
): IUpdateRecipientService => {
  return async ({ body, recipientId, expiresIn }) => {
    const { updatedAt, ...document } = await databaseService.getRecipientById(recipientId).catch((error) => {
      console.error('Get recipient', error);
      throw httpError(500, 'Error while getting recipient');
    });

    if (!document) {
      throw httpError(404, 'No recipient found');
    }

    const updated = recipientDocumentConverter.update({ document, body }, expiresIn);

    await databaseService.updateRecipient(updated).catch((error) => {
      console.error('Update recipient', error);
      throw httpError(500, 'Error while updating recipient');
    });
  };
};
