import webpack from '@cypress/webpack-preprocessor';
import { accountService, categoryService, projectService, recipientService, transactionService, productService, settingService, identityService, fileService, storageService, customerService } from '@household/test/api/dependencies';

const setTasksFromService = <T extends Record<keyof T, (...args: any[]) => Promise<any>>>(on: Cypress.PluginEvents, service: T, ...functions: (keyof T)[]) => {
  on('task', functions.reduce((accumulator, currentValue) => {
    return {
      ...accumulator,
      [currentValue]: async (params: any[]) => {
        return (await service[currentValue](...params)) ?? null;
      },
    };
  }, {}));
};

export default (on: Cypress.PluginEvents) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  const options = {
    // send in the options from your webpack.config.js, so it works the same
    // as your app's code
    webpackOptions: require('../../webpack.config'),
    watchOptions: {},
  };
  on('file:preprocessor', webpack(options));
  setTasksFromService(on, projectService, 'findProjectById', 'saveProject', 'saveProjects');
  setTasksFromService(on, productService, 'saveProduct', 'findProductById', 'saveProducts');
  setTasksFromService(on, recipientService, 'findRecipientById', 'saveRecipient', 'saveRecipients');
  setTasksFromService(on, customerService, 'findCustomerById', 'saveCustomer', 'saveCustomers');
  setTasksFromService(on, accountService, 'findAccountById', 'saveAccount', 'saveAccounts');
  setTasksFromService(on, categoryService, 'getCategoryById', 'saveCategory', 'saveCategories');
  setTasksFromService(on, transactionService, 'getTransactionByIdAndAccountId', 'saveTransaction', 'getTransactionById', 'saveTransactions', 'listDraftTransactionsByFileId');
  setTasksFromService(on, settingService, 'updateSetting', 'getSettingByKey');
  setTasksFromService(on, fileService, 'findFileById', 'saveFile');
  setTasksFromService(on, identityService, 'deleteUser', 'getUser', 'createUser', 'listGroupsByUser');
  setTasksFromService(on, storageService, 'checkFile', 'writeFile', 'uploadFile');
};
