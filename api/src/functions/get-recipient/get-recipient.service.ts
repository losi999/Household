import { httpError } from '@household/shared/common/utils';
import { IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { IDatabaseService } from '@household/shared/services/database-service';
import { Recipient } from '@household/shared/types/types';

export interface IGetRecipientService {
  (ctx: {
    recipientId: Recipient.IdType;
  }): Promise<Recipient.Response>;
}

export const getRecipientServiceFactory = (
  databaseService: IDatabaseService,
  recipientDocumentConverter: IRecipientDocumentConverter): IGetRecipientService => {
  return async ({ recipientId }) => {

    const document = await databaseService.getRecipientById(recipientId).catch((error) => {
      console.error('Get recipient', error);
      throw httpError(500, 'Error while getting recipient');
    });

    if (!document) {
      throw httpError(404, 'No recipient found');
    }

    return recipientDocumentConverter.toResponse(document);
  };
};
