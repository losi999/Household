import { Recipient } from '@household/shared/types/types';
import { recipientDataFactory } from './data-factory';
import { UserType } from '@household/shared/enums';

const allowedUserTypes = [UserType.Editor];

describe('POST recipient/v1/recipients', () => {
  let request: Recipient.Request;

  beforeEach(() => {
    request = recipientDataFactory.request();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestCreateRecipient(request)
        .expectUnauthorizedResponse();
    });
  });

  Object.values(UserType).forEach((userType) => {
    describe(`called as ${userType}`, () => {
      if (!allowedUserTypes.includes(userType)) {
        it('should return forbidden', () => {
          cy.authenticate(userType)
            .requestCreateRecipient(request)
            .expectForbiddenResponse();
        });
      } else {
        it('should create recipient', () => {
          cy.authenticate(userType)
            .requestCreateRecipient(request)
            .expectCreatedResponse()
            .validateRecipientDocument(request);
        });

        describe('should return error', () => {
          describe('if name', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestCreateRecipient(recipientDataFactory.request({
                  name: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('name', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateRecipient(recipientDataFactory.request({
                  name: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('name', 'string', 'body');
            });

            it('is too short', () => {
              cy.authenticate(userType)
                .requestCreateRecipient(recipientDataFactory.request({
                  name: '',
                }))
                .expectBadRequestResponse()
                .expectTooShortProperty('name', 1, 'body');
            });

            it('is already in used by a different recipient', () => {
              const recipientDocument = recipientDataFactory.document(request);

              cy.saveRecipientDocument(recipientDocument)
                .authenticate(userType)
                .requestCreateRecipient(request)
                .expectBadRequestResponse()
                .expectMessage('Duplicate recipient name');
            });
          });
        });
      }
    });
  });
});
