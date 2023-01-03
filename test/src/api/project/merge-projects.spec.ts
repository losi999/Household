import { createProjectId } from '@household/shared/common/test-data-factory';
import { getAccountId, getProjectId, toDictionary } from '@household/shared/common/utils';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { projectDocumentConverter } from '@household/shared/dependencies/converters/project-document-converter';
import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { Account, Project, Transaction } from '@household/shared/types/types';
import { v4 as uuid } from 'uuid';

describe('POST project/v1/projects/{projectId}/merge', () => {
  let accountDocument: Account.Document;
  let sourceProjectDocument: Project.Document;
  let targetProjectDocument: Project.Document;
  let paymentTransactionDocument: Transaction.PaymentDocument;
  let splitTransactionDocument: Transaction.SplitDocument;

  beforeEach(() => {
    accountDocument = accountDocumentConverter.create({
      accountType: 'bankAccount',
      currency: 'Ft',
      name: `account-${uuid()}`,
    }, Cypress.env('EXPIRES_IN'), true);

    sourceProjectDocument = projectDocumentConverter.create({
      name: `source-${uuid()}`,
      description: 'source',
    }, Cypress.env('EXPIRES_IN'), true);

    targetProjectDocument = projectDocumentConverter.create({
      name: `target-${uuid()}`,
      description: 'target',
    }, Cypress.env('EXPIRES_IN'), true);

    paymentTransactionDocument = transactionDocumentConverter.createPaymentDocument({
      body: {
        accountId: getAccountId(accountDocument),
        amount: 100,
        projectId: getProjectId(sourceProjectDocument),
        description: 'desc',
        inventory: undefined,
        issuedAt: new Date().toISOString(),
        categoryId: undefined,
        recipientId: undefined,
        invoice: undefined,
      },
      account: accountDocument,
      project: sourceProjectDocument,
      product: undefined,
      recipient: undefined,
      category: undefined,
    }, Cypress.env('EXPIRES_IN'), true);

    splitTransactionDocument = transactionDocumentConverter.createSplitDocument({
      body: {
        accountId: getAccountId(accountDocument),
        amount: 100,
        description: 'desc',
        issuedAt: new Date().toISOString(),
        recipientId: undefined,
        splits: [
          {
            amount: 50,
            projectId: getProjectId(sourceProjectDocument),
            description: 'desc',
            inventory: undefined,
            categoryId: undefined,
            invoice: undefined,
          },
          {
            amount: 50,
            projectId: getProjectId(targetProjectDocument),
            description: 'desc',
            inventory: undefined,
            categoryId: undefined,
            invoice: undefined,
          },
        ],
      },
      account: accountDocument,
      projects: toDictionary([
        sourceProjectDocument,
        targetProjectDocument,
      ], '_id'),
      products: undefined,
      recipient: undefined,
      categories: {},
    }, Cypress.env('EXPIRES_IN'), true);
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestMergeProjects(createProjectId(), [createProjectId()])
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should merge projects', () => {
      cy.saveAccountDocument(accountDocument)
        .saveProjectDocument(sourceProjectDocument)
        .saveProjectDocument(targetProjectDocument)
        .saveTransactionDocument(paymentTransactionDocument)
        .saveTransactionDocument(splitTransactionDocument)
        .authenticate(1)
        .requestMergeProjects(getProjectId(targetProjectDocument), [getProjectId(sourceProjectDocument)])
        .expectCreatedResponse()
        .validateProjectDeleted(getProjectId(sourceProjectDocument))
        .validateProjectReassign(paymentTransactionDocument, getProjectId(targetProjectDocument))
        .validateProjectReassign(splitTransactionDocument, getProjectId(targetProjectDocument), 0);
    });

    describe('should return error', () => {
      describe('if body', () => {
        it('is not array', () => {
          cy.authenticate(1)
            .requestMergeProjects(createProjectId(), {} as any)
            .expectBadRequestResponse()
            .expectWrongPropertyType('data', 'array', 'body');
        });

        it('has too few items', () => {
          cy.authenticate(1)
            .requestMergeProjects(createProjectId(), [])
            .expectBadRequestResponse()
            .expectTooFewItemsProperty('data', 1, 'body');
        });
      });

      describe('if body[0]', () => {
        it('is not string', () => {
          cy.authenticate(1)
            .requestMergeProjects(createProjectId(), [1] as any)
            .expectBadRequestResponse()
            .expectWrongPropertyType('data', 'string', 'body');
        });

        it('is not a valid mongo id', () => {
          cy.authenticate(1)
            .requestMergeProjects(createProjectId(), [createProjectId('not-valid')])
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('data', 'body');
        });
      });

      describe('is projectId', () => {
        it('is not a valid mongo id', () => {
          cy.authenticate(1)
            .requestMergeProjects(createProjectId('not-valid'), [createProjectId()])
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('projectId', 'pathParameters');
        });
      });
    });
  });
});
