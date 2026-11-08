import { entries, getPriceId } from '@household/shared/common/utils';
import { priceDataFactory } from '@household/test/api/price/data-factory';
import { allowUsers } from '@household/test/utils';
import { customerDataFactory } from '@household/test/api/customer/data-factory';

import { priceApiTest, priceApiExpect } from '@household/test/fixtures/price-api.fixture';
import { mergeTests } from '@playwright/test';
import { priceDbTest } from '@household/test/fixtures/price-db.fixture';
import { customerDbTest } from '@household/test/fixtures/customer-db.fixture';
import { calendarEntryDataFactory } from '@household/test/api/calendar/data-factory';
import { calendarEntryDbTest } from '@household/test/fixtures/calendar-entry-db.fixture';
import { Documents } from '@household/shared/types/documents';

const permissionMap = allowUsers('hairdresser') ;

const test = mergeTests(priceApiTest, priceDbTest, customerDbTest, calendarEntryDbTest);

test.describe('DELETE /price/v1/prices/{priceId}', () => {
  let priceDocument: Documents.Price;

  test.beforeEach(async () => {
    priceDocument = priceDataFactory.document();
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestDeletePrice }) => {
      const res = await requestDeletePrice(priceDataFactory.id());
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
        test('should return forbidden', async ({ requestDeletePrice }) => {
          const res = await requestDeletePrice(priceDataFactory.id());
          priceApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test('should delete price', async ({ requestDeletePrice, savePrice, findPriceById }) => {
          await savePrice(priceDocument);
          const res = await requestDeletePrice(getPriceId(priceDocument));
          priceApiExpect(res).toBeNoContentResponse();

          priceApiExpect(await findPriceById(getPriceId(priceDocument))).toHaveBeenDeletedFromDatabase();
        });

        test.describe('should archive price', () => {
          test('if there is a customer job', async ({ requestDeletePrice, savePrice, findPriceById, saveCustomer }) => {
            const customerDocument = customerDataFactory.document({
              jobs: [
                {
                  prices: [
                    {
                      price: priceDocument,
                    },
                  ],
                },
              ],
            });
            await savePrice(priceDocument);
            await saveCustomer(customerDocument);
            const res = await requestDeletePrice(getPriceId(priceDocument));
            priceApiExpect(res).toBeNoContentResponse();

            priceApiExpect(priceDocument).toHaveBeenArchivedInDatabase(await findPriceById(getPriceId(priceDocument)));
          });

          test('if there is a calendar entry', async ({ requestDeletePrice, savePrice, findPriceById, saveCustomer, saveCalendarEntry }) => {
            const customerDocument = customerDataFactory.document();
            
            const calendarEntryDocument = calendarEntryDataFactory.document.work({
              customer: customerDocument,
              prices: [
                {
                  price: priceDocument,
                },
              ],
            });
            
            await savePrice (priceDocument);
            await saveCustomer(customerDocument);
            await saveCalendarEntry(calendarEntryDocument);

            const res = await requestDeletePrice(getPriceId(priceDocument));
            priceApiExpect(res).toBeNoContentResponse();

            priceApiExpect(priceDocument).toHaveBeenArchivedInDatabase(await findPriceById(getPriceId(priceDocument)));
          });
        });

        test.describe('should return error', () => {
          test.describe('if priceId', () => {
            test('is not mongo id', async ({ requestDeletePrice }) => {
              const res = await requestDeletePrice(priceDataFactory.id('not-valid'));
              priceApiExpect(res).toBeBadRequestResponse();
              priceApiExpect(res).toHavePatternValidationError('pathParameters', 'priceId');
            });
          });
        });
      }
    });
  });
});
