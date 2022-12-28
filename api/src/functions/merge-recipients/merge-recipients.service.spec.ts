import { IMergeRecipientsService, mergeRecipientsServiceFactory } from '@household/api/functions/merge-recipients/merge-recipients.service';
import { createRecipientDocument } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getRecipientId } from '@household/shared/common/utils';
import { IRecipientService } from '@household/shared/services/recipient-service';

describe('Merge recipient service', () => {
  let service: IMergeRecipientsService;
  let mockRecipientService: Mock<IRecipientService>;

  beforeEach(() => {
    mockRecipientService = createMockService('listRecipientsByIds', 'mergeRecipients');

    service = mergeRecipientsServiceFactory(mockRecipientService.service);
  });

  const targetRecipientDocument = createRecipientDocument();
  const sourceRecipientDocument = createRecipientDocument();
  const sourceRecipientId = getRecipientId(sourceRecipientDocument);
  const recipientId = getRecipientId(targetRecipientDocument);
  const body = [sourceRecipientId];

  it('should return if recipients are merged', async () => {
    mockRecipientService.functions.listRecipientsByIds.mockResolvedValue([
      targetRecipientDocument,
      sourceRecipientDocument,
    ]);
    mockRecipientService.functions.mergeRecipients.mockResolvedValue(undefined);

    await service({
      body,
      recipientId,
    });
    validateFunctionCall(mockRecipientService.functions.listRecipientsByIds, [
      recipientId,
      sourceRecipientId,
    ]);
    validateFunctionCall(mockRecipientService.functions.mergeRecipients, {
      sourceRecipientIds: body,
      targetRecipientId: recipientId,
    });
    expect.assertions(2);
  });

  describe('should throw error', () => {
    it('if target recipient is among source recipients', async () => {
      await service({
        body: [
          recipientId,
          sourceRecipientId,
        ],
        recipientId,
      }).catch(validateError('Target recipient is among the source recipient Ids', 400));
      validateFunctionCall(mockRecipientService.functions.listRecipientsByIds);
      validateFunctionCall(mockRecipientService.functions.mergeRecipients);
      expect.assertions(4);
    });

    it('if unable to query recipients', async () => {
      mockRecipientService.functions.listRecipientsByIds.mockRejectedValue('This is a mongo error');

      await service({
        body,
        recipientId,
      }).catch(validateError('Error while listing recipients by ids', 500));
      validateFunctionCall(mockRecipientService.functions.listRecipientsByIds, [
        recipientId,
        sourceRecipientId,
      ]);
      validateFunctionCall(mockRecipientService.functions.mergeRecipients);
      expect.assertions(4);
    });

    it('if some of the recipients not found', async () => {
      mockRecipientService.functions.listRecipientsByIds.mockResolvedValue([sourceRecipientDocument]);
      mockRecipientService.functions.mergeRecipients.mockResolvedValue(undefined);

      await service({
        body,
        recipientId,
      }).catch(validateError('Some of the recipients are not found', 400));
      validateFunctionCall(mockRecipientService.functions.listRecipientsByIds, [
        recipientId,
        sourceRecipientId,
      ]);
      validateFunctionCall(mockRecipientService.functions.mergeRecipients);
      expect.assertions(4);
    });

    it('if unable to merge recipients', async () => {
      mockRecipientService.functions.listRecipientsByIds.mockResolvedValue([
        targetRecipientDocument,
        sourceRecipientDocument,
      ]);
      mockRecipientService.functions.mergeRecipients.mockRejectedValue('This is a mongo error');

      await service({
        body,
        recipientId,
      }).catch(validateError('Error while merging recipients', 500));
      validateFunctionCall(mockRecipientService.functions.listRecipientsByIds, [
        recipientId,
        sourceRecipientId,
      ]);
      validateFunctionCall(mockRecipientService.functions.mergeRecipients, {
        sourceRecipientIds: body,
        targetRecipientId: recipientId,
      });
      expect.assertions(4);
    });
  });
});
