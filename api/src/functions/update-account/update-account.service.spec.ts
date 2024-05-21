import { IUpdateAccountService, updateAccountServiceFactory } from '@household/api/functions/update-account/update-account.service';
import { createAccountDocument, createAccountRequest, createDocumentUpdate } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getAccountId } from '@household/shared/common/utils';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { IAccountService } from '@household/shared/services/account-service';

describe('Update account service', () => {
  let service: IUpdateAccountService;
  let mockAccountService: Mock<IAccountService>;
  let mockAccountDocumentConverter: Mock<IAccountDocumentConverter>;

  beforeEach(() => {
    mockAccountService = createMockService('getAccountById', 'updateAccount');
    mockAccountDocumentConverter = createMockService('update');

    service = updateAccountServiceFactory(mockAccountService.service, mockAccountDocumentConverter.service);
  });

  const body = createAccountRequest();
  const queriedDocument = createAccountDocument();
  const accountId = getAccountId(queriedDocument);
  const updateQuery = createDocumentUpdate({
    name: 'updated',
  });

  it('should return if account is updated', async () => {
    mockAccountService.functions.getAccountById.mockResolvedValue(queriedDocument);
    mockAccountDocumentConverter.functions.update.mockReturnValue(updateQuery);
    mockAccountService.functions.updateAccount.mockResolvedValue(undefined);

    await service({
      body,
      accountId,
      expiresIn: undefined,
    });
    validateFunctionCall(mockAccountService.functions.getAccountById, accountId);
    validateFunctionCall(mockAccountDocumentConverter.functions.update, body, undefined);
    validateFunctionCall(mockAccountService.functions.updateAccount, accountId, updateQuery);
    expect.assertions(3);
  });

  describe('should throw error', () => {
    it('if unable to query account', async () => {
      mockAccountService.functions.getAccountById.mockRejectedValue('this is a mongo error');

      await service({
        body,
        accountId,
        expiresIn: undefined,
      }).catch(validateError('Error while getting account', 500));
      validateFunctionCall(mockAccountService.functions.getAccountById, accountId);
      validateFunctionCall(mockAccountDocumentConverter.functions.update);
      validateFunctionCall(mockAccountService.functions.updateAccount);
      expect.assertions(5);
    });

    it('if account not found', async () => {
      mockAccountService.functions.getAccountById.mockResolvedValue(undefined);

      await service({
        body,
        accountId,
        expiresIn: undefined,
      }).catch(validateError('No account found', 404));
      validateFunctionCall(mockAccountService.functions.getAccountById, accountId);
      validateFunctionCall(mockAccountDocumentConverter.functions.update);
      validateFunctionCall(mockAccountService.functions.updateAccount);
      expect.assertions(5);
    });

    it('if unable to update account', async () => {
      mockAccountService.functions.getAccountById.mockResolvedValue(queriedDocument);
      mockAccountDocumentConverter.functions.update.mockReturnValue(updateQuery);
      mockAccountService.functions.updateAccount.mockRejectedValue('this is a mongo error');

      await service({
        body,
        accountId,
        expiresIn: undefined,
      }).catch(validateError('Error while updating account', 500));
      validateFunctionCall(mockAccountService.functions.getAccountById, accountId);
      validateFunctionCall(mockAccountDocumentConverter.functions.update, body, undefined);
      validateFunctionCall(mockAccountService.functions.updateAccount, accountId, updateQuery);
      expect.assertions(5);
    });
  });
});
