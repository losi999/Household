import { isPriceBase } from '@household/shared/common/type-guards';
import { getCalendarEntryId, getCustomerId, getPriceId } from '@household/shared/common/utils';
import { headerExpiresIn, WORKDAY_END, WORKDAY_START } from '@household/shared/constants';
import { CalendarDayType, CalendarEntryResolutionStatus, CalendarEntryType } from '@household/shared/enums';
import { Calendar, Transaction } from '@household/shared/types/types';
import { Comparer } from '@household/test/comparer';
import { test as baseTest, expect as baseExpect } from '@household/test/fixtures/api.fixture';
import { validateCustomerJobPriceResponse, validateCustomerResponse } from '@household/test/fixtures/customer-api.fixture';
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
  requestCreateCalendarEntry: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestCreateCalendarEntry = async (calendarEntry: Calendar.Entry.Request) => {
      return loggedRequest.post(`${process.env.BASE_URL}/calendar/v1/entries`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: calendarEntry,
      });
    };

    await use(requestCreateCalendarEntry);
  },
  requestGetCalendarEntry: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestGetCalendarEntry = async (calendarEntryId: Calendar.Entry.Id) => {
      return loggedRequest.get(`${process.env.BASE_URL}/calendar/v1/entries/${calendarEntryId}`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
      });
    };

    await use(requestGetCalendarEntry);
  },
  requestUpdateCalendarEntry: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestUpdateCalendarEntry = async (calendarEntryId: Calendar.Entry.Id, requestBody: Calendar.Entry.Request) => {
      return loggedRequest.put(`${process.env.BASE_URL}/calendar/v1/entries/${calendarEntryId}`, {
        headers: {
          Authorization: authToken,
        },
        data: requestBody,
      });
    };

    await use(requestUpdateCalendarEntry);
  },
  requestDeleteCalendarEntry: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestDeleteCalendarEntry = async (calendarEntryId: Calendar.Entry.Id) => {
      return loggedRequest.delete(`${process.env.BASE_URL}/calendar/v1/entries/${calendarEntryId}`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestDeleteCalendarEntry);
  },
  requestUpdateCalendarDay: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestUpdateCalendarDay = async (day: Calendar.DayProp['day'], dayRequest: Calendar.Day.Request) => {
      return loggedRequest.put(`${process.env.BASE_URL}/calendar/v1/days/${day}`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: dayRequest,
      });
    };

    await use(requestUpdateCalendarDay);
  },
  requestDeleteCalendarDay: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestDeleteCalendarDay = async (day: Calendar.DayProp['day']) => {
      return loggedRequest.delete(`${process.env.BASE_URL}/calendar/v1/days/${day}`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
      });
    };

    await use(requestDeleteCalendarDay);
  },
  requestListCalendarDays: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestListCalendarDays = async (dateRange: Calendar.DateRange) => {
      return loggedRequest.get(`${process.env.BASE_URL}/calendar/v1/days`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        params: dateRange,
      });
    };

    await use(requestListCalendarDays);
  },
  requestResolveCalendarWorkEntry: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestResolveCalendarWorkEntry = async (calendarEntryId: Calendar.Entry.Id, body: Calendar.Entry.ResolutionRequest) => {
      return loggedRequest.post(`${process.env.BASE_URL}/calendar/v1/entries/${calendarEntryId}/resolution`, {
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

const validateCalendarEntryResponse = (response: Calendar.Entry.Response, document: Calendar.Entry.Document) => {
  if (response.entryType === CalendarEntryType.Work && document.entryType === CalendarEntryType.Work) { 
    return new Comparer(response, {
      calendarEntryId: getCalendarEntryId(document),
      title: document.title,
      description: document.description,
      start: document.start,
      end: document.end,
      day: document.day,
      entryType: document.entryType,
      customer: validateCustomerResponse(response.customer, document.customer),
      resolution: new Comparer(response.resolution, {
        status: document.resolution.status,
        delay: document.resolution.delay,
      }),
      prices: validateCustomerJobPriceResponse(response.prices, document.prices),
    });
  }

  return new Comparer(response, {
    calendarEntryId: getCalendarEntryId(document),
    title: document.title,
    description: document.description,
    start: document.start,
    end: document.end,
    day: document.day,
    entryType: document.entryType,
  });
};

export const expect = baseExpect.extend({
  toHaveBeenSavedAsCalendarDayDocument(req: Calendar.Day.Request, document: Calendar.Day.Document) {
    const comparer = new Comparer(document, {
      dayType: req.dayType,
      start: req.dayType === CalendarDayType.Workday ? req.start : undefined,
      end: req.dayType === CalendarDayType.Workday ? req.end : undefined,
    }, '_id', 'createdAt', 'updatedAt', 'expiresAt', 'day');

    const errors = comparer.validate();

    return {
      pass: errors.length === 0,
      message: () => `Expected document to be saved as calendar day document, but it was not: ${errors.join(', ')}`,
    };
  },
  toHaveBeenSavedAsCalendarEntryDocument(req: Calendar.Entry.Request, document: Calendar.Entry.Document) {
    const comparer = new Comparer(document, {
      title: req.title,
      entryType: req.entryType,
      description: req.description,
      start: req.start,
      end: req.end,
      day: req.day,
      resolution: undefined,
      transaction: undefined,
      customer: req.entryType === CalendarEntryType.Work ? req.customerId : undefined,
      prices: req.entryType === CalendarEntryType.Work ? document.prices?.map((priceDocument, index) => {
        const priceRequest = req.prices[index];

        if (isPriceBase(priceDocument) && isPriceBase(priceRequest)) {
          return new Comparer(priceDocument, {
            name: priceRequest.name,
            amount: priceRequest.amount,
          });
        }

        if (!isPriceBase(priceDocument) && !isPriceBase(priceRequest)) {
          return new Comparer(priceDocument, {
            price: priceRequest.priceId,
            quantity: priceRequest.quantity,
          });
        }
      }) : undefined,
    }, '_id', 'createdAt', 'updatedAt', 'expiresAt');

    const errors = comparer.validate();

    return {
      pass: errors.length === 0,
      message: () => `Expected document to be saved as calendar day document, but it was not:\n${errors.join('\n')}`,
    };
  },
  toHaveBeenDeletedFromDatabase(document: Calendar.Day.Document | Calendar.Entry.Document) {
    return {
      pass: !document,
      message: () => `expected document to be deleted from database, but it was found with id ${document._id}`,
    };
  },
  async toContainMatchingCalendarEntryBaseDocument(received: APIResponse, document: Calendar.Entry.Document) {
    const response = await received.json() as Calendar.Entry.ResponseBase[];
    
    const matchingResponse = response.find(r => r.calendarEntryId === getCalendarEntryId(document));

    if (!matchingResponse) {
      return {
        pass: false,
        message: () => `expected response to contain a calendar entry with id ${getCalendarEntryId(document)}, but it was not found`,
      };
    }

    const comparer = new Comparer(matchingResponse, {
      calendarEntryId: getCalendarEntryId(document),
      title: document.title,
      description: document.description,
      start: document.start,
      end: document.end,
      day: document.day,
    });

    const errors = comparer.validate();

    return {
      pass: errors.length === 0,
      message: () => `Expected document to match calendar entry document, but it did not: ${errors.join('\n')}`,
    };
  },
  async toMatchCalendarEntryDocument(received: APIResponse, document: Calendar.Entry.Document) {
    const response = await received.json() as Calendar.Entry.Response;

    const errors = validateCalendarEntryResponse(response, document).validate();
    
    return {      
      pass: errors.length === 0,
      message: () => `Expected document to match calendar entry document, but it did not:\n${errors.join('\n')}`,
    };
  },
  toHaveBeenResolved(originalDocument: Calendar.Entry.Document, currentDocument: Calendar.Entry.Document, request: Calendar.Entry.ResolutionRequest, transactionId?: Transaction.Id) {
    const comparer = new Comparer(currentDocument, {
      description: originalDocument.description,
      start: originalDocument.start,
      end: originalDocument.end,
      day: originalDocument.day,
      title: originalDocument.title,
      entryType: originalDocument.entryType,  
      customer: getCustomerId(originalDocument.customer),
      resolution: new Comparer(currentDocument.resolution, {
        delay: request.status !== CalendarEntryResolutionStatus.NoShow ? request.delay : undefined,
        status: request.status,
      }),
      prices: currentDocument.prices?.map((currentPrice, index) => {
        const originalPrice = originalDocument.prices[index];

        if (isPriceBase(currentPrice) && isPriceBase(originalPrice)) {
          return new Comparer(currentPrice, {
            name: originalPrice.name,
            amount: originalPrice.amount,
          });
        }

        if (!isPriceBase(currentPrice) && !isPriceBase(originalPrice)) {
          return new Comparer(currentPrice, {
            price: getPriceId(originalPrice.price),
            quantity: originalPrice.quantity,
          });
        }
      }),
      transaction: currentDocument.resolution?.status === CalendarEntryResolutionStatus.Paid ? transactionId : undefined,
    }, '_id', 'createdAt', 'updatedAt', 'expiresAt');

    const errors = comparer.validate();

    return {
      pass: errors.length === 0,
      message: () => `Expected document to be resolved correctly, but it was not:\n${errors.join('\n')}`,
    };
  },
  async toContainMatchingCalendarDayDocument(received: APIResponse, dayInput: Calendar.DayProp['day'], calendarEntryDocument: Calendar.Entry.Document, calendarDayDocument?: Calendar.Day.Document) {
    const response = await received.json() as Calendar.Day.Response[];
    const matchingResponse = response.find(r => r.day === dayInput);

    if (!matchingResponse) {
      return {
        pass: false,
        message: () => `expected response to contain a calendar day with day ${dayInput}, but it was not found`,
      };
    }

    if (matchingResponse.dayType === CalendarDayType.Workday) {
      const entryResponse = matchingResponse.entries?.find(e => e.calendarEntryId === getCalendarEntryId(calendarEntryDocument));

      const comparer = new Comparer(matchingResponse, {
        day: dayInput,
        dayType: CalendarDayType.Workday,
        start: calendarDayDocument?.start ?? WORKDAY_START,
        end: calendarDayDocument?.end ?? WORKDAY_END,
        entries: [entryResponse].map(entry => validateCalendarEntryResponse(entry, calendarEntryDocument)),
      });

      const errors = comparer.validate();  

      return {
        pass: errors.length === 0,
        message: () => `Expected response to match calendar entry document, but it did not:\n${errors.join('\n')}`,
      };
    }

    if (matchingResponse.dayType === CalendarDayType.Weekend) {
      const entryResponse = matchingResponse.entries?.find(e => e.calendarEntryId === getCalendarEntryId(calendarEntryDocument));
      const comparer = new Comparer(matchingResponse, {
        day: dayInput,
        dayType: CalendarDayType.Weekend,
        start: calendarDayDocument?.start ?? undefined,
        end: calendarDayDocument?.end ?? undefined,
        entries: [entryResponse].map(entry => validateCalendarEntryResponse(entry, calendarEntryDocument)),
      });

      const errors = comparer.validate();  
      
      return {
        pass: errors.length === 0,
        message: () => `Expected response to match calendar entry document, but it did not:\n${errors.join('\n')}`,
      };
    }

    if (matchingResponse.dayType === CalendarDayType.Vacation) {
      const entryResponse = matchingResponse.entries?.find(e => e.calendarEntryId === getCalendarEntryId(calendarEntryDocument));
      const comparer = new Comparer(matchingResponse, {
        day: dayInput,
        dayType: CalendarDayType.Vacation,
        entries: [entryResponse].map(entry => validateCalendarEntryResponse(entry, calendarEntryDocument)),
      });

      const errors = comparer.validate();  
      
      return {
        pass: errors.length === 0,
        message: () => `Expected response to match calendar entry document, but it did not:\n${errors.join('\n')}`,
      };
    }

    const entryResponse = matchingResponse.entries?.find(e => e.calendarEntryId === getCalendarEntryId(calendarEntryDocument));
    const comparer = new Comparer(matchingResponse, {
      day: dayInput,
      dayType: CalendarDayType.Holiday,
      entries: [entryResponse].map(entry => validateCalendarEntryResponse(entry, calendarEntryDocument)),
    });

    const errors = comparer.validate();  
      
    return {
      pass: errors.length === 0,
      message: () => `Expected response to match calendar entry document, but it did not:\n${errors.join('\n')}`,
    };

  },
});
