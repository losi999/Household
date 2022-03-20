import { httpError } from '@household/shared/common/utils';
import { IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { IDatabaseService } from '@household/shared/services/database-service';
import { Recipient } from '@household/shared/types/types';

export interface ICreateRecipientService {
  (ctx: {
    body: Recipient.Request;
    expiresIn: number;
  }): Promise<string>;
}

export const createRecipientServiceFactory = (
  databaseService: IDatabaseService,
  recipientDocumentConverter: IRecipientDocumentConverter): ICreateRecipientService => {
  return async ({ body, expiresIn }) => {
    const document = recipientDocumentConverter.create(body, expiresIn);

    const saved = await databaseService.saveRecipient(document).catch((error) => {
      console.error('Save recipient', error);
      throw httpError(500, 'Error while saving recipient');
    });

    return saved._id.toString();
  };
};
