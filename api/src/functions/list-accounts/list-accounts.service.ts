import { httpErrors } from '@household/api/common/error-handlers';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { IAccountService } from '@household/shared/services/account-service';
import { Responses } from '@household/shared/types/responses';

export interface IListAccountsService {
  (): Promise<Responses.Account[]>;
}

export const listAccountsServiceFactory = (
  accountService: IAccountService,
  accountDocumentConverter: IAccountDocumentConverter): IListAccountsService => {
  return async () => {

    const documents = await accountService.listAccounts().catch(httpErrors.account.list());

    return accountDocumentConverter.toResponseList(documents);
  };
};
