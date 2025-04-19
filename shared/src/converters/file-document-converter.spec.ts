import { createFileDocument, createFileRequest, createFileResponse } from '@household/shared/common/test-data-factory';
import { addSeconds, getFileId } from '@household/shared/common/utils';
import { fileDocumentConverterFactory, IFileDocumentConverter } from '@household/shared/converters/file-document-converter';
import { FileProcessingStatus, FileType } from '@household/shared/enums';
import { advanceTo, clear } from 'jest-date-mock';

describe('File document converter', () => {
  let converter: IFileDocumentConverter;
  const now = new Date();

  beforeEach(() => {
    advanceTo(now);
    converter = fileDocumentConverterFactory();
  });

  afterEach(() => {
    clear();
  });

  const expiresIn = 3600;
  const timezone = 'Europe/Budapest';
  const fileType = FileType.Otp;
  const draftCount = 5;
  const processingStatus = FileProcessingStatus.Completed;

  const body = createFileRequest({
    timezone,
    fileType,

  });

  const queriedDocument = createFileDocument({
    timezone,
    fileType,
    createdAt: now,
    updatedAt: now,
    draftCount,
    processingStatus,
  });

  describe('create', () => {
    it('should return document', () => {
      const result = converter.create(body, undefined);
      expect(result).toEqual(createFileDocument({
        timezone,
        fileType,
        expiresAt: undefined,
        _id: undefined,
      }));
    });

    it('should return expiring document', () => {
      const result = converter.create(body, expiresIn);
      expect(result).toEqual(createFileDocument({
        timezone,
        fileType,
        expiresAt: addSeconds(expiresIn, now),
        _id: undefined,
      }));
    });

  });

  describe('update status', () => {
    it('should update document', () => {
      const result = converter.updateStatus(FileProcessingStatus.Completed);
      expect(result).toEqual({
        $set: {
          processingStatus: 'completed',
        },
      });
    });
  });

  describe('toResponse', () => {
    it('should return response', () => {

      const result = converter.toResponse(queriedDocument);
      expect(result).toEqual(createFileResponse({
        fileId: getFileId(queriedDocument),
        fileType,
        draftCount,
        uploadedAt: now.toISOString(),
      }));
    });
  });

  describe('toResponseList', () => {
    it('should return response list', () => {

      const result = converter.toResponseList([queriedDocument]);
      expect(result).toEqual([
        createFileResponse({
          fileId: getFileId(queriedDocument),
          fileType,
          draftCount,
          uploadedAt: now.toISOString(),
        }),
      ]);
    });
  });
});
