import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';
import { Recipient } from '@household/shared/types/types';
import { Types } from 'mongoose';

describe('PUT /recipient/v1/recipients/{recipientId}', () => {
  const recipient: Recipient.Request = {
    name: 'old name',
  };

  const recipientToUpdate: Recipient.Request = {
    name: 'new name',
  };

  describe.skip('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestUpdateRecipient(new Types.ObjectId().toString() as Recipient.IdType, recipientToUpdate)
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    describe('with test data created', () => {
      let recipientDocument: Recipient.Document;

      beforeEach(() => {
        cy.recipientTask('saveRecipient', [recipientDocumentConverter.create(recipient, Cypress.env('EXPIRES_IN'))]).then((document: Recipient.Document) => {
          recipientDocument = document;
        });
      });
      it('should update a recipient', () => {
        cy
          .authenticate('admin1')
          .requestUpdateRecipient(recipientDocument._id.toString() as Recipient.IdType, recipientToUpdate)
          .expectCreatedResponse()
          .validateRecipientDocument(recipientToUpdate);
      });
    });
    describe('should return error', () => {
      describe('if name', () => {
        it('is missing from body', () => {
          cy.authenticate('admin1')
            .requestUpdateRecipient(new Types.ObjectId().toString() as Recipient.IdType, {
              ...recipient,
              name: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('name', 'body');
        });

        it('is not string', () => {
          cy.authenticate('admin1')
            .requestUpdateRecipient(new Types.ObjectId().toString() as Recipient.IdType, {
              ...recipient,
              name: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('name', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate('admin1')
            .requestUpdateRecipient(new Types.ObjectId().toString() as Recipient.IdType, {
              ...recipient,
              name: '',
            })
            .expectBadRequestResponse()
            .expectTooShortProperty('name', 1, 'body');
        });
      });

      describe('if recipientId', () => {
        it('is not mongo id', () => {
          cy.authenticate('admin1')
            .requestUpdateRecipient(`${new Types.ObjectId().toString()}-not-valid` as Recipient.IdType, recipientToUpdate)
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('recipientId', 'pathParameters');
        });

        it('does not belong to any recipient', () => {
          cy.authenticate('admin1')
            .requestUpdateRecipient(new Types.ObjectId().toString() as Recipient.IdType, recipientToUpdate)
            .expectNotFoundResponse();
        });
      });
    });
  });

});
