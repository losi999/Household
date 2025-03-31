import { createFileDocument, createFileRequest } from '@household/shared/common/test-data-factory';
import { addSeconds } from '@household/shared/common/utils';
import { fileDocumentConverterFactory, IFileDocumentConverter } from '@household/shared/converters/file-document-converter';
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
  const fileType = 'otp';

  const body = createFileRequest({
    timezone,
    fileType,
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
      const result = converter.updateStatus('completed');
      expect(result).toEqual({
        $set: {
          processingStatus: 'completed',
        },
      });
    });
  });
});
