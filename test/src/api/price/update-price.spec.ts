import { entries, getPriceId } from '@household/shared/common/utils';
import { priceDataFactory } from '@household/test/api/price/data-factory';
import { allowUsers } from '@household/test/utils';

import { priceApiTest, priceApiExpect } from '@household/test/fixtures/price-api.fixture';
import { mergeTests } from '@playwright/test';
import { priceDbTest } from '@household/test/fixtures/price-db.fixture';
import { Documents } from '@household/shared/types/documents';
import { Requests } from '@household/shared/types/requests';

const permissionMap = allowUsers('hairdresser') ;

const test = mergeTests(priceApiTest, priceDbTest);

test.describe('PUT /price/v1/prices/{priceId}', () => {
  let request: Requests.Price;
  let priceDocument: Documents.Price;

  test.beforeEach(async () => {
    request = priceDataFactory.request();

    priceDocument = priceDataFactory.document();
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestUpdatePrice }) => {
      const res = await requestUpdatePrice(priceDataFactory.id(), request);
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
        test('should return forbidden', async ({ requestUpdatePrice }) => {
          const res = await requestUpdatePrice(priceDataFactory.id(), request);
          priceApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should update price', () => {
          test('with complete body', async ({ requestUpdatePrice, savePrice, findPriceById }) => {
            await savePrice(priceDocument);
            const res = await requestUpdatePrice(getPriceId(priceDocument), request);
            priceApiExpect(res).toBeNoContentResponse();
            priceApiExpect(request).toHaveBeenSavedAsPriceDocument(await findPriceById(getPriceId(priceDocument)));
          });
        });

        test.describe('should return error', () => {
          test('if price is archived', async ({ requestUpdatePrice, savePrice }) => {
            await savePrice({
              ...priceDocument,
              isArchived: true, 
            });
            const res = await requestUpdatePrice(getPriceId(priceDocument), request);
            priceApiExpect(res).toBeBadRequestResponse();
            priceApiExpect(res).toHaveMessage('Price is archived');
          });

          test.describe('if body', () => {
            test('has additional properties', async ({ requestUpdatePrice }) => {
              const res = await requestUpdatePrice(priceDataFactory.id(), priceDataFactory.request({
                ...request,
                extraProperty: 'extra',
              } as any));
            
              priceApiExpect(res).toBeBadRequestResponse();
              priceApiExpect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extraProperty');
            });
          });

          test.describe('if name', () => {
            test('is missing from body', async ({ requestUpdatePrice }) => {
              const res = await requestUpdatePrice(priceDataFactory.id(), priceDataFactory.request({
                name: undefined, 
              }));
              priceApiExpect(res).toBeBadRequestResponse();
              priceApiExpect(res).toHaveRequiredPropertyValidationError('body', 'name');
            });

            test('is not string', async ({ requestUpdatePrice }) => {
              const res = await requestUpdatePrice(priceDataFactory.id(), priceDataFactory.request({
                name: <any>1, 
              }));
              priceApiExpect(res).toBeBadRequestResponse();
              priceApiExpect(res).toHaveWrongTypeValidationError('body', 'name', 'string');
            });

            test('is too short', async ({ requestUpdatePrice }) => {
              const res = await requestUpdatePrice(priceDataFactory.id(), priceDataFactory.request({
                name: '', 
              }));
              priceApiExpect(res).toBeBadRequestResponse();
              priceApiExpect(res).toHaveTooShortValidationError('body', 'name', 1);
            });

            test('is already in use by a different price', async ({ requestUpdatePrice, savePrice }) => {
              const duplicatePriceDocument = priceDataFactory.document(request);

              await savePrice(priceDocument);
              await savePrice(duplicatePriceDocument);
              const res = await requestUpdatePrice(getPriceId(priceDocument), request);
              priceApiExpect(res).toBeBadRequestResponse();
              priceApiExpect(res).toHaveMessage('Duplicate price name');
            });
          });

          test.describe('if amount', () => {
            test('is missing from body', async ({ requestUpdatePrice }) => {
              const res = await requestUpdatePrice(priceDataFactory.id(), priceDataFactory.request({
                amount: undefined, 
              }));
              priceApiExpect(res).toBeBadRequestResponse();
              priceApiExpect(res).toHaveRequiredPropertyValidationError('body', 'amount');
            });

            test('is not integer', async ({ requestUpdatePrice }) => {
              const res = await requestUpdatePrice(priceDataFactory.id(), priceDataFactory.request({
                amount: 1.5, 
              }));
              priceApiExpect(res).toBeBadRequestResponse();
              priceApiExpect(res).toHaveWrongTypeValidationError('body', 'amount', 'integer');
            });

            test('is too small', async ({ requestUpdatePrice }) => {
              const res = await requestUpdatePrice(priceDataFactory.id(), priceDataFactory.request({
                amount: 0, 
              }));
              priceApiExpect(res).toBeBadRequestResponse();
              priceApiExpect(res).toHaveExclusiveTooSmallValidationError('body', 'amount', 0);
            });
          });

          test.describe('if unitOfMeasurement', () => {
            test('is missing from body', async ({ requestUpdatePrice }) => {
              const res = await requestUpdatePrice(priceDataFactory.id(), priceDataFactory.request({
                unitOfMeasurement: undefined, 
              }));
              priceApiExpect(res).toBeBadRequestResponse();
              priceApiExpect(res).toHaveRequiredPropertyValidationError('body', 'unitOfMeasurement');
            });

            test('is not string', async ({ requestUpdatePrice }) => {
              const res = await requestUpdatePrice(priceDataFactory.id(), priceDataFactory.request({
                unitOfMeasurement: <any>1, 
              }));
              priceApiExpect(res).toBeBadRequestResponse();
              priceApiExpect(res).toHaveWrongTypeValidationError('body', 'unitOfMeasurement', 'string');
            });

            test('is not a valid enum value', async ({ requestUpdatePrice }) => {
              const res = await requestUpdatePrice(priceDataFactory.id(), priceDataFactory.request({
                unitOfMeasurement: <any>'not-enum', 
              }));
              priceApiExpect(res).toBeBadRequestResponse();
              priceApiExpect(res).toHaveEnumValidationError('body', 'unitOfMeasurement');
            });
          });

          test.describe('if priceId', () => {
            test('is not mongo id', async ({ requestUpdatePrice }) => {
              const res = await requestUpdatePrice(priceDataFactory.id('not-valid'), request);
              priceApiExpect(res).toBeBadRequestResponse();
              priceApiExpect(res).toHavePatternValidationError('pathParameters', 'priceId');
            });

            test('does not belong to any price', async ({ requestUpdatePrice }) => {
              const res = await requestUpdatePrice(priceDataFactory.id(), request);
              priceApiExpect(res).toBeNotFoundResponse();
              priceApiExpect(res).toHaveMessage('No price found');
            });
          });
        });
      }
    });
  });
});
