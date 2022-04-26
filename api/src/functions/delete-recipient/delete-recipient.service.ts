import { httpError } from '@household/shared/common/utils';
import { IRecipientService } from '@household/shared/services/recipient-service';
import { Recipient } from '@household/shared/types/types';

export interface IDeleteRecipientService {
  (ctx: {
    recipientId: Recipient.IdType;
  }): Promise<void>;
}

export const deleteRecipientServiceFactory = (
  recipientService: IRecipientService): IDeleteRecipientService => {
  return async ({ recipientId }) => {
    await recipientService.deleteRecipient(recipientId).catch((error) => {
      console.error('Delete recipient', error);
      throw httpError(500, 'Error while deleting recipient');
    });
  };
};
