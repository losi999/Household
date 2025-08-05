import { User } from '@household/shared/types/types';
import { userDataFactory } from './data-factory';
import { allowUsers } from '@household/test/api/utils';
import { entries } from '@household/shared/common/utils';
import { UserType } from '@household/shared/enums';

const permissionMap = allowUsers('editor') ;

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

  entries(permissionMap).forEach(([
    userType,
    isAllowed,
  ]) => {
    describe(`called as ${userType}`, () => {
      if (!isAllowed) {
        it('should return forbidden', () => {
          cy.authenticate(userType)
            .requestDeleteUser(pendingUser.email)
            .expectForbiddenResponse();
        });
      } else {
        it('should delete user', () => {
          cy.createUser(pendingUser, UserType.Editor, true)
            .authenticate(userType)
            .requestDeleteUser(pendingUser.email)
            .expectNoContentResponse()
            .validateUserDeleted(pendingUser.email);
        });

        describe('should return error', () => {
          describe('if userId', () => {
            it('is not email', () => {
              cy.authenticate(userType)
                .requestDeleteUser('not an email')
                .expectBadRequestResponse()
                .expectWrongPropertyFormat('email', 'email', 'pathParameters');
            });
          });
        });
      }
    });
  });
});
