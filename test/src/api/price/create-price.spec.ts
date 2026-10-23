import { priceDataFactory } from '@household/test/api/price/data-factory';
import { allowUsers } from '@household/test/utils';
import { entries } from '@household/shared/common/utils';

import { priceApiTest, priceApiExpect } from '@household/test/fixtures/price-api.fixture';
import { mergeTests } from '@playwright/test';
import { priceDbTest } from '@household/test/fixtures/price-db.fixture';
import { Requests } from '@household/shared/types/requests';
import { Api } from '@household/shared/types/api';

const permissionMap = allowUsers('hairdresser') ;

const test = mergeTests(priceApiTest, priceDbTest);

test.describe('POST price/v1/prices', () => {
  let request: Requests.Price;

  test.beforeEach(async () => {
    request = priceDataFactory.request();
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestCreatePrice }) => {
      const res = await requestCreatePrice(request);
      priceApiExpect(res).toBeUnauthorizedResponse();
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
          priceApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should create price', () => {
          test('with complete body', async ({ requestCreatePrice, findPriceById }) => {
            const res = await requestCreatePrice(request);
            priceApiExpect(res).toBeCreatedResponse();

            const { priceId } = (await res.json()) as Api.Price.PriceId;
            priceApiExpect(request).toHaveBeenSavedAsPriceDocument(await findPriceById(priceId));
          });
        });

        test('should reactivate archived price', async ({ requestCreatePrice, savePrice, findPriceById }) => {
          const archivedPriceDocument = {
            ...priceDataFactory.document({
              name: request.name,
            }),
            isArchived: true,
          };

          await savePrice(archivedPriceDocument);
          const res = await requestCreatePrice(request);
          priceApiExpect(res).toBeCreatedResponse();

          const { priceId } = (await res.json()) as Api.Price.PriceId;
          priceApiExpect(request).toHaveBeenSavedAsPriceDocument(await findPriceById(priceId));
        });

        test.describe('should return error', () => {
          test.describe('if body', () => {
            test('has additional properties', async ({ requestCreatePrice }) => {
              const res = await requestCreatePrice({
                ...request,
                extraProperty: 'extra',
              } as any);
          
              priceApiExpect(res).toBeBadRequestResponse();
              priceApiExpect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extraProperty');
            });
          });

          test.describe('if name', () => {
            test('is missing from body', async ({ requestCreatePrice }) => {
              const res = await requestCreatePrice(priceDataFactory.request({
                name: undefined, 
              }));
              priceApiExpect(res).toBeBadRequestResponse();
              priceApiExpect(res).toHaveRequiredPropertyValidationError('body', 'name');
            });

            test('is not string', async ({ requestCreatePrice }) => {
              const res = await requestCreatePrice(priceDataFactory.request({
                name: <any>1, 
              }));
              priceApiExpect(res).toBeBadRequestResponse();
              priceApiExpect(res).toHaveWrongTypeValidationError('body', 'name', 'string');
            });

            test('is too short', async ({ requestCreatePrice }) => {
              const res = await requestCreatePrice(priceDataFactory.request({
                name: '', 
              }));
              priceApiExpect(res).toBeBadRequestResponse();
              priceApiExpect(res).toHaveTooShortValidationError('body', 'name', 1);
            });

            test('is already in use by a different price', async ({ requestCreatePrice, savePrice }) => {
              const priceDocument = priceDataFactory.document(request);

              await savePrice(priceDocument);
              const res = await requestCreatePrice(request);
              priceApiExpect(res).toBeBadRequestResponse();
              priceApiExpect(res).toHaveMessage('Duplicate price name');
            });
          });

          test.describe('if amount', () => {
            test('is missing from body', async ({ requestCreatePrice }) => {
              const res = await requestCreatePrice(priceDataFactory.request({
                amount: undefined, 
              }));
              priceApiExpect(res).toBeBadRequestResponse();
              priceApiExpect(res).toHaveRequiredPropertyValidationError('body', 'amount');
            });

            test('is not integer', async ({ requestCreatePrice }) => {
              const res = await requestCreatePrice(priceDataFactory.request({
                amount: 1.5, 
              }));
              priceApiExpect(res).toBeBadRequestResponse();
              priceApiExpect(res).toHaveWrongTypeValidationError('body', 'amount', 'integer');
            });

            test('is too small', async ({ requestCreatePrice }) => {
              const res = await requestCreatePrice(priceDataFactory.request({
                amount: 0, 
              }));
              priceApiExpect(res).toBeBadRequestResponse();
              priceApiExpect(res).toHaveExclusiveTooSmallValidationError('body', 'amount', 0);
            });
          });

          test.describe('if unitOfMeasurement', () => {
            test('is missing from body', async ({ requestCreatePrice }) => {
              const res = await requestCreatePrice(priceDataFactory.request({
                unitOfMeasurement: undefined, 
              }));
              priceApiExpect(res).toBeBadRequestResponse();
              priceApiExpect(res).toHaveRequiredPropertyValidationError('body', 'unitOfMeasurement');
            });

            test('is not string', async ({ requestCreatePrice }) => {
              const res = await requestCreatePrice(priceDataFactory.request({
                unitOfMeasurement: <any>1, 
              }));
              priceApiExpect(res).toBeBadRequestResponse();
              priceApiExpect(res).toHaveWrongTypeValidationError('body', 'unitOfMeasurement', 'string');
            });

            test('is not a valid enum value', async ({ requestCreatePrice }) => {
              const res = await requestCreatePrice(priceDataFactory.request({
                unitOfMeasurement: <any>'not-enum', 
              }));
              priceApiExpect(res).toBeBadRequestResponse();
              priceApiExpect(res).toHaveEnumValidationError('body', 'unitOfMeasurement');
            });
          });
        });
      }
    });
  });
});
