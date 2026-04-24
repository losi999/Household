import { default as schema } from '@household/test/schemas/price-response-list';
import { Price } from '@household/shared/types/types';
import { priceDataFactory } from '@household/test/api/price/data-factory';
import { allowUsers } from '@household/test/utils';
import { entries } from '@household/shared/common/utils';

import { test as priceApiTest, expect as priceApiExpect } from '@household/test/fixtures/price-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects, mergeTests } from '@playwright/test';
import { test as priceDbTest } from '@household/test/fixtures/price-db.fixture';

const expect = mergeExpects(priceApiExpect, apiExpect);

const permissionMap = allowUsers('hairdresser');

const test = mergeTests(priceApiTest, priceDbTest);

test.describe('GET /price/v1/prices', () => {
  let priceDocument1: Price.Document;
  let priceDocument2: Price.Document;
  let archivedPriceDocument: Price.Document;

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
        test('should return forbidden', async ({ requestListPrices }) => {
          const res = await requestListPrices();
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should get a list of prices', async ({ requestListPrices, savePrices }) => {
          await savePrices(priceDocument1, priceDocument2, archivedPriceDocument);
          const res = await requestListPrices();
          expect(res).toBeOkResponse();
          expect(res).toMatchSchema(schema);

          expect(res).toContainMatchingPriceDocument(priceDocument1);
          expect(res).toContainMatchingPriceDocument(priceDocument2);
          expect(res).toNotContainMatchingPriceDocument(archivedPriceDocument);
        });
      }
    });
  });
});
