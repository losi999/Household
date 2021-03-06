import { httpError } from '@household/shared/common/utils';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { IAccountService } from '@household/shared/services/account-service';
import { Account } from '@household/shared/types/types';

export interface IGetAccountService {
  (ctx: {
    accountId: Account.IdType;
  }): Promise<Account.Response>;
}

export const getAccountServiceFactory = (
  accountService: IAccountService,
  accountDocumentConverter: IAccountDocumentConverter): IGetAccountService => {
  return async ({ accountId }) => {

    const document = await accountService.getAccountById(accountId).catch((error) => {
      console.error('Get account', error);
      throw httpError(500, 'Error while getting account');
    });

    if (!document) {
      throw httpError(404, 'No account found');
    }

    return accountDocumentConverter.toResponse(document);
  };
};
