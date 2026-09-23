import { httpErrors } from '@household/api/common/error-handlers';
import { getRecipientId } from '@household/shared/common/utils';
import { IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { IRecipientService } from '@household/shared/services/recipient-service';
import { Api } from '@household/shared/types/api';
import { ExpiresIn } from '@household/shared/types/common';
import { Requests } from '@household/shared/types/requests';

export interface ICreateRecipientService {
  (ctx: {
    body: Requests.Recipient;
  } & ExpiresIn): Promise<Api.Recipient.Id>;
}

export const createRecipientServiceFactory = (
  recipientService: IRecipientService,
  recipientDocumentConverter: IRecipientDocumentConverter): ICreateRecipientService => {
  return async ({ body, expiresIn }) => {
    const document = recipientDocumentConverter.create(body, expiresIn);

    const saved = await recipientService.saveRecipient(document).catch(httpErrors.recipient.save(document));

    return getRecipientId(saved);
  };
};
