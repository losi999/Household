import { httpErrors } from '@household/api/common/error-handlers';
import { IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { IRecipientService } from '@household/shared/services/recipient-service';
import { Recipient } from '@household/shared/types/types';

export interface IGetRecipientService {
  (ctx: {
    recipientId: Recipient.IdType;
  }): Promise<Recipient.Response>;
}

export const getRecipientServiceFactory = (
  recipientService: IRecipientService,
  recipientDocumentConverter: IRecipientDocumentConverter): IGetRecipientService => {
  return async ({ recipientId }) => {

    const document = await recipientService.getRecipientById(recipientId).catch(httpErrors.recipient.getById({
      recipientId,
    }));

    httpErrors.recipient.notFound(!document, {
      recipientId,
    });

    return recipientDocumentConverter.toResponse(document);
  };
};
