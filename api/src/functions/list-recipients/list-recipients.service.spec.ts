import { IListRecipientsService, listRecipientsServiceFactory } from '@household/api/functions/list-recipients/list-recipients.service';
import { createRecipientDocument, createRecipientResponse } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { IRecipientService } from '@household/shared/services/recipient-service';

describe('List recipients service', () => {
  let service: IListRecipientsService;
  let mockRecipientService: Mock<IRecipientService>;
  let mockRecipientDocumentConverter: Mock<IRecipientDocumentConverter>;

  beforeEach(() => {
    mockRecipientService = createMockService('listRecipients');
    mockRecipientDocumentConverter = createMockService('toResponseList');

    service = listRecipientsServiceFactory(mockRecipientService.service, mockRecipientDocumentConverter.service);
  });

  const queriedDocument = createRecipientDocument();
  const convertedResponse = createRecipientResponse();

  it('should return documents', async () => {
    mockRecipientService.functions.listRecipients.mockResolvedValue([queriedDocument]);
    mockRecipientDocumentConverter.functions.toResponseList.mockReturnValue([convertedResponse]);

    const result = await service();
    expect(result).toEqual([convertedResponse]);
    expect(mockRecipientService.functions.listRecipients).toHaveBeenCalled();
    validateFunctionCall(mockRecipientDocumentConverter.functions.toResponseList, [queriedDocument]);
    expect.assertions(3);
  });

  describe('should throw error', () => {
    it('if unable to query recipients', async () => {
      mockRecipientService.functions.listRecipients.mockRejectedValue('this is a mongo error');

      await service().catch(validateError('Error while listing recipients', 500));
      expect(mockRecipientService.functions.listRecipients).toHaveBeenCalled();
      validateFunctionCall(mockRecipientDocumentConverter.functions.toResponseList);
      expect.assertions(4);
    });
  });
});
