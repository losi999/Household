import { httpErrors } from '@household/api/common/error-handlers';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { IAccountService } from '@household/shared/services/account-service';
import { Api } from '@household/shared/types/api';
import { ExpiresIn } from '@household/shared/types/common';
import { Requests } from '@household/shared/types/requests';

export interface IUpdateAccountService {
  (ctx: {
    body: Requests.Account;
  } & Api.Account.AccountId & ExpiresIn): Promise<unknown>;
}

export const updateAccountServiceFactory = (
  accountService: IAccountService,
  accountDocumentConverter: IAccountDocumentConverter,
): IUpdateAccountService => {
  return async ({ body, accountId, expiresIn }) => {
    const queried = await accountService.findAccountById(accountId).catch(httpErrors.account.getById({
      accountId,
    }));

    httpErrors.account.notFound({
      account: queried,
      accountId,
    });

    const update = accountDocumentConverter.update(body, expiresIn);

    return accountService.updateAccount(accountId, update).catch(httpErrors.account.update({
      accountId,
      update,
    }));
  };
};
