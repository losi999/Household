import { UserStatusType } from '@aws-sdk/client-cognito-identity-provider';
import { UserType } from '@household/shared/enums';
import { Auth, User } from '@household/shared/types/types';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { expectEmptyObject } from '@household/test/api/utils';

const validateUserInCognito = (req: User.Email & Partial<Auth.Password>) => {
  cy.log('Get user', req.email)
    .getUser(req)
    .should((user) => {
      expect(user.UserStatus, 'UserStatus').to.equal(req.password ? UserStatusType.CONFIRMED : UserStatusType.FORCE_CHANGE_PASSWORD);
      expect(user.Enabled, 'Enabled').to.be.true;
      expect(user.UserAttributes.find(a => a.Name === 'email')?.Value, 'email').to.equal(req.email);
    });
};

const validateUserInGroup = (req: User.Email & User.Group, userType: UserType) => {
  cy.log('Get user group', req.email)
    .listGroupsByUser(req.email)
    .should((groups) => {
      const group = groups.Groups.find(g => g.GroupName === userType);
      if (req.group === userType) {
        expect(group, 'Group').to.be.undefined;
      } else {
        expect(group, 'Group').to.not.be.undefined;
      }      
    });
};

const validateUserResponse = (nestedPath: string = '') => (response: User.Response, user: User.Request & Partial<Auth.Password & User.Group>) => {
  const { email, status, groups, ...internal } = response;

  expect(email, `${nestedPath}email`).to.equal(user.email);
  expect(status, `${nestedPath}status`).to.equal(user.password ? UserStatusType.CONFIRMED : UserStatusType.FORCE_CHANGE_PASSWORD);
  expect(groups, `${nestedPath}groups`).to.deep.equal(user.group ? [user.group] : []);
  expectEmptyObject(internal, nestedPath);
};

const validateNestedUserResponse = (nestedPath: string, ...rest: Parameters<ReturnType<typeof validateUserResponse>>) => validateUserResponse(nestedPath)(...rest);

const validateUserListResponse = (responses: User.Response[], cognitoUsers: (User.Request & Partial<Auth.Password & User.Group>)[]) => {
  cognitoUsers.forEach((user, index) => {
    const response = responses.find(r => r.email === user.email);
    cy.validateNestedUserResponse(`[${index}].`, response, user);
  });
};

const validateUserDeleted = (email: User.Email['email']) => {
  cy.log('Get user from cognito', email)
    .getUser({
      email,
    })
    .should((user) => {
      expect(user, 'user').to.be.null;
    });
};

export const setUserValidationCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    validateUserResponse: validateUserResponse(),
    validateUserListResponse,
  });

  Cypress.Commands.addAll({
    validateUserInCognito,
    validateUserInGroup,
    validateUserDeleted,
    validateNestedUserResponse,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateUserDeleted: CommandFunction<typeof validateUserDeleted>;
      validateUserInCognito: CommandFunction<typeof validateUserInCognito>;
      validateUserInGroup: CommandFunction<typeof validateUserInGroup>;
      validateNestedUserResponse: CommandFunction<typeof validateNestedUserResponse>;
    }

    interface ChainableResponseBody extends Chainable {
      validateUserResponse: CommandFunctionWithPreviousSubject<ReturnType<typeof validateUserResponse>>;
      validateUserListResponse: CommandFunctionWithPreviousSubject<typeof validateUserListResponse>;
    }
  }
}
