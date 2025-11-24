import { CommandFunction } from '@household/test/api/types';

const validateNestedObject = (nestedPath: string, object: unknown): Cypress.ChainableResponseBody => {
  return cy.log(`Validating ${nestedPath}`).wrap(object, {
    log: false,
  }) as Cypress.ChainableResponseBody;
};

export const setValidationCommands = () => {
  Cypress.Commands.addAll({
    validateNestedObject,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateNestedObject: CommandFunction<typeof validateNestedObject>;
    }
  }
}
