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

test.describe('DELETE /project/v1/projects/{projectId}', () => {

  let projectDocument: Documents.Project;

  test.beforeEach(async () => {
    projectDocument = projectDataFactory.document();
  });

  test.describe('called as anyonymous', () => {
    test('should return unauthorized', async ({ requestDeleteProject }) => {
      const res = await requestDeleteProject(projectDataFactory.id());
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
        test('should return forbidden', async ({ requestDeleteProject }) => {
          const res = await requestDeleteProject(projectDataFactory.id());
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should delete project', async ({ requestDeleteProject, saveProject, findProjectById }) => {
          await saveProject(projectDocument);

          const res = await requestDeleteProject(getProjectId(projectDocument));
          expect(res).toBeNoContentResponse();
          
          expect(await findProjectById(getProjectId(projectDocument))).toHaveBeenDeletedFromDatabase();
        });

        test.describe('should unset project in related', () => {
          let accountDocument: Documents.Account;
          let loanAccountDocument: Documents.Account;

          test.beforeEach(async () => {
            accountDocument = accountDataFactory.document();
            loanAccountDocument = accountDataFactory.document({
              accountType: AccountType.Loan,
            });
            
          });
          
          test('payment transaction', async ({ requestDeleteProject, saveAccounts, saveTransactions, findTransactionById, saveProjects, findProjectById }) => {
            const paymentTransactionDocument = paymentTransactionDataFactory.document({
              account: accountDocument,
              project: projectDocument,
            });

            await saveAccounts(accountDocument, loanAccountDocument);
            await saveTransactions(paymentTransactionDocument);
            await saveProjects(projectDocument);

            const res = await requestDeleteProject(getProjectId(projectDocument));
            expect(res).toBeNoContentResponse();
          
            expect(await findProjectById(getProjectId(projectDocument))).toHaveBeenDeletedFromDatabase();

            expect(paymentTransactionDocument).toHaveRelatedDocumentsChangedInPaymentTransaction(await findTransactionById(getTransactionId(paymentTransactionDocument)), {
              project: {
                from: getProjectId(projectDocument),
              },
            });
          });
          
          test('deferred transaction', async ({ requestDeleteProject, saveAccounts, saveTransactions, findTransactionById, saveProjects, findProjectById }) => {
            const deferredTransactionDocument = deferredTransactionDataFactory.document({
              account: accountDocument,
              project: projectDocument,
              loanAccount: loanAccountDocument,
            });
            
            await saveAccounts(accountDocument, loanAccountDocument);
            await saveTransactions(deferredTransactionDocument);
            await saveProjects(projectDocument);

            const res = await requestDeleteProject(getProjectId(projectDocument));
            expect(res).toBeNoContentResponse();
          
            expect(await findProjectById(getProjectId(projectDocument))).toHaveBeenDeletedFromDatabase();

            expect(deferredTransactionDocument).toHaveRelatedDocumentsChangedInDeferredTransaction(await findTransactionById(getTransactionId(deferredTransactionDocument)), {
              project: {
                from: getProjectId(projectDocument),
              },
            });
          });
          
          test('reimbursement transaction', async ({ requestDeleteProject, saveAccounts, saveTransactions, findTransactionById, saveProjects, findProjectById }) => {
            const reimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
              account: loanAccountDocument,
              project: projectDocument,
              loanAccount: accountDocument,
            });
            
            await saveAccounts(accountDocument, loanAccountDocument);
            await saveTransactions(reimbursementTransactionDocument);
            await saveProjects(projectDocument);

            const res = await requestDeleteProject(getProjectId(projectDocument));
            expect(res).toBeNoContentResponse();
          
            expect(await findProjectById(getProjectId(projectDocument))).toHaveBeenDeletedFromDatabase();

            expect(reimbursementTransactionDocument).toHaveRelatedDocumentsChangedInReimbursementTransaction(await findTransactionById(getTransactionId(reimbursementTransactionDocument)), {
              project: {
                from: getProjectId(projectDocument),
              },
            });
          });
          
          test('split transaction', async ({ requestDeleteProject, saveAccounts, saveTransactions, findTransactionById, saveProjects, findProjectById }) => {
            const splitTransactionDocument = splitTransactionDataFactory.document({
              account: accountDocument,
              splits: [
                {
                  project: projectDocument,
                },
              ],
              loans: [
                {
                  project: projectDocument,
                  loanAccount: loanAccountDocument,
                },
              ],
            });
            
            await saveAccounts(accountDocument, loanAccountDocument);
            await saveTransactions(splitTransactionDocument);
            await saveProjects(projectDocument);

            const res = await requestDeleteProject(getProjectId(projectDocument));
            expect(res).toBeNoContentResponse();
          
            expect(await findProjectById(getProjectId(projectDocument))).toHaveBeenDeletedFromDatabase();

            expect(splitTransactionDocument).toHaveRelatedDocumentsChangedInSplitTransaction(await findTransactionById(getTransactionId(splitTransactionDocument)), {
              project: {
                from: getProjectId(projectDocument),
              },
            });
          });
        });

        test.describe('should return error', () => {
          test.describe('if projectId', () => {
            test('is not mongo id', async ({ requestDeleteProject }) => {
              const res = await requestDeleteProject(projectDataFactory.id('not-mongo-id'));
              
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('pathParameters', 'projectId');
            });
          });
        });
      }
    });
  }
});
