import { priceDataFactory } from '@household/shared/common/test-data-factory';
import { validateInternalProperties } from '@household/shared/common/unit-testing';
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

      const { amount, name, unitOfMeasurement, ...internal } = converter.create(body, undefined);
      expect(amount).toEqual(body.amount);
      expect(name).toEqual(body.name);
      expect(unitOfMeasurement).toEqual(body.unitOfMeasurement);
      validateInternalProperties(internal);
    });

    it('should return expiring document', () => {
      const body = priceDataFactory.request();

      const { amount, name, unitOfMeasurement, expiresAt, ...internal } = converter.create(body, expiresIn);
      expect(amount).toEqual(body.amount);
      expect(name).toEqual(body.name);
      expect(unitOfMeasurement).toEqual(body.unitOfMeasurement);
      expect(expiresAt).toEqual(addSeconds(expiresIn, now));
      validateInternalProperties(internal);
    });

  });

  describe('update', () => {
    it('should update document', () => {
      const body = priceDataFactory.request();

      const result = converter.update(body, expiresIn);
      expect(result).toEqual({
        update: {
          $set: {
            ...body,
            expiresAt: addSeconds(expiresIn, now),
          },
        },
      });
    });
  });

  describe('toResponse', () => {
    it('should return response', () => {
      const doc = priceDataFactory.document();

      const { priceId, amount, name, unitOfMeasurement, ...internal } = converter.toResponse(doc);
      expect(priceId).toEqual(getPriceId(doc));
      expect(amount).toEqual(doc.amount);
      expect(name).toEqual(doc.name);
      expect(unitOfMeasurement).toEqual(doc.unitOfMeasurement);
      validateInternalProperties(internal);
    });
  });

  describe('toResponseList', () => {
    it('should return response list', () => {
      const doc = priceDataFactory.document();

      const [{ priceId, amount, name, unitOfMeasurement, ...internal }] = converter.toResponseList([doc]);
      expect(priceId).toEqual(getPriceId(doc));
      expect(amount).toEqual(doc.amount);
      expect(name).toEqual(doc.name);
      expect(unitOfMeasurement).toEqual(doc.unitOfMeasurement);
      validateInternalProperties(internal);
    });
  });
});
