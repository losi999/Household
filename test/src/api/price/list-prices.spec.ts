import { default as schema } from '@household/test/api/schemas/price-response-list';
import { Price } from '@household/shared/types/types';
import { priceDataFactory } from './data-factory';
import { allowUsers } from '@household/test/api/utils';
import { entries, getPriceId } from '@household/shared/common/utils';

const permissionMap = allowUsers('hairdresser');

describe('GET /price/v1/prices', () => {
  let priceDocument1: Price.Document;
  let priceDocument2: Price.Document;
  let archivedPriceDocument: Price.Document;

  beforeEach(() => {
    priceDocument1 = priceDataFactory.document();
    priceDocument2 = priceDataFactory.document();
    archivedPriceDocument = {
      ...priceDataFactory.document(),
      isArchived: true,
    };
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestGetPriceList()
        .expectUnauthorizedResponse();
    });
  });

  entries(permissionMap).forEach(([
    userType,
    isAllowed,
  ]) => {
    describe(`called as ${userType}`, () => {
      if (!isAllowed) {
        it('should return forbidden', () => {
          cy.authenticate(userType)
            .requestGetPriceList()
            .expectForbiddenResponse();
        });
      } else {
        it('should get a list of prices', () => {
          cy.savePriceDocuments([
            priceDocument1,
            priceDocument2,
            archivedPriceDocument,
          ])
            .authenticate(userType)
            .requestGetPriceList()
            .expectOkResponse()
            .expectValidResponseSchema(schema)
            .validateInPriceListResponse(priceDocument1)
            .validateInPriceListResponse(priceDocument2)
            .validateNotInPriceListResponse(getPriceId(archivedPriceDocument));
        });
      }
    });
  });
});
