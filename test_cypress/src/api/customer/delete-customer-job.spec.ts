import { Customer, Price } from '@household/shared/types/types';
import { customerDataFactory } from './data-factory';
import { allowUsers } from '@household/test/api/utils';
import { entries, getCustomerId } from '@household/shared/common/utils';
import { priceDataFactory } from '@household/test/api/price/data-factory';

const permissionMap = allowUsers('hairdresser');

describe('DELETE customer/v1/customers/{customerId}/jobs/{jobName}', () => {
  let customerDocument: Customer.Document;
  let blacklistedCustomer: Customer.Document;
  let priceDocument: Price.Document;
  let jobName: string;

  beforeEach(() => {
    priceDocument = priceDataFactory.document();
    blacklistedCustomer = customerDataFactory.document();

    customerDocument = customerDataFactory.document({
      blacklistedCustomers: [blacklistedCustomer],
      jobs: [
        {},
        {
          prices: {
            custom: [{}],
            listed: [
              {
                price: priceDocument,
                quantity: 1,
              },
            ],
          },
        },
      ],
    });

    jobName = customerDocument.jobs[0].name;
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestDeleteCustomerJob(customerDataFactory.id(), jobName)
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
            .requestDeleteCustomerJob(customerDataFactory.id(), jobName)
            .expectForbiddenResponse();
        });
      } else {
        it('should add customer job', () => {
          cy.saveCustomerDocuments([
            customerDocument,
            blacklistedCustomer,
          ])
            .savePriceDocument(priceDocument)
            .authenticate(userType)
            .requestDeleteCustomerJob(getCustomerId(customerDocument), jobName)
            .expectNoContentResponse()
            .validateCustomerJobDeleted(customerDocument, jobName);
        });

        describe('should return error', () => {
          describe('if customerId', () => {
            it('is not mongo id', () => {
              cy.authenticate(userType)
                .requestDeleteCustomerJob(customerDataFactory.id('not-valid'), jobName)
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('customerId', 'pathParameters');
            });

            it('does not belong to any customer', () => {
              cy.authenticate(userType)
                .requestDeleteCustomerJob(customerDataFactory.id(), jobName)
                .expectNotFoundResponse()
                .expectMessage('No customer found');
            });
          });
        });
      }
    });
  });
});
