import { ICreateRecipientService, createRecipientServiceFactory } from '@household/api/functions/create-recipient/create-recipient.service';
import { createRecipientRequest, createRecipientDocument } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { IRecipientService } from '@household/shared/services/recipient-service';
import { Types } from 'mongoose';

describe('Create recipient service', () => {
  let service: ICreateRecipientService;
  let mockRecipientService: Mock<IRecipientService>;
  let mockRecipientDocumentConverter: Mock<IRecipientDocumentConverter>;
  beforeEach(() => {
    mockRecipientService = createMockService('saveRecipient');
    mockRecipientDocumentConverter = createMockService('create');

    service = createRecipientServiceFactory(mockRecipientService.service, mockRecipientDocumentConverter.service);
  });

  const body = createRecipientRequest();
  const recipientId = new Types.ObjectId();
  const convertedRecipientDocument = createRecipientDocument({
    _id: recipientId,
  });

  it('should return new id', async () => {
    mockRecipientDocumentConverter.functions.create.mockReturnValue(convertedRecipientDocument);
    mockRecipientService.functions.saveRecipient.mockResolvedValue(convertedRecipientDocument);

    const result = await service({
      body,
      expiresIn: undefined,
    });
    expect(result).toEqual(recipientId.toString()),
    validateFunctionCall(mockRecipientDocumentConverter.functions.create, body, undefined);
    validateFunctionCall(mockRecipientService.functions.saveRecipient, convertedRecipientDocument);
    expect.assertions(3);
  });
  describe('should throw error', () => {
    it('if unable to save document', async () => {
      mockRecipientDocumentConverter.functions.create.mockReturnValue(convertedRecipientDocument);
      mockRecipientService.functions.saveRecipient.mockRejectedValue('this is a mongo error');

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Error while saving recipient', 500));
      validateFunctionCall(mockRecipientDocumentConverter.functions.create, body, undefined);
      validateFunctionCall(mockRecipientService.functions.saveRecipient, convertedRecipientDocument);
      expect.assertions(4);
    });
  });
});
