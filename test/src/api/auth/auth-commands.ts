import { Auth } from '@household/shared/types/types';
import { CommandFunction } from '@household/test/api/types';
import { isLocalhost } from '@household/test/api/utils';

const unauthenticate = () => {
  return undefined as Cypress.ChainableRequest;
};

const authenticate = (userIndex: number) => {
  if (isLocalhost()) {
    return undefined as Cypress.ChainableRequest;
  }

  const email = `losonczil+${userIndex}@gmail.com`;
  const body: Auth.Login.Request = {
    email,
    password: Cypress.env('PASSWORD'),
  };
  return cy.log(`Logging in as ${email}`).request({
    body,
    method: 'POST',
    url: 'user/v1/login',
    failOnStatusCode: false,
  })
    .its('body')
    .its('idToken') as Cypress.ChainableRequest;
};

export const setAuthCommands = () => {
  Cypress.Commands.addAll({
    authenticate,
    unauthenticate,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      authenticate: CommandFunction<typeof authenticate>;
      unauthenticate: CommandFunction<typeof unauthenticate>;
    }
  }
}
