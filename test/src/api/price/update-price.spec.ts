import { entries, getPriceId } from '@household/shared/common/utils';
import { Price } from '@household/shared/types/types';
import { priceDataFactory } from '@household/test/api/price/data-factory';
import { allowUsers } from '@household/test/utils';

import { test as priceApiTest, expect as priceApiExpect } from '@household/test/fixtures/price-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects, mergeTests } from '@playwright/test';
import { test as priceDbTest } from '@household/test/fixtures/price-db.fixture';

const expect = mergeExpects(priceApiExpect, apiExpect);

const permissionMap = allowUsers('hairdresser') ;

const test = mergeTests(priceApiTest, priceDbTest);

test.describe('PUT /price/v1/prices/{priceId}', () => {
  let request: Price.Request;
  let priceDocument: Price.Document;

  test.beforeEach(async () => {
    request = priceDataFactory.request();

    priceDocument = priceDataFactory.document();
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestUpdatePrice }) => {
      const res = await requestUpdatePrice(priceDataFactory.id(), request);
      expect(res).toBeUnauthorizedResponse();
    });
  });

  entries(permissionMap).forEach(([
    userType,
    isAllowed,
  ]) => {
    test.describe(`called as ${userType}`, () => {
      test.use({
        userType: userType, 
      });
      if (!isAllowed) {
        test('should return forbidden', async ({ requestUpdatePrice }) => {
          const res = await requestUpdatePrice(priceDataFactory.id(), request);
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should update price', () => {
          test('with complete body', async ({ requestUpdatePrice, savePrice, findPriceById }) => {
            await savePrice(priceDocument);
            const res = await requestUpdatePrice(getPriceId(priceDocument), request);
            expect(res).toBeCreatedResponse();

            const { priceId } = await res.json() as Price.PriceId;
            expect(request).toHaveBeenSavedAsPriceDocument(await findPriceById(priceId));
          });
        });

        test.describe('should return error', () => {
          test('if price is archived', async ({ requestUpdatePrice, savePrice }) => {
            await savePrice({
              ...priceDocument,
              isArchived: true, 
            });
            const res = await requestUpdatePrice(getPriceId(priceDocument), request);
            expect(res).toBeBadRequestResponse();
            expect(res).toHaveMessage('Price is archived');
          });

          test.describe('if body', () => {
            test('has additional properties', async ({ requestUpdatePrice }) => {
              const res = await requestUpdatePrice(priceDataFactory.id(), priceDataFactory.request({
                ...request,
                extraProperty: 'extra',
              } as any));
            
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extraProperty');
            });
          });

          test.describe('if name', () => {
            test('is missing from body', async ({ requestUpdatePrice }) => {
              const res = await requestUpdatePrice(priceDataFactory.id(), priceDataFactory.request({
                name: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'name');
            });

            test('is not string', async ({ requestUpdatePrice }) => {
              const res = await requestUpdatePrice(priceDataFactory.id(), priceDataFactory.request({
                name: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'name', 'string');
            });

            test('is too short', async ({ requestUpdatePrice }) => {
              const res = await requestUpdatePrice(priceDataFactory.id(), priceDataFactory.request({
                name: '', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'name', 1);
            });

            test('is already in use by a different price', async ({ requestUpdatePrice, savePrice }) => {
              const duplicatePriceDocument = priceDataFactory.document(request);

              await savePrice(priceDocument);
              await savePrice(duplicatePriceDocument);
              const res = await requestUpdatePrice(getPriceId(priceDocument), request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Duplicate price name');
            });
          });

          test.describe('if amount', () => {
            test('is missing from body', async ({ requestUpdatePrice }) => {
              const res = await requestUpdatePrice(priceDataFactory.id(), priceDataFactory.request({
                amount: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'amount');
            });

            test('is not integer', async ({ requestUpdatePrice }) => {
              const res = await requestUpdatePrice(priceDataFactory.id(), priceDataFactory.request({
                amount: 1.5, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'amount', 'integer');
            });

            test('is too small', async ({ requestUpdatePrice }) => {
              const res = await requestUpdatePrice(priceDataFactory.id(), priceDataFactory.request({
                amount: 0, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveExclusiveTooSmallValidationError('body', 'amount', 0);
            });
          });

          test.describe('if unitOfMeasurement', () => {
            test('is missing from body', async ({ requestUpdatePrice }) => {
              const res = await requestUpdatePrice(priceDataFactory.id(), priceDataFactory.request({
                unitOfMeasurement: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'unitOfMeasurement');
            });

            test('is not string', async ({ requestUpdatePrice }) => {
              const res = await requestUpdatePrice(priceDataFactory.id(), priceDataFactory.request({
                unitOfMeasurement: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'unitOfMeasurement', 'string');
            });

            test('is not a valid enum value', async ({ requestUpdatePrice }) => {
              const res = await requestUpdatePrice(priceDataFactory.id(), priceDataFactory.request({
                unitOfMeasurement: <any>'not-enum', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveEnumValidationError('body', 'unitOfMeasurement');
            });
          });

          test.describe('if priceId', () => {
            test('is not mongo id', async ({ requestUpdatePrice }) => {
              const res = await requestUpdatePrice(priceDataFactory.id('not-valid'), request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('pathParameters', 'priceId');
            });

            test('does not belong to any price', async ({ requestUpdatePrice }) => {
              const res = await requestUpdatePrice(priceDataFactory.id(), request);
              expect(res).toBeNotFoundResponse();
              expect(res).toHaveMessage('No price found');
            });
          });
        });
      }
    });
  });
});
