import { entries, getAccountId } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/utils';
import { Account } from '@household/shared/types/types';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { test, expect as accountApiExpect } from '@household/test/fixtures/account-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects } from '@playwright/test';
import { accountService } from '@household/test/dependencies';

const expect = mergeExpects(accountApiExpect, apiExpect);

const permissionMap = allowUsers('editor') ;

test.describe('PUT /account/v1/accounts/{accountId}', () => {
  let request: Account.Request;
  let accountDocument: Account.Document;

  test.beforeEach(async () => {
    request = accountDataFactory.request();

    accountDocument = accountDataFactory.document();
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestUpdateAccount }) => {
      const res = await requestUpdateAccount(accountDataFactory.id(), request);
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
        test('should return forbidden', async ({ requestUpdateAccount }) => {
          const res = await requestUpdateAccount(accountDataFactory.id(), request);
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should update account', async ({ requestUpdateAccount }) => {
          await accountService.saveAccount(accountDocument);
          const res = await requestUpdateAccount(getAccountId(accountDocument), request);
          expect(res).toBeCreatedResponse();
          
          const { accountId } = (await res.json()) as Account.AccountId;
          expect(request).toHaveBeenSavedAsAccountDocument(await accountService.findAccountById(accountId));
        });

        test('should update account with an existing name for a different owner', async ({ requestUpdateAccount }) => {
          const sameNameAccountDocument = accountDataFactory.document({
            ...request,
            owner: 'different owner',
          });

          await accountService.saveAccounts(accountDocument, sameNameAccountDocument);
          const res = await requestUpdateAccount(getAccountId(accountDocument), request);
          expect(res).toBeCreatedResponse();

          const { accountId } = (await res.json()) as Account.AccountId;
          expect(request).toHaveBeenSavedAsAccountDocument(await accountService.findAccountById(accountId));
        });
        test.describe('should return error', () => {
          test.describe('if body', () => {
            test('has additional properties', async ({ requestUpdateAccount }) => {
              const res = await requestUpdateAccount(accountDataFactory.id(), {
                ...request,
                extraProperty: 'extra',
              } as any);
          
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extraProperty');
            });
          });
          test.describe('if name', () => {
            test('is missing from body', async ({ requestUpdateAccount }) => {
              const res = await requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
                name: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'name');
            });

            test('is not string', async ({ requestUpdateAccount }) => {
              const res = await requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
                name: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'name', 'string');
            });

            test('is too short', async ({ requestUpdateAccount }) => {
              const res = await requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
                name: '', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'name', 1);
            });

            test('is already in use by a different account of the same owner', async ({ requestUpdateAccount }) => {
              const duplicateAccountDocument = accountDataFactory.document(request);

              await accountService.saveAccount(accountDocument);
              await accountService.saveAccount(duplicateAccountDocument);
              const res = await requestUpdateAccount(getAccountId(accountDocument), request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Duplicate account name');
            });
          });

          test.describe('if accountType', () => {
            test('is missing from body', async ({ requestUpdateAccount }) => {
              const res = await requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
                accountType: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'accountType');
            });

            test('is not string', async ({ requestUpdateAccount }) => {
              const res = await requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
                accountType: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'accountType', 'string');
            });

            test('is not a valid enum value', async ({ requestUpdateAccount }) => {
              const res = await requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
                accountType: <any>'not-account-type', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveEnumValidationError('body', 'accountType');
            });
          });

          test.describe('if currency', () => {
            test('is missing from body', async ({ requestUpdateAccount }) => {
              const res = await requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
                currency: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'currency');
            });

            test('is not string', async ({ requestUpdateAccount }) => {
              const res = await requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
                currency: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'currency', 'string');
            });

            test('is too short', async ({ requestUpdateAccount }) => {
              const res = await requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
                currency: '', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'currency', 1);
            });
          });

          test.describe('if owner', () => {
            test('is missing from body', async ({ requestUpdateAccount }) => {
              const res = await requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
                owner: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'owner');
            });

            test('is not string', async ({ requestUpdateAccount }) => {
              const res = await requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
                owner: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'owner', 'string');
            });

            test('is too short', async ({ requestUpdateAccount }) => {
              const res = await requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
                owner: '', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'owner', 1);
            });
          });

          test.describe('if accountId', () => {
            test('is not mongo id', async ({ requestUpdateAccount }) => {
              const res = await requestUpdateAccount(accountDataFactory.id('not-valid'), request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('pathParameters', 'accountId');
            });

            test('does not belong to any account', async ({ requestUpdateAccount }) => {
              const res = await requestUpdateAccount(accountDataFactory.id(), request);
              expect(res).toBeNotFoundResponse();
            });
          });
        });
      }
    });
  });
});
