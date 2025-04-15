import { getProjectId } from '@household/shared/common/utils';
import { Account, Project, Transaction } from '@household/shared/types/types';
import { splitTransactionDataFactory } from '../transaction/split/split-data-factory';
import { paymentTransactionDataFactory } from '../transaction/payment/payment-data-factory';
import { projectDataFactory } from './data-factory';
import { accountDataFactory } from '../account/data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred/deferred-data-factory';
import { reimbursementTransactionDataFactory } from '@household/test/api/transaction/reimbursement/reimbursement-data-factory';
import { AccountType } from '@household/shared/enums';

describe('DELETE /project/v1/projects/{projectId}', () => {
  let projectDocument: Project.Document;

  beforeEach(() => {
    projectDocument = projectDataFactory.document();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestDeleteProject(projectDataFactory.id())
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {

    it('should delete project', () => {
      cy.saveProjectDocument(projectDocument)
        .authenticate(1)
        .requestDeleteProject(getProjectId(projectDocument))
        .expectNoContentResponse()
        .validateProjectDeleted(getProjectId(projectDocument));
    });

    describe('in related transactions project', () => {
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

      beforeEach(() => {
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
      it('should be unset if project is deleted', () => {
        cy.saveAccountDocuments([
          accountDocument,
          loanAccountDocument,
        ])
          .saveProjectDocuments([
            projectDocument,
            unrelatedProjectDocument,
          ])
          .saveTransactionDocuments([
            paymentTransactionDocument,
            splitTransactionDocument,
            deferredTransactionDocument,
            reimbursementTransactionDocument,
            unrelatedPaymentTransactionDocument,
            unrelatedDeferredTransactionDocument,
            unrelatedReimbursementTransactionDocument,
          ])
          .authenticate(1)
          .requestDeleteProject(getProjectId(projectDocument))
          .expectNoContentResponse()
          .validateProjectDeleted(getProjectId(projectDocument))
          .validateRelatedChangesInPaymentDocument(paymentTransactionDocument, {
            project: {
              from: getProjectId(projectDocument),
            },
          })
          .validateRelatedChangesInPaymentDocument(unrelatedPaymentTransactionDocument, {
            project: {
              from: getProjectId(projectDocument),
            },
          })
          .validateRelatedChangesInDeferredDocument(deferredTransactionDocument, {
            project: {
              from: getProjectId(projectDocument),
            },
          })
          .validateRelatedChangesInDeferredDocument(unrelatedDeferredTransactionDocument, {
            project: {
              from: getProjectId(projectDocument),
            },
          })
          .validateRelatedChangesInReimbursementDocument(reimbursementTransactionDocument, {
            project: {
              from: getProjectId(projectDocument),
            },
          })
          .validateRelatedChangesInReimbursementDocument(unrelatedReimbursementTransactionDocument, {
            project: {
              from: getProjectId(projectDocument),
            },
          })
          .validateRelatedChangesInSplitDocument(splitTransactionDocument, {
            project: {
              from: getProjectId(projectDocument),
            },
          });
      });
    });

    describe('should return error', () => {
      describe('if projectId', () => {
        it('is not mongo id', () => {
          cy.authenticate(1)
            .requestDeleteProject(projectDataFactory.id('not-valid'))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('projectId', 'pathParameters');
        });
      });
    });
  });
});
