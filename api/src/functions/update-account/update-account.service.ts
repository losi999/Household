import { httpErrors } from '@household/api/common/error-handlers';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { IAccountService } from '@household/shared/services/account-service';
import { Account } from '@household/shared/types/types';

export interface IUpdateAccountService {
  (ctx: {
    body: Account.Request;
    accountId: Account.Id;
    expiresIn: number;
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

    httpErrors.account.notFound(!queried, {
      accountId,
    });

    const { updatedAt, ...document } = queried;

    const updated = accountDocumentConverter.update({
      document,
      body,
    }, expiresIn);

    await accountService.updateAccount(updated).catch(httpErrors.account.update(updated));
  };
};
