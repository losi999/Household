import { IListAccountsService, listAccountsServiceFactory } from '@household/api/functions/list-accounts/list-accounts.service';
import { createAccountDocument, createAccountResponse } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { IAccountService } from '@household/shared/services/account-service';

describe('List accounts service', () => {
  let service: IListAccountsService;
  let mockAccountService: Mock<IAccountService>;
  let mockAccountDocumentConverter: Mock<IAccountDocumentConverter>;

  beforeEach(() => {
    mockAccountService = createMockService('listAccounts');
    mockAccountDocumentConverter = createMockService('toResponseList');

    service = listAccountsServiceFactory(mockAccountService.service, mockAccountDocumentConverter.service);
  });

  const queriedDocument = createAccountDocument();
  const convertedResponse = createAccountResponse();

  it('should return documents', async () => {
    mockAccountService.functions.listAccounts.mockResolvedValue([queriedDocument]);
    mockAccountDocumentConverter.functions.toResponseList.mockReturnValue([convertedResponse]);

    const result = await service();
    expect(result).toEqual([convertedResponse]);
    expect(mockAccountService.functions.listAccounts).toHaveBeenCalled();
    validateFunctionCall(mockAccountDocumentConverter.functions.toResponseList, [queriedDocument]);
    expect.assertions(3);
  });

  describe('should throw error', () => {
    it('if unable to query accounts', async () => {
      mockAccountService.functions.listAccounts.mockRejectedValue('this is a mongo error');

      await service().catch(validateError('Error while listing accounts', 500));
      expect(mockAccountService.functions.listAccounts).toHaveBeenCalled();
      validateFunctionCall(mockAccountDocumentConverter.functions.toResponseList);
      expect.assertions(4);
    });
  });
});
