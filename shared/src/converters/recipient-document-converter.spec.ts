import { testDataFactory } from '@household/shared/common/test-data-factory';
import { addSeconds, getRecipientId } from '@household/shared/common/utils';
import { recipientDocumentConverterFactory, IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';

describe('Recipient document converter', () => {
  let converter: IRecipientDocumentConverter;

  beforeEach(() => {
    vi.useFakeTimers().setSystemTime(new Date());
    converter = recipientDocumentConverterFactory();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const expiresIn = 3600;

  describe('create', () => {
    it('should return document', () => {
      const body = testDataFactory.recipient.request();

      const result = converter.create(body, undefined);
      expect(result).toEqual(testDataFactory.recipient.document({
        ...body,
        expiresAt: undefined,
        _id: undefined,
      }));
    });

    it('should return expiring document', () => {
      const body = testDataFactory.recipient.request();

      const result = converter.create(body, expiresIn);
      expect(result).toEqual(testDataFactory.recipient.document({
        ...body,
        expiresAt: addSeconds(expiresIn),
        _id: undefined,
      }));
    });

  });

  describe('update', () => {
    it('should update document', () => {
      const body = testDataFactory.recipient.request();

      const result = converter.update(body, expiresIn);
      expect(result).toEqual(testDataFactory.documentUpdate({
        update: {
          $set: {
            ...body,
            expiresAt: addSeconds(expiresIn),
          },
        },
      }));
    });
  });

  describe('toResponse', () => {
    it('should return response', () => {
      const doc = testDataFactory.recipient.document();

      const { name } = doc;

      const result = converter.toResponse(doc);
      expect(result).toEqual(testDataFactory.recipient.response({
        recipientId: getRecipientId(doc),
        name,
      }));
    });
  });

  describe('toResponseList', () => {
    it('should return response list', () => {
      const doc = testDataFactory.recipient.document();

      const { name } = doc;

      const result = converter.toResponseList([doc]);
      expect(result).toEqual([
        testDataFactory.recipient.response({
          recipientId: getRecipientId(doc),
          name,
        }),
      ]);
    });
  });

  describe('toReport', () => {
    it('should return report', () => {
      const doc = testDataFactory.recipient.document();

      const { name } = doc;

      const result = converter.toReport(doc);
      expect(result).toEqual(testDataFactory.recipient.report({
        recipientId: getRecipientId(doc),
        name,
      }));
    });
  });
});
