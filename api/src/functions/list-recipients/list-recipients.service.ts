import { httpError } from '@household/shared/common/utils';
import { IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { IDatabaseService } from '@household/shared/services/database-service';
import { Recipient } from '@household/shared/types/types';

export interface IListRecipientsService {
  (): Promise<Recipient.Response[]>;
}

export const listRecipientsServiceFactory = (
  databaseService: IDatabaseService,
  recipientDocumentConverter: IRecipientDocumentConverter): IListRecipientsService => {
  return async () => {

    const documents = await databaseService.listRecipients().catch((error) => {
      console.error('List recipients', error);
      throw httpError(500, 'Error while listing recipients');
    });

    return recipientDocumentConverter.toResponseList(documents);
  };
};
