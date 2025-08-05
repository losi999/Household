import { User } from '@household/shared/types/types';
import { userDataFactory } from './data-factory';
import { allowUsers } from '@household/test/api/utils';
import { entries } from '@household/shared/common/utils';
import { UserType } from '@household/shared/enums';

const permissionMap = allowUsers('editor') ;

describe('POST /user/v1/users/{email}/groups/{group}', () => {
  let viewerUser: User.Request & User.Group;

  beforeEach(() => {
    viewerUser = userDataFactory.confirmedUser();
  });

  afterEach(() => {
    cy.deleteUser(viewerUser);
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestAddUserToGroup(viewerUser.email, UserType.Editor)
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
            .requestAddUserToGroup(viewerUser.email, UserType.Editor)
            .expectForbiddenResponse();
        });
      } else {
        it('should add user to group', () => {
          cy.createUser(viewerUser, undefined, true)
            .authenticate(userType)
            .requestAddUserToGroup(viewerUser.email, UserType.Editor)
            .expectNoContentResponse()
            .validateUserInGroup(viewerUser, UserType.Editor);
        });

        describe('should return error', () => {
          describe('if email', () => {
            it('is not email', () => {
              cy.authenticate(userType)
                .requestAddUserToGroup('not an email', UserType.Editor)
                .expectBadRequestResponse()
                .expectWrongPropertyFormat('email', 'email', 'pathParameters');
            });
          });

          describe('if group', () => {
            it('is not a valid enum value', () => {
              cy.authenticate(userType)
                .requestAddUserToGroup(viewerUser.email, 'dummy' as any)
                .expectBadRequestResponse()
                .expectWrongEnumValue('group', 'pathParameters');
            });
          });
        });
      }
    });
  });
});
