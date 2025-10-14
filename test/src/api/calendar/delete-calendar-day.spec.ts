import { entries } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/api/utils';
import { Calendar } from '@household/shared/types/types';
import { calendarDayDataFactory } from '@household/test/api/calendar/data-factory';

const permissionMap = allowUsers('hairdresser');

describe('DELETE /calendar/v1/days/{day}', () => {
  let day: string;
  let calendarDayDocument: Calendar.Day.Document;

  beforeEach(() => {
    day = calendarDayDataFactory.futureDay();

    calendarDayDocument = calendarDayDataFactory.document({
      day,
    });
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestDeleteCalendarDay(day)
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
            .requestDeleteCalendarDay(day)
            .expectForbiddenResponse();
        });
      } else {  
        it('should delete calendar day', () => {
          cy.saveCalendarDayDocument(calendarDayDocument)
            .authenticate(userType)
            .requestDeleteCalendarDay(day)
            .expectNoContentResponse()
            .validateCalendarDayDeleted(day);
        });

        describe('should return error', () => {
          describe('if day', () => {
            it('is not date', () => {
              cy.authenticate(userType)
                .requestDeleteCalendarDay('not-date')
                .expectBadRequestResponse()
                .expectWrongPropertyFormat('day', 'date', 'pathParameters');
            });
          });
        });
      }
    });
  });
});
