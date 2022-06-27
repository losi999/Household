import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { projectDocumentConverter } from '@household/shared/dependencies/converters/project-document-converter';
import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';
import { Account, Category, Project, Recipient, Transaction } from '@household/shared/types/types';

describe('POST transaction/v1/transactions/payment', () => {
  const request: Transaction.PaymentRequest = {
    accountId: undefined,
    amount: 100,
    categoryId: undefined,
    description: 'description',
    issuedAt: new Date(2022, 6, 9, 22, 30, 12).toISOString(),
    projectId: undefined,
    recipientId: undefined,
    invoice: {
      billingStartDate: new Date(2022, 6, 1, 0, 0, 0).toISOString()
        .split('T')[0],
      billingEndDate: new Date(2022, 6, 25, 0, 0, 0).toISOString()
        .split('T')[0],
      invoiceNumber: 'invoice123',
    },
    inventory: undefined,
  };

  describe('called as an admin', () => {
    let projectDocument: Project.Document;
    let recipientDocument: Recipient.Document;
    let accountDocument: Account.Document;

    beforeEach(() => {
      cy.projectTask('saveProject', [
        projectDocumentConverter.create({
          name: 'proj',
          description: 'desc',
        }, Cypress.env('EXPIRES_IN')),
      ]).then((doc: Project.Document) => {
        projectDocument = doc;
      });

      cy.recipientTask('saveRecipient', [
        recipientDocumentConverter.create({
          name: 'recipient',
        }, Cypress.env('EXPIRES_IN')),
      ]).then((doc: Recipient.Document) => {
        recipientDocument = doc;
      });

      cy.accountTask('saveAccount', [
        accountDocumentConverter.create({
          name: 'bank',
          accountType: 'bankAccount',
          currency: 'Ft',
        }, Cypress.env('EXPIRES_IN')),
      ]).then((doc: Account.Document) => {
        accountDocument = doc;
      });
    });

    describe('with regular category', () => {
      let categoryDocument: Category.Document;
      beforeEach(() => {
        cy.categoryTask('saveCategory', [
          categoryDocumentConverter.create({
            body: {
              name: 'category',
              categoryType: 'regular',
              parentCategoryId: undefined,
            },
            parentCategory: undefined,
          }, Cypress.env('EXPIRES_IN')),
        ]).then((doc: Category.Document) => {
          categoryDocument = doc;
        });
      });

      it('should create transaction', () => {
        cy.authenticate('admin1')
          .requestCreatePaymentTransaction({
            ...request,
            accountId: accountDocument._id.toString() as Account.IdType,
            categoryId: categoryDocument._id.toString() as Category.IdType,
            projectId: projectDocument._id.toString() as Project.IdType,
            recipientId: recipientDocument._id.toString() as Recipient.IdType,
          })
          .expectCreatedResponse()
          .validateTransactionPaymentDocument();
      });
    });

    describe('should return error', () => {
      // describe('if name', () => {
      //   it('is missing from body', () => {
      //     cy.authenticate('admin1')
      //       .requestCreatePaymentTransaction({
      //         ...request,
      //         name: undefined,
      //       })
      //       .expectBadRequestResponse()
      //       .expectRequiredProperty('name', 'body');
      //   });

      //   it('is not string', () => {
      //     cy.authenticate('admin1')
      //       .requestCreatePaymentTransaction({
      //         ...request,
      //         name: 1 as any,
      //       })
      //       .expectBadRequestResponse()
      //       .expectWrongPropertyType('name', 'string', 'body');
      //   });

      //   it('is too short', () => {
      //     cy.authenticate('admin1')
      //       .requestCreatePaymentTransaction({
      //         ...request,
      //         name: '',
      //       })
      //       .expectBadRequestResponse()
      //       .expectTooShortProperty('name', 1, 'body');
      //   });
      // });
    });
  });
});
