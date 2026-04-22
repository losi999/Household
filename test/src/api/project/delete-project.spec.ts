import { entries, getProjectId, getTransactionId } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/utils';
import { test as projectApiTest, expect as projectApiExpect } from '@household/test/fixtures/project-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { expect as transactionApiExpect } from '@household/test/fixtures/transaction-api.fixture';
import { projectDataFactory } from '@household/test/api/project/data-factory';
import { Account, Project, Transaction } from '@household/shared/types/types';
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

  let projectDocument: Project.Document;

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

        test.describe('in related transactions project', () => {
          let unrelatedProjectDocument: Project.Document;
          let paymentTransactionDocument: Transaction.PaymentDocument;
          let deferredTransactionDocument: Transaction.DeferredDocument;
          let reimbursementTransactionDocument: Transaction.ReimbursementDocument;
          let splitTransactionDocument: Transaction.SplitDocument;
          let unrelatedPaymentTransactionDocument: Transaction.PaymentDocument;
          let unrelatedDeferredTransactionDocument: Transaction.DeferredDocument;
          let unrelatedReimbursementTransactionDocument: Transaction.ReimbursementDocument;
          let accountDocument: Account.Document;
          let loanAccountDocument: Account.Document;

          test.beforeEach(async () => {
            accountDocument = accountDataFactory.document();
            loanAccountDocument = accountDataFactory.document({
              accountType: AccountType.Loan,
            });

            unrelatedProjectDocument = projectDataFactory.document();

            paymentTransactionDocument = paymentTransactionDataFactory.document({
              account: accountDocument,
              project: projectDocument,
            });

            deferredTransactionDocument = deferredTransactionDataFactory.document({
              account: accountDocument,
              project: projectDocument,
              loanAccount: loanAccountDocument,
            });

            reimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
              account: loanAccountDocument,
              project: projectDocument,
              loanAccount: accountDocument,
            });

            unrelatedPaymentTransactionDocument = paymentTransactionDataFactory.document({
              account: accountDocument,
              project: unrelatedProjectDocument,
            });

            unrelatedDeferredTransactionDocument = deferredTransactionDataFactory.document({
              account: accountDocument,
              project: unrelatedProjectDocument,
              loanAccount: loanAccountDocument,
            });

            unrelatedReimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
              account: loanAccountDocument,
              project: unrelatedProjectDocument,
              loanAccount: accountDocument,
            });

            splitTransactionDocument = splitTransactionDataFactory.document({
              account: accountDocument,
              splits: [
                {
                  project: unrelatedProjectDocument,
                },
                {
                  project: projectDocument,
                },
              ],
              loans: [
                {
                  project: unrelatedProjectDocument,
                  loanAccount: loanAccountDocument,
                },
                {
                  project: projectDocument,
                  loanAccount: loanAccountDocument,
                },
              ],
            });
          });
          
          test('should be unset if project is deleted', async ({ requestDeleteProject, saveAccounts, saveTransactions, findTransactionById, saveProjects, findProjectById }) => {
            await saveAccounts(accountDocument, loanAccountDocument);
            await saveTransactions(
              paymentTransactionDocument,
              deferredTransactionDocument,
              reimbursementTransactionDocument,
              unrelatedPaymentTransactionDocument,
              unrelatedDeferredTransactionDocument,
              unrelatedReimbursementTransactionDocument,
              splitTransactionDocument,
            );
            await saveProjects(projectDocument, unrelatedProjectDocument);

            const res = await requestDeleteProject(getProjectId(projectDocument));
            expect(res).toBeNoContentResponse();
          
            expect(await findProjectById(getProjectId(projectDocument))).toHaveBeenDeletedFromDatabase();

            expect(paymentTransactionDocument).toHaveRelatedDocumentsChangedInPaymentTransaction(await findTransactionById(getTransactionId(paymentTransactionDocument)), {
              project: {
                from: getProjectId(projectDocument),
              },
            });
            expect(deferredTransactionDocument).toHaveRelatedDocumentsChangedInDeferredTransaction(await findTransactionById(getTransactionId(deferredTransactionDocument)), {
              project: {
                from: getProjectId(projectDocument),
              },
            });
            expect(reimbursementTransactionDocument).toHaveRelatedDocumentsChangedInReimbursementTransaction(await findTransactionById(getTransactionId(reimbursementTransactionDocument)), {
              project: {
                from: getProjectId(projectDocument),
              },
            });
            expect(unrelatedPaymentTransactionDocument).toHaveRelatedDocumentsChangedInPaymentTransaction(await findTransactionById(getTransactionId(unrelatedPaymentTransactionDocument)), {
              project: {
                from: getProjectId(projectDocument),
              },
            });
            expect(unrelatedDeferredTransactionDocument).toHaveRelatedDocumentsChangedInDeferredTransaction(await findTransactionById(getTransactionId(unrelatedDeferredTransactionDocument)), {
              project: {
                from: getProjectId(projectDocument),
              },
            });
            expect(unrelatedReimbursementTransactionDocument).toHaveRelatedDocumentsChangedInReimbursementTransaction(await findTransactionById(getTransactionId(unrelatedReimbursementTransactionDocument)), {
              project: {
                from: getProjectId(projectDocument),
              },
            });
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
