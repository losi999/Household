import { createDocumentUpdate, createRecipientDocument, createRecipientReport, createRecipientRequest, createRecipientResponse } from '@household/shared/common/test-data-factory';
import { addSeconds, getRecipientId } from '@household/shared/common/utils';
import { recipientDocumentConverterFactory, IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { advanceTo, clear } from 'jest-date-mock';

describe('Recipient document converter', () => {
  let converter: IRecipientDocumentConverter;
  const now = new Date();

  beforeEach(() => {
    advanceTo(now);
    converter = recipientDocumentConverterFactory();
  });

  afterEach(() => {
    clear();
  });

  const name = 'Bolt';
  const expiresIn = 3600;

  const body = createRecipientRequest({
    name,
  });
  const queriedDocument = createRecipientDocument({
    name,
    createdAt: now,
    updatedAt: now,
  });

  describe('create', () => {
    it('should return document', () => {
      const result = converter.create(body, undefined);
      expect(result).toEqual(createRecipientDocument({
        name,
        expiresAt: undefined,
        _id: undefined,
      }));
    });

    it('should return expiring document', () => {
      const result = converter.create(body, expiresIn);
      expect(result).toEqual(createRecipientDocument({
        name,
        expiresAt: addSeconds(expiresIn, now),
        _id: undefined,
      }));
    });

  });

  describe('update', () => {
    it('should update document', () => {
      const result = converter.update(body, expiresIn);
      expect(result).toEqual(createDocumentUpdate({
        $set: {
          ...body,
          expiresAt: addSeconds(expiresIn, now),
        },
      }));
    });
  });

  describe('toResponse', () => {
    it('should return response', () => {
      const result = converter.toResponse(queriedDocument);
      expect(result).toEqual(createRecipientResponse({
        recipientId: getRecipientId(queriedDocument),
        name,
      }));
    });
  });

  describe('toResponseList', () => {
    it('should return response list', () => {
      const result = converter.toResponseList([queriedDocument]);
      expect(result).toEqual([
        createRecipientResponse({
          recipientId: getRecipientId(queriedDocument),
          name,
        }),
      ]);
    });
  });

  describe('toReport', () => {
    it('should return report', () => {
      const result = converter.toReport(queriedDocument);
      expect(result).toEqual(createRecipientReport({
        recipientId: getRecipientId(queriedDocument),
        name,
      }));
    });
  });
});
