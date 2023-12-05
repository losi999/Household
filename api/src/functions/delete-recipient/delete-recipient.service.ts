import { httpErrors } from '@household/api/common/error-handlers';
import { IRecipientService } from '@household/shared/services/recipient-service';
import { Recipient } from '@household/shared/types/types';

export interface IDeleteRecipientService {
  (ctx: {
    recipientId: Recipient.Id;
  }): Promise<void>;
}

export const deleteRecipientServiceFactory = (
  recipientService: IRecipientService): IDeleteRecipientService => {
  return async ({ recipientId }) => {
    await recipientService.deleteRecipient(recipientId).catch(httpErrors.recipient.delete({
      recipientId,
    }));
  };
};
