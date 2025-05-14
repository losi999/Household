import { IUpdateSettingService, updateSettingServiceFactory } from '@household/api/functions/update-setting/update-setting.service';
import { createSettingRequest, createSettingDocument, createDocumentUpdate } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { ISettingDocumentConverter } from '@household/shared/converters/setting-document-converter';
import { ISettingService } from '@household/shared/services/setting-service';

describe('Update setting service', () => {
  let service: IUpdateSettingService;
  let mockSettingService: Mock<ISettingService>;
  let mockSettingDocumentConverter: Mock<ISettingDocumentConverter>;

  beforeEach(() => {
    mockSettingService = createMockService('updateSetting');
    mockSettingDocumentConverter = createMockService('update');

    service = updateSettingServiceFactory(mockSettingService.service, mockSettingDocumentConverter.service);
  });

  const body = createSettingRequest();
  const queriedDocument = createSettingDocument();
  const settingKey = queriedDocument.settingKey;
  const updateQuery = createDocumentUpdate({
    name: 'updated',
  });

  it('should return if setting is updated', async () => {
    mockSettingDocumentConverter.functions.update.mockReturnValue(updateQuery);
    mockSettingService.functions.updateSetting.mockResolvedValue(undefined);

    await service({
      ...body,
      settingKey,
      expiresIn: undefined,
    });
    validateFunctionCall(mockSettingDocumentConverter.functions.update, body, undefined);
    validateFunctionCall(mockSettingService.functions.updateSetting, settingKey, updateQuery);
    expect.assertions(2);
  });

  describe('should throw error', () => {
    it('if unable to update setting', async () => {
      mockSettingDocumentConverter.functions.update.mockReturnValue(updateQuery);
      mockSettingService.functions.updateSetting.mockRejectedValue('this is a mongo error');

      await service({
        ...body,
        settingKey,
        expiresIn: undefined,
      }).catch(validateError('Error while updating setting document', 500));
      validateFunctionCall(mockSettingDocumentConverter.functions.update, body, undefined);
      validateFunctionCall(mockSettingService.functions.updateSetting, settingKey, updateQuery);
      expect.assertions(4);
    });
  });
});
