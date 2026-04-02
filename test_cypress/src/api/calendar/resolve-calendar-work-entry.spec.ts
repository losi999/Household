import { entries, getCalendarEntryId } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/api/utils';
import { Calendar, Customer, Price } from '@household/shared/types/types';
import { calendarEntryDataFactory } from '@household/test/api/calendar/data-factory';
import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { priceDataFactory } from '@household/test/api/price/data-factory';
import { CalendarEntryResolutionStatus } from '@household/shared/enums';

const permissionMap = allowUsers('hairdresser');

describe('POST /calendar/v1/entries/{calendarEntryId}/resolution', () => {
  let request: Calendar.Entry.ResolutionRequest;
  let calendarPersonalEntryDocument: Calendar.Entry.Document;
  let calendarWorkEntryDocument: Calendar.Entry.Document;
  let calendarIssueEntryDocument: Calendar.Entry.Document;
  let customerDocument: Customer.Document;
  let priceDocument: Price.Document;

  beforeEach(() => {
    customerDocument = customerDataFactory.document();
    priceDocument = priceDataFactory.document();

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
    });
            
    request = calendarEntryDataFactory.resolutionRequest();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestResolveCalendarWorkEntry(calendarEntryDataFactory.id(), request)
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
            .requestResolveCalendarWorkEntry(calendarEntryDataFactory.id(), request)
            .expectForbiddenResponse();
        });
      } else {
        describe('should update calendar work entry', () => {
          it('with transfer payment', () => {
            request = calendarEntryDataFactory.resolutionRequest({
              status: CalendarEntryResolutionStatus.PendingTransfer,
            });

            cy.saveCalendarEntryDocument(calendarWorkEntryDocument)
              .authenticate(userType)
              .requestResolveCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), request)
              .expectCreatedResponse()
              .validateCalendarEntryDocumentResolved(calendarWorkEntryDocument, request);
          });

          it('with cash payment', () => {            
            request = calendarEntryDataFactory.resolutionRequest({
              status: CalendarEntryResolutionStatus.Paid,
            });
            
            cy.saveCalendarEntryDocument(calendarWorkEntryDocument)
              .authenticate(userType)
              .requestResolveCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), request)
              .expectCreatedResponse()
              .validateCalendarEntryDocumentResolved(calendarWorkEntryDocument, request);
          });

          it('with no show', () => {            
            request = calendarEntryDataFactory.resolutionRequest({
              status: CalendarEntryResolutionStatus.NoShow,
            });
            
            cy.saveCalendarEntryDocument(calendarWorkEntryDocument)
              .authenticate(userType)
              .requestResolveCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), request)
              .expectCreatedResponse()
              .validateCalendarEntryDocumentResolved(calendarWorkEntryDocument, request);
          });
        });

        describe('should return error', () => {    
          it('if work entry is already resolved', () => {              
            calendarWorkEntryDocument = calendarEntryDataFactory.document.work({
              customer: customerDocument,
              resolution: {
                status: CalendarEntryResolutionStatus.Paid,
              },
            });
          
            cy.saveCalendarEntryDocument(calendarWorkEntryDocument)
              .authenticate(userType)
              .requestResolveCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), request)
              .expectBadRequestResponse()
              .expectMessage('Calendar entry is already resolved');
          });

          it('if entry is personal', () => {              
            cy.saveCalendarEntryDocument(calendarPersonalEntryDocument)
              .authenticate(userType)
              .requestResolveCalendarWorkEntry(getCalendarEntryId(calendarPersonalEntryDocument), request)
              .expectBadRequestResponse()
              .expectMessage('Calendar entry must be of "work" type');
          });

          it('if entry is issue', () => {              
            cy.saveCalendarEntryDocument(calendarIssueEntryDocument)
              .authenticate(userType)
              .requestResolveCalendarWorkEntry(getCalendarEntryId(calendarIssueEntryDocument), request)
              .expectBadRequestResponse()
              .expectMessage('Calendar entry must be of "work" type');
          });
          
          describe('if status', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestResolveCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.resolutionRequest({
                  status: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('status', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestResolveCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.resolutionRequest({
                  status: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('status', 'string', 'body');
            });

            it('is not a valid value', () => {
              cy.authenticate(userType)
                .requestResolveCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.resolutionRequest({
                  status: 'not-valid-enum' as any,
                }))
                .expectBadRequestResponse()
                .expectNotConstantValue('status', 'body');
            });
          });

          describe('if amount', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestResolveCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.resolutionRequest({
                  amount: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('amount', 'body');
            });

            it('is not number', () => {
              cy.authenticate(userType)
                .requestResolveCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.resolutionRequest({
                  amount: <any>'1',
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('amount', 'number', 'body');
            });
          });

          describe('if delay', () => {
            it('is not integer', () => {
              cy.authenticate(userType)
                .requestResolveCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.resolutionRequest({
                  delay: <any>'1',
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('delay', 'integer', 'body');
            });

            it('is too small', () => {
              cy.authenticate(userType)
                .requestResolveCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.resolutionRequest({
                  delay: 0,
                }))
                .expectBadRequestResponse()
                .expectTooSmallNumberProperty('delay', 0, true, 'body');
            });
          });

          describe('if calendarEntryId', () => {
            it('is not mongo id', () => {
              cy.authenticate(userType)
                .requestResolveCalendarWorkEntry(calendarEntryDataFactory.id('not-mongo-id'), calendarEntryDataFactory.resolutionRequest())
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('calendarEntryId', 'pathParameters');
            });

            it('does not belong to any calendar entry', () => {
              cy.authenticate(userType)
                .requestResolveCalendarWorkEntry(calendarEntryDataFactory.id(), calendarEntryDataFactory.resolutionRequest())
                .expectNotFoundResponse()
                .expectMessage('No calendar entry found');
            });
          }); 
        });
      }
    });
  });
});
