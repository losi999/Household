import { User } from '@household/shared/types/types';
import { userDataFactory } from './data-factory';

describe('POST user/v1/users', () => {
  let request: User.Request;

  beforeEach(() => {
    request = userDataFactory.request();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestCreateUser(request)
        .expectUnauthorizedResponse();
    });
  });

  afterEach(() => {
    cy.deleteUser(request);
  });

  describe('called as an admin', () => {
    describe('should create user', () => {
      it('with complete body', () => {
        cy.authenticate(1)
          .requestCreateUser(request)
          .expectCreatedResponse()
          .validateUserInCognito(request);
      });
    });

    describe('should return error', () => {
      describe('if email', () => {
        it('is missing from body', () => {
          cy.authenticate(1)
            .requestCreateUser(userDataFactory.request({
              email: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('email', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateUser(userDataFactory.request({
              email: <any>1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('email', 'string', 'body');
        });

        it('is not email', () => {
          cy.authenticate(1)
            .requestCreateUser(userDataFactory.request({
              email: 'not-email',
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyFormat('email', 'email', 'body');
        });

        it('is already in used by a different user', () => {
          cy.createUser(request, true)
            .authenticate(1)
            .requestCreateUser(request)
            .expectBadRequestResponse()
            .expectMessage('Duplicate user email');
        });
      });
    });
  });
});
