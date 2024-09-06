import { httpErrors } from '@household/api/common/error-handlers';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { IAccountService } from '@household/shared/services/account-service';
import { Account } from '@household/shared/types/types';

export interface IUpdateAccountService {
  (ctx: {
    accountId: Account.Id;
    expiresIn: number; body:
    Account.Request;
  }): Promise<void>;
}

export const updateAccountServiceFactory = (
  accountService: IAccountService,
  accountDocumentConverter: IAccountDocumentConverter,
): IUpdateAccountService => {
  return async ({ body, accountId, expiresIn }) => {
    const queried = await accountService.getAccountById(accountId).catch(httpErrors.account.getById({
      accountId,
    }));

    httpErrors.account.notFound({
      account: queried,
      accountId,
    });

    const update = accountDocumentConverter.update(body, expiresIn);

    await accountService.updateAccount(accountId, update).catch(httpErrors.account.update({
      accountId,
      update,
    }));
  };
};
