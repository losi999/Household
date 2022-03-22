import { httpError } from '@household/shared/common/utils';
import { IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { IRecipientService } from '@household/shared/services/recipient-service';
import { Recipient } from '@household/shared/types/types';

export interface ICreateRecipientService {
  (ctx: {
    body: Recipient.Request;
    expiresIn: number;
  }): Promise<string>;
}

export const createRecipientServiceFactory = (
  recipientService: IRecipientService,
  recipientDocumentConverter: IRecipientDocumentConverter): ICreateRecipientService => {
  return async ({ body, expiresIn }) => {
    const document = recipientDocumentConverter.create(body, expiresIn);

    const saved = await recipientService.saveRecipient(document).catch((error) => {
      console.error('Save recipient', error);
      throw httpError(500, 'Error while saving recipient');
    });

    return saved._id.toString();
  };
};
