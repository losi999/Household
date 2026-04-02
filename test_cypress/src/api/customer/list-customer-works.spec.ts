import { default as schema } from '@household/test/api/schemas/calendar-entry-response-base-list';
import { Calendar, Customer } from '@household/shared/types/types';
import { entries, getCustomerId } from '@household/shared/common/utils';
import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { allowUsers } from '@household/test/api/utils';
import { calendarEntryDataFactory } from '@household/test/api/calendar/data-factory';

const permissionMap = allowUsers('hairdresser');

describe('GET /customer/v1/customers/{customerId}/works', () => {
  let customerDocument: Customer.Document;
  let workEntryDocument: Calendar.Entry.Document;

  beforeEach(() => {
    customerDocument = customerDataFactory.document();

    workEntryDocument = calendarEntryDataFactory.document.work({
      customer: customerDocument,
    });
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestListCustomerWorks(customerDataFactory.id())
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
            .requestListCustomerWorks(customerDataFactory.id())
            .expectForbiddenResponse();
        });
      } else {
        it('should get customer works', () => {
          cy.saveCustomerDocument(customerDocument)
            .saveCalendarEntryDocument(workEntryDocument)
            .authenticate(userType)
            .requestListCustomerWorks(getCustomerId(customerDocument))
            .expectOkResponse()
            .expectValidResponseSchema(schema)
            .validateInCalendarEntryListResponseBase(workEntryDocument);
        });

        describe('should return error if customerId', () => {
          it('is not mongo id', () => {
            cy.authenticate(userType)
              .requestListCustomerWorks(customerDataFactory.id('not-valid'))
              .expectBadRequestResponse()
              .expectWrongPropertyPattern('customerId', 'pathParameters');
          });

          it('does not belong to any customer', () => {
            cy.authenticate(userType)
              .requestListCustomerWorks(customerDataFactory.id())
              .expectNotFoundResponse();
          });
        });
      }
    });
  });
});
