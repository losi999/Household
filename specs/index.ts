import { writeFileSync } from 'fs';
import { OpenApiBuilder } from 'openapi3-ts/oas32';
import { listAccounts } from './paths/account/list-accounts';
import { createAccount } from './paths/account/create-account';
import { getAccount } from './paths/account/get-account';
import { updateAccount } from './paths/account/update-account';
import { deleteAccount } from './paths/account/delete-account';
import { listProjects } from './paths/project/list-projects';
import { createProject } from './paths/project/create-project';
import { getProject } from './paths/project/get-project';
import { updateProject } from './paths/project/update-project';
import { deleteProject } from './paths/project/delete-project';
import { mergeProjects } from './paths/project/merge-projects';
import { listRecipients } from './paths/recipient/list-recipients';
import { createRecipient } from './paths/recipient/create-recipient';
import { getRecipient } from './paths/recipient/get-recipient';
import { updateRecipient } from './paths/recipient/update-recipient';
import { deleteRecipient } from './paths/recipient/delete-recipient';
import { mergeRecipients } from './paths/recipient/merge-recipients';
import { listCategories } from './paths/category/list-categories';
import { createCategory } from './paths/category/create-category';
import { getCategory } from './paths/category/get-category';
import { updateCategory } from './paths/category/update-category';
import { deleteCategory } from './paths/category/delete-category';
import { mergeCategories } from './paths/category/merge-categories';
import { createProduct } from './paths/product/create-product';
import { listProducts } from './paths/product/list-products';
import { updateProduct } from './paths/product/update-product';
import { deleteProduct } from './paths/product/delete-product';
import { mergeProducts } from './paths/product/merge-products';
import { createUploadUrl } from './paths/file/create-upload-url';
import { listFiles } from './paths/file/list-files';
import { deleteFile } from './paths/file/delete-file';
import { listSettings } from './paths/setting/list-settings';
import { updateSetting } from './paths/setting/update-setting';
import { createUser } from './paths/user/create-user';
import { deleteUser } from './paths/user/delete-user';
import { listUsers } from './paths/user/list-users';
import { confirmUser } from './paths/user/confirm-user';
import { addUserToGroup } from './paths/user/add-user-to-group';
import { removeUserFromGroup } from './paths/user/remove-user-from-group';
import { login } from './paths/user/login';
import { refreshToken } from './paths/user/refresh-token';
import { forgotPassword } from './paths/user/forgot-password';
import { confirmForgotPassword } from './paths/user/confirm-forgot-password';
import { createPaymentTransaction } from './paths/transaction/create-payment-transaction';
import { createTransferTransaction } from './paths/transaction/create-transfer-transaction';
import { createSplitTransaction } from './paths/transaction/create-split-transaction';
import { updateToPaymentTransaction } from './paths/transaction/update-to-payment-transaction';
import { updateToSplitTransaction } from './paths/transaction/update-to-split-transaction';
import { updateToTransferTransaction } from './paths/transaction/update-to-transfer-transaction';
import { listTransactionsByAccount } from './paths/transaction/list-transactions-by-account';
import { getTransaction } from './paths/transaction/get-transaction';
import { listDeferredTransactions } from './paths/transaction/list-deferred-transactions';
import { deleteTransaction } from './paths/transaction/delete-transaction';
import { listTransactionsByFile } from './paths/transaction/list-transactions-by-file';
import { listCustomers } from './paths/customer/list-customers';
import { createCustomer } from './paths/customer/create-customer';
import { getCustomer } from './paths/customer/get-customer';
import { updateCustomer } from './paths/customer/update-customer';
import { deleteCustomer } from './paths/customer/delete-customer';
import { listCustomerWorks } from './paths/customer/list-customer-works';
import { createCustomerJob } from './paths/customer/create-customer-job';
import { addCustomerToBlacklist } from './paths/customer/add-customer-to-blacklist';
import { removeCustomerFromBlacklist } from './paths/customer/remove-customer-from-blacklist';
import { updateCustomerJob } from './paths/customer/update-customer-job';
import { deleteCustomerJob } from './paths/customer/delete-customer-job';
import { listPrices } from './paths/price/list-prices';
import { createPrice } from './paths/price/create-price';
import { updatePrice } from './paths/price/update-price';
import { deletePrice } from './paths/price/delete-price';
import { listCalendarDays } from './paths/calendar/list-calendar-days';
import { updateCalendarDay } from './paths/calendar/update-calendar-day';
import { createCalendarEntry } from './paths/calendar/create-calendar-entry';
import { getCalendarEntry } from './paths/calendar/get-calendar-entry';
import { updateCalendarEntry } from './paths/calendar/update-calendar-entry';
import { deleteCalendarDay } from './paths/calendar/delete-calendar-day';
import { deleteCalendarEntry } from './paths/calendar/delete-calendar-entry';
import { resolveCalendarWorkEntry } from './paths/calendar/resolve-calendar-work-entry';
import { reportTransactions } from './paths/transaction/report-transactions';

