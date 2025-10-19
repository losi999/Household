import { default as schema } from '@household/test/api/schemas/customer-response';
import { Calendar, Customer, Price } from '@household/shared/types/types';
import { entries, getCustomerId } from '@household/shared/common/utils';
import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { allowUsers } from '@household/test/api/utils';
import { priceDataFactory } from '@household/test/api/price/data-factory';
import { calendarEntryDataFactory } from '@household/test/api/calendar/data-factory';
import { CalendarEntryType } from '@household/shared/enums';

const permissionMap = allowUsers('hairdresser');

describe('GET /customer/v1/customers/{customerId}', () => {
  let customerDocument: Customer.Document;
  let workEntryDocument: Calendar.Entry.Document;
  let blacklistedCustomer: Customer.Document;
  let priceDocument: Price.Document;

  beforeEach(() => {
    blacklistedCustomer = customerDataFactory.document();
    priceDocument = priceDataFactory.document();

    customerDocument = customerDataFactory.document({ //TODO work entries
      blacklistedCustomers: [blacklistedCustomer],
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

    workEntryDocument = calendarEntryDataFactory.document({
      entryType: CalendarEntryType.Work,
      customer: customerDocument,
    });
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
          cy.saveCustomerDocuments([
            customerDocument,
            blacklistedCustomer,
          ])
            .savePriceDocument(priceDocument)
            .saveCalendarEntryDocument(workEntryDocument)
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
