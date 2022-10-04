import { IUpdateRecipientService, updateRecipientServiceFactory } from '@household/api/functions/update-recipient/update-recipient.service';
import { createRecipientRequest, createRecipientDocument } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getRecipientId } from '@household/shared/common/utils';
import { IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { IRecipientService } from '@household/shared/services/recipient-service';

describe('Update recipient service', () => {
  let service: IUpdateRecipientService;
  let mockRecipientService: Mock<IRecipientService>;
  let mockRecipientDocumentConverter: Mock<IRecipientDocumentConverter>;

  beforeEach(() => {
    mockRecipientService = createMockService('getRecipientById', 'updateRecipient');
    mockRecipientDocumentConverter = createMockService('update');

    service = updateRecipientServiceFactory(mockRecipientService.service, mockRecipientDocumentConverter.service);
  });

  const body = createRecipientRequest();
  const queriedDocument = createRecipientDocument();
  const recipientId = getRecipientId(queriedDocument);
  const updatedDocument = createRecipientDocument({
    name: 'updated',
  });
  const { updatedAt, ...toUpdate } = queriedDocument;

  it('should return if recipient is updated', async () => {
    mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedDocument);
    mockRecipientDocumentConverter.functions.update.mockReturnValue(updatedDocument);
    mockRecipientService.functions.updateRecipient.mockResolvedValue(undefined);

    await service({
      body,
      recipientId,
      expiresIn: undefined,
    });
    validateFunctionCall(mockRecipientService.functions.getRecipientById, recipientId);
    validateFunctionCall(mockRecipientDocumentConverter.functions.update, {
      body,
      document: toUpdate,
    }, undefined);
    validateFunctionCall(mockRecipientService.functions.updateRecipient, updatedDocument);
    expect.assertions(3);
  });

  describe('should throw error', () => {
    it('if unable to query recipient', async () => {
      mockRecipientService.functions.getRecipientById.mockRejectedValue('this is a mongo error');

      await service({
        body,
        recipientId,
        expiresIn: undefined,
      }).catch(validateError('Error while getting recipient', 500));
      validateFunctionCall(mockRecipientService.functions.getRecipientById, recipientId);
      validateFunctionCall(mockRecipientDocumentConverter.functions.update);
      validateFunctionCall(mockRecipientService.functions.updateRecipient);
      expect.assertions(5);
    });

    it('if recipient not found', async () => {
      mockRecipientService.functions.getRecipientById.mockResolvedValue(undefined);

      await service({
        body,
        recipientId,
        expiresIn: undefined,
      }).catch(validateError('No recipient found', 404));
      validateFunctionCall(mockRecipientService.functions.getRecipientById, recipientId);
      validateFunctionCall(mockRecipientDocumentConverter.functions.update);
      validateFunctionCall(mockRecipientService.functions.updateRecipient);
      expect.assertions(5);
    });

    it('if unable to update recipient', async () => {
      mockRecipientService.functions.getRecipientById.mockResolvedValue(queriedDocument);
      mockRecipientDocumentConverter.functions.update.mockReturnValue(updatedDocument);
      mockRecipientService.functions.updateRecipient.mockRejectedValue('this is a mongo error');

      await service({
        body,
        recipientId,
        expiresIn: undefined,
      }).catch(validateError('Error while updating recipient', 500));
      validateFunctionCall(mockRecipientService.functions.getRecipientById, recipientId);
      validateFunctionCall(mockRecipientDocumentConverter.functions.update, {
        body,
        document: toUpdate,
      }, undefined);
      validateFunctionCall(mockRecipientService.functions.updateRecipient, updatedDocument);
      expect.assertions(5);
    });
  });
});