const document = new OpenApiBuilder()
  .addOpenApiVersion('3.1.0')
  .addInfo({
    title: 'Household API',
    version: '1.0.0',
  })
  .addPath('/account/v1/accounts', {
    ...listAccounts,
    ...createAccount,
  })
  .addPath('/account/v1/accounts/{accountId}', {
    ...getAccount,
    ...updateAccount,
    ...deleteAccount,
  })
  .addPath('/project/v1/projects', {
    ...listProjects,
    ...createProject,
  })
  .addPath('/project/v1/projects/{projectId}', {
    ...getProject,
    ...updateProject,
    ...deleteProject,
  })
  .addPath('/project/v1/projects/{projectId}/merge', {
    ...mergeProjects,
  })
  .addPath('/recipient/v1/recipients', {
    ...listRecipients,
    ...createRecipient,
  })
  .addPath('/recipient/v1/recipients/{recipientId}', {
    ...getRecipient,
    ...updateRecipient,
    ...deleteRecipient,
  })
  .addPath('/recipient/v1/recipients/{recipientId}/merge', {
    ...mergeRecipients,
  })
  .addPath('/category/v1/categories', {
    ...listCategories,
    ...createCategory,
  })
  .addPath('/category/v1/categories/{categoryId}', {
    ...getCategory,
    ...updateCategory,
    ...deleteCategory,
  })
  .addPath('/category/v1/categories/{categoryId}/merge', {
    ...mergeCategories,
  })
  .addPath('/product/v1/categories/{categoryId}/products', {
    ...createProduct,
  })
  .addPath('/product/v1/products', {
    ...listProducts,
  })
  .addPath('/product/v1/products/{productId}', {
    ...updateProduct,
    ...deleteProduct,
  })
  .addPath('/product/v1/products/{productId}/merge', {
    ...mergeProducts,
  })
  .addPath('/transaction/v1/accounts/{accountId}/transactions', {
    ...listTransactionsByAccount,
  })
  .addPath('/transaction/v1/accounts/{accountId}/transactions/{transactionId}', {
    ...getTransaction,
  })
  .addPath('/transaction/v1/transactions/payment', {
    ...createPaymentTransaction,
  })
  .addPath('/transaction/v1/transactions/transfer', {
    ...createTransferTransaction,
  })
  .addPath('/transaction/v1/transactions/split', {
    ...createSplitTransaction,
  })
  .addPath('/transaction/v1/transactions/deferred', {
    ...listDeferredTransactions,
  })
  .addPath('/transaction/v1/transactions/{transactionId}/payment', {
    ...updateToPaymentTransaction,
  })
  .addPath('/transaction/v1/transactions/{transactionId}/transfer', {
    ...updateToTransferTransaction,
  })
  .addPath('/transaction/v1/transactions/{transactionId}/split', {
    ...updateToSplitTransaction,
  })
  .addPath('/transaction/v1/transactions/{transactionId}', {
    ...deleteTransaction,
  }) 
  .addPath('/transaction/v1/transactionReports', {
    ...reportTransactions,
  })
  .addPath('/transaction/v1/files/{fileId}/transactions', {
    ...listTransactionsByFile,
  })
  .addPath('/file/v1/files', {
    ...listFiles,
    ...createUploadUrl,
  })
  .addPath('/file/v1/files/{fileId}', {
    ...deleteFile,
  })
  .addPath('/setting/v1/settings', {
    ...listSettings,
  })
  .addPath('/setting/v1/settings/{settingKey}', {
    ...updateSetting,
  })
  .addPath('/user/v1/users', {
    ...listUsers,
    ...createUser,
  })
  .addPath('/user/v1/users/{email}', {
    ...deleteUser,
  })
  .addPath('/user/v1/users/{email}/confirm', {
    ...confirmUser,
  })
  .addPath('/user/v1/users/{email}/groups/{group}', {
    ...addUserToGroup,
    ...removeUserFromGroup,
  })
  .addPath('/user/v1/users/{email}/confirmForgotPassword', {
    ...confirmForgotPassword,
  })
  .addPath('/user/v1/login', {
    ...login,
  })
  .addPath('/user/v1/refreshToken', {
    ...refreshToken,
  })
  .addPath('/user/v1/forgotPassword', {
    ...forgotPassword,
  })
  .addPath('/customer/v1/customers', {
    ...listCustomers,
    ...createCustomer,
  })
  .addPath('/customer/v1/customers/{customerId}', {
    ...getCustomer,
    ...updateCustomer,
    ...deleteCustomer,
  })
  .addPath('/customer/v1/customers/{customerId}/works', {
    ...listCustomerWorks,
  })
  .addPath('/customer/v1/customers/{customerId}/jobs', {
    ...createCustomerJob,
  })
  .addPath('/customer/v1/customers/{customerId}/jobs/{jobName}', {
    ...updateCustomerJob,
    ...deleteCustomerJob,
  })
  .addPath('/customer/v1/customers/blacklist', {
    ...addCustomerToBlacklist,
    ...removeCustomerFromBlacklist,
  })
  .addPath('/price/v1/prices', {
    ...listPrices,
    ...createPrice,
  })
  .addPath('/price/v1/prices/{priceId}', {
    ...updatePrice,
    ...deletePrice,
  })
  .addPath('/calendar/v1/days', {
    ...listCalendarDays,
  })
  .addPath('/calendar/v1/days/{day}', {
    ...updateCalendarDay,
    ...deleteCalendarDay,
  })
  .addPath('/calendar/v1/entries', {
    ...createCalendarEntry,
  })
  .addPath('/calendar/v1/entries/{calendarEntryId}', {
    ...getCalendarEntry,
    ...updateCalendarEntry,
    ...deleteCalendarEntry,
  })
  .addPath('/calendar/v1/entries/{calendarEntryId}/resolution', {
    ...resolveCalendarWorkEntry,
  });

writeFileSync('specs/household.json', document.getSpecAsJson(undefined, 2));
