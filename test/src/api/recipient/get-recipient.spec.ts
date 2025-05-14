import { default as schema } from '@household/test/api/schemas/recipient-response';
import { Recipient } from '@household/shared/types/types';
import { getRecipientId } from '@household/shared/common/utils';
import { recipientDataFactory } from '@household/test/api/recipient/data-factory';
import { UserType } from '@household/shared/enums';

const allowedUserTypes = [
  UserType.Editor,
  UserType.Viewer,
];

describe('GET /recipient/v1/recipients/{recipientId}', () => {
  let recipientDocument: Recipient.Document;

  beforeEach(() => {
    recipientDocument = recipientDataFactory.document();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestGetRecipient(recipientDataFactory.id())
        .expectUnauthorizedResponse();
    });
  });

  Object.values(UserType).forEach((userType) => {
    describe(`called as ${userType}`, () => {
      if (!allowedUserTypes.includes(userType)) {
        it('should return forbidden', () => {
          cy.authenticate(userType)
            .requestGetRecipient(recipientDataFactory.id())
            .expectForbiddenResponse();
        });
      } else {
        it('should get recipient by id', () => {
          cy.saveRecipientDocument(recipientDocument)
            .authenticate(userType)
            .requestGetRecipient(getRecipientId(recipientDocument))
            .expectOkResponse()
            .expectValidResponseSchema(schema)
            .validateRecipientResponse(recipientDocument);
        });

        describe('should return error if recipientId', () => {
          it('is not mongo id', () => {
            cy.authenticate(userType)
              .requestGetRecipient(recipientDataFactory.id('not-valid'))
              .expectBadRequestResponse()
              .expectWrongPropertyPattern('recipientId', 'pathParameters');
          });

          it('does not belong to any recipient', () => {
            cy.authenticate(userType)
              .requestGetRecipient(recipientDataFactory.id())
              .expectNotFoundResponse();
          });
        });
      }
    });
  });
});
