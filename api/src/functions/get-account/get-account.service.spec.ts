import { IGetAccountService, getAccountServiceFactory } from '@household/api/functions/get-account/get-account.service';
import { createAccountDocument, createAccountId, createAccountResponse } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { IAccountService } from '@household/shared/services/account-service';

describe('Get account service', () => {
  let service: IGetAccountService;
  let mockAccountService: Mock<IAccountService>;
  let mockAccountDocumentConverter: Mock<IAccountDocumentConverter>;

  beforeEach(() => {
    mockAccountService = createMockService('getAccountById');
    mockAccountDocumentConverter = createMockService('toResponse');

    service = getAccountServiceFactory(mockAccountService.service, mockAccountDocumentConverter.service);
  });

  const accountId = createAccountId();
  const queriedDocument = createAccountDocument();
  const convertedResponse = createAccountResponse();

  it('should return account', async () => {
    mockAccountService.functions.getAccountById.mockResolvedValue(queriedDocument);
    mockAccountDocumentConverter.functions.toResponse.mockReturnValue(convertedResponse);

    const result = await service({
      accountId,
    });
    expect(result).toEqual(convertedResponse);
    validateFunctionCall(mockAccountService.functions.getAccountById, accountId);
    validateFunctionCall(mockAccountDocumentConverter.functions.toResponse, queriedDocument);
    expect.assertions(3);
  });
  describe('should throw error', () => {
    it('if unable to query account', async () => {
      mockAccountService.functions.getAccountById.mockRejectedValue('this is a mongo error');

      await service({
        accountId,
      }).catch(validateError('Error while getting account', 500));
      validateFunctionCall(mockAccountService.functions.getAccountById, accountId);
      validateFunctionCall(mockAccountDocumentConverter.functions.toResponse);
      expect.assertions(4);
    });

    it('if no account found', async () => {
      mockAccountService.functions.getAccountById.mockResolvedValue(undefined);

      await service({
        accountId,
      }).catch(validateError('No account found', 404));
      validateFunctionCall(mockAccountService.functions.getAccountById, accountId);
      validateFunctionCall(mockAccountDocumentConverter.functions.toResponse);
      expect.assertions(4);
    });
  });
});
