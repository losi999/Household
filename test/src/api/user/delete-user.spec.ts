import { User } from '@household/shared/types/types';
import { userDataFactory } from './data-factory';
import { UserType } from '@household/shared/enums';

describe('DELETE /user/v1/users/{email}', () => {
  let pendingUser: User.Request;

  beforeEach(() => {
    pendingUser = userDataFactory.request();
  });

  afterEach(() => {
    cy.deleteUser(pendingUser);
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestDeleteUser(pendingUser.email)
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an editor', () => {
    it('should delete user', () => {
      cy.createUser(pendingUser, UserType.Editor, true)
        .authenticate(UserType.Editor)
        .requestDeleteUser(pendingUser.email)
        .expectNoContentResponse()
        .validateUserDeleted(pendingUser.email);
    });

    describe('should return error', () => {
      describe('if userId', () => {
        it('is not email', () => {
          cy.authenticate(UserType.Editor)
            .requestDeleteUser('not an email')
            .expectBadRequestResponse()
            .expectWrongPropertyFormat('email', 'email', 'pathParameters');
        });
      });
    });
  });
});
