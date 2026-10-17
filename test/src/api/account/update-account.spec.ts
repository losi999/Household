import { entries, getAccountId } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/utils';
import { Documents } from '@household/shared/types/documents';
import { Requests } from '@household/shared/types/requests';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { accountApiTest as accountApiTest, accountApiExpect as accountApiExpect } from '@household/test/fixtures/account-api.fixture';
import { mergeTests } from '@playwright/test';
import { accountDbTest } from '@household/test/fixtures/account-db.fixture';

const permissionMap = allowUsers('editor') ;

const test = mergeTests(accountApiTest, accountDbTest);

test.describe('PUT /account/v1/accounts/{accountId}', () => {
  let request: Requests.Account;
  let accountDocument: Documents.Account;

  test.beforeEach(async () => {
    request = accountDataFactory.request();

    accountDocument = accountDataFactory.document();
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestUpdateAccount }) => {
      const res = await requestUpdateAccount(accountDataFactory.id(), request);
      accountApiExpect(res).toBeUnauthorizedResponse();
    });
  });

  entries(permissionMap).forEach(([
    userType,
    isAllowed,
  ]) => {
    test.describe(`called as ${userType}`, () => {
      test.use({
        userType: userType, 
      });
      if (!isAllowed) {
        test('should return forbidden', async ({ requestUpdateAccount }) => {
          const res = await requestUpdateAccount(accountDataFactory.id(), request);
          accountApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test('should update account', async ({ requestUpdateAccount, saveAccount, findAccountById }) => {
          await saveAccount(accountDocument);
          const res = await requestUpdateAccount(getAccountId(accountDocument), request);
          accountApiExpect(res).toBeNoContentResponse();
          accountApiExpect(request).toHaveBeenSavedAsAccountDocument(await findAccountById(getAccountId(accountDocument)));
        });

        test.describe('should return error', () => {
          test.describe('if body', () => {
            test('has additional properties', async ({ requestUpdateAccount }) => {
              const res = await requestUpdateAccount(accountDataFactory.id(), {
                ...request,
                extraProperty: 'extra',
              } as any);
          
              accountApiExpect(res).toBeBadRequestResponse();
              accountApiExpect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extraProperty');
            });
          });
          test.describe('if name', () => {
            test('is missing from body', async ({ requestUpdateAccount }) => {
              const res = await requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
                name: undefined, 
              }));
              accountApiExpect(res).toBeBadRequestResponse();
              accountApiExpect(res).toHaveRequiredPropertyValidationError('body', 'name');
            });

            test('is not string', async ({ requestUpdateAccount }) => {
              const res = await requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
                name: <any>1, 
              }));
              accountApiExpect(res).toBeBadRequestResponse();
              accountApiExpect(res).toHaveWrongTypeValidationError('body', 'name', 'string');
            });

            test('is too short', async ({ requestUpdateAccount }) => {
              const res = await requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
                name: '', 
              }));
              accountApiExpect(res).toBeBadRequestResponse();
              accountApiExpect(res).toHaveTooShortValidationError('body', 'name', 1);
            });

            test('is already in use by a different account', async ({ requestUpdateAccount, saveAccount }) => {
              const duplicateAccountDocument = accountDataFactory.document(request);

              await saveAccount(accountDocument);
              await saveAccount(duplicateAccountDocument);
              const res = await requestUpdateAccount(getAccountId(accountDocument), request);
              accountApiExpect(res).toBeBadRequestResponse();
              accountApiExpect(res).toHaveMessage('Duplicate account name');
            });
          });

          test.describe('if accountType', () => {
            test('is missing from body', async ({ requestUpdateAccount }) => {
              const res = await requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
                accountType: undefined, 
              }));
              accountApiExpect(res).toBeBadRequestResponse();
              accountApiExpect(res).toHaveRequiredPropertyValidationError('body', 'accountType');
            });

            test('is not string', async ({ requestUpdateAccount }) => {
              const res = await requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
                accountType: <any>1, 
              }));
              accountApiExpect(res).toBeBadRequestResponse();
              accountApiExpect(res).toHaveWrongTypeValidationError('body', 'accountType', 'string');
            });

            test('is not a valid enum value', async ({ requestUpdateAccount }) => {
              const res = await requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
                accountType: <any>'not-account-type', 
              }));
              accountApiExpect(res).toBeBadRequestResponse();
              accountApiExpect(res).toHaveEnumValidationError('body', 'accountType');
            });
          });

          test.describe('if currency', () => {
            test('is missing from body', async ({ requestUpdateAccount }) => {
              const res = await requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
                currency: undefined, 
              }));
              accountApiExpect(res).toBeBadRequestResponse();
              accountApiExpect(res).toHaveRequiredPropertyValidationError('body', 'currency');
            });

            test('is not string', async ({ requestUpdateAccount }) => {
              const res = await requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
                currency: <any>1, 
              }));
              accountApiExpect(res).toBeBadRequestResponse();
              accountApiExpect(res).toHaveWrongTypeValidationError('body', 'currency', 'string');
            });

            test('is too short', async ({ requestUpdateAccount }) => {
              const res = await requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
                currency: '', 
              }));
              accountApiExpect(res).toBeBadRequestResponse();
              accountApiExpect(res).toHaveTooShortValidationError('body', 'currency', 1);
            });
          });

          test.describe('if accountId', () => {
            test('is not mongo id', async ({ requestUpdateAccount }) => {
              const res = await requestUpdateAccount(accountDataFactory.id('not-valid'), request);
              accountApiExpect(res).toBeBadRequestResponse();
              accountApiExpect(res).toHavePatternValidationError('pathParameters', 'accountId');
            });

            test('does not belong to any account', async ({ requestUpdateAccount }) => {
              const res = await requestUpdateAccount(accountDataFactory.id(), request);
              accountApiExpect(res).toBeNotFoundResponse();
            });
          });
        });
      }
    });
  });
});
