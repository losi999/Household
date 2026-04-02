import { Customer } from '@household/shared/types/types';
import { customerDataFactory } from './data-factory';
import { allowUsers } from '@household/test/api/utils';
import { entries } from '@household/shared/common/utils';

const permissionMap = allowUsers('hairdresser');

describe('POST customer/v1/customers', () => {
  let request: Customer.Request;

  beforeEach(() => {
    request = customerDataFactory.request();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestCreateCustomer(request)
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
            .requestCreateCustomer(request)
            .expectForbiddenResponse();
        });
      } else {
        it('should create customer', () => {
          cy.authenticate(userType)
            .requestCreateCustomer(request)
            .expectCreatedResponse()
            .validateCustomerDocument(request);
        });

        describe('should return error', () => {
          describe('if name', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestCreateCustomer(customerDataFactory.request({
                  name: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('name', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateCustomer(customerDataFactory.request({
                  name: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('name', 'string', 'body');
            });

            it('is too short', () => {
              cy.authenticate(userType)
                .requestCreateCustomer(customerDataFactory.request({
                  name: '',
                }))
                .expectBadRequestResponse()
                .expectTooShortProperty('name', 1, 'body');
            });

            it('is already in use by a different customer', () => {
              const customerDocument = customerDataFactory.document({
                body: request,
              });

              cy.saveCustomerDocument(customerDocument)
                .authenticate(userType)
                .requestCreateCustomer(request)
                .expectBadRequestResponse()
                .expectMessage('Duplicate customer name');
            });
          });

          describe('if description', () => {
            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateCustomer(customerDataFactory.request({
                  description: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('description', 'string', 'body');
            });

            it('is too short', () => {
              cy.authenticate(userType)
                .requestCreateCustomer(customerDataFactory.request({
                  description: '',
                }))
                .expectBadRequestResponse()
                .expectTooShortProperty('description', 1, 'body');
            });
          });

          describe('if isGroup', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestCreateCustomer(customerDataFactory.request({
                  isGroup: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('isGroup', 'body');
            });

            it('is not boolean', () => {
              cy.authenticate(userType)
                .requestCreateCustomer(customerDataFactory.request({
                  isGroup: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('isGroup', 'boolean', 'body');
            });
          });

          describe('if rating', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestCreateCustomer(customerDataFactory.request({
                  rating: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('rating', 'body');
            });

            it('is not integer', () => {
              cy.authenticate(userType)
                .requestCreateCustomer(customerDataFactory.request({
                  rating: 1.5,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('rating', 'integer', 'body');
            });

            it('is too small', () => {
              cy.authenticate(userType)
                .requestCreateCustomer(customerDataFactory.request({
                  rating: 0,
                }))
                .expectBadRequestResponse()
                .expectTooSmallNumberProperty('rating', 1, false, 'body');
            });

            it('is too large', () => {
              cy.authenticate(userType)
                .requestCreateCustomer(customerDataFactory.request({
                  rating: 6,
                }))
                .expectBadRequestResponse()
                .expectTooLargeNumberProperty('rating', 5, false, 'body');
            });
          });
        });
      }
    });
  });
});
