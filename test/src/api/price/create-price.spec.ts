import { Price } from '@household/shared/types/types';
import { priceDataFactory } from '@household/test/api/price/data-factory';
import { allowUsers } from '@household/test/api/utils';
import { entries } from '@household/shared/common/utils';

const permissionMap = allowUsers('hairdresser') ;

describe('POST price/v1/prices', () => {
  let request: Price.Request;

  beforeEach(() => {
    request = priceDataFactory.request();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestCreatePrice(request)
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
            .requestCreatePrice(request)
            .expectForbiddenResponse();
        });
      } else {
        describe('should create price', () => {
          it('with complete body', () => {
            cy.authenticate(userType)
              .requestCreatePrice(request)
              .expectCreatedResponse()
              .validatePriceDocument(request);
          });
        });

        it('should reactivate archived price', () => {
          const archivedPriceDocument = {
            ...priceDataFactory.document({
              name: request.name,
            }),
            isArchived: true,
          };

          cy.savePriceDocument(archivedPriceDocument)
            .authenticate(userType)
            .requestCreatePrice(request)
            .expectCreatedResponse()
            .validatePriceDocument(request);
        });

        describe('should return error', () => {
          describe('if name', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestCreatePrice(priceDataFactory.request({
                  name: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('name', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreatePrice(priceDataFactory.request({
                  name: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('name', 'string', 'body');
            });

            it('is too short', () => {
              cy.authenticate(userType)
                .requestCreatePrice(priceDataFactory.request({
                  name: '',
                }))
                .expectBadRequestResponse()
                .expectTooShortProperty('name', 1, 'body');
            });

            it('is already in use by a different price', () => {
              const priceDocument = priceDataFactory.document(request);

              cy.savePriceDocument(priceDocument)
                .authenticate(userType)
                .requestCreatePrice(request)
                .expectBadRequestResponse()
                .expectMessage('Duplicate price name');
            });
          });

          describe('if amount', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestCreatePrice(priceDataFactory.request({
                  amount: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('amount', 'body');
            });

            it('is not integer', () => {
              cy.authenticate(userType)
                .requestCreatePrice(priceDataFactory.request({
                  amount: 1.5,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('amount', 'integer', 'body');
            });

            it('is too small', () => {
              cy.authenticate(userType)
                .requestCreatePrice(priceDataFactory.request({
                  amount: 0,
                }))
                .expectBadRequestResponse()
                .expectTooSmallNumberProperty('amount', 0, true, 'body');
            });
          });

          describe('if unitOfMeasurement', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestCreatePrice(priceDataFactory.request({
                  unitOfMeasurement: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('unitOfMeasurement', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreatePrice(priceDataFactory.request({
                  unitOfMeasurement: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('unitOfMeasurement', 'string', 'body');
            });

            it('is not a valid enum value', () => {
              cy.authenticate(userType)
                .requestCreatePrice(priceDataFactory.request({
                  unitOfMeasurement: <any>'not-enum',
                }))
                .expectBadRequestResponse()
                .expectWrongEnumValue('unitOfMeasurement', 'body');
            });
          });
        });
      }
    });
  });
});
