import { getCalendarEntryId } from '@household/shared/common/utils';
import { headerExpiresIn } from '@household/shared/constants';
import { Calendar } from '@household/shared/types/types';
import { test as baseTest, expect as baseExpect } from '@household/test/fixtures/api.fixture';
import { createComparer } from '@household/test/utils';
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

export const expect = baseExpect.extend({
  async toMatchCalendarEntryBaseDocumentInResponseList(received: APIResponse, document: Calendar.Entry.Document) {
    const response = await received.json() as Calendar.Entry.ResponseBase[];
    
    const matchingResponse = response.find(r => r.calendarEntryId === getCalendarEntryId(document));

    if (!matchingResponse) {
      return {
        pass: false,
        message: () => `expected response to contain a calendar entry with id ${getCalendarEntryId(document)}, but it was not found`,
      };
    }

    const comparer = createComparer((compare) => {
      return {
        calendarEntryId: compare(matchingResponse?.calendarEntryId, getCalendarEntryId(document)),
        title: compare(matchingResponse?.title, document.title),
        description: compare(matchingResponse?.description, document.description),
        start: compare(matchingResponse?.start, document.start),
        end: compare(matchingResponse?.end, document.end),
        day: compare(matchingResponse?.day, document.day),
      };
    });

    const message = comparer.validate(matchingResponse);

    return {
      pass: !message,
      message: () => message,
    };
  },
});
