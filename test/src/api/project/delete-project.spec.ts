import { createProjectId } from '@household/shared/common/test-data-factory';
import { getAccountId, getProjectId, getTransactionId, toDictionary } from '@household/shared/common/utils';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { projectDocumentConverter } from '@household/shared/dependencies/converters/project-document-converter';
import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { Account, Project, Transaction } from '@household/shared/types/types';

describe('DELETE /project/v1/projects/{projectId}', () => {
  const project: Project.Request = {
    name: 'project',
    description: 'desc',
  };

  let projectDocument: Project.Document;

  beforeEach(() => {
    projectDocument = projectDocumentConverter.create(project, Cypress.env('EXPIRES_IN'), true);
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestDeleteProject(createProjectId())
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
      let paymentTransactionDocument: Transaction.PaymentDocument;
      let splitTransactionDocument: Transaction.SplitDocument;
      let accountDocument: Account.Document;

      beforeEach(() => {
        accountDocument = accountDocumentConverter.create({
          name: 'account',
          accountType: 'bankAccount',
          currency: 'Ft',
        }, Cypress.env('EXPIRES_IN'), true);

        paymentTransactionDocument = transactionDocumentConverter.createPaymentDocument({
          body: {
            accountId: getAccountId(accountDocument),
            amount: 100,
            description: 'description',
            issuedAt: new Date(2022, 2, 3).toISOString(),
            categoryId: undefined,
            inventory: undefined,
            invoice: undefined,
            projectId: getProjectId(projectDocument),
            recipientId: undefined,
          },
          account: accountDocument,
          category: undefined,
          project: projectDocument,
          recipient: undefined,
          product: undefined,
        }, Cypress.env('EXPIRES_IN'), true);

        splitTransactionDocument = transactionDocumentConverter.createSplitDocument({
          body: {
            accountId: getAccountId(accountDocument),
            amount: 200,
            description: 'description',
            issuedAt: new Date(2022, 2, 3).toISOString(),
            recipientId: undefined,
            splits: [
              {
                amount: 100,
                categoryId: undefined,
                description: undefined,
                inventory: undefined,
                invoice: undefined,
                projectId: getProjectId(projectDocument),
              },
              {
                amount: 100,
                categoryId: undefined,
                description: undefined,
                inventory: undefined,
                invoice: undefined,
                projectId: undefined,
              },
            ],
          },
          account: accountDocument,
          recipient: undefined,
          categories: {},
          projects: toDictionary([projectDocument], '_id'),
          products: {},
        }, Cypress.env('EXPIRES_IN'), true);
      });
      it('should be unset if project is deleted', () => {
        cy.saveAccountDocument(accountDocument)
          .saveProjectDocument(projectDocument)
          .saveTransactionDocument(paymentTransactionDocument)
          .saveTransactionDocument(splitTransactionDocument)
          .authenticate(1)
          .requestDeleteProject(getProjectId(projectDocument))
          .expectNoContentResponse()
          .validateProjectDeleted(getProjectId(projectDocument))
          .validateProjectUnset(getTransactionId(paymentTransactionDocument))
          .validateProjectUnset(getTransactionId(splitTransactionDocument), 0);
      });
    });

    describe('should return error', () => {
      describe('if projectId', () => {
        it('is not mongo id', () => {
          cy.authenticate(1)
            .requestDeleteProject(createProjectId('not-valid'))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('projectId', 'pathParameters');
        });
      });
    });
  });
});
