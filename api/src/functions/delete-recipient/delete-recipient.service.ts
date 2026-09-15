import { httpErrors } from '@household/api/common/error-handlers';
import { IRecipientService } from '@household/shared/services/recipient-service';
import { Api } from '@household/shared/types/api';

export interface IDeleteRecipientService {
  (ctx: {
    recipientId: Api.Recipient.Id;
  }): Promise<unknown>;
}

export const deleteRecipientServiceFactory = (
  recipientService: IRecipientService): IDeleteRecipientService => {
  return ({ recipientId }) => {
    return recipientService.deleteRecipient(recipientId).catch(httpErrors.recipient.delete({
      recipientId,
    }));
  };
};
