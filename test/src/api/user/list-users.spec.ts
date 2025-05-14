import { default as schema } from '@household/test/api/schemas/user-response-list';
import { User } from '@household/shared/types/types';
import { userDataFactory } from './data-factory';
import { UserType } from '@household/shared/enums';

const allowedUserTypes = [UserType.Editor];

describe('GET /user/v1/users', () => {
  let pendingUser: User.Request;
  let confirmedUser: User.Request;

  beforeEach(() => {
    pendingUser = userDataFactory.request();
    confirmedUser = userDataFactory.confirmedUser();
  });

  afterEach(() => {
    cy.deleteUser(pendingUser)
      .deleteUser(confirmedUser);
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestGetUserList()
        .expectUnauthorizedResponse();
    });
  });

  Object.values(UserType).forEach((userType) => {
    describe(`called as ${userType}`, () => {
      if (!allowedUserTypes.includes(userType)) {
        it('should return forbidden', () => {
          cy.authenticate(userType)
            .requestGetUserList()
            .expectForbiddenResponse();
        });
      } else {
        it('should get a list of users', () => {
          cy.createUser(pendingUser, UserType.Editor, true)
            .createUser(confirmedUser, UserType.Editor, true)
            .authenticate(userType)
            .requestGetUserList()
            .expectOkResponse()
            .expectValidResponseSchema(schema)
            .validateUserListResponse([
              pendingUser,
              confirmedUser,
            ]);

        });
      }
    });
  });
});
