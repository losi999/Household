import { Calendar } from '@household/shared/types/types';
import { CommandFunction } from '@household/test/api/types';
import { ICalendarDayService } from '@household/shared/services/calendar-day-service';
import { ICalendarEntryService } from '@household/shared/services/calendar-entry-service';

const saveCalendarDayDocument = (...params: Parameters<ICalendarDayService['saveCalendarDay']>) => {
  return cy.task('saveCalendarDay', params);
};

const clearCalendarDay = (...params: Parameters<ICalendarDayService['clearCalendarDay']>) => {
  return cy.task<Calendar.Day.Document>('clearCalendarDay', params);
};

const findCalendarDayDocumentByDay = (...params: Parameters<ICalendarDayService['findCalendarDayByDay']>) => {
  return cy.task<Calendar.Day.Document>('findCalendarDayByDay', params);
};

const findCalendarEntryDocumentById = (...params: Parameters<ICalendarEntryService['findCalendarEntryById']>) => {
  return cy.task<Calendar.Entry.Document>('findCalendarEntryById', params);
};

const saveCalendarEntryDocument = (...params: Parameters<ICalendarEntryService['saveCalendarEntry']>) => {
  return cy.task<Calendar.Entry.Document>('saveCalendarEntry', params);
};

export const setCalendarTaskCommands = () => {

  Cypress.Commands.addAll({
    findCalendarDayDocumentByDay,
    saveCalendarDayDocument,
    findCalendarEntryDocumentById,
    saveCalendarEntryDocument,
    clearCalendarDay,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      findCalendarDayDocumentByDay: CommandFunction<typeof findCalendarDayDocumentByDay>;
      findCalendarEntryDocumentById: CommandFunction<typeof findCalendarEntryDocumentById>;
      saveCalendarDayDocument: CommandFunction<typeof saveCalendarDayDocument>;
      saveCalendarEntryDocument: CommandFunction<typeof saveCalendarEntryDocument>;
      clearCalendarDay: CommandFunction<typeof clearCalendarDay>;
    }
  }
}
