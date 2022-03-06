import { httpError } from '@household/shared/common/utils';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { IDatabaseService } from '@household/shared/services/database-service';
import { Account } from '@household/shared/types/types';

export interface ICreateAccountService {
  (ctx: {
    body: Account.Request;
    expiresIn: number;
  }): Promise<string>;
}

export const createAccountServiceFactory = (
  databaseService: IDatabaseService,
  accountDocumentConverter: IAccountDocumentConverter): ICreateAccountService => {
  return async ({ body, expiresIn }) => {
    const document = accountDocumentConverter.create(body, expiresIn);

    const saved = await databaseService.saveAccount(document).catch((error) => {
      console.error('Save account', error);
      throw httpError(500, 'Error while saving account');
    });

    return saved._id.toString();
  };
};
