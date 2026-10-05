import { entries, getProjectId, getTransactionId } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/utils';
import { test as projectApiTest, expect as projectApiExpect } from '@household/test/fixtures/project-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { expect as transactionApiExpect } from '@household/test/fixtures/transaction-api.fixture';
import { projectDataFactory } from '@household/test/api/project/data-factory';
import { Documents } from '@household/shared/types/documents';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { AccountType } from '@household/shared/enums';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred/deferred-data-factory';
import { reimbursementTransactionDataFactory } from '@household/test/api/transaction/reimbursement/reimbursement-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';
import { mergeExpects, mergeTests } from '@playwright/test';
import { test as accountDbTest } from '@household/test/fixtures/account-db.fixture';
import { test as transactionDbTest } from '@household/test/fixtures/transaction-db.fixture';
import { test as projectDbTest } from '@household/test/fixtures/project-db.fixture';

const expect = mergeExpects(apiExpect, projectApiExpect, transactionApiExpect);

const permissionMap = allowUsers('editor');

const test = mergeTests(projectApiTest, accountDbTest, transactionDbTest, projectDbTest);

test.describe('POST /project/v1/projects/{projectId}/merge', () => {

  let sourceProjectDocument: Documents.Project;
  let targetProjectDocument: Documents.Project;

  test.beforeEach(async () => {
    sourceProjectDocument = projectDataFactory.document();
    targetProjectDocument = projectDataFactory.document();
  });

  test.describe('called as anyonymous', () => {
    test('should return unauthorized', async ({ requestMergeProjects }) => {
      const res = await requestMergeProjects(projectDataFactory.id(), [projectDataFactory.id()]);
      expect(res).toBeUnauthorizedResponse();
    });
  });

  for (const [
    userType,
    isAllowed,
  ] of entries(permissionMap)) {
    test.describe(`called as ${userType}`, () => {
      test.use({
        userType,
      });
    
      if (!isAllowed) {
        test('should return forbidden', async ({ requestMergeProjects }) => {
          const res = await requestMergeProjects(projectDataFactory.id(), [projectDataFactory.id()]);
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should merge projects', async ({ requestMergeProjects, saveProjects, findProjectById }) => {
          await saveProjects(sourceProjectDocument, targetProjectDocument);

          const res = await requestMergeProjects(getProjectId(targetProjectDocument), [getProjectId(sourceProjectDocument)]);
          expect(res).toBeNoContentResponse();
          
          expect(await findProjectById(getProjectId(sourceProjectDocument))).toHaveBeenDeletedFromDatabase();
        });

        test.describe('should reassign project in related', () => {
          let accountDocument: Documents.Account;
          let loanAccountDocument: Documents.Account;

          test.beforeEach(async () => {
            accountDocument = accountDataFactory.document();
            loanAccountDocument = accountDataFactory.document({
              accountType: AccountType.Loan,
            });
           
          });
          
          test('payment transaction', async ({ requestMergeProjects, saveAccounts, saveTransactions, findTransactionById, saveProjects, findProjectById }) => {
            const paymentTransactionDocument = paymentTransactionDataFactory.document({
              account: accountDocument,
              project: sourceProjectDocument,
            });

            await saveAccounts(accountDocument, loanAccountDocument);
            await saveTransactions(paymentTransactionDocument);
            await saveProjects(sourceProjectDocument, targetProjectDocument);

            const res = await requestMergeProjects(getProjectId(targetProjectDocument), [getProjectId(sourceProjectDocument)]);
            expect(res).toBeNoContentResponse();
          
            expect(await findProjectById(getProjectId(sourceProjectDocument))).toHaveBeenDeletedFromDatabase();

            expect(paymentTransactionDocument).toHaveRelatedDocumentsChangedInPaymentTransaction(await findTransactionById(getTransactionId(paymentTransactionDocument)), {
              project: {
                from: getProjectId(sourceProjectDocument),
                to: getProjectId(targetProjectDocument),
              },
            });
          });
          
          test('deferred transaction', async ({ requestMergeProjects, saveAccounts, saveTransactions, findTransactionById, saveProjects, findProjectById }) => {
            const deferredTransactionDocument = deferredTransactionDataFactory.document({
              account: accountDocument,
              project: sourceProjectDocument,
              loanAccount: loanAccountDocument,
            });

            await saveAccounts(accountDocument, loanAccountDocument);
            await saveTransactions(deferredTransactionDocument);
            await saveProjects(sourceProjectDocument, targetProjectDocument);

            const res = await requestMergeProjects(getProjectId(targetProjectDocument), [getProjectId(sourceProjectDocument)]);
            expect(res).toBeNoContentResponse();
          
            expect(await findProjectById(getProjectId(sourceProjectDocument))).toHaveBeenDeletedFromDatabase();

            expect(deferredTransactionDocument).toHaveRelatedDocumentsChangedInDeferredTransaction(await findTransactionById(getTransactionId(deferredTransactionDocument)), {
              project: {
                from: getProjectId(sourceProjectDocument),
                to: getProjectId(targetProjectDocument),

              },
            });
          });
          
          test('reibursement transaction', async ({ requestMergeProjects, saveAccounts, saveTransactions, findTransactionById, saveProjects, findProjectById }) => {
            const reimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
              account: loanAccountDocument,
              project: sourceProjectDocument,
              loanAccount: accountDocument,
            });

            await saveAccounts(accountDocument, loanAccountDocument);
            await saveTransactions(reimbursementTransactionDocument);
            await saveProjects(sourceProjectDocument, targetProjectDocument);

            const res = await requestMergeProjects(getProjectId(targetProjectDocument), [getProjectId(sourceProjectDocument)]);
            expect(res).toBeNoContentResponse();
          
            expect(await findProjectById(getProjectId(sourceProjectDocument))).toHaveBeenDeletedFromDatabase();

            expect(reimbursementTransactionDocument).toHaveRelatedDocumentsChangedInReimbursementTransaction(await findTransactionById(getTransactionId(reimbursementTransactionDocument)), {
              project: {
                from: getProjectId(sourceProjectDocument),
                to: getProjectId(targetProjectDocument),

              },
            });
          });
          
          test('split transaction', async ({ requestMergeProjects, saveAccounts, saveTransactions, findTransactionById, saveProjects, findProjectById }) => {
            const splitTransactionDocument = splitTransactionDataFactory.document({
              account: accountDocument,
              splits: [
                {
                  project: sourceProjectDocument,
                },
              ],
              loans: [
                {
                  project: sourceProjectDocument,
                  loanAccount: loanAccountDocument,
                },
              ],
            });

            await saveAccounts(accountDocument, loanAccountDocument);
            await saveTransactions(splitTransactionDocument);
            await saveProjects(sourceProjectDocument, targetProjectDocument);

            const res = await requestMergeProjects(getProjectId(targetProjectDocument), [getProjectId(sourceProjectDocument)]);
            expect(res).toBeNoContentResponse();
          
            expect(await findProjectById(getProjectId(sourceProjectDocument))).toHaveBeenDeletedFromDatabase();

            expect(splitTransactionDocument).toHaveRelatedDocumentsChangedInSplitTransaction(await findTransactionById(getTransactionId(splitTransactionDocument)), {
              project: {
                from: getProjectId(sourceProjectDocument),
                to: getProjectId(targetProjectDocument),
              },
            });

          });
        });

        test.describe('should return error', () => {
          test('if a source project does not exist', async ({ requestMergeProjects, saveProjects }) => {
            await saveProjects(targetProjectDocument);

            const res = await requestMergeProjects(getProjectId(targetProjectDocument), [getProjectId(sourceProjectDocument)]);
            expect(res).toBeBadRequestResponse();
            expect(res).toHaveMessage('Some of the projects are not found');
          });

          test.describe('if body', () => {
            test('is not array', async ({ requestMergeProjects }) => {
              const res = await requestMergeProjects(projectDataFactory.id(), {} as any);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'data', 'array');
            });

            test('has too few items', async ({ requestMergeProjects }) => {
              const res = await requestMergeProjects(projectDataFactory.id(), []);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooFewItemsValidationError('body', 'data', 1);
            });
          });

          test.describe('if body[0]', () => {
            test('is not string', async ({ requestMergeProjects }) => {
              const res = await requestMergeProjects(projectDataFactory.id(), [1] as any);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'data/0', 'string');
            });

            test('is not a valid mongo id', async ({ requestMergeProjects }) => {
              const res = await requestMergeProjects(projectDataFactory.id(), [projectDataFactory.id('not-valid')]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'data/0');
            });
          });

          test.describe('if projectId', () => {
            test('is not mongo id', async ({ requestMergeProjects }) => {
              const res = await requestMergeProjects(projectDataFactory.id('not-mongo-id'), [projectDataFactory.id()]);
                        
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('pathParameters', 'projectId');
            });

            test('does not belong to any project', async ({ requestMergeProjects }) => {
              const res = await requestMergeProjects(projectDataFactory.id(), [getProjectId(sourceProjectDocument)]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Some of the projects are not found');
            });
          });
        });
      }
    });
  }
});
