import { default as schema } from '@household/test/api/schemas/customer-response-list';
import { Customer } from '@household/shared/types/types';
import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { allowUsers } from '@household/test/api/utils';
import { entries } from '@household/shared/common/utils';

const permissionMap = allowUsers('hairdresser');

describe('GET /customer/v1/customers', () => {
  let customerDocument1: Customer.Document;
  let customerDocument2: Customer.Document;

  beforeEach(() => {
    customerDocument1 = customerDataFactory.document();
    customerDocument2 = customerDataFactory.document();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestGetCustomerList()
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
            .requestGetCustomerList()
            .expectForbiddenResponse();
        });
      } else {
        it('should get a list of customers', () => {
          cy.saveCustomerDocument(customerDocument1)
            .saveCustomerDocument(customerDocument2)
            .authenticate(userType)
            .requestGetCustomerList()
            .expectOkResponse()
            .expectValidResponseSchema(schema)
            .validateInCustomerListResponse(customerDocument1)
            .validateInCustomerListResponse(customerDocument2);
        });
      }
    });
  });
});
