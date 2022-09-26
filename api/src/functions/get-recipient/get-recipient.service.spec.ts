import { IGetRecipientService, getRecipientServiceFactory } from '@household/api/functions/get-recipient/get-recipient.service';
import { createRecipientDocument, createRecipientResponse } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getRecipientId } from '@household/shared/common/utils';
import { IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { IRecipientService } from '@household/shared/services/recipient-service';

describe('Get recipient service', () => {
  let service: IGetRecipientService;
  let mockRecipientService: Mock<IRecipientService>;
  let mockRecipientDocumentConverter: Mock<IRecipientDocumentConverter>;

  beforeEach(() => {
    mockRecipientService = createMockService('getRecipientById');
    mockRecipientDocumentConverter = createMockService('toResponse');

    service = getRecipientServiceFactory(mockRecipientService.service, mockRecipientDocumentConverter.service);
  });

  const queriedDocument = createRecipientDocument();
  const recipientId = getRecipientId(queriedDocument);
  const convertedResponse = createRecipientResponse();

  it('should return recipient', async () => {
    mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedDocument);
    mockRecipientDocumentConverter.functions.toResponse.mockReturnValue(convertedResponse);

    const result = await service({
      recipientId,
    });
    expect(result).toEqual(convertedResponse);
    validateFunctionCall(mockRecipientService.functions.getRecipientById, recipientId);
    validateFunctionCall(mockRecipientDocumentConverter.functions.toResponse, queriedDocument);
    expect.assertions(3);
  });
  describe('should throw error', () => {
    it('if unable to query recipient', async () => {
      mockRecipientService.functions.getRecipientById.mockRejectedValue('this is a mongo error');

      await service({
        recipientId,
      }).catch(validateError('Error while getting recipient', 500));
      validateFunctionCall(mockRecipientService.functions.getRecipientById, recipientId);
      validateFunctionCall(mockRecipientDocumentConverter.functions.toResponse);
      expect.assertions(4);
    });

    it('if no recipient found', async () => {
      mockRecipientService.functions.getRecipientById.mockResolvedValue(undefined);

      await service({
        recipientId,
      }).catch(validateError('No recipient found', 404));
      validateFunctionCall(mockRecipientService.functions.getRecipientById, recipientId);
      validateFunctionCall(mockRecipientDocumentConverter.functions.toResponse);
      expect.assertions(4);
    });
  });
});
