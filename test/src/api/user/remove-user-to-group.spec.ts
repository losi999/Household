import { User } from '@household/shared/types/types';
import { userDataFactory } from './data-factory';
import { allowUsers } from '@household/test/api/utils';
import { entries } from '@household/shared/common/utils';
import { UserType } from '@household/shared/enums';

const permissionMap = allowUsers('editor') ;

describe('DELETE /user/v1/users/{email}/groups/{group}', () => {
  let editorUser: User.Request & User.Group;

  beforeEach(() => {
    editorUser = userDataFactory.confirmedUser({
      group: UserType.Editor,
    });
  });

  afterEach(() => {
    cy.deleteUser(editorUser);
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestRemoveUserFromGroup(editorUser.email, UserType.Editor)
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
            .requestRemoveUserFromGroup(editorUser.email, UserType.Editor)
            .expectForbiddenResponse();
        });
      } else {
        it('should remove user from group', () => {
          cy.createUser(editorUser, undefined, true)
            .authenticate(userType)
            .requestRemoveUserFromGroup(editorUser.email, UserType.Editor)
            .expectNoContentResponse()
            .validateUserInGroup(editorUser, UserType.Editor);
        });
      }
    });
  });
});
