import { Customer, Price } from '@household/shared/types/types';
import { customerDataFactory } from './data-factory';
import { allowUsers } from '@household/test/api/utils';
import { entries, getCustomerId } from '@household/shared/common/utils';
import { priceDataFactory } from '@household/test/api/price/data-factory';

const permissionMap = allowUsers('hairdresser');

describe('PUT customer/v1/customers/blacklist', () => {
  let customerDocumentA: Customer.Document;
  let customerDocumentB: Customer.Document;
  let alreadyBlacklistedCustomer: Customer.Document;
  let priceDocument: Price.Document;

  beforeEach(() => {
    priceDocument = priceDataFactory.document();

    alreadyBlacklistedCustomer = customerDataFactory.document();

    customerDocumentA = customerDataFactory.document({
      blacklistedCustomers: [alreadyBlacklistedCustomer],
    });
    customerDocumentB = customerDataFactory.document({
      jobs: [
        {
          prices: {
            custom: [],
            listed: [
              {
                price: priceDocument,
              },
            ],
          },
        },
      ],
    });
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestAddCustomerToBlacklist([
          customerDataFactory.id(),
          customerDataFactory.id(),
        ])
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
            .requestAddCustomerToBlacklist([
              customerDataFactory.id(),
              customerDataFactory.id(),
            ])
            .expectForbiddenResponse();
        });
      } else {
        it('should add customer to blacklist', () => {
          cy.saveCustomerDocuments([
            customerDocumentA,
            customerDocumentB,
            alreadyBlacklistedCustomer,
          ])
            .savePriceDocument(priceDocument)
            .authenticate(userType)
            .requestAddCustomerToBlacklist([
              getCustomerId(customerDocumentA),
              getCustomerId(customerDocumentB),
            ])
            .expectNoContentResponse()
            .validateCustomerAddedToBlacklist(customerDocumentA, customerDocumentB)
            .validateCustomerAddedToBlacklist(customerDocumentB, customerDocumentA);
        });

        it('should handle if customers are already added to blacklist', () => {
          customerDocumentA = customerDataFactory.document({
            blacklistedCustomers: [customerDocumentB],
          });

          cy.saveCustomerDocuments([
            customerDocumentA,
            customerDocumentB,
          ])
            .savePriceDocument(priceDocument)
            .authenticate(userType)
            .requestAddCustomerToBlacklist([
              getCustomerId(customerDocumentA),
              getCustomerId(customerDocumentB),
            ])
            .expectNoContentResponse()
            .validateCustomerAddedToBlacklist(customerDocumentA, customerDocumentB)
            .validateCustomerAddedToBlacklist(customerDocumentB, customerDocumentA);
        });

        describe('should return error', () => {
          describe('if body', () => {
            it('is not array', () => {
              cy.authenticate(userType)
                .requestAddCustomerToBlacklist(<any>{})
                .expectBadRequestResponse()
                .expectWrongPropertyType('data', 'array', 'body');
            });

            it('is has to few items', () => {
              cy.authenticate(userType)
                .requestAddCustomerToBlacklist([customerDataFactory.id()])
                .expectBadRequestResponse()
                .expectTooFewItemsProperty('data', 2, 'body');
            });

            it('has too many items', () => {
              cy.authenticate(userType)
                .requestAddCustomerToBlacklist([
                  customerDataFactory.id(),
                  customerDataFactory.id(),
                  customerDataFactory.id(),
                ])
                .expectBadRequestResponse()
                .expectTooManyItemsProperty('data', 2, 'body');
            });

            it('items are the same', () => {
              cy.authenticate(userType)
                .requestAddCustomerToBlacklist([
                  getCustomerId(customerDocumentA),
                  getCustomerId(customerDocumentA),
                ])
                .expectBadRequestResponse()
                .expectMessage('Customer cannot be blacklisted with itself');
            });
          });

          describe('if body[0]', () => {
            it('is not mongo id', () => {
              cy.authenticate(userType)
                .requestAddCustomerToBlacklist([
                  customerDataFactory.id('not-mongo-id'),
                  customerDataFactory.id(),
                ])
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('data/0', 'body');
            });

            it('does not belong to any customer', () => {
              cy.saveCustomerDocument(customerDocumentB)
                .savePriceDocument(priceDocument)
                .authenticate(userType)
                .requestAddCustomerToBlacklist([
                  getCustomerId(customerDocumentA),
                  getCustomerId(customerDocumentB),
                ])
                .expectNotFoundResponse()
                .expectMessage('No customer found');
            });
          });

          describe('if body[1]', () => {
            it('is not mongo id', () => {
              cy.authenticate(userType)
                .requestAddCustomerToBlacklist([
                  customerDataFactory.id(),
                  customerDataFactory.id('not-mongo-id'),
                ])
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('data/1', 'body');
            });

            it('does not belong to any customer', () => {
              cy.saveCustomerDocuments([
                customerDocumentA,
                alreadyBlacklistedCustomer,
              ])
                .authenticate(userType)
                .requestAddCustomerToBlacklist([
                  getCustomerId(customerDocumentA),
                  getCustomerId(customerDocumentB),
                ])
                .expectNotFoundResponse()
                .expectMessage('No customer found');
            });
          });
        });
      }
    });
  });
});
