import { createRecipientDocument, createRecipientId, createRecipientRequest, createRecipientResponse } from '@household/shared/common/test-data-factory';
import { addSeconds } from '@household/shared/common/utils';
import { recipientDocumentConverterFactory, IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { Types } from 'mongoose';
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
  const recipientId = new Types.ObjectId();

  const body = createRecipientRequest({
    name,
  });
  const queriedDocument = createRecipientDocument({
    name,
    _id: recipientId,
    createdAt: now,
    updatedAt: now,
  });

  describe('create', () => {
    it('should return document', () => {
      const result = converter.create(body, undefined);
      expect(result).toEqual(createRecipientDocument({
        name,
        expiresAt: undefined,
      }));
    });

    it('should return expiring document', () => {
      const result = converter.create(body, expiresIn);
      expect(result).toEqual(createRecipientDocument({
        name,
        expiresAt: addSeconds(expiresIn, now),
      }));
    });

  });

  describe('update', () => {
    const { updatedAt, ...document } = queriedDocument;
    it('should update document', () => {
      const result = converter.update({
        body,
        document,
      }, expiresIn);
      expect(result).toEqual(createRecipientDocument({
        _id: recipientId,
        name,
        createdAt: now,
        expiresAt: addSeconds(expiresIn, now),
      }));
    });
  });

  describe('toResponse', () => {
    it('should return response', () => {
      const result = converter.toResponse(queriedDocument);
      expect(result).toEqual(createRecipientResponse({
        recipientId: createRecipientId(recipientId.toString()),
        name,
      }));
    });
  });

  describe('toResponseList', () => {
    it('should return response list', () => {
      const result = converter.toResponseList([queriedDocument]);
      expect(result).toEqual([
        createRecipientResponse({
          recipientId: createRecipientId(recipientId.toString()),
          name,
        }),
      ]);
    });
  });
});
