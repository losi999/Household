import { httpError } from '@household/shared/common/utils';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { IAccountService } from '@household/shared/services/account-service';
import { Account } from '@household/shared/types/types';

export interface IUpdateAccountService {
  (ctx: {
    body: Account.Request;
    accountId: Account.IdType;
    expiresIn: number;
  }): Promise<void>;
}

export const updateAccountServiceFactory = (
  accountService: IAccountService,
  accountDocumentConverter: IAccountDocumentConverter,
): IUpdateAccountService => {
  return async ({ body, accountId, expiresIn }) => {
    const { updatedAt, ...document } = await accountService.getAccountById(accountId).catch((error) => {
      console.error('Get account', error);
      throw httpError(500, 'Error while getting account');
    });

    if (!document) {
      throw httpError(404, 'No account found');
    }

    const updated = accountDocumentConverter.update({
      document,
      body, 
    }, expiresIn);

    await accountService.updateAccount(updated).catch((error) => {
      console.error('Update account', error);
      throw httpError(500, 'Error while updating account');
    });
  };
};
