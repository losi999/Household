import { IDeleteRecipientService, deleteRecipientServiceFactory } from '@household/api/functions/delete-recipient/delete-recipient.service';
import { createRecipientId } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { IRecipientService } from '@household/shared/services/recipient-service';

describe('Delete recipient service', () => {
  let service: IDeleteRecipientService;
  let mockRecipientService: Mock<IRecipientService>;
  beforeEach(() => {
    mockRecipientService = createMockService('deleteRecipient');

    service = deleteRecipientServiceFactory(mockRecipientService.service);
  });

  const recipientId = createRecipientId();

  it('should return if document is deleted', async () => {
    mockRecipientService.functions.deleteRecipient.mockResolvedValue(undefined);

    await service({
      recipientId,
    });
    validateFunctionCall(mockRecipientService.functions.deleteRecipient, recipientId);
    expect.assertions(1);
  });

  describe('should throw error', () => {
    it('if unable to delete document', async () => {
      mockRecipientService.functions.deleteRecipient.mockRejectedValue('this is a mongo error');

      await service({
        recipientId,
      }).catch(validateError('Error while deleting recipient', 500));
      validateFunctionCall(mockRecipientService.functions.deleteRecipient, recipientId);
      expect.assertions(3);
    });
  });
});
