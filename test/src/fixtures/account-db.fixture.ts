import { IAccountService } from '@household/shared/services/account-service';
import { accountServiceFactory } from '@household/shared/services/account-service';
import { mongoDbService } from '@household/test/dependencies';
import { test as baseTest } from '@household/test/fixtures/logging.fixture';

const accountService = accountServiceFactory(mongoDbService);

export const test = baseTest.extend<Pick<IAccountService, 'saveAccount' | 'saveAccounts' | 'findAccountById'>>({
  saveAccount: async ({ logDbCall }, use) => {
    const saveAccount: IAccountService['saveAccount'] = async (account) => {
      const result = await accountService.saveAccount(account);
      await logDbCall('saveAccount', {
        account,
      }, result);
      return result;
    };
    
    await use(saveAccount);
  },
  saveAccounts: async ({ logDbCall }, use) => {
    const saveAccounts: IAccountService['saveAccounts'] = async (...accounts) => {
      const result = await accountService.saveAccounts(...accounts);
      await logDbCall('saveAccounts', {
        accounts,
      }, result);
      return result;
    };
    
    await use(saveAccounts);
  },
  findAccountById: async ({ logDbCall }, use) => {
    const findAccountById: IAccountService['findAccountById'] = async (accountId) => {
      const result = await accountService.findAccountById(accountId);
      await logDbCall('findAccountById', {
        accountId,
      }, result);
      return result;
    };
    
    await use(findAccountById);
  },
});
