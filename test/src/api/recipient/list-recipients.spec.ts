import { default as schema } from '@household/test/api/schemas/recipient-response-list';
import { Recipient } from '@household/shared/types/types';
import { recipientDataFactory } from '@household/test/api/recipient/data-factory';
import { UserType } from '@household/shared/enums';

describe('GET /recipient/v1/recipients', () => {
  let recipientDocument1: Recipient.Document;
  let recipientDocument2: Recipient.Document;

  beforeEach(() => {
    recipientDocument1 = recipientDataFactory.document();
    recipientDocument2 = recipientDataFactory.document();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestGetRecipientList()
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an editor', () => {
    it('should get a list of recipients', () => {
      cy.saveRecipientDocument(recipientDocument1)
        .saveRecipientDocument(recipientDocument2)
        .authenticate(UserType.Editor)
        .requestGetRecipientList()
        .expectOkResponse()
        .expectValidResponseSchema(schema)
        .validateRecipientListResponse([
          recipientDocument1,
          recipientDocument2,
        ]);
    });
  });
});
