import { createAccountId, createProjectId, createTransactionId } from '@household/shared/common/test-data-factory';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { projectDocumentConverter } from '@household/shared/dependencies/converters/project-document-converter';
import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { Account, Project, Transaction } from '@household/shared/types/types';
import { Types } from 'mongoose';

describe('DELETE /project/v1/projects/{projectId}', () => {
  const project: Project.Request = {
    name: 'project',
    description: 'desc',
  };

  let projectDocument: Project.Document;

  beforeEach(() => {
    projectDocument = projectDocumentConverter.create(project, Cypress.env('EXPIRES_IN'));
    projectDocument._id = new Types.ObjectId();
  });

  describe.skip('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestDeleteProject(createProjectId())
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {

    it('should delete project', () => {
      cy.authenticate('admin1')
        .requestDeleteProject(createProjectId(projectDocument._id))
        .expectNoContentResponse()
        .validateProjectDeleted(createProjectId(projectDocument._id));
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
        }, Cypress.env('EXPIRES_IN'));
        accountDocument._id = new Types.ObjectId();

        paymentTransactionDocument = transactionDocumentConverter.createPaymentDocument({
          body: {
            accountId: createAccountId(accountDocument._id),
            amount: 100,
            description: 'description',
            issuedAt: new Date(2022, 2, 3).toISOString(),
            categoryId: undefined,
            inventory: undefined,
            invoice: undefined,
            projectId: createProjectId(projectDocument._id),
            recipientId: undefined,
          },
          account: accountDocument,
          category: undefined,
          project: projectDocument,
          recipient: undefined,
        }, Cypress.env('EXPIRES_IN'));
        paymentTransactionDocument._id = new Types.ObjectId();

        splitTransactionDocument = transactionDocumentConverter.createSplitDocument({
          body: {
            accountId: createAccountId(accountDocument._id),
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
                projectId: createProjectId(projectDocument._id),
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
          categories: [],
          projects: [projectDocument],
        }, Cypress.env('EXPIRES_IN'));
        splitTransactionDocument._id = new Types.ObjectId();
      });
      it('should be unset if project is deleted', () => {
        cy.saveAccountDocument(accountDocument)
          .saveProjectDocument(projectDocument)
          .saveTransactionDocument(paymentTransactionDocument)
          .saveTransactionDocument(splitTransactionDocument)
          .authenticate('admin1')
          .requestDeleteProject(createProjectId(projectDocument._id))
          .expectNoContentResponse()
          .validateProjectDeleted(createProjectId(projectDocument._id))
          .validateProjectUnset(createTransactionId(paymentTransactionDocument._id))
          .validateProjectUnset(createTransactionId(splitTransactionDocument._id), 0);
      });
    });

    describe('should return error', () => {
      describe('if projectId', () => {
        it('is not mongo id', () => {
          cy.authenticate('admin1')
            .requestDeleteProject(createProjectId('not-valid'))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('projectId', 'pathParameters');
        });
      });
    });
  });
});
