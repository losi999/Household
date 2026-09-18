import { httpErrors } from '@household/api/common/error-handlers';
import { IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { IRecipientService } from '@household/shared/services/recipient-service';
import { Api } from '@household/shared/types/api';
import { Responses } from '@household/shared/types/responses';

export interface IGetRecipientService {
  (ctx: {
    recipientId: Api.Recipient.Id;
  }): Promise<Responses.Recipient>;
}

export const getRecipientServiceFactory = (
  recipientService: IRecipientService,
  recipientDocumentConverter: IRecipientDocumentConverter): IGetRecipientService => {
  return async ({ recipientId }) => {
    const recipient = await recipientService.findRecipientById(recipientId).catch(httpErrors.recipient.getById({
      recipientId,
    }));

    httpErrors.recipient.notFound({
      recipientId,
      recipient,
    });

    return recipientDocumentConverter.toResponse(recipient);
  };
};
