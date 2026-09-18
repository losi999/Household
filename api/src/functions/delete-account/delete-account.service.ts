import { httpErrors } from '@household/api/common/error-handlers';
import { IAccountService } from '@household/shared/services/account-service';
import { Api } from '@household/shared/types/api';

export interface IDeleteAccountService {
  (ctx: {
    accountId: Api.Account.Id;
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
