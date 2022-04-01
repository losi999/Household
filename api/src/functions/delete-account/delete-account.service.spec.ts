import { IDeleteAccountService, deleteAccountServiceFactory } from '@household/api/functions/delete-account/delete-account.service';
import { createAccountId } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { IAccountService } from '@household/shared/services/account-service';

describe('Delete account service', () => {
  let service: IDeleteAccountService;
  let mockAccountService: Mock<IAccountService>;

  beforeEach(() => {
    mockAccountService = createMockService('deleteAccount');

    service = deleteAccountServiceFactory(mockAccountService.service);
  });

  const accountId = createAccountId();

  it('should return if document is deleted', async () => {
    mockAccountService.functions.deleteAccount.mockResolvedValue(undefined);

    await service({
      accountId,
    });
    validateFunctionCall(mockAccountService.functions.deleteAccount, accountId);
    expect.assertions(1);
  });

  describe('should throw error', () => {
    it('if unable to delete document', async () => {
      mockAccountService.functions.deleteAccount.mockRejectedValue('this is a mongo error');

      await service({
        accountId,
      }).catch(validateError('Error while deleting account', 500));
      validateFunctionCall(mockAccountService.functions.deleteAccount, accountId);
      expect.assertions(3);
    });
  });
});
