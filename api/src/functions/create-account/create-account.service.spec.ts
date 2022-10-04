import { ICreateAccountService, createAccountServiceFactory } from '@household/api/functions/create-account/create-account.service';
import { createAccountDocument, createAccountRequest } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getAccountId } from '@household/shared/common/utils';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { IAccountService } from '@household/shared/services/account-service';

describe('Create account service', () => {
  let service: ICreateAccountService;
  let mockAccountService: Mock<IAccountService>;
  let mockAccountDocumentConverter: Mock<IAccountDocumentConverter>;

  beforeEach(() => {
    mockAccountService = createMockService('saveAccount');
    mockAccountDocumentConverter = createMockService('create');

    service = createAccountServiceFactory(mockAccountService.service, mockAccountDocumentConverter.service);
  });

  const body = createAccountRequest();
  const convertedAccountDocument = createAccountDocument();
  const accountId = getAccountId(convertedAccountDocument);

  it('should return new id', async () => {
    mockAccountDocumentConverter.functions.create.mockReturnValue(convertedAccountDocument);
    mockAccountService.functions.saveAccount.mockResolvedValue(convertedAccountDocument);

    const result = await service({
      body,
      expiresIn: undefined,
    });
    expect(result).toEqual(accountId),
    validateFunctionCall(mockAccountDocumentConverter.functions.create, body, undefined);
    validateFunctionCall(mockAccountService.functions.saveAccount, convertedAccountDocument);
    expect.assertions(3);
  });
  describe('should throw error', () => {
    it('if unable to save document', async () => {
      mockAccountDocumentConverter.functions.create.mockReturnValue(convertedAccountDocument);
      mockAccountService.functions.saveAccount.mockRejectedValue('this is a mongo error');

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Error while saving account', 500));
      validateFunctionCall(mockAccountDocumentConverter.functions.create, body, undefined);
      validateFunctionCall(mockAccountService.functions.saveAccount, convertedAccountDocument);
      expect.assertions(4);
    });
  });
});
