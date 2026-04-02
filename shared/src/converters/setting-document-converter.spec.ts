import { createSettingDocument, createSettingKey, createSettingRequest, createSettingResponse } from '@household/shared/common/test-data-factory';
import { addSeconds } from '@household/shared/common/utils';
import { settingDocumentConverterFactory, ISettingDocumentConverter } from '@household/shared/converters/setting-document-converter';

describe('Setting document converter', () => {
  let converter: ISettingDocumentConverter;
  const now = new Date();

  beforeEach(() => {
    vi.useFakeTimers().setSystemTime(now);
    converter = settingDocumentConverterFactory();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const expiresIn = 3600;
  const settingKey = createSettingKey();
  const value = 5;

  const body = createSettingRequest({
    value,
  });

  const queriedDocument = createSettingDocument({
    settingKey,
    value,
    createdAt: now,
    updatedAt: now,
  });

  describe('update', () => {
    it('should update document', () => {
      const result = converter.update(body, expiresIn);
      expect(result).toEqual({
        $set: {
          value,
          expiresAt: addSeconds(expiresIn),
        },
      });
    });
  });

  describe('toResponse', () => {
    it('should return response', () => {

      const result = converter.toResponse(queriedDocument);
      expect(result).toEqual(createSettingResponse({
        settingKey,
        value,
      }));
    });
  });

  describe('toResponseList', () => {
    it('should return response list', () => {

      const result = converter.toResponseList([queriedDocument]);
      expect(result).toEqual([
        createSettingResponse({
          settingKey,
          value,
        }),
      ]);
    });
  });
});
