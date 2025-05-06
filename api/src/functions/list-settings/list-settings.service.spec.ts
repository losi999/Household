import { IListSettingsService, listSettingsServiceFactory } from '@household/api/functions/list-settings/list-settings.service';
import { createSettingDocument, createSettingResponse } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { ISettingDocumentConverter } from '@household/shared/converters/setting-document-converter';
import { ISettingService } from '@household/shared/services/setting-service';

describe('List settings service', () => {
  let service: IListSettingsService;
  let mockSettingService: Mock<ISettingService>;
  let mockSettingDocumentConverter: Mock<ISettingDocumentConverter>;

  beforeEach(() => {
    mockSettingService = createMockService('listSettings');
    mockSettingDocumentConverter = createMockService('toResponseList');

    service = listSettingsServiceFactory(mockSettingService.service, mockSettingDocumentConverter.service);
  });

  const queriedDocument = createSettingDocument();
  const convertedResponse = createSettingResponse();

  it('should return documents', async () => {
    mockSettingService.functions.listSettings.mockResolvedValue([queriedDocument]);
    mockSettingDocumentConverter.functions.toResponseList.mockReturnValue([convertedResponse]);

    const result = await service();
    expect(result).toEqual([convertedResponse]);
    expect(mockSettingService.functions.listSettings).toHaveBeenCalled();
    validateFunctionCall(mockSettingDocumentConverter.functions.toResponseList, [queriedDocument]);
    expect.assertions(3);
  });

  describe('should throw error', () => {
    it('if unable to query settings', async () => {
      mockSettingService.functions.listSettings.mockRejectedValue('this is a mongo error');

      await service().catch(validateError('Error while listing settings', 500));
      expect(mockSettingService.functions.listSettings).toHaveBeenCalled();
      validateFunctionCall(mockSettingDocumentConverter.functions.toResponseList);
      expect.assertions(4);
    });
  });
});
