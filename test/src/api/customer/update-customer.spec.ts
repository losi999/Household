import { entries, getCustomerId } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/api/utils';
import { Customer } from '@household/shared/types/types';
import { customerDataFactory } from '@household/test/api/customer/data-factory';

const permissionMap = allowUsers('hairdresser');

describe('PUT /customer/v1/customers/{customerId}', () => {
  let request: Customer.Request;
  let customerDocument: Customer.Document;

  beforeEach(() => {
    request = customerDataFactory.request();

    customerDocument = customerDataFactory.document();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestUpdateCustomer(customerDataFactory.id(), request)
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
            .requestUpdateCustomer(customerDataFactory.id(), request)
            .expectForbiddenResponse();
        });
      } else {
        it('should update a customer', () => {
          cy.saveCustomerDocument(customerDocument)
            .authenticate(userType)
            .requestUpdateCustomer(getCustomerId(customerDocument), request)
            .expectCreatedResponse()
            .validateCustomerDocument(request);
        });

        describe('should return error', () => {
          describe('if name', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestUpdateCustomer(customerDataFactory.id(), customerDataFactory.request({
                  name: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('name', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestUpdateCustomer(customerDataFactory.id(), customerDataFactory.request({
                  name: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('name', 'string', 'body');
            });

            it('is too short', () => {
              cy.authenticate(userType)
                .requestUpdateCustomer(customerDataFactory.id(), customerDataFactory.request({
                  name: '',
                }))
                .expectBadRequestResponse()
                .expectTooShortProperty('name', 1, 'body');
            });

            it('is already in used by a different customer', () => {
              const updatedCustomerDocument = customerDataFactory.document(request);

              cy.saveCustomerDocument(customerDocument)
                .saveCustomerDocument(updatedCustomerDocument)
                .authenticate(userType)
                .requestUpdateCustomer(getCustomerId(customerDocument), request)
                .expectBadRequestResponse()
                .expectMessage('Duplicate customer name');
            });
          });

          describe('if customerId', () => {
            it('is not mongo id', () => {
              cy.authenticate(userType)
                .requestUpdateCustomer(customerDataFactory.id('not-valid'), request)
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('customerId', 'pathParameters');
            });

            it('does not belong to any customer', () => {
              cy.authenticate(userType)
                .requestUpdateCustomer(customerDataFactory.id(), request)
                .expectNotFoundResponse();
            });
          });
        });
      }
    });
  });
});
