import { entries, getPriceId } from '@household/shared/common/utils';
import { Price } from '@household/shared/types/types';
import { priceDataFactory } from './data-factory';
import { allowUsers } from '@household/test/api/utils';
import { customerDataFactory } from '@household/test/api/customer/data-factory';

const permissionMap = allowUsers('hairdresser') ;

describe('DELETE /price/v1/prices/{priceId}', () => {
  let priceDocument: Price.Document;

  beforeEach(() => {
    priceDocument = priceDataFactory.document();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestDeletePrice(priceDataFactory.id())
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
            .requestDeletePrice(priceDataFactory.id())
            .expectForbiddenResponse();
        });
      } else {
        it('should delete price', () => {
          cy.savePriceDocument(priceDocument)
            .authenticate(userType)
            .requestDeletePrice(getPriceId(priceDocument))
            .expectNoContentResponse()
            .validatePriceDeleted(getPriceId(priceDocument));
        });

        describe('should archive price', () => {
          it('if there is a customer job', () => {
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
            cy.savePriceDocument(priceDocument)
              .saveCustomerDocument(customerDocument)
              .authenticate(userType)
              .requestDeletePrice(getPriceId(priceDocument))
              .expectNoContentResponse()
              .validatePriceArchived(priceDocument);
          });

          // it('if there is a calendar entry', () => {
          //   cy.savePriceDocument(priceDocument)
          //     .authenticate(userType)
          //     .requestDeletePrice(getPriceId(priceDocument))
          //     .expectNoContentResponse()
          //     .validatePriceDeleted(getPriceId(priceDocument));
          // });
        });

        describe('should return error', () => {
          describe('if priceId', () => {
            it('is not mongo id', () => {
              cy.authenticate(userType)
                .requestDeletePrice(priceDataFactory.id('not-valid'))
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('priceId', 'pathParameters');
            });
          });
        });
      }
    });
  });
});
