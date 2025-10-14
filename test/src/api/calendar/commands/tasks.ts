import { Calendar } from '@household/shared/types/types';
import { CommandFunction } from '@household/test/api/types';
import { ICalendarDayService } from '@household/shared/services/calendar-day-service';

const saveCalendarDayDocument = (...params: Parameters<ICalendarDayService['saveCalendarDay']>) => {
  return cy.task('saveCalendarDay', params);
};

// const saveCustomerDocuments = (...params: Parameters<ICalendarDayService['saveCustomers']>) => {
//   return cy.task('saveCustomers', params);
// };

const findCalendarDayDocumentByDay = (...params: Parameters<ICalendarDayService['findCalendarDayByDay']>) => {
  return cy.task<Calendar.Day.Document>('findCalendarDayByDay', params);
};

export const setCalendarTaskCommands = () => {

  Cypress.Commands.addAll({
    findCalendarDayDocumentByDay,
    //   saveCustomerDocuments,
    saveCalendarDayDocument,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      findCalendarDayDocumentByDay: CommandFunction<typeof findCalendarDayDocumentByDay>;
      // saveCustomerDocuments: CommandFunction<typeof saveCustomerDocuments>;
      saveCalendarDayDocument: CommandFunction<typeof saveCalendarDayDocument>
    }
  }
}
