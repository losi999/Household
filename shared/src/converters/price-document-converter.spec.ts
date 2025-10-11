import { createDocumentUpdate2, priceDataFactory } from '@household/shared/common/test-data-factory';
import { addSeconds, getPriceId } from '@household/shared/common/utils';
import { priceDocumentConverterFactory, IPriceDocumentConverter } from '@household/shared/converters/price-document-converter';
import { advanceTo, clear } from 'jest-date-mock';

describe('Price document converter', () => {
  let converter: IPriceDocumentConverter;
  const now = new Date();

  beforeEach(() => {
    advanceTo(now);
    converter = priceDocumentConverterFactory();
  });

  afterEach(() => {
    clear();
  });

  const expiresIn = 3600;

  describe('create', () => {
    it('should return document', () => {
      const body = priceDataFactory.request();

      const result = converter.create(body, undefined);
      expect(result).toEqual(priceDataFactory.document({
        ...body,
        _id: undefined,
      }));
    });

    it('should return expiring document', () => {
      const body = priceDataFactory.request();

      const result = converter.create(body, expiresIn);
      expect(result).toEqual(priceDataFactory.document({
        ...body,
        _id: undefined,
        expiresAt: addSeconds(expiresIn, now),
      }));
    });

  });

  describe('update', () => {
    it('should update document', () => {
      const body = priceDataFactory.request();

      const result = converter.update(body, expiresIn);
      expect(result).toEqual(
        createDocumentUpdate2({
          update: {
            $set: {
              ...body,
              expiresAt: addSeconds(expiresIn, now),
            },

          },
        }),
      );
    });
  });

  describe('toResponse', () => {
    it('should return response', () => {
      const doc = priceDataFactory.document();

      const { amount, name, unitOfMeasurement } = doc;
      const result = converter.toResponse(doc);
      expect(result).toEqual(priceDataFactory.response({
        amount,
        name,
        unitOfMeasurement,
        priceId: getPriceId(doc),
      }));
    });
  });

  describe('toResponseList', () => {
    it('should return response list', () => {
      const doc = priceDataFactory.document();

      const { amount, name, unitOfMeasurement } = doc;

      const result = converter.toResponseList([doc]);
      expect(result).toEqual([
        priceDataFactory.response({
          amount,
          name,
          unitOfMeasurement,
          priceId: getPriceId(doc),
        }),
      ]);
    });
  });
});
