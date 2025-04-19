import { IListFilesService, listFilesServiceFactory } from '@household/api/functions/list-files/list-files.service';
import { createFileDocument, createFileResponse } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { IFileDocumentConverter } from '@household/shared/converters/file-document-converter';
import { IFileService } from '@household/shared/services/file-service';

describe('List files service', () => {
  let service: IListFilesService;
  let mockFileService: Mock<IFileService>;
  let mockFileDocumentConverter: Mock<IFileDocumentConverter>;

  beforeEach(() => {
    mockFileService = createMockService('listFiles');
    mockFileDocumentConverter = createMockService('toResponseList');

    service = listFilesServiceFactory(mockFileService.service, mockFileDocumentConverter.service);
  });

  const queriedDocument = createFileDocument();
  const convertedResponse = createFileResponse();

  it('should return documents', async () => {
    mockFileService.functions.listFiles.mockResolvedValue([queriedDocument]);
    mockFileDocumentConverter.functions.toResponseList.mockReturnValue([convertedResponse]);

    const result = await service();
    expect(result).toEqual([convertedResponse]);
    expect(mockFileService.functions.listFiles).toHaveBeenCalled();
    validateFunctionCall(mockFileDocumentConverter.functions.toResponseList, [queriedDocument]);
    expect.assertions(3);
  });

  describe('should throw error', () => {
    it('if unable to query files', async () => {
      mockFileService.functions.listFiles.mockRejectedValue('this is a mongo error');

      await service().catch(validateError('Error while listing files', 500));
      expect(mockFileService.functions.listFiles).toHaveBeenCalled();
      validateFunctionCall(mockFileDocumentConverter.functions.toResponseList);
      expect.assertions(4);
    });
  });
});
