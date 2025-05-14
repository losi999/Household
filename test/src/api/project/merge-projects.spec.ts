import { getProjectId } from '@household/shared/common/utils';
import { Account, Project, Transaction } from '@household/shared/types/types';
import { splitTransactionDataFactory } from '../transaction/split/split-data-factory';
import { paymentTransactionDataFactory } from '../transaction/payment/payment-data-factory';
import { projectDataFactory } from './data-factory';
import { accountDataFactory } from '../account/data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred/deferred-data-factory';
import { reimbursementTransactionDataFactory } from '@household/test/api/transaction/reimbursement/reimbursement-data-factory';
import { AccountType, UserType } from '@household/shared/enums';

describe('POST project/v1/projects/{projectId}/merge', () => {
  let accountDocument: Account.Document;
  let loanAccountDocument: Account.Document;
  let sourceProjectDocument: Project.Document;
  let targetProjectDocument: Project.Document;
  let unrelatedProjectDocument: Project.Document;
  let paymentTransactionDocument: Transaction.PaymentDocument;
  let deferredTransactionDocument: Transaction.DeferredDocument;
  let reimbursementTransactionDocument: Transaction.ReimbursementDocument;
  let unrelatedPaymentTransactionDocument: Transaction.PaymentDocument;
  let unrelatedDeferredTransactionDocument: Transaction.DeferredDocument;
  let unrelatedReimbursementTransactionDocument: Transaction.ReimbursementDocument;
  let splitTransactionDocument: Transaction.SplitDocument;

  beforeEach(() => {
    accountDocument = accountDataFactory.document();
    loanAccountDocument = accountDataFactory.document({
      accountType: AccountType.Loan,
    });

    sourceProjectDocument = projectDataFactory.document();
    targetProjectDocument = projectDataFactory.document();
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

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestMergeProjects(projectDataFactory.id(), [projectDataFactory.id()])
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an editor', () => {
    it('should merge projects', () => {
      cy.saveAccountDocuments([
        accountDocument,
        loanAccountDocument,
      ])
        .saveProjectDocuments([
          sourceProjectDocument,
          targetProjectDocument,
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
        .authenticate(UserType.Editor)
        .requestMergeProjects(getProjectId(targetProjectDocument), [getProjectId(sourceProjectDocument)])
        .expectCreatedResponse()
        .validateProjectDeleted(getProjectId(sourceProjectDocument))
        .validateRelatedChangesInPaymentDocument(paymentTransactionDocument, {
          project: {
            from: getProjectId(sourceProjectDocument),
            to: getProjectId(targetProjectDocument),
          },
        })
        .validateRelatedChangesInPaymentDocument(unrelatedPaymentTransactionDocument, {
          project: {
            from: getProjectId(sourceProjectDocument),
            to: getProjectId(targetProjectDocument),
          },
        })
        .validateRelatedChangesInDeferredDocument(deferredTransactionDocument, {
          project: {
            from: getProjectId(sourceProjectDocument),
            to: getProjectId(targetProjectDocument),
          },
        })
        .validateRelatedChangesInDeferredDocument(unrelatedDeferredTransactionDocument, {
          project: {
            from: getProjectId(sourceProjectDocument),
            to: getProjectId(targetProjectDocument),
          },
        })
        .validateRelatedChangesInReimbursementDocument(reimbursementTransactionDocument, {
          project: {
            from: getProjectId(sourceProjectDocument),
            to: getProjectId(targetProjectDocument),
          },
        })
        .validateRelatedChangesInReimbursementDocument(unrelatedReimbursementTransactionDocument, {
          project: {
            from: getProjectId(sourceProjectDocument),
            to: getProjectId(targetProjectDocument),
          },
        })
        .validateRelatedChangesInSplitDocument(splitTransactionDocument, {
          project: {
            from: getProjectId(sourceProjectDocument),
            to: getProjectId(targetProjectDocument),
          },
        });
    });

    describe('should return error', () => {
      it('if a source project does not exist', () => {
        cy.saveProjectDocument(targetProjectDocument)
          .saveProjectDocument(sourceProjectDocument)
          .authenticate(UserType.Editor)
          .requestMergeProjects(getProjectId(targetProjectDocument), [
            getProjectId(sourceProjectDocument),
            projectDataFactory.id(),
          ])
          .expectBadRequestResponse()
          .expectMessage('Some of the projects are not found');
      });
      describe('if body', () => {
        it('is not array', () => {
          cy.authenticate(UserType.Editor)
            .requestMergeProjects(projectDataFactory.id(), {} as any)
            .expectBadRequestResponse()
            .expectWrongPropertyType('data', 'array', 'body');
        });

        it('has too few items', () => {
          cy.authenticate(UserType.Editor)
            .requestMergeProjects(projectDataFactory.id(), [])
            .expectBadRequestResponse()
            .expectTooFewItemsProperty('data', 1, 'body');
        });
      });

      describe('if body[0]', () => {
        it('is not string', () => {
          cy.authenticate(UserType.Editor)
            .requestMergeProjects(projectDataFactory.id(), [1] as any)
            .expectBadRequestResponse()
            .expectWrongPropertyType('data', 'string', 'body');
        });

        it('is not a valid mongo id', () => {
          cy.authenticate(UserType.Editor)
            .requestMergeProjects(projectDataFactory.id(), [projectDataFactory.id('not-valid')])
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('data', 'body');
        });
      });

      describe('if projectId', () => {
        it('is not a valid mongo id', () => {
          cy.authenticate(UserType.Editor)
            .requestMergeProjects(projectDataFactory.id('not-valid'), [projectDataFactory.id()])
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('projectId', 'pathParameters');
        });

        it('does not belong to any project', () => {
          cy.authenticate(UserType.Editor)
            .requestMergeProjects(projectDataFactory.id(), [getProjectId(sourceProjectDocument)])
            .expectBadRequestResponse()
            .expectMessage('Some of the projects are not found');
        });
      });
    });
  });
});
