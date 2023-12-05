import { IIdentityService, identityServiceFactory } from '@household/shared/services/identity-service';
import { Mock, createMockService, awsResolvedValue } from '@household/shared/common/unit-testing';
import type { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';

describe('Notification service', () => {
  let service: IIdentityService;
  const userPoolId = 'UserPoolId';
  const clientId = 'ClientId';
  let mockCognito: Mock<CognitoIdentityProvider>;

  beforeEach(() => {
    mockCognito = createMockService('adminInitiateAuth', 'adminCreateUser', 'adminAddUserToGroup', 'adminSetUserPassword', 'adminGetUser');

    service = identityServiceFactory(userPoolId, clientId, mockCognito.service);
  });

  describe('login', () => {
    it('should call cognito operations with correct parameters', async () => {
      const email = 'email';
      const password = 'password';

      mockCognito.functions.adminInitiateAuth.mockReturnValue(awsResolvedValue());

      await service.login({
        email,
        password,
      });

      expect(mockCognito.functions.adminInitiateAuth).toHaveBeenCalledWith({
        UserPoolId: userPoolId,
        ClientId: clientId,
        AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      });
    });
  });
});
