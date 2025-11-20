import { entries, getPriceId } from '@household/shared/common/utils';
import { Price } from '@household/shared/types/types';
import { priceDataFactory } from './data-factory';
import { allowUsers } from '@household/test/api/utils';

const permissionMap = allowUsers('hairdresser') ;

describe('PUT /price/v1/prices/{priceId}', () => {
  let request: Price.Request;
  let priceDocument: Price.Document;

  beforeEach(() => {
    request = priceDataFactory.request();

    priceDocument = priceDataFactory.document();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestUpdatePrice(priceDataFactory.id(), request)
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
            .requestUpdatePrice(priceDataFactory.id(), request)
            .expectForbiddenResponse();
        });
      } else {
        describe('should update price', () => {
          it('with complete body', () => {
            cy
              .savePriceDocument(priceDocument)
              .authenticate(userType)
              .requestUpdatePrice(getPriceId(priceDocument), request)
              .expectCreatedResponse()
              .validatePriceDocument(request);
          });
        });

        describe('should return error', () => {
          it('if price is archived', () => {
            cy.savePriceDocument({
              ...priceDocument,
              isArchived: true,
            })
              .authenticate(userType)
              .requestUpdatePrice(getPriceId(priceDocument), request)
              .expectBadRequestResponse()
              .expectMessage('Price is archived');
          });

          describe('if name', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestUpdatePrice(priceDataFactory.id(), priceDataFactory.request({
                  name: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('name', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestUpdatePrice(priceDataFactory.id(), priceDataFactory.request({
                  name: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('name', 'string', 'body');
            });

            it('is too short', () => {
              cy.authenticate(userType)
                .requestUpdatePrice(priceDataFactory.id(), priceDataFactory.request({
                  name: '',
                }))
                .expectBadRequestResponse()
                .expectTooShortProperty('name', 1, 'body');
            });

            it('is already in use by a different price', () => {
              const duplicatePriceDocument = priceDataFactory.document(request);

              cy.savePriceDocument(priceDocument)
                .savePriceDocument(duplicatePriceDocument)
                .authenticate(userType)
                .requestUpdatePrice(getPriceId(priceDocument), request)
                .expectBadRequestResponse()
                .expectMessage('Duplicate price name');
            });
          });

          describe('if amount', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestUpdatePrice(priceDataFactory.id(), priceDataFactory.request({
                  amount: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('amount', 'body');
            });

            it('is not integer', () => {
              cy.authenticate(userType)
                .requestUpdatePrice(priceDataFactory.id(), priceDataFactory.request({
                  amount: 1.5,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('amount', 'integer', 'body');
            });

            it('is too small', () => {
              cy.authenticate(userType)
                .requestUpdatePrice(priceDataFactory.id(), priceDataFactory.request({
                  amount: 0,
                }))
                .expectBadRequestResponse()
                .expectTooSmallNumberProperty('amount', 0, true, 'body');
            });
          });

          describe('if unitOfMeasurement', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestUpdatePrice(priceDataFactory.id(), priceDataFactory.request({
                  unitOfMeasurement: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('unitOfMeasurement', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestUpdatePrice(priceDataFactory.id(), priceDataFactory.request({
                  unitOfMeasurement: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('unitOfMeasurement', 'string', 'body');
            });

            it('is not a valid enum value', () => {
              cy.authenticate(userType)
                .requestUpdatePrice(priceDataFactory.id(), priceDataFactory.request({
                  unitOfMeasurement: <any>'not-enum',
                }))
                .expectBadRequestResponse()
                .expectWrongEnumValue('unitOfMeasurement', 'body');
            });
          });

          describe('if priceId', () => {
            it('is not mongo id', () => {
              cy.authenticate(userType)
                .requestUpdatePrice(priceDataFactory.id('not-valid'), request)
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('priceId', 'pathParameters');
            });

            it('does not belong to any price', () => {
              cy.authenticate(userType)
                .requestUpdatePrice(priceDataFactory.id(), request)
                .expectNotFoundResponse()
                .expectMessage('No price found');
            });
          });
        });
      }
    });
  });
});
