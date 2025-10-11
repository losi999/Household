import { default as schema } from '@household/test/api/schemas/customer-response';
import { Customer } from '@household/shared/types/types';
import { entries, getCustomerId } from '@household/shared/common/utils';
import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { allowUsers } from '@household/test/api/utils';

const permissionMap = allowUsers('hairdresser');

describe('GET /customer/v1/customers/{customerId}', () => {
  let customerDocument: Customer.Document;

  beforeEach(() => {
    customerDocument = customerDataFactory.document();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestGetCustomer(customerDataFactory.id())
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
            .requestGetCustomer(customerDataFactory.id())
            .expectForbiddenResponse();
        });
      } else {
        it('should get customer by id', () => {
          cy.saveCustomerDocument(customerDocument)
            .authenticate(userType)
            .requestGetCustomer(getCustomerId(customerDocument))
            .expectOkResponse()
            .expectValidResponseSchema(schema)
            .validateCustomerResponse(customerDocument);
        });

        describe('should return error if customerId', () => {
          it('is not mongo id', () => {
            cy.authenticate(userType)
              .requestGetCustomer(customerDataFactory.id('not-valid'))
              .expectBadRequestResponse()
              .expectWrongPropertyPattern('customerId', 'pathParameters');
          });

          it('does not belong to any customer', () => {
            cy.authenticate(userType)
              .requestGetCustomer(customerDataFactory.id())
              .expectNotFoundResponse();
          });
        });
      }
    });
  });
});
