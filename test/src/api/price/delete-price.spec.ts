import { entries, getPriceId } from '@household/shared/common/utils';
import { Price } from '@household/shared/types/types';
import { priceDataFactory } from '@household/test/api/price/data-factory';
import { allowUsers } from '@household/test/utils';
import { customerDataFactory } from '@household/test/api/customer/data-factory';

import { test as priceApiTest, expect as priceApiExpect } from '@household/test/fixtures/price-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects, mergeTests } from '@playwright/test';
import { test as priceDbTest } from '@household/test/fixtures/price-db.fixture';
import { test as customerDbTest } from '@household/test/fixtures/customer-db.fixture';
import { calendarEntryDataFactory } from '@household/test/api/calendar/data-factory';
import { test as calendarEntryDbTest } from '@household/test/fixtures/calendar-entry-db.fixture';

const expect = mergeExpects(priceApiExpect, apiExpect);

const permissionMap = allowUsers('hairdresser') ;

const test = mergeTests(priceApiTest, priceDbTest, customerDbTest, calendarEntryDbTest);

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
        test('should delete price', async ({ requestDeletePrice, savePrice, findPriceById }) => {
          await savePrice(priceDocument);
          const res = await requestDeletePrice(getPriceId(priceDocument));
          expect(res).toBeNoContentResponse();

          expect(await findPriceById(getPriceId(priceDocument))).toHaveBeenDeletedFromDatabase();
        });

        test.describe('should archive price', () => {
          test('if there is a customer job', async ({ requestDeletePrice, savePrice, findPriceById, saveCustomer }) => {
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
            await savePrice(priceDocument);
            await saveCustomer(customerDocument);
            const res = await requestDeletePrice(getPriceId(priceDocument));
            expect(res).toBeNoContentResponse();

            expect(priceDocument).toHaveBeenArchivedInDatabase(await findPriceById(getPriceId(priceDocument)));
          });

          test('if there is a calendar entry', async ({ requestDeletePrice, savePrice, findPriceById, saveCustomer, saveCalendarEntry }) => {
            const customerDocument = customerDataFactory.document();
            
            const calendarEntryDocument = calendarEntryDataFactory.document.work({
              customer: customerDocument,
              prices: {
                listed: [
                  {
                    price: priceDocument,
                  },
                ],
              },
            });
            
            await savePrice (priceDocument);
            await saveCustomer(customerDocument);
            await saveCalendarEntry(calendarEntryDocument);

            const res = await requestDeletePrice(getPriceId(priceDocument));
            expect(res).toBeNoContentResponse();

            expect(priceDocument).toHaveBeenArchivedInDatabase(await findPriceById(getPriceId(priceDocument)));
          });
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
