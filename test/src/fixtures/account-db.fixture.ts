import { accountService } from '@household/shared/dependencies/services/account-service';
import { IAccountService } from '@household/shared/services/account-service';
import { test as baseTest } from '@household/test/fixtures/logging.fixture';

export const test = baseTest.extend<Pick<IAccountService, 'saveAccount' | 'saveAccounts' | 'findAccountById'>>({
  saveAccount: async ({ logServiceCall }, use) => {
    const saveAccount: IAccountService['saveAccount'] = async (account) => {
      const result = await accountService.saveAccount(account);
      await logServiceCall('saveAccount', {
        account,
      }, result);
      return result;
    };
    
    await use(saveAccount);
  },
  saveAccounts: async ({ logServiceCall }, use) => {
    const saveAccounts: IAccountService['saveAccounts'] = async (...accounts) => {
      const result = await accountService.saveAccounts(...accounts);
      await logServiceCall('saveAccounts', {
        accounts,
      }, result);
      return result;
    };
    
    await use(saveAccounts);
  },
  findAccountById: async ({ logServiceCall }, use) => {
    const findAccountById: IAccountService['findAccountById'] = async (accountId) => {
      const result = await accountService.findAccountById(accountId);
      await logServiceCall('findAccountById', {
        accountId,
      }, result);
      return result;
    };
    
    await use(findAccountById);
  },
});
