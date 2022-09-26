import { httpErrors } from '@household/api/common/error-handlers';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { IAccountService } from '@household/shared/services/account-service';
import { Account } from '@household/shared/types/types';

export interface IListAccountsService {
  (): Promise<Account.Response[]>;
}

export const listAccountsServiceFactory = (
  accountService: IAccountService,
  accountDocumentConverter: IAccountDocumentConverter): IListAccountsService => {
  return async () => {

    const documents = await accountService.listAccounts().catch(httpErrors.account.list());

    return accountDocumentConverter.toResponseList(documents);
  };
};
