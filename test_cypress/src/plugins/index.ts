import { accountService, categoryService, projectService, recipientService, transactionService, productService, settingService, identityService, fileService, storageService, customerService, priceService, calendarDayService, calendarEntryService } from '@household/test/api/dependencies';

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
  setTasksFromService(on, projectService, 'findProjectById', 'saveProject', 'saveProjects');
  setTasksFromService(on, priceService, 'findPriceById', 'savePrice', 'savePrices');
  setTasksFromService(on, productService, 'saveProduct', 'findProductById', 'saveProducts');
  setTasksFromService(on, recipientService, 'findRecipientById', 'saveRecipient', 'saveRecipients');
  setTasksFromService(on, customerService, 'findCustomerById', 'saveCustomer', 'saveCustomers');
  setTasksFromService(on, accountService, 'findAccountById', 'saveAccount', 'saveAccounts');
  setTasksFromService(on, categoryService, 'getCategoryById', 'saveCategory', 'saveCategories');
  setTasksFromService(on, transactionService, 'getTransactionByIdAndAccountId', 'saveTransaction', 'getTransactionById', 'saveTransactions', 'listDraftTransactionsByFileId');
  setTasksFromService(on, settingService, 'updateSetting', 'getSettingByKey', 'listSettingsByKeys');
  setTasksFromService(on, fileService, 'findFileById', 'saveFile');
  setTasksFromService(on, calendarDayService, 'findCalendarDayByDay', 'saveCalendarDay', 'clearCalendarDay');
  setTasksFromService(on, calendarEntryService, 'findCalendarEntryById', 'saveCalendarEntry');
  setTasksFromService(on, identityService, 'deleteUser', 'getUser', 'createUser', 'listGroupsByUser');
  setTasksFromService(on, storageService, 'checkFile', 'writeFile', 'uploadFile');
};
