import { Customer, Price } from '@household/shared/types/types';
import { customerDataFactory } from './data-factory';
import { allowUsers } from '@household/test/api/utils';
import { entries, getCustomerId } from '@household/shared/common/utils';
import { priceDataFactory } from '@household/test/api/price/data-factory';

const permissionMap = allowUsers('hairdresser');

describe('DELETE customer/v1/customers/blacklist', () => {
  let customerDocumentA: Customer.Document;
  let customerDocumentB: Customer.Document;
  let alreadyBlacklistedCustomer: Customer.Document;
  let priceDocument: Price.Document;

  beforeEach(() => {
    priceDocument = priceDataFactory.document();

    alreadyBlacklistedCustomer = customerDataFactory.document();
    customerDocumentB = customerDataFactory.document({
      blacklistedCustomers: [alreadyBlacklistedCustomer],
    });

    customerDocumentA = customerDataFactory.document({
      blacklistedCustomers: [customerDocumentB],
      jobs: [
        {
          prices: {
            custom: [{}],
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
        .requestRemoveCustomerFromBlacklist([
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
            .requestRemoveCustomerFromBlacklist([
              customerDataFactory.id(),
              customerDataFactory.id(),
            ])
            .expectForbiddenResponse();
        });
      } else {
        it('should remove customer from blacklist', () => {
          cy.saveCustomerDocuments([
            customerDocumentA,
            customerDocumentB,
            alreadyBlacklistedCustomer,
          ])
            .savePriceDocument(priceDocument)
            .authenticate(userType)
            .requestRemoveCustomerFromBlacklist([
              getCustomerId(customerDocumentA),
              getCustomerId(customerDocumentB),
            ])
            .expectNoContentResponse()
            .validateCustomerRemovedFromBlacklist(customerDocumentA, customerDocumentB)
            .validateCustomerRemovedFromBlacklist(customerDocumentB, customerDocumentA);
        });

        it('should handle if customers were already removed to blacklist', () => {
          cy.saveCustomerDocuments([
            customerDocumentA,
            customerDocumentB,
            alreadyBlacklistedCustomer,
          ])
            .savePriceDocument(priceDocument)
            .authenticate(userType)
            .requestRemoveCustomerFromBlacklist([
              getCustomerId(customerDocumentA),
              getCustomerId(customerDocumentB),
            ])
            .expectNoContentResponse()
            .validateCustomerRemovedFromBlacklist(customerDocumentA, customerDocumentB)
            .validateCustomerRemovedFromBlacklist(customerDocumentB, customerDocumentA);
        });

        describe('should return error', () => {
          describe('if body', () => {
            it('is not array', () => {
              cy.authenticate(userType)
                .requestRemoveCustomerFromBlacklist(<any>{})
                .expectBadRequestResponse()
                .expectWrongPropertyType('data', 'array', 'body');
            });

            it('is has to few items', () => {
              cy.authenticate(userType)
                .requestRemoveCustomerFromBlacklist([customerDataFactory.id()])
                .expectBadRequestResponse()
                .expectTooFewItemsProperty('data', 2, 'body');
            });

            it('has too many items', () => {
              cy.authenticate(userType)
                .requestRemoveCustomerFromBlacklist([
                  customerDataFactory.id(),
                  customerDataFactory.id(),
                  customerDataFactory.id(),
                ])
                .expectBadRequestResponse()
                .expectTooManyItemsProperty('data', 2, 'body');
            });

            it('items are the same', () => {
              cy.authenticate(userType)
                .requestRemoveCustomerFromBlacklist([
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
                .requestRemoveCustomerFromBlacklist([
                  customerDataFactory.id('not-mongo-id'),
                  customerDataFactory.id(),
                ])
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('data/0', 'body');
            });

            it('does not belong to any customer', () => {
              cy.saveCustomerDocuments([
                customerDocumentB,
                alreadyBlacklistedCustomer,
              ])
                .authenticate(userType)
                .requestRemoveCustomerFromBlacklist([
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
                .requestRemoveCustomerFromBlacklist([
                  customerDataFactory.id(),
                  customerDataFactory.id('not-mongo-id'),
                ])
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('data/1', 'body');
            });

            it('does not belong to any customer', () => {
              cy.saveCustomerDocument(customerDocumentA)
                .savePriceDocument(priceDocument)
                .authenticate(userType)
                .requestRemoveCustomerFromBlacklist([
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
