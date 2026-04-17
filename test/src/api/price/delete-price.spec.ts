import { entries, getPriceId } from '@household/shared/common/utils';
import { Price } from '@household/shared/types/types';
import { priceDataFactory } from '@household/test/api/price/data-factory';
import { allowUsers } from '@household/test/utils';
import { customerDataFactory } from '@household/test/api/customer/data-factory';

import { test, expect as priceApiExpect } from '@household/test/fixtures/price-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects } from '@playwright/test';
import { customerService, priceService } from '@household/test/dependencies';

const expect = mergeExpects(priceApiExpect, apiExpect);

const permissionMap = allowUsers('hairdresser') ;

test.describe('DELETE /price/v1/prices/{priceId}', () => {
  let priceDocument: Price.Document;

  test.beforeEach(async () => {
    priceDocument = priceDataFactory.document();
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestDeletePrice }) => {
      const res = await requestDeletePrice(priceDataFactory.id());
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
        test('should return forbidden', async ({ requestDeletePrice }) => {
          const res = await requestDeletePrice(priceDataFactory.id());
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should delete price', async ({ requestDeletePrice }) => {
          await priceService.savePrice(priceDocument);
          const res = await requestDeletePrice(getPriceId(priceDocument));
          expect(res).toBeNoContentResponse();

          expect(await priceService.findPriceById(getPriceId(priceDocument))).toHaveBeenDeletedFromDatabase();
        });

        test.describe('should archive price', () => {
          test('if there is a customer job', async ({ requestDeletePrice }) => {
            const customerDocument = customerDataFactory.document({
              jobs: [
                {
                  prices: {
                    listed: [
                      {
                        price: priceDocument,
                      },
                    ],
                  },
                },
              ],
            });
            await priceService.savePrice(priceDocument);
            await customerService.saveCustomer(customerDocument);
            const res = await requestDeletePrice(getPriceId(priceDocument));
            expect(res).toBeNoContentResponse();

            expect(priceDocument).toHaveBeenArchivedInDatabase(await priceService.findPriceById(getPriceId(priceDocument)));
          });

          // test('if there is a calendar entry', async ({ requestDeletePrice }) => {
          // legacy-cypress.savePriceDocument(priceDocument)
          //     .authenticate(userType)
          //     .requestDeletePrice(getPriceId(priceDocument))
          //     .expectNoContentResponse()
          //     .validatePriceDeleted(getPriceId(priceDocument));
          // });
        });

        test.describe('should return error', () => {
          test.describe('if priceId', () => {
            test('is not mongo id', async ({ requestDeletePrice }) => {
              const res = await requestDeletePrice(priceDataFactory.id('not-valid'));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('pathParameters', 'priceId');
            });
          });
        });
      }
    });
  });
});
