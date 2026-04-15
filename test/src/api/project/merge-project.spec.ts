import { entries, getProjectId, getTransactionId } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/api/utils';
import { test, expect as projectApiExpect } from '@household/test/fixtures/project-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { expect as paymentTransactionApiExpect } from '@household/test/fixtures/payment-transaction-api.fixture';
import { expect as deferredTransactionApiExpect } from '@household/test/fixtures/deferred-transaction-api.fixture';
import { expect as reimbursementTransactionApiExpect } from '@household/test/fixtures/reimbursement-transaction-api.fixture';
import { expect as splitTransactionApiExpect } from '@household/test/fixtures/split-transaction-api.fixture';
import { projectDataFactory } from '@household/test/api/project/data-factory';
import { projectService } from '@household/test/api/dependencies';
import { Account, Project, Transaction } from '@household/shared/types/types';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { AccountType } from '@household/shared/enums';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred/deferred-data-factory';
import { reimbursementTransactionDataFactory } from '@household/test/api/transaction/reimbursement/reimbursement-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';
import { transactionService } from '@household/shared/dependencies/services/transaction-service';
import { accountService } from '@household/shared/dependencies/services/account-service';
import { mergeExpects } from '@playwright/test';

const expect = mergeExpects(apiExpect, projectApiExpect, paymentTransactionApiExpect, deferredTransactionApiExpect, reimbursementTransactionApiExpect, splitTransactionApiExpect);

const permissionMap = allowUsers('editor');

test.describe('POST /project/v1/projects/{projectId}/merge', () => {

  let sourceProjectDocument: Project.Document;
  let targetProjectDocument: Project.Document;

  test.beforeEach(() => {
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
        test('should merge projects', async ({ requestMergeProjects }) => {
          await projectService.saveProjects(sourceProjectDocument, targetProjectDocument);

          const res = await requestMergeProjects(getProjectId(targetProjectDocument), [getProjectId(sourceProjectDocument)]);
          expect(res).toBeCreatedResponse();
          
          expect(await projectService.findProjectById(getProjectId(sourceProjectDocument))).toHaveBeenDeletedFromDatabase();
        });

        test.describe('in related transactions source project', () => {
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

          test.beforeEach(() => {
            accountDocument = accountDataFactory.document();
            loanAccountDocument = accountDataFactory.document({
              accountType: AccountType.Loan,
            });

            unrelatedProjectDocument = projectDataFactory.document();

            paymentTransactionDocument = paymentTransactionDataFactory.document({
              account: accountDocument,
              project: sourceProjectDocument,
            });

            deferredTransactionDocument = deferredTransactionDataFactory.document({
              account: accountDocument,
              project: sourceProjectDocument,
              loanAccount: loanAccountDocument,
            });

            reimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
              account: loanAccountDocument,
              project: sourceProjectDocument,
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
                  project: sourceProjectDocument,
                },
                {
                  project: targetProjectDocument,
                },
              ],
              loans: [
                {
                  project: unrelatedProjectDocument,
                  loanAccount: loanAccountDocument,
                },
                {
                  project: sourceProjectDocument,
                  loanAccount: loanAccountDocument,
                },
                {
                  project: targetProjectDocument,
                  loanAccount: loanAccountDocument,
                },
              ],
            });
          });
          
          test('should be unset if project is merged into another project', async ({ requestMergeProjects }) => {
            await accountService.saveAccounts(accountDocument, loanAccountDocument);
            await transactionService.saveTransactions(
              paymentTransactionDocument,
              deferredTransactionDocument,
              reimbursementTransactionDocument,
              unrelatedPaymentTransactionDocument,
              unrelatedDeferredTransactionDocument,
              unrelatedReimbursementTransactionDocument,
              splitTransactionDocument,
            );
            await projectService.saveProjects(sourceProjectDocument, targetProjectDocument, unrelatedProjectDocument);

            const res = await requestMergeProjects(getProjectId(targetProjectDocument), [getProjectId(sourceProjectDocument)]);
            expect(res).toBeCreatedResponse();
          
            expect(await projectService.findProjectById(getProjectId(sourceProjectDocument))).toHaveBeenDeletedFromDatabase();

            expect(paymentTransactionDocument).toChangeRelatedDocumentsChangedInPaymentTransaction(await transactionService.findTransactionById(getTransactionId(paymentTransactionDocument)), {
              project: {
                from: getProjectId(sourceProjectDocument),
                to: getProjectId(targetProjectDocument),
              },
            });
            expect(deferredTransactionDocument).toChangeRelatedDocumentsChangedInDeferredTransaction(await transactionService.findTransactionById(getTransactionId(deferredTransactionDocument)), {
              project: {
                from: getProjectId(sourceProjectDocument),
                to: getProjectId(targetProjectDocument),

              },
            });
            expect(reimbursementTransactionDocument).toChangeRelatedDocumentsChangedInReimbursementTransaction(await transactionService.findTransactionById(getTransactionId(reimbursementTransactionDocument)), {
              project: {
                from: getProjectId(sourceProjectDocument),
                to: getProjectId(targetProjectDocument),

              },
            });
            expect(unrelatedPaymentTransactionDocument).toChangeRelatedDocumentsChangedInPaymentTransaction(await transactionService.findTransactionById(getTransactionId(unrelatedPaymentTransactionDocument)), {
              project: {
                from: getProjectId(sourceProjectDocument),
                to: getProjectId(targetProjectDocument),
              },
            });
            expect(unrelatedDeferredTransactionDocument).toChangeRelatedDocumentsChangedInDeferredTransaction(await transactionService.findTransactionById(getTransactionId(unrelatedDeferredTransactionDocument)), {
              project: {
                from: getProjectId(sourceProjectDocument),
                to: getProjectId(targetProjectDocument),
              },
            });
            expect(unrelatedReimbursementTransactionDocument).toChangeRelatedDocumentsChangedInReimbursementTransaction(await transactionService.findTransactionById(getTransactionId(unrelatedReimbursementTransactionDocument)), {
              project: {
                from: getProjectId(sourceProjectDocument),
                to: getProjectId(targetProjectDocument),
              },
            });
            expect(splitTransactionDocument).toChangeRelatedDocumentsChangedInSplitTransaction(await transactionService.findTransactionById(getTransactionId(splitTransactionDocument)), {
              project: {
                from: getProjectId(sourceProjectDocument),
                to: getProjectId(targetProjectDocument),
              },
            });

          });
        });

        test.describe('should return error', () => {
          test('if a source project does not exist', async ({ requestMergeProjects }) => {
            await projectService.saveProjects(targetProjectDocument);

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
