import { entries } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/api/utils';
import { Calendar } from '@household/shared/types/types';
import { calendarDayDataFactory } from '@household/test/api/calendar/data-factory';

const permissionMap = allowUsers('hairdresser');

describe('PUT /calendar/v1/days/{day}', () => {
  let request: Calendar.Day.Request;
  let day: string;
  let calendarDayDocument: Calendar.Day.Document;

  beforeEach(() => {
    request = calendarDayDataFactory.request.workday();
    day = calendarDayDataFactory.futureDay();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestUpdateCalendarDay(day, request)
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
            .requestUpdateCalendarDay(day, request)
            .expectForbiddenResponse();
        });
      } else {
        describe('should save previously unset day to', () => {
          it('workday', () => {
            cy.clearCalendarDay(day)
              .authenticate(userType)
              .requestUpdateCalendarDay(day, request)
              .expectNoContentResponse()
              .validateCalendarDayDocument(day, request);
          });
          
          it('vacation', () => {
            request = calendarDayDataFactory.request.vacation();
            
            cy.clearCalendarDay(day)
              .authenticate(userType)
              .requestUpdateCalendarDay(day, request)
              .expectNoContentResponse()
              .validateCalendarDayDocument(day, request);
          });
        });

        describe('should update', () => {  
          it('workday to vacation', () => {
            calendarDayDocument = calendarDayDataFactory.document.work({
              day,
            });

            request = calendarDayDataFactory.request.vacation();

            cy.saveCalendarDayDocument(calendarDayDocument)
              .authenticate(userType)
              .requestUpdateCalendarDay(day, request)
              .expectNoContentResponse()
              .validateCalendarDayDocument(day, request);
          });
          
          it('vacation to workday', () => {
            calendarDayDocument = calendarDayDataFactory.document.vacation({
              day,
            });

            request = calendarDayDataFactory.request.workday();

            cy.saveCalendarDayDocument(calendarDayDocument)
              .authenticate(userType)
              .requestUpdateCalendarDay(day, request)
              .expectNoContentResponse()
              .validateCalendarDayDocument(day, request);
          });
        });

        describe('should return error', () => {
          it('if holiday is to be updated', () => {
            calendarDayDocument = calendarDayDataFactory.document.holiday({
              day,
            });

            request = calendarDayDataFactory.request.workday();

            cy.saveCalendarDayDocument(calendarDayDocument)
              .authenticate(userType)
              .requestUpdateCalendarDay(day, request)
              .expectBadRequestResponse()
              .expectMessage('Selected calendar day is a national holiday');
          });
          
          describe('if dayType', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestUpdateCalendarDay(day, calendarDayDataFactory.request.workday({
                  dayType: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('dayType', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestUpdateCalendarDay(day, calendarDayDataFactory.request.workday({
                  dayType: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('dayType', 'string', 'body');
            });

            it('is not a valid constant value', () => {
              cy.authenticate(userType)
                .requestUpdateCalendarDay(day, calendarDayDataFactory.request.workday({
                  dayType: 'not-valid-const' as any,
                }))
                .expectBadRequestResponse()
                .expectNotConstantValue('dayType', 'body');
            });
          });

          describe('if start', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestUpdateCalendarDay(day, calendarDayDataFactory.request.workday({
                  start: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('start', 'body');
            });

            it('is not integer', () => {
              cy.authenticate(userType)
                .requestUpdateCalendarDay(day, calendarDayDataFactory.request.workday({
                  start: 1.1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('start', 'integer', 'body');
            });

            it('is too small', () => {
              cy.authenticate(userType)
                .requestUpdateCalendarDay(day, calendarDayDataFactory.request.workday({
                  start: -1,
                }))
                .expectBadRequestResponse()
                .expectTooSmallNumberProperty('start', 0, false, 'body');
            });

            it('is too large', () => {
              cy.authenticate(userType)
                .requestUpdateCalendarDay(day, calendarDayDataFactory.request.workday({
                  start: 97,
                }))
                .expectBadRequestResponse()
                .expectTooLargeNumberProperty('start', 96, false, 'body');
            });
          });

          describe('if end', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestUpdateCalendarDay(day, calendarDayDataFactory.request.workday({
                  end: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('end', 'body');
            });

            it('is not integer', () => {
              cy.authenticate(userType)
                .requestUpdateCalendarDay(day, calendarDayDataFactory.request.workday({
                  end: 1.1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('end', 'integer', 'body');
            });

            it('is too small', () => {
              cy.authenticate(userType)
                .requestUpdateCalendarDay(day, calendarDayDataFactory.request.workday({
                  start: 20,
                  end: 10,
                }))
                .expectBadRequestResponse()
                .expectTooSmallNumberProperty('end', 0, true, 'body');
            });

            it('is too large', () => {
              cy.authenticate(userType)
                .requestUpdateCalendarDay(day, calendarDayDataFactory.request.workday({
                  end: 97,
                }))
                .expectBadRequestResponse()
                .expectTooLargeNumberProperty('end', 96, false, 'body');
            });
          });

          describe('if day', () => {
            it('is not date', () => {
              cy.authenticate(userType)
                .requestUpdateCalendarDay('not-date', request)
                .expectBadRequestResponse()
                .expectWrongPropertyFormat('day', 'date', 'pathParameters');
            });
          });
        });
      }
    });
  });
});
