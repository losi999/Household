import { responseList as schema } from '@household/shared/schemas/price';
import { priceDataFactory } from '@household/test/api/price/data-factory';
import { allowUsers } from '@household/test/utils';
import { entries } from '@household/shared/common/utils';

import { priceApiTest, priceApiExpect } from '@household/test/fixtures/price-api.fixture';
import { mergeTests } from '@playwright/test';
import { priceDbTest } from '@household/test/fixtures/price-db.fixture';
import { Documents } from '@household/shared/types/documents';

const permissionMap = allowUsers('hairdresser');

const test = mergeTests(priceApiTest, priceDbTest);

test.describe('GET /price/v1/prices', () => {
  let priceDocument1: Documents.Price;
  let priceDocument2: Documents.Price;
  let archivedPriceDocument: Documents.Price;

  test.beforeEach(async () => {
    priceDocument1 = priceDataFactory.document();
    priceDocument2 = priceDataFactory.document();
    archivedPriceDocument = {
      ...priceDataFactory.document(),
      isArchived: true,
    };
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestListPrices }) => {
      const res = await requestListPrices();
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
        test('should return forbidden', async ({ requestListPrices }) => {
          const res = await requestListPrices();
          priceApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test('should get a list of prices', async ({ requestListPrices, savePrices }) => {
          await savePrices(priceDocument1, priceDocument2, archivedPriceDocument);
          const res = await requestListPrices();
          priceApiExpect(res).toBeOkResponse();
          priceApiExpect(res).toMatchSchema(schema);

          priceApiExpect(res).toContainMatchingPriceDocument(priceDocument1);
          priceApiExpect(res).toContainMatchingPriceDocument(priceDocument2);
          priceApiExpect(res).toNotContainMatchingPriceDocument(archivedPriceDocument);
        });
      }
    });
  });
});
