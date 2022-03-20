import { httpError } from '@household/shared/common/utils';
import { IDatabaseService } from '@household/shared/services/database-service';
import { Account } from '@household/shared/types/types';

export interface IDeleteAccountService {
  (ctx: {
    accountId: Account.IdType;
  }): Promise<void>;
}

export const deleteAccountServiceFactory = (
  databaseService: IDatabaseService): IDeleteAccountService => {
  return async ({ accountId }) => {
    await databaseService.deleteAccount(accountId).catch((error) => {
      console.error('Delete account', error);
      throw httpError(500, 'Error while deleting account');
    });
  };
};
