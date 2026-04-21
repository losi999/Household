import { entries } from '@household/shared/common/utils';
import { Account } from '@household/shared/types/types';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { allowUsers } from '@household/test/utils';
import { test, expect as accountApiExpect } from '@household/test/fixtures/account-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects } from '@playwright/test';
import { accountService } from '@household/test/dependencies';

const expect = mergeExpects(accountApiExpect, apiExpect);

const permissionMap = allowUsers('editor') ;
test.describe('POST account/v1/accounts', () => {
  let request: Account.Request;

  test.beforeEach(async () => {
    request = accountDataFactory.request();
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestCreateAccount }) => {
      const res = await requestCreateAccount(request);
      expect(res).toBeUnauthorizedResponse();
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
        test('should return forbidden', async ({ requestCreateAccount }) => {
          const res = await requestCreateAccount(request);
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should create account', async ({ requestCreateAccount }) => {
          const res = await requestCreateAccount(request);
          expect(res).toBeCreatedResponse();

          const { accountId } = (await res.json()) as Account.AccountId;
          expect(request).toHaveBeenSavedAsAccountDocument(await accountService.findAccountById(accountId));
        });

        test('should create account with an existing name for a different owner', async ({ requestCreateAccount }) => {
          const accountDocument = accountDataFactory.document(request);

          request = accountDataFactory.request({
            name: request.name,
          });

          await accountService.saveAccount(accountDocument);
          const res = await requestCreateAccount(request);
          expect(res).toBeCreatedResponse();

          const { accountId } = (await res.json()) as Account.AccountId;
          expect(request).toHaveBeenSavedAsAccountDocument(await accountService.findAccountById(accountId));
        });

        test.describe('should return error', () => {
          test.describe('if body', () => {
            test('has additional properties', async ({ requestCreateAccount }) => {
              const res = await requestCreateAccount({
                ...request,
                extraProperty: 'extra',
              } as any);
  
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extraProperty');
            });
          });

          test.describe('if name', () => {
            test('is missing from body', async ({ requestCreateAccount }) => {
              const res = await requestCreateAccount(accountDataFactory.request({
                name: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'name');
            });

            test('is not string', async ({ requestCreateAccount }) => {
              const res = await requestCreateAccount(accountDataFactory.request({
                name: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'name', 'string');
            });

            test('is too short', async ({ requestCreateAccount }) => {
              const res = await requestCreateAccount(accountDataFactory.request({
                name: '', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'name', 1);
            });

            test('is already in use by a different account of the same owner', async ({ requestCreateAccount }) => {
              const accountDocument = accountDataFactory.document(request);

              await accountService.saveAccount(accountDocument);
              const res = await requestCreateAccount(request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Duplicate account name');
            });
          });

          test.describe('if accountType', () => {
            test('is missing from body', async ({ requestCreateAccount }) => {
              const res = await requestCreateAccount(accountDataFactory.request({
                accountType: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'accountType');
            });

            test('is not string', async ({ requestCreateAccount }) => {
              const res = await requestCreateAccount(accountDataFactory.request({
                accountType: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'accountType', 'string');
            });

            test('is not a valid enum value', async ({ requestCreateAccount }) => {
              const res = await requestCreateAccount(accountDataFactory.request({
                accountType: 'not-account-type' as any, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveEnumValidationError('body', 'accountType');
            });
          });

          test.describe('if currency', () => {
            test('is missing from body', async ({ requestCreateAccount }) => {
              const res = await requestCreateAccount(accountDataFactory.request({
                currency: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'currency');
            });

            test('is not string', async ({ requestCreateAccount }) => {
              const res = await requestCreateAccount(accountDataFactory.request({
                currency: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'currency', 'string');
            });

            test('is too short', async ({ requestCreateAccount }) => {
              const res = await requestCreateAccount(accountDataFactory.request({
                currency: '', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'currency', 1);
            });
          });

          test.describe('if owner', () => {
            test('is missing from body', async ({ requestCreateAccount }) => {
              const res = await requestCreateAccount(accountDataFactory.request({
                owner: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'owner');
            });

            test('is not string', async ({ requestCreateAccount }) => {
              const res = await requestCreateAccount(accountDataFactory.request({
                owner: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'owner', 'string');
            });

            test('is too short', async ({ requestCreateAccount }) => {
              const res = await requestCreateAccount(accountDataFactory.request({
                owner: '', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'owner', 1);
            });
          });
        });
      }
    });
  });
});
