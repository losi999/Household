import { default as schema } from '@household/test/api/schemas/user-response-list';
import { User } from '@household/shared/types/types';
import { userDataFactory } from './data-factory';
import { allowUsers } from '@household/test/api/utils';
import { entries } from '@household/shared/common/utils';
import { UserType } from '@household/shared/enums';

const permissionMap = allowUsers('editor') ;

describe('GET /user/v1/users', () => {
  let pendingUser: User.Request;
  let editorUser: User.Request & User.Group;
  let viewerUser: User.Request & User.Group;
  let hairdresserUser: User.Request & User.Group;

  beforeEach(() => {
    pendingUser = userDataFactory.request();
    editorUser = userDataFactory.confirmedUser({
      group: UserType.Editor,
    });
    viewerUser = userDataFactory.confirmedUser();
    hairdresserUser = userDataFactory.confirmedUser({
      group: UserType.Hairdresser,
    });
  });

  afterEach(() => {
    cy.deleteUser(pendingUser)
      .deleteUser(editorUser)
      .deleteUser(viewerUser)
      .deleteUser(hairdresserUser);
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestGetUserList()
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
            .requestGetUserList()
            .expectForbiddenResponse();
        });
      } else {
        it('should get a list of users', () => {
          cy.createUser(pendingUser, undefined, true)
            .createUser(editorUser, editorUser.group, true)
            .createUser(viewerUser, viewerUser.group, true)
            .createUser(hairdresserUser, hairdresserUser.group, true)
            .authenticate(userType)
            .requestGetUserList()
            .expectOkResponse()
            .expectValidResponseSchema(schema)
            .validateUserListResponse([
              pendingUser,
              editorUser,
              viewerUser,
              hairdresserUser,
            ]);

        });
      }
    });
  });
});
