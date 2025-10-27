import { entries, getCalendarEntryId } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/api/utils';
import { Calendar, Customer } from '@household/shared/types/types';
import { calendarEntryDataFactory } from '@household/test/api/calendar/data-factory';
import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { CalendarEntryResolutionStatus } from '@household/shared/enums';

const permissionMap = allowUsers('hairdresser');

describe('DELETE /calendar/v1/entries/{calendarEntryId}', () => {
  let calendarPersonalEntryDocument: Calendar.Entry.Document;
  let calendarWorkEntryDocument: Calendar.Entry.Document;
  let calendarIssueEntryDocument: Calendar.Entry.Document;
  let customerDocument: Customer.Document;

  beforeEach(() => {
    customerDocument = customerDataFactory.document();

    calendarPersonalEntryDocument = calendarEntryDataFactory.document.personal();

    calendarIssueEntryDocument = calendarEntryDataFactory.document.issue();

    calendarWorkEntryDocument = calendarEntryDataFactory.document.work({
      customer: customerDocument,
    });
          
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestDeleteCalendarEntry(calendarEntryDataFactory.id())
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
            .requestDeleteCalendarEntry(calendarEntryDataFactory.id())
            .expectForbiddenResponse();
        });
      } else {
        describe('should delete calendar', () => {
          it('personal entry', () => {
            cy.saveCalendarEntryDocument(calendarPersonalEntryDocument)
              .authenticate(userType)
              .requestDeleteCalendarEntry(getCalendarEntryId(calendarPersonalEntryDocument))
              .expectNoContentResponse()
              .validateCalendarEntryDeleted(getCalendarEntryId(calendarPersonalEntryDocument));
          });

          it('issue entry', () => {                        
            cy.saveCalendarEntryDocument(calendarIssueEntryDocument)
              .authenticate(userType)
              .requestDeleteCalendarEntry(getCalendarEntryId(calendarIssueEntryDocument))
              .expectNoContentResponse()
              .validateCalendarEntryDeleted(getCalendarEntryId(calendarIssueEntryDocument));
          });

          it('work entry', () => {          
            cy.saveCalendarEntryDocument(calendarWorkEntryDocument)
              .saveCustomerDocument(customerDocument)
              .authenticate(userType)
              .requestDeleteCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument))
              .expectNoContentResponse()
              .validateCalendarEntryDeleted(getCalendarEntryId(calendarWorkEntryDocument));
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
              .requestDeleteCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument))
              .expectBadRequestResponse()
              .expectMessage('Calendar entry is already resolved');
          });

          describe('if calendarEntryId', () => {
            it('is not mongo id', () => {
              cy.authenticate(userType)
                .requestDeleteCalendarEntry(calendarEntryDataFactory.id('not-mongo-id'))
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('calendarEntryId', 'pathParameters');
            });
          }); 
        });
      }
    });
  });
});
