import { entries, getAccountId, getTransactionId } from '@household/shared/common/utils';
import { AccountType } from '@household/shared/enums';
import { Account, Transaction } from '@household/shared/types/types';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred/deferred-data-factory';
import { transferTransactionDataFactory } from '@household/test/api/transaction/transfer/transfer-data-factory';
import { allowUsers } from '@household/test/utils';

import { test, expect as transactionApiExpect } from '@household/test/fixtures/transaction-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects } from '@playwright/test';
import { accountService, transactionService } from '@household/test/dependencies';

const expect = mergeExpects(transactionApiExpect, apiExpect);

const permissionMap = allowUsers('editor') ;

test.describe('POST transaction/v1/transactions/transfer (transfer)', () => {
  let request: Transaction.TransferRequest;
  let accountDocument: Account.Document;
  let transferAccountDocument: Account.Document;
  let relatedDocumentIds: Pick<Transaction.TransferRequest, 'accountId' | 'transferAccountId'> ;

  test.beforeEach(async () => {
    accountDocument = accountDataFactory.document();
    transferAccountDocument = accountDataFactory.document();

    relatedDocumentIds = {
      accountId: getAccountId(accountDocument),
      transferAccountId: getAccountId(transferAccountDocument),
    };

    request = transferTransactionDataFactory.request(relatedDocumentIds);
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestCreateTransferTransaction }) => {
      const res = await requestCreateTransferTransaction(request);
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
        test('should return forbidden', async ({ requestCreateTransferTransaction }) => {
          const res = await requestCreateTransferTransaction(request);
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should create transaction', () => {
          test('between non-loan accounts', async ({ requestCreateTransferTransaction }) => {
            await accountService.saveAccounts(accountDocument, transferAccountDocument);
            const res = await requestCreateTransferTransaction(request);
            expect(res).toBeCreatedResponse();
            const { transactionId } = await res.json() as Transaction.TransactionId;
            expect(request).toHaveBeenSavedAsTransferTransactionDocument(await transactionService.getTransactionById(transactionId));
          });

          test('between a non-loan and a loan account', async ({ requestCreateTransferTransaction }) => {
            const loanAccountDocument = accountDataFactory.document({
              accountType: AccountType.Loan,
            });

            request = transferTransactionDataFactory.request({
              accountId: getAccountId(accountDocument),
              transferAccountId: getAccountId(loanAccountDocument),
            });

            await accountService.saveAccounts(accountDocument, loanAccountDocument);
            const res = await requestCreateTransferTransaction(request);
            expect(res).toBeCreatedResponse();
            const { transactionId } = await res.json() as Transaction.TransactionId;
            expect(request).toHaveBeenSavedAsTransferTransactionDocument(await transactionService.getTransactionById(transactionId));
          });

          test('between two loan accounts', async ({ requestCreateTransferTransaction }) => {
            accountDocument = accountDataFactory.document({
              accountType: AccountType.Loan,
            });

            transferAccountDocument = accountDataFactory.document({
              accountType: AccountType.Loan,
            });

            request = transferTransactionDataFactory.request({
              accountId: getAccountId(accountDocument),
              transferAccountId: getAccountId(transferAccountDocument),
            });

            await accountService.saveAccounts(accountDocument, transferAccountDocument);
            const res = await requestCreateTransferTransaction(request);
            expect(res).toBeCreatedResponse();
            const { transactionId } = await res.json() as Transaction.TransactionId;
            expect(request).toHaveBeenSavedAsTransferTransactionDocument(await transactionService.getTransactionById(transactionId));
          });

          test('with payments between non-loan accounts', async ({ requestCreateTransferTransaction }) => {
            const deferredTransactionDocument = deferredTransactionDataFactory.document({
              body: {
                amount: -5000,
              },
              account: accountDocument,
              loanAccount: transferAccountDocument,
            });

            request = transferTransactionDataFactory.request({
              accountId: getAccountId(accountDocument),
              transferAccountId: getAccountId(transferAccountDocument),
              amount: 2000,
              payments: [
                {
                  amount: 1500,
                  transactionId: getTransactionId(deferredTransactionDocument),
                },
              ],
            });

            await accountService.saveAccounts(accountDocument, transferAccountDocument);
            await transactionService.saveTransaction(deferredTransactionDocument);
            const res = await requestCreateTransferTransaction(request);
            expect(res).toBeCreatedResponse();
            const { transactionId } = await res.json() as Transaction.TransactionId;
            expect(request).toHaveBeenSavedAsTransferTransactionDocument(await transactionService.getTransactionById(transactionId));
          });

          test('with payments between a non-loan and a loan account', async ({ requestCreateTransferTransaction }) => {
            const loanAccountDocument = accountDataFactory.document({
              accountType: AccountType.Loan,
            });

            const deferredTransactionDocument = deferredTransactionDataFactory.document({
              body: {
                amount: -5000,
              },
              account: accountDocument,
              loanAccount: transferAccountDocument,
            });

            request = transferTransactionDataFactory.request({
              accountId: getAccountId(accountDocument),
              transferAccountId: getAccountId(loanAccountDocument,
              ),
              amount: 2000,
              payments: [
                {
                  amount: 1500,
                  transactionId: getTransactionId(deferredTransactionDocument),
                },
              ],
            });

            await accountService.saveAccounts(accountDocument, loanAccountDocument);
            await transactionService.saveTransaction(deferredTransactionDocument);
            const res = await requestCreateTransferTransaction(request);
            expect(res).toBeCreatedResponse();
            const { transactionId } = await res.json() as Transaction.TransactionId;
            expect(request).toHaveBeenSavedAsTransferTransactionDocument(await transactionService.getTransactionById(transactionId));
          });

          test('with payment amount max out by deferred transaction amount', async ({ requestCreateTransferTransaction }) => {
            const deferredTransactionDocument = deferredTransactionDataFactory.document({
              body: {
                amount: -500,
              },
              account: accountDocument,
              loanAccount: transferAccountDocument,
            });

            request = transferTransactionDataFactory.request({
              accountId: getAccountId(accountDocument),
              transferAccountId: getAccountId(transferAccountDocument),
              amount: 2000,
              payments: [
                {
                  amount: 1500,
                  transactionId: getTransactionId(deferredTransactionDocument),
                },
              ],
            });

            await accountService.saveAccounts(accountDocument, transferAccountDocument);
            await transactionService.saveTransaction(deferredTransactionDocument);
            const res = await requestCreateTransferTransaction(request);
            expect(res).toBeCreatedResponse();
            const { transactionId } = await res.json() as Transaction.TransactionId;
            expect(request).toHaveBeenSavedAsTransferTransactionDocument(await transactionService.getTransactionById(transactionId));
          });

          test.describe('without optional properties', () => {
            test('description', async ({ requestCreateTransferTransaction }) => {
              request = transferTransactionDataFactory.request({
                ...relatedDocumentIds,
                description: undefined,
              });

              await accountService.saveAccounts(accountDocument, transferAccountDocument);
              const res = await requestCreateTransferTransaction(request);
              expect(res).toBeCreatedResponse();
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsTransferTransactionDocument(await transactionService.getTransactionById(transactionId));
            });

            test('transferAmount', async ({ requestCreateTransferTransaction }) => {
              request = transferTransactionDataFactory.request({
                ...relatedDocumentIds,
                transferAmount: undefined,
              });

              await accountService.saveAccounts(accountDocument, transferAccountDocument);
              const res = await requestCreateTransferTransaction(request);
              expect(res).toBeCreatedResponse();
              const { transactionId } = await res.json() as Transaction.TransactionId;
              expect(request).toHaveBeenSavedAsTransferTransactionDocument(await transactionService.getTransactionById(transactionId));
            });
          });
        });

        test.describe('should return error', () => {
          test.describe('if body', () => {
            test('has additional properties', async ({ requestCreateTransferTransaction }) => {
              const res = await requestCreateTransferTransaction(transferTransactionDataFactory.request({
                extra: 123, 
              } as any));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extra');
            });
          });

          test.describe('if amount', () => {
            test('is missing', async ({ requestCreateTransferTransaction }) => {
              const res = await requestCreateTransferTransaction(transferTransactionDataFactory.request({
                amount: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'amount');
            });

            test('is not number', async ({ requestCreateTransferTransaction }) => {
              const res = await requestCreateTransferTransaction(transferTransactionDataFactory.request({
                amount: <any>'1', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'amount', 'number');
            });
          });

          test.describe('if description', () => {
            test('is not string', async ({ requestCreateTransferTransaction }) => {
              const res = await requestCreateTransferTransaction(transferTransactionDataFactory.request({
                description: <any> 1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'description', 'string');
            });

            test('is too short', async ({ requestCreateTransferTransaction }) => {
              const res = await requestCreateTransferTransaction(transferTransactionDataFactory.request({
                description: '', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'description', 1);
            });
          });

          test.describe('if issuedAt', () => {
            test('is missing', async ({ requestCreateTransferTransaction }) => {
              const res = await requestCreateTransferTransaction(transferTransactionDataFactory.request({
                issuedAt: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'issuedAt');
            });

            test('is not string', async ({ requestCreateTransferTransaction }) => {
              const res = await requestCreateTransferTransaction(transferTransactionDataFactory.request({
                issuedAt: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'issuedAt', 'string');
            });

            test('is not date-time format', async ({ requestCreateTransferTransaction }) => {
              const res = await requestCreateTransferTransaction(transferTransactionDataFactory.request({
                issuedAt: 'not-date-time', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongFormatValidationError('body', 'issuedAt', 'date-time');
            });
          });

          test.describe('if accountId', () => {
            test('does not belong to any account', async ({ requestCreateTransferTransaction }) => {
              await accountService.saveAccount(transferAccountDocument);
              const res = await requestCreateTransferTransaction(transferTransactionDataFactory.request({
                ...relatedDocumentIds,
                accountId: accountDataFactory.id(), 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('No account found');
            });
            test('is missing', async ({ requestCreateTransferTransaction }) => {
              const res = await requestCreateTransferTransaction(transferTransactionDataFactory.request({
                accountId: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'accountId');
            });

            test('is not string', async ({ requestCreateTransferTransaction }) => {
              const res = await requestCreateTransferTransaction(transferTransactionDataFactory.request({
                accountId: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'accountId', 'string');
            });

            test('is not mongo id format', async ({ requestCreateTransferTransaction }) => {
              const res = await requestCreateTransferTransaction(transferTransactionDataFactory.request({
                accountId: accountDataFactory.id('not-mongo-id'), 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'accountId');
            });
          });

          test.describe('if transferAccountId', () => {
            test('is the same as accountId', async ({ requestCreateTransferTransaction }) => {
              const res = await requestCreateTransferTransaction(transferTransactionDataFactory.request({
                ...relatedDocumentIds,
                transferAccountId: getAccountId(accountDocument), 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Cannot transfer to same account');
            });

            test('does not belong to any account', async ({ requestCreateTransferTransaction }) => {
              await accountService.saveAccount(accountDocument);
              const res = await requestCreateTransferTransaction(transferTransactionDataFactory.request({
                ...relatedDocumentIds,
                transferAccountId: accountDataFactory.id(), 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('No account found');
            });

            test('is missing', async ({ requestCreateTransferTransaction }) => {
              const res = await requestCreateTransferTransaction(transferTransactionDataFactory.request({
                transferAccountId: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'transferAccountId');
            });

            test('is not string', async ({ requestCreateTransferTransaction }) => {
              const res = await requestCreateTransferTransaction(transferTransactionDataFactory.request({
                transferAccountId: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'transferAccountId', 'string');
            });

            test('is not mongo id format', async ({ requestCreateTransferTransaction }) => {
              const res = await requestCreateTransferTransaction(transferTransactionDataFactory.request({
                transferAccountId: accountDataFactory.id('not-mongo-id'), 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'transferAccountId');
            });
          });

          test.describe('if transferAmount', () => {
            test('is not number', async ({ requestCreateTransferTransaction }) => {
              const res = await requestCreateTransferTransaction(transferTransactionDataFactory.request({
                transferAmount: <any>'1', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'transferAmount', 'number');
            });
          });
        });
      }
    });
  });
});
