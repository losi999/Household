import { entries, getCalendarEntryId } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/api/utils';
import { Calendar, Customer, Price } from '@household/shared/types/types';
import { calendarEntryDataFactory } from '@household/test/api/calendar/data-factory';
import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { priceDataFactory } from '@household/test/api/price/data-factory';
import { CalendarEntryType, PaymentType } from '@household/shared/enums';

const permissionMap = allowUsers('hairdresser');

describe.skip('POST /calendar/v1/entries/{calendarEntryId}/payment', () => {
  let request: Calendar.Entry.PaymentRequest;
  let calendarPersonalEntryDocument: Calendar.Entry.Document;
  let calendarWorkEntryDocument: Calendar.Entry.Document;
  let calendarIssueEntryDocument: Calendar.Entry.Document;
  let customerDocument: Customer.Document;
  let priceDocument: Price.Document;

  beforeEach(() => {
    customerDocument = customerDataFactory.document();
    priceDocument = priceDataFactory.document();

    calendarPersonalEntryDocument = calendarEntryDataFactory.document({
      entryType: CalendarEntryType.Personal,
    });

    calendarIssueEntryDocument = calendarEntryDataFactory.document({
      entryType: CalendarEntryType.Issue,
    });

    calendarWorkEntryDocument = calendarEntryDataFactory.document({
      entryType: CalendarEntryType.Work,
      customer: customerDocument,
      prices: {
        custom: [{}],
        listed: [
          {
            price: priceDocument,
          },
        ],
      },
    });
            
    request = calendarEntryDataFactory.paymentRequest();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestPayCalendarWorkEntry(calendarEntryDataFactory.id(), request)
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
            .requestPayCalendarWorkEntry(calendarEntryDataFactory.id(), request)
            .expectForbiddenResponse();
        });
      } else {
        describe('should update calendar work entry', () => {
          it('with transfer payment', () => {
            request = calendarEntryDataFactory.paymentRequest({
              paymentType: PaymentType.Transfer,
            });

            cy.saveCalendarEntryDocument(calendarWorkEntryDocument)
              .authenticate(userType)
              .requestPayCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), request)
              .expectCreatedResponse()
              .validateCalendarEntryDocumentPaid(calendarWorkEntryDocument, request);
          });

          it('with cash payment', () => {            
            request = calendarEntryDataFactory.paymentRequest({
              paymentType: PaymentType.Cash,
            });
            
            cy.saveCalendarEntryDocument(calendarWorkEntryDocument)
              .authenticate(userType)
              .requestPayCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), request)
              .expectCreatedResponse()
              .validateCalendarEntryDocumentPaid(calendarWorkEntryDocument, request);
          });
        });

        describe('should return error', () => {    
          it('if work entry is already paid', () => {              
            cy.saveCalendarEntryDocument({
              ...calendarWorkEntryDocument,
              isPaid: true,
            })
              .authenticate(userType)
              .requestPayCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), request)
              .expectBadRequestResponse()
              .expectMessage('Calendar entry is already paid');
          });

          it('if entry is personal', () => {              
            cy.saveCalendarEntryDocument(calendarPersonalEntryDocument)
              .authenticate(userType)
              .requestPayCalendarWorkEntry(getCalendarEntryId(calendarPersonalEntryDocument), request)
              .expectBadRequestResponse()
              .expectMessage('Calendar entry must be of "work" type');
          });

          it('if entry is issue', () => {              
            cy.saveCalendarEntryDocument(calendarIssueEntryDocument)
              .authenticate(userType)
              .requestPayCalendarWorkEntry(getCalendarEntryId(calendarIssueEntryDocument), request)
              .expectBadRequestResponse()
              .expectMessage('Calendar entry must be of "work" type');
          });
          
          describe('if paymentType', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestPayCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.paymentRequest({
                  paymentType: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('paymentType', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestPayCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.paymentRequest({
                  paymentType: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('paymentType', 'string', 'body');
            });

            it('is not a valid enum value', () => {
              cy.authenticate(userType)
                .requestPayCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.paymentRequest({
                  paymentType: 'not-valid-enum' as any,
                }))
                .expectBadRequestResponse()
                .expectWrongEnumValue('paymentType', 'body');
            });
          });

          describe('if amount', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestPayCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.paymentRequest({
                  amount: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('amount', 'body');
            });

            it('is not number', () => {
              cy.authenticate(userType)
                .requestPayCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.paymentRequest({
                  amount: <any>'1',
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('amount', 'number', 'body');
            });
          });

          describe('if calendarEntryId', () => {
            it('is not mongo id', () => {
              cy.authenticate(userType)
                .requestPayCalendarWorkEntry(calendarEntryDataFactory.id('not-mongo-id'), calendarEntryDataFactory.paymentRequest())
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('calendarEntryId', 'pathParameters');
            });

            it('does not belong to any calendar entry', () => {
              cy.authenticate(userType)
                .requestPayCalendarWorkEntry(calendarEntryDataFactory.id(), calendarEntryDataFactory.paymentRequest())
                .expectNotFoundResponse()
                .expectMessage('No calendar entry found');
            });
          }); 
        });
      }
    });
  });
});
