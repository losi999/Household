import { Price } from '@household/shared/types/types';
import { priceDataFactory } from '@household/test/api/price/data-factory';
import { allowUsers } from '@household/test/utils';
import { entries } from '@household/shared/common/utils';

import { test, expect as priceApiExpect } from '@household/test/fixtures/price-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects } from '@playwright/test';
import { priceService } from '@household/test/dependencies';

const expect = mergeExpects(priceApiExpect, apiExpect);

const permissionMap = allowUsers('hairdresser') ;

test.describe('POST price/v1/prices', () => {
  let request: Price.Request;

  test.beforeEach(async () => {
    request = priceDataFactory.request();
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestCreatePrice }) => {
      const res = await requestCreatePrice(request);
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
        test('should return forbidden', async ({ requestCreatePrice }) => {
          const res = await requestCreatePrice(request);
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should create price', () => {
          test('with complete body', async ({ requestCreatePrice }) => {
            const res = await requestCreatePrice(request);
            expect(res).toBeCreatedResponse();

            const { priceId } = (await res.json()) as Price.PriceId;
            expect(request).toBeStoredInDatabase(await priceService.findPriceById(priceId));
          });
        });

        test('should reactivate archived price', async ({ requestCreatePrice }) => {
          const archivedPriceDocument = {
            ...priceDataFactory.document({
              name: request.name,
            }),
            isArchived: true,
          };

          await priceService.savePrice(archivedPriceDocument);
          const res = await requestCreatePrice(request);
          expect(res).toBeCreatedResponse();

          const { priceId } = (await res.json()) as Price.PriceId;
          expect(request).toBeStoredInDatabase(await priceService.findPriceById(priceId));
        });

        test.describe('should return error', () => {
          test.describe('if body', () => {
            test('has additional properties', async ({ requestCreatePrice }) => {
              const res = await requestCreatePrice({
                ...request,
                extraProperty: 'extra',
              } as any);
          
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extraProperty');
            });
          });

          test.describe('if name', () => {
            test('is missing from body', async ({ requestCreatePrice }) => {
              const res = await requestCreatePrice(priceDataFactory.request({
                name: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'name');
            });

            test('is not string', async ({ requestCreatePrice }) => {
              const res = await requestCreatePrice(priceDataFactory.request({
                name: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'name', 'string');
            });

            test('is too short', async ({ requestCreatePrice }) => {
              const res = await requestCreatePrice(priceDataFactory.request({
                name: '', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'name', 1);
            });

            test('is already in use by a different price', async ({ requestCreatePrice }) => {
              const priceDocument = priceDataFactory.document(request);

              await priceService.savePrice(priceDocument);
              const res = await requestCreatePrice(request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Duplicate price name');
            });
          });

          test.describe('if amount', () => {
            test('is missing from body', async ({ requestCreatePrice }) => {
              const res = await requestCreatePrice(priceDataFactory.request({
                amount: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'amount');
            });

            test('is not integer', async ({ requestCreatePrice }) => {
              const res = await requestCreatePrice(priceDataFactory.request({
                amount: 1.5, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'amount', 'integer');
            });

            test('is too small', async ({ requestCreatePrice }) => {
              const res = await requestCreatePrice(priceDataFactory.request({
                amount: 0, 
              }));
              expect(res).toBeBadRequestResponse();
              // TODO: expectTooSmallNumberProperty('amount', 0, true, 'body')
            });
          });

          test.describe('if unitOfMeasurement', () => {
            test('is missing from body', async ({ requestCreatePrice }) => {
              const res = await requestCreatePrice(priceDataFactory.request({
                unitOfMeasurement: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'unitOfMeasurement');
            });

            test('is not string', async ({ requestCreatePrice }) => {
              const res = await requestCreatePrice(priceDataFactory.request({
                unitOfMeasurement: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'unitOfMeasurement', 'string');
            });

            test('is not a valid enum value', async ({ requestCreatePrice }) => {
              const res = await requestCreatePrice(priceDataFactory.request({
                unitOfMeasurement: <any>'not-enum', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveEnumValidationError('body', 'unitOfMeasurement');
            });
          });
        });
      }
    });
  });
});
