import { httpErrors } from '@household/api/common/error-handlers';
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
    const documents = await recipientService.listRecipients().catch(httpErrors.recipient.list());

    return recipientDocumentConverter.toResponseList(documents);
  };
};
