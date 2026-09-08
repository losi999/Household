import { httpErrors } from '@household/api/common/error-handlers';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { IAccountService } from '@household/shared/services/account-service';
import { Responses } from '@household/shared/types/responses';
import { Api } from '@household/shared/types/api';

export interface IGetAccountService {
  (ctx: Api.Account.AccountId): Promise<Responses.Account>;
}

export const getAccountServiceFactory = (
  accountService: IAccountService,
  accountDocumentConverter: IAccountDocumentConverter): IGetAccountService => {
  return async ({ accountId }) => {
    const account = await accountService.getAccountById(accountId).catch(httpErrors.account.getById({
      accountId,
    }));

    httpErrors.account.notFound({
      account,
      accountId,
    });

    return accountDocumentConverter.toResponse(account);
  };
};
