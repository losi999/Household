import { createDocumentUpdate, createCustomerDocument, createCustomerRequest, createCustomerResponse } from '@household/shared/common/test-data-factory';
import { addSeconds, getCustomerId } from '@household/shared/common/utils';
import { customerDocumentConverterFactory, ICustomerDocumentConverter } from '@household/shared/converters/customer-document-converter';
import { advanceTo, clear } from 'jest-date-mock';

describe('Customer document converter', () => {
  let converter: ICustomerDocumentConverter;
  const now = new Date();

  beforeEach(() => {
    advanceTo(now);
    converter = customerDocumentConverterFactory();
  });

  afterEach(() => {
    clear();
  });

  const name = 'Bolt';
  const expiresIn = 3600;

  const body = createCustomerRequest({
    name,
  });
  const queriedDocument = createCustomerDocument({
    name,
    createdAt: now,
    updatedAt: now,
  });

  describe('create', () => {
    it('should return document', () => {
      const result = converter.create(body, undefined);
      expect(result).toEqual(createCustomerDocument({
        name,
        expiresAt: undefined,
        _id: undefined,
      }));
    });

    it('should return expiring document', () => {
      const result = converter.create(body, expiresIn);
      expect(result).toEqual(createCustomerDocument({
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
      expect(result).toEqual(createCustomerResponse({
        customerId: getCustomerId(queriedDocument),
        name,
      }));
    });
  });

  describe('toResponseList', () => {
    it('should return response list', () => {
      const result = converter.toResponseList([queriedDocument]);
      expect(result).toEqual([
        createCustomerResponse({
          customerId: getCustomerId(queriedDocument),
          name,
        }),
      ]);
    });
  });
});
