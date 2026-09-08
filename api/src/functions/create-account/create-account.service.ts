import { httpErrors } from '@household/api/common/error-handlers';
import { getAccountId } from '@household/shared/common/utils';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { IAccountService } from '@household/shared/services/account-service';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';

export interface ICreateAccountService {
  (ctx: {
    body: Requests.Account;
    expiresIn: number;
  }): Promise<Api.Account.Id>;
}

export const createAccountServiceFactory = (
  accountService: IAccountService,
  accountDocumentConverter: IAccountDocumentConverter): ICreateAccountService => {
  return async ({ body, expiresIn }) => {
    const document = accountDocumentConverter.create(body, expiresIn);

    const saved = await accountService.saveAccount(document).catch(httpErrors.account.save(document));

    return getAccountId(saved);
  };
};
