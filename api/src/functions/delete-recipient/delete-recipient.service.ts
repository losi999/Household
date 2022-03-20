import { httpError } from '@household/shared/common/utils';
import { IDatabaseService } from '@household/shared/services/database-service';
import { Recipient } from '@household/shared/types/types';

export interface IDeleteRecipientService {
  (ctx: {
    recipientId: Recipient.IdType;
  }): Promise<void>;
}

export const deleteRecipientServiceFactory = (
  databaseService: IDatabaseService): IDeleteRecipientService => {
  return async ({ recipientId }) => {
    await databaseService.deleteRecipient(recipientId).catch((error) => {
      console.error('Delete recipient', error);
      throw httpError(500, 'Error while deleting recipient');
    });
  };
};
