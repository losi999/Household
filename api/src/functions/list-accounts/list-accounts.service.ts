import { httpError } from '@household/shared/common/utils';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { IDatabaseService } from '@household/shared/services/database-service';
import { Account } from '@household/shared/types/types';

export interface IListAccountsService {
  (): Promise<Account.Response[]>;
}

export const listAccountsServiceFactory = (
  databaseService: IDatabaseService,
  accountDocumentConverter: IAccountDocumentConverter): IListAccountsService => {
  return async () => {

    const documents = await databaseService.listAccounts().catch((error) => {
      console.error('List accounts', error);
      throw httpError(500, 'Error while listing accounts');
    });

    return accountDocumentConverter.toResponseList(documents);
  };
};
