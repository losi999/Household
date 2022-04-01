import { IUpdateAccountService, updateAccountServiceFactory } from '@household/api/functions/update-account/update-account.service';
import { createAccountDocument, createAccountRequest, createAccountId } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
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

  const accountId = createAccountId();
  const body = createAccountRequest();
  const queriedDocument = createAccountDocument();
  const updatedDocument = createAccountDocument({
    name: 'updated',
  });
  const { updatedAt, ...toUpdate } = queriedDocument;

  it('should return if account is updated', async () => {
    mockAccountService.functions.getAccountById.mockResolvedValue(queriedDocument);
    mockAccountDocumentConverter.functions.update.mockReturnValue(updatedDocument);
    mockAccountService.functions.updateAccount.mockResolvedValue(undefined);

    await service({
      body,
      accountId,
      expiresIn: undefined,
    });
    validateFunctionCall(mockAccountService.functions.getAccountById, accountId);
    validateFunctionCall(mockAccountDocumentConverter.functions.update, {
      body,
      document: toUpdate,
    }, undefined);
    validateFunctionCall(mockAccountService.functions.updateAccount, updatedDocument);
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
      mockAccountDocumentConverter.functions.update.mockReturnValue(updatedDocument);
      mockAccountService.functions.updateAccount.mockRejectedValue('this is a mongo error');

      await service({
        body,
        accountId,
        expiresIn: undefined,
      }).catch(validateError('Error while updating account', 500));
      validateFunctionCall(mockAccountService.functions.getAccountById, accountId);
      validateFunctionCall(mockAccountDocumentConverter.functions.update, {
        body,
        document: toUpdate,
      }, undefined);
      validateFunctionCall(mockAccountService.functions.updateAccount, updatedDocument);
      expect.assertions(5);
    });
  });
});
