import { ICreateUploadUrlService, createUploadUrlServiceFactory } from '@household/api/functions/create-upload-url/create-upload-url.service';
import { createFileDocument, createFileRequest, generateMongoId } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { IFileDocumentConverter } from '@household/shared/converters/file-document-converter';
import { IFileService } from '@household/shared/services/file-service';
import { IStorageService } from '@household/shared/services/storage-service';

describe('Create upload URL service', () => {
  let service: ICreateUploadUrlService;
  let mockFileService: Mock<IFileService>;
  let mockFileDocumentConverter: Mock<IFileDocumentConverter>;
  let mockStorageService: Mock<IStorageService>;

  beforeEach(() => {
    mockFileService = createMockService('saveFile');
    mockFileDocumentConverter = createMockService('create');
    mockStorageService = createMockService('getSignedUrlForUpload');

    service = createUploadUrlServiceFactory(mockFileService.service,
      mockFileDocumentConverter.service,
      mockStorageService.service);
  });

  const url = 'https://url-for.upload.com';
  const convertedFileDocument = createFileDocument({
    processingStatus: undefined,
  });
  const savedFileDocument = createFileDocument({
    processingStatus: 'pending',
    _id: generateMongoId(),
  });

  const fileRequest = createFileRequest();

  describe('should return url', () => {
    it('if upload url is generated', async () => {
      mockFileDocumentConverter.functions.create.mockReturnValue(convertedFileDocument);
      mockFileService.functions.saveFile.mockResolvedValue(savedFileDocument);
      mockStorageService.functions.getSignedUrlForUpload.mockResolvedValue(url);

      await service({
        body: fileRequest,
        expiresIn: undefined,
      });
      validateFunctionCall(mockFileDocumentConverter.functions.create, fileRequest, undefined);
      validateFunctionCall(mockFileService.functions.saveFile, convertedFileDocument);
      validateFunctionCall(mockStorageService.functions.getSignedUrlForUpload, `${fileRequest.type}/${savedFileDocument._id}`);
      expect.assertions(3);
    });
  });

  describe('should throw error', () => {
    it('if unable to save file document', async () => {
      mockFileDocumentConverter.functions.create.mockReturnValue(convertedFileDocument);
      mockFileService.functions.saveFile.mockRejectedValue('this is a mongo error');

      await service({
        body: fileRequest,
        expiresIn: undefined,
      }).catch(validateError('Error while saving file document', 500));
      validateFunctionCall(mockFileDocumentConverter.functions.create, fileRequest, undefined);
      validateFunctionCall(mockFileService.functions.saveFile, convertedFileDocument);
      validateFunctionCall(mockStorageService.functions.getSignedUrlForUpload);
      expect.assertions(5);
    });

    it('if unable to generate upload url', async () => {
      mockFileDocumentConverter.functions.create.mockReturnValue(convertedFileDocument);
      mockFileService.functions.saveFile.mockResolvedValue(savedFileDocument);
      mockStorageService.functions.getSignedUrlForUpload.mockRejectedValue('this is an s3 error');

      await service({
        body: fileRequest,
        expiresIn: undefined,
      }).catch(validateError('Error while getting URL for file upload', 500));
      validateFunctionCall(mockFileDocumentConverter.functions.create, fileRequest, undefined);
      validateFunctionCall(mockFileService.functions.saveFile, convertedFileDocument);
      validateFunctionCall(mockStorageService.functions.getSignedUrlForUpload, `${fileRequest.type}/${savedFileDocument._id}`);
      expect.assertions(5);
    });
  });
});
