import { Auth, User } from '@household/shared/types/types';
import { userDataFactory } from './data-factory';
import { UserType } from '@household/shared/enums';

describe('POST user/v1/users/{email}/confirm', () => {
  let pendingUser: User.Request & Auth.TemporaryPassword;
  let request: Auth.ConfirmUser.Request;

  beforeEach(() => {
    pendingUser = userDataFactory.pendindUser();
    request = userDataFactory.confirmRequest({
      temporaryPassword: pendingUser.temporaryPassword,
    });
  });

  afterEach(() => {
    cy.deleteUser(pendingUser);
  });

  describe('called as anonymous', () => {
    describe('should confirm user', () => {
      it('with complete body', () => {
        cy.createUser(pendingUser, UserType.Editor, true)
          .authenticate('anonymous')
          .requestConfirmUser(pendingUser.email, request)
          .expectOkResponse()
          .validateUserInCognito({
            email: pendingUser.email,
            password: request.password,
          });
      });
    });

    describe('should return error', () => {
      describe('if email', () => {
        it('is not email', () => {
          cy.authenticate(UserType.Editor)
            .requestConfirmUser('not-email', request)
            .expectBadRequestResponse()
            .expectWrongPropertyFormat('email', 'email', 'pathParameters');
        });
      });

      describe('if password', () => {
        it('is missing from body', () => {
          cy.authenticate(UserType.Editor)
            .requestConfirmUser(pendingUser.email, userDataFactory.confirmRequest({
              password: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('password', 'body');
        });

        it('is not string', () => {
          cy.authenticate(UserType.Editor)
            .requestConfirmUser(pendingUser.email, userDataFactory.confirmRequest({
              password: 1 as any,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('password', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(UserType.Editor)
            .requestConfirmUser(pendingUser.email, userDataFactory.confirmRequest({
              password: 'asdfg',
            }))
            .expectBadRequestResponse()
            .expectTooShortProperty('password', 6, 'body');
        });
      });

      describe('if temporaryPassword', () => {
        it('is missing from body', () => {
          cy.authenticate(UserType.Editor)
            .requestConfirmUser(pendingUser.email, userDataFactory.confirmRequest({
              temporaryPassword: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('temporaryPassword', 'body');
        });

        it('is not string', () => {
          cy.authenticate(UserType.Editor)
            .requestConfirmUser(pendingUser.email, userDataFactory.confirmRequest({
              temporaryPassword: 1 as any,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('temporaryPassword', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(UserType.Editor)
            .requestConfirmUser(pendingUser.email, userDataFactory.confirmRequest({
              temporaryPassword: 'asdfg',
            }))
            .expectBadRequestResponse()
            .expectTooShortProperty('temporaryPassword', 6, 'body');
        });
      });
    });
  });
});
