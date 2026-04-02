import { default as schema } from '@household/test/api/schemas/recipient-response-list';
import { Recipient } from '@household/shared/types/types';
import { recipientDataFactory } from '@household/test/api/recipient/data-factory';
import { forbidUsers } from '@household/test/api/utils';
import { entries } from '@household/shared/common/utils';

const permissionMap = forbidUsers();

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

  entries(permissionMap).forEach(([
    userType,
    isAllowed,
  ]) => {
    describe(`called as ${userType}`, () => {
      if (!isAllowed) {
        it('should return forbidden', () => {
          cy.authenticate(userType)
            .requestGetRecipientList()
            .expectForbiddenResponse();
        });
      } else {
        it('should get a list of recipients', () => {
          cy.saveRecipientDocument(recipientDocument1)
            .saveRecipientDocument(recipientDocument2)
            .authenticate(userType)
            .requestGetRecipientList()
            .expectOkResponse()
            .expectValidResponseSchema(schema)
            .validateInRecipientListResponse(recipientDocument1)
            .validateInRecipientListResponse(recipientDocument2);
        });
      }
    });
  });
});
