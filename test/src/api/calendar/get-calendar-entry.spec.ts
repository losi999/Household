import { entries, getCalendarEntryId } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/api/utils';
import { Calendar, Customer, Price } from '@household/shared/types/types';
import { calendarEntryDataFactory } from '@household/test/api/calendar/data-factory';
import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { priceDataFactory } from '@household/test/api/price/data-factory';
import { default as schema } from '@household/test/api/schemas/calendar-entry-response';
import { CalendarEntryResolutionStatus } from '@household/shared/enums';

const permissionMap = allowUsers('hairdresser');

describe('GET /calendar/v1/entries/{calendarEntryId}', () => {
  let calendarPersonalEntryDocument: Calendar.Entry.Document;
  let calendarWorkEntryDocument: Calendar.Entry.Document;
  let calendarIssueEntryDocument: Calendar.Entry.Document;
  let customerDocument: Customer.Document;
  let blacklistedCustomerDocument: Customer.Document;
  let priceDocument: Price.Document;

  beforeEach(() => {
    priceDocument = priceDataFactory.document();
    blacklistedCustomerDocument = customerDataFactory.document();
    customerDocument = customerDataFactory.document({
      blacklistedCustomers: [blacklistedCustomerDocument],
      jobs: [
        {
          prices: {
            listed: [
              {
                price: priceDocument,
              },
            ],
          },
        },
      ],
    });

    calendarPersonalEntryDocument = calendarEntryDataFactory.document.personal();

    calendarIssueEntryDocument = calendarEntryDataFactory.document.issue();

    calendarWorkEntryDocument = calendarEntryDataFactory.document.work({
      customer: customerDocument,
      prices: {
        custom: [{}],
        listed: [
          {
            price: priceDocument,
          },
        ],
      },
      resolution: { 
        status: CalendarEntryResolutionStatus.Paid,
        delay: 30,
      },
    });
          
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestGetCalendarEntry(calendarEntryDataFactory.id())
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
            .requestGetCalendarEntry(calendarEntryDataFactory.id())
            .expectForbiddenResponse();
        });
      } else {
        describe('should return calendar', () => {
          it('personal entry', () => {
            cy.saveCalendarEntryDocument(calendarPersonalEntryDocument)
              .authenticate(userType)
              .requestGetCalendarEntry(getCalendarEntryId(calendarPersonalEntryDocument))
              .expectOkResponse()
              .expectValidResponseSchema(schema)
              .validateCalendarEntryResponse(calendarPersonalEntryDocument);
          });

          it('issue entry', () => {                        
            cy.saveCalendarEntryDocument(calendarIssueEntryDocument)
              .authenticate(userType)
              .requestGetCalendarEntry(getCalendarEntryId(calendarIssueEntryDocument))
              .expectOkResponse()
              .expectValidResponseSchema(schema)
              .validateCalendarEntryResponse(calendarIssueEntryDocument);
          });

          it('work entry', () => {          
            cy.saveCalendarEntryDocument(calendarWorkEntryDocument)
              .saveCustomerDocuments([
                customerDocument,
                blacklistedCustomerDocument,
              ])
              .savePriceDocument(priceDocument)
              .authenticate(userType)
              .requestGetCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument))
              .expectOkResponse()
              .expectValidResponseSchema(schema)
              .validateCalendarEntryResponse(calendarWorkEntryDocument);
          });
        });

        describe('should return error', () => {    
          describe('if calendarEntryId', () => {
            it('is not mongo id', () => {
              cy.authenticate(userType)
                .requestGetCalendarEntry(calendarEntryDataFactory.id('not-mongo-id'))
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('calendarEntryId', 'pathParameters');
            });

            it('does not belong to any calendar entry', () => {
              cy.authenticate(userType)
                .requestGetCalendarEntry(calendarEntryDataFactory.id())
                .expectNotFoundResponse()
                .expectMessage('No calendar entry found');
            });
          }); 
        });
      }
    });
  });
});
