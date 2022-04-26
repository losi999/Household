import { httpError } from '@household/shared/common/utils';
import { IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { IRecipientService } from '@household/shared/services/recipient-service';
import { Recipient } from '@household/shared/types/types';

export interface IListRecipientsService {
  (): Promise<Recipient.Response[]>;
}

export const listRecipientsServiceFactory = (
  recipientService: IRecipientService,
  recipientDocumentConverter: IRecipientDocumentConverter): IListRecipientsService => {
  return async () => {

    const documents = await recipientService.listRecipients().catch((error) => {
      console.error('List recipients', error);
      throw httpError(500, 'Error while listing recipients');
    });

    return recipientDocumentConverter.toResponseList(documents);
  };
};
