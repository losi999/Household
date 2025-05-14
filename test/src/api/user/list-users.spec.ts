import { default as schema } from '@household/test/api/schemas/user-response-list';
import { User } from '@household/shared/types/types';
import { userDataFactory } from './data-factory';

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

  describe('called as an admin', () => {
    it('should get a list of users', () => {
      cy.createUser(pendingUser, true)
        .createUser(confirmedUser, true)
        .authenticate('admin')
        .requestGetUserList()
        .expectOkResponse()
        .expectValidResponseSchema(schema)
        .validateUserListResponse([
          pendingUser,
          confirmedUser,
        ]);

    });
  });
});
