import { User } from '@household/shared/types/types';
import { userDataFactory } from './data-factory';
import { UserType } from '@household/shared/enums';

const allowedUserTypes = [UserType.Editor];

describe('POST user/v1/users', () => {
  let request: User.Request;

  beforeEach(() => {
    request = userDataFactory.request();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestCreateUser(request)
        .expectUnauthorizedResponse();
    });
  });

  Object.values(UserType).forEach((userType) => {
    describe(`called as ${userType}`, () => {
      if (!allowedUserTypes.includes(userType)) {
        it('should return forbidden', () => {
          cy.authenticate(userType)
            .requestCreateUser(request)
            .expectForbiddenResponse();
        });
      } else {
        describe('should create user', () => {
          it('with complete body', () => {
            cy.authenticate(userType)
              .requestCreateUser(request)
              .expectCreatedResponse()
              .validateUserInCognito(request);
          });
        });

        describe('should return error', () => {
          describe('if email', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestCreateUser(userDataFactory.request({
                  email: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('email', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateUser(userDataFactory.request({
                  email: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('email', 'string', 'body');
            });

            it('is not email', () => {
              cy.authenticate(userType)
                .requestCreateUser(userDataFactory.request({
                  email: 'not-email',
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyFormat('email', 'email', 'body');
            });

            it('is already in used by a different user', () => {
              cy.createUser(request, UserType.Editor, true)
                .authenticate(userType)
                .requestCreateUser(request)
                .expectBadRequestResponse()
                .expectMessage('Duplicate user email');
            });
          });
        });
      }
    });
  });

  afterEach(() => {
    cy.deleteUser(request);
  });
});
