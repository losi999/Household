import { Auth, User } from '@household/shared/types/types';
import { headerSuppressEmail } from '@household/shared/constants';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';

const requestCreateUser = (idToken: string, user: User.Request) => {
  return cy.request({
    body: user,
    method: 'POST',
    url: '/user/v1/users',
    headers: {
      Authorization: idToken,
      [headerSuppressEmail]: true,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestConfirmUser = (email: User.Email['email'], request: Auth.ConfirmUser.Request) => {
  return cy.request({
    body: request,
    method: 'POST',
    url: `/user/v1/users/${email}/confirm`,
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestDeleteUser = (idToken: string, email: User.Email['email']) => {
  return cy.request({
    method: 'DELETE',
    url: `/user/v1/users/${email}`,
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestGetUserList = (idToken: string) => {
  return cy.request({
    method: 'GET',
    url: '/user/v1/users',
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

export const setUserRequestCommands = () => {
  Cypress.Commands.addAll({
    requestConfirmUser,
  });

  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    requestCreateUser,
    requestDeleteUser,
    requestGetUserList,
  });

};

declare global {
  namespace Cypress {
    interface ChainableRequest extends Chainable {
      requestCreateUser: CommandFunctionWithPreviousSubject<typeof requestCreateUser>;
      requestConfirmUser: CommandFunction<typeof requestConfirmUser>;
      requestDeleteUser: CommandFunctionWithPreviousSubject<typeof requestDeleteUser>;
      requestGetUserList: CommandFunctionWithPreviousSubject<typeof requestGetUserList>;
    }
  }
}
