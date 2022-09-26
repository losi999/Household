import { httpErrors } from '@household/api/common/error-handlers';
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
    await accountService.deleteAccount(accountId).catch(httpErrors.account.delete({
      accountId,
    }));
  };
};
