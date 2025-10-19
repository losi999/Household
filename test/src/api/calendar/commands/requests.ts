import { Calendar } from '@household/shared/types/types';
import { headerExpiresIn } from '@household/shared/constants';
import { CommandFunctionWithPreviousSubject } from '@household/test/api/types';

const requestCreateCalendarEntry = (idToken: string, calendarEntry: Calendar.Entry.Request) => {
  return cy.request({
    body: calendarEntry,
    method: 'POST',
    url: '/calendar/v1/entries',
    headers: {
      Authorization: idToken,
      [headerExpiresIn]: Cypress.env('EXPIRES_IN'),
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestGetCalendarEntry = (idToken: string, calendarEntryId: Calendar.Entry.Id) => {
  return cy.request({
    method: 'GET',
    url: `/calendar/v1/entries/${calendarEntryId}`,
    headers: {
      Authorization: idToken,
      [headerExpiresIn]: Cypress.env('EXPIRES_IN'),
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestUpdateCalendarEntry = (idToken: string, calendarEntryId: Calendar.Entry.Id, request: Calendar.Entry.Request) => {
  return cy.request({
    body: request,
    method: 'PUT',
    url: `/calendar/v1/entries/${calendarEntryId}`,
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestDeleteCalendarEntry = (idToken: string, calendarEntryId: Calendar.Entry.Id) => {
  return cy.request({
    method: 'DELETE',
    url: `/calendar/v1/entries/${calendarEntryId}`,
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestUpdateCalendarDay = (idToken: string, day: Calendar.DayProp['day'], job: Calendar.Day.Request) => {
  return cy.request({
    body: job,
    method: 'PUT',
    url: `/calendar/v1/days/${day}`,
    headers: {
      Authorization: idToken,
      [headerExpiresIn]: Cypress.env('EXPIRES_IN'),
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestDeleteCalendarDay = (idToken: string, day: Calendar.DayProp['day']) => {
  return cy.request({
    method: 'DELETE',
    url: `/calendar/v1/days/${day}`,
    headers: {
      Authorization: idToken,
      [headerExpiresIn]: Cypress.env('EXPIRES_IN'),
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestListCalendarDays = (idToken: string) => {
  return cy.request({
    method: 'GET',
    url: '/calendar/v1/days',
    headers: {
      Authorization: idToken,
      [headerExpiresIn]: Cypress.env('EXPIRES_IN'),
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestPayCalendarWorkEntry = (idToken: string, calendarEntryId: Calendar.Entry.Id, body: Calendar.Entry.PaymentRequest) => {
  return cy.request({
    body,
    method: 'POST',
    url: `/calendar/v1/entries/${calendarEntryId}/payment`,
    headers: {
      Authorization: idToken,
      [headerExpiresIn]: Cypress.env('EXPIRES_IN'),
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

export const setCalendarRequestCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    requestCreateCalendarEntry,
    requestUpdateCalendarEntry,
    requestGetCalendarEntry,
    requestDeleteCalendarEntry,
    requestUpdateCalendarDay,
    requestDeleteCalendarDay,
    requestListCalendarDays,
    requestPayCalendarWorkEntry,
  });
};

declare global {
  namespace Cypress {
    interface ChainableRequest extends Chainable {
      requestCreateCalendarEntry: CommandFunctionWithPreviousSubject<typeof requestCreateCalendarEntry>;
      requestUpdateCalendarEntry: CommandFunctionWithPreviousSubject<typeof requestUpdateCalendarEntry>;
      requestGetCalendarEntry: CommandFunctionWithPreviousSubject<typeof requestGetCalendarEntry>;
      requestDeleteCalendarEntry: CommandFunctionWithPreviousSubject<typeof requestDeleteCalendarEntry>;
      requestUpdateCalendarDay: CommandFunctionWithPreviousSubject<typeof requestUpdateCalendarDay>;
      requestDeleteCalendarDay: CommandFunctionWithPreviousSubject<typeof requestDeleteCalendarDay>;
      requestListCalendarDays: CommandFunctionWithPreviousSubject<typeof requestListCalendarDays>;
      requestPayCalendarWorkEntry: CommandFunctionWithPreviousSubject<typeof requestPayCalendarWorkEntry>;
    }
  }
}
