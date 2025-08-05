import { httpErrors } from '@household/api/common/error-handlers';
import { IAccountService } from '@household/shared/services/account-service';
import { Account } from '@household/shared/types/types';

export interface IDeleteAccountService {
  (ctx: {
    accountId: Account.Id;
  }): Promise<unknown>;
}

export const deleteAccountServiceFactory = (
  accountService: IAccountService): IDeleteAccountService => {
  return ({ accountId }) => {
    return accountService.deleteAccount(accountId).catch(httpErrors.account.delete({
      accountId,
    }));
  };
};
