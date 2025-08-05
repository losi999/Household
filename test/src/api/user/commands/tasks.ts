import { CommandFunction } from '@household/test/api/types';
import { IIdentityService } from '@household/shared/services/identity-service';
import { AdminGetUserResponse, AdminListGroupsForUserResponse } from '@aws-sdk/client-cognito-identity-provider';

const deleteUser = (...params: Parameters<IIdentityService['deleteUser']>) => {
  return cy.task('deleteUser', params);
};

const getUser = (...params: Parameters<IIdentityService['getUser']>) => {
  return cy.task<AdminGetUserResponse>('getUser', params);
};

const createUser = (...params: Parameters<IIdentityService['createUser']>) => {
  return cy.task('createUser', params);
};

const listGroupsByUser = (...params: Parameters<IIdentityService['listGroupsByUser']>) => {
  return cy.task<AdminListGroupsForUserResponse>('listGroupsByUser', params);
};

export const setUserTaskCommands = () => {
  Cypress.Commands.addAll({
    deleteUser,
    getUser,
    createUser,
    listGroupsByUser,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      deleteUser: CommandFunction<typeof deleteUser>;
      getUser: CommandFunction<typeof getUser>;
      createUser: CommandFunction<typeof createUser>;
      listGroupsByUser: CommandFunction<typeof listGroupsByUser>;
    }
  }
}
