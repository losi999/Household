import { httpError } from '@household/shared/common/utils';
import { IAccountService } from '@household/shared/services/account-service';
import { Account } from '@household/shared/types/types';

export interface IDeleteAccountService {
  (ctx: {
    accountId: Account.IdType;
  }): Promise<void>;
}

export const deleteAccountServiceFactory = (
  accountService: IAccountService): IDeleteAccountService => {
  return async ({ accountId }) => {
    await accountService.deleteAccount(accountId).catch((error) => {
      console.error('Delete account', error);
      throw httpError(500, 'Error while deleting account');
    });
  };
};
