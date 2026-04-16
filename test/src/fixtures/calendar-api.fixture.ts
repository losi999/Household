import { headerExpiresIn } from '@household/shared/constants';
import { Calendar } from '@household/shared/types/types';
import { test as baseTest, expect as baseExpect } from '@household/test/fixtures/api.fixture';
import { APIResponse } from '@playwright/test';

type CalendarApiFixture = {
  requestCreateCalendarEntry(calendarEntry: Calendar.Entry.Request): Promise<APIResponse>;
  requestGetCalendarEntry(calendarEntryId: Calendar.Entry.Id): Promise<APIResponse>;
  requestUpdateCalendarEntry(calendarEntryId: Calendar.Entry.Id, requestBody: Calendar.Entry.Request): Promise<APIResponse>;
  requestDeleteCalendarEntry(calendarEntryId: Calendar.Entry.Id): Promise<APIResponse>;
  requestUpdateCalendarDay(day: Calendar.DayProp['day'], dayRequest: Calendar.Day.Request): Promise<APIResponse>;
  requestDeleteCalendarDay(day: Calendar.DayProp['day']): Promise<APIResponse>;
  requestListCalendarDays(dateRange: Calendar.DateRange): Promise<APIResponse>;
  requestResolveCalendarWorkEntry(calendarEntryId: Calendar.Entry.Id, body: Calendar.Entry.ResolutionRequest): Promise<APIResponse>;
};

export const test = baseTest.extend<CalendarApiFixture>({
  requestCreateCalendarEntry: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestCreateCalendarEntry = async (calendarEntry: Calendar.Entry.Request) => {
      return request.post(`${process.env.BASE_URL}/calendar/v1/entries`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: calendarEntry,
      });
    };

    await use(requestCreateCalendarEntry);
  },
  requestGetCalendarEntry: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestGetCalendarEntry = async (calendarEntryId: Calendar.Entry.Id) => {
      return request.get(`${process.env.BASE_URL}/calendar/v1/entries/${calendarEntryId}`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
      });
    };

    await use(requestGetCalendarEntry);
  },
  requestUpdateCalendarEntry: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestUpdateCalendarEntry = async (calendarEntryId: Calendar.Entry.Id, requestBody: Calendar.Entry.Request) => {
      return request.put(`${process.env.BASE_URL}/calendar/v1/entries/${calendarEntryId}`, {
        headers: {
          Authorization: authToken,
        },
        data: requestBody,
      });
    };

    await use(requestUpdateCalendarEntry);
  },
  requestDeleteCalendarEntry: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestDeleteCalendarEntry = async (calendarEntryId: Calendar.Entry.Id) => {
      return request.delete(`${process.env.BASE_URL}/calendar/v1/entries/${calendarEntryId}`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestDeleteCalendarEntry);
  },
  requestUpdateCalendarDay: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestUpdateCalendarDay = async (day: Calendar.DayProp['day'], dayRequest: Calendar.Day.Request) => {
      return request.put(`${process.env.BASE_URL}/calendar/v1/days/${day}`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: dayRequest,
      });
    };

    await use(requestUpdateCalendarDay);
  },
  requestDeleteCalendarDay: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestDeleteCalendarDay = async (day: Calendar.DayProp['day']) => {
      return request.delete(`${process.env.BASE_URL}/calendar/v1/days/${day}`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
      });
    };

    await use(requestDeleteCalendarDay);
  },
  requestListCalendarDays: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestListCalendarDays = async (dateRange: Calendar.DateRange) => {
      return request.get(`${process.env.BASE_URL}/calendar/v1/days`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        params: dateRange,
      });
    };

    await use(requestListCalendarDays);
  },
  requestResolveCalendarWorkEntry: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestResolveCalendarWorkEntry = async (calendarEntryId: Calendar.Entry.Id, body: Calendar.Entry.ResolutionRequest) => {
      return request.post(`${process.env.BASE_URL}/calendar/v1/entries/${calendarEntryId}/resolution`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: body,
      });
    };

    await use(requestResolveCalendarWorkEntry);
  },
});

export const expect = baseExpect.extend({});
