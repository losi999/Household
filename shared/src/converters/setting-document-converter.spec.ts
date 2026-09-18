import { testDataFactory } from '@household/shared/common/test-data-factory';
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
  const settingKey = testDataFactory.setting.key();
  const value = 5;

  const body = testDataFactory.setting.request({
    value,
  });

  const queriedDocument = testDataFactory.setting.document({
    settingKey,
    value,
    createdAt: now,
    updatedAt: now,
  });

  describe('update', () => {
    it('should update document', () => {
      const result = converter.update(body, expiresIn);
      expect(result).toEqual(testDataFactory.documentUpdate({
        update: {
          $set: {
            value,
            expiresAt: addSeconds(expiresIn),
          },
        },
      }));
    });
  });

  describe('toResponse', () => {
    it('should return response', () => {

      const result = converter.toResponse(queriedDocument);
      expect(result).toEqual(testDataFactory.setting.response({
        settingKey,
        value,
      }));
    });
  });

  describe('toResponseList', () => {
    it('should return response list', () => {

      const result = converter.toResponseList([queriedDocument]);
      expect(result).toEqual([
        testDataFactory.setting.response({
          settingKey,
          value,
        }),
      ]);
    });
  });
});
