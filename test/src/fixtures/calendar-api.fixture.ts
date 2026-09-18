import { getCalendarEntryId, getCustomerId, getPriceId, getTransactionId } from '@household/shared/common/utils';
import { headerExpiresIn, WORKDAY_END, WORKDAY_START } from '@household/shared/constants';
import { CalendarDayType, CalendarEntryResolutionStatus, CalendarEntryType } from '@household/shared/enums';
import { Api } from '@household/shared/types/api';
import { Documents } from '@household/shared/types/documents';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { Comparer } from '@household/test/comparer';
import { test as baseTest, expect as baseExpect } from '@household/test/fixtures/api.fixture';
import { validateCustomerJobPriceResponse, validateCustomerResponse } from '@household/test/fixtures/customer-api.fixture';
import { APIResponse } from '@playwright/test';

type CalendarApiFixture = {
  requestCreateCalendarEntry(calendarEntry: Requests.CalendarEntry): Promise<APIResponse>;
  requestGetCalendarEntry(calendarEntryId: Api.Calendar.Entry.Id): Promise<APIResponse>;
  requestUpdateCalendarEntry(calendarEntryId: Api.Calendar.Entry.Id, requestBody: Requests.CalendarEntry): Promise<APIResponse>;
  requestDeleteCalendarEntry(calendarEntryId: Api.Calendar.Entry.Id): Promise<APIResponse>;
  requestUpdateCalendarDay(day: Api.Calendar.Day['day'], dayRequest: Requests.CalendarDay): Promise<APIResponse>;
  requestDeleteCalendarDay(day: Api.Calendar.Day['day']): Promise<APIResponse>;
  requestListCalendarDays(dateRange: Api.Calendar.DateRange): Promise<APIResponse>;
  requestResolveCalendarWorkEntry(calendarEntryId: Api.Calendar.Entry.Id, body: Requests.CalendarEntryResolution): Promise<APIResponse>;
};

export const test = baseTest.extend<CalendarApiFixture>({
  requestCreateCalendarEntry: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestCreateCalendarEntry = async (calendarEntry: Requests.CalendarEntry) => {
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

    const requestGetCalendarEntry = async (calendarEntryId: Api.Calendar.Entry.Id) => {
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

    const requestUpdateCalendarEntry = async (calendarEntryId: Api.Calendar.Entry.Id, requestBody: Requests.CalendarEntry) => {
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

    const requestDeleteCalendarEntry = async (calendarEntryId: Api.Calendar.Entry.Id) => {
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

    const requestUpdateCalendarDay = async (day: Api.Calendar.Day['day'], dayRequest: Requests.CalendarDay) => {
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

    const requestDeleteCalendarDay = async (day: Api.Calendar.Day['day']) => {
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

    const requestListCalendarDays = async (dateRange: Api.Calendar.DateRange) => {
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

    const requestResolveCalendarWorkEntry = async (calendarEntryId: Api.Calendar.Entry.Id, body: Requests.CalendarEntryResolution) => {
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

const validateCalendarEntryResponseBase = (response: Responses.CalendarEntryLean, document: Documents.CalendarEntry) => {
  return new Comparer(response, {
    calendarEntryId: getCalendarEntryId(document),
    title: document.title,
    description: document.description,
    start: document.start,
    end: document.end,
    day: document.day,
  });
};

const validateCalendarEntryResponse = (response: Responses.CalendarEntry, document: Documents.CalendarEntry) => {
  const comparer = new Comparer(response, [
    validateCalendarEntryResponseBase(response, document),
    {
      entryType: document.entryType,
    },
  ]);

  if (response.entryType === CalendarEntryType.Work && document.entryType === CalendarEntryType.Work) { 
    return new Comparer(response, [
      comparer,
      {
        customer: validateCustomerResponse(response.customer, document.customer),
        resolution: new Comparer(response.resolution, {
          status: document.resolution.status,
          delay: document.resolution.delay,
        }),
        prices: validateCustomerJobPriceResponse(response.prices, document.prices),
        additionalPrice: document.additionalPrice,
      },
    ]);
  }

  return comparer;
};

const validateCalendarEntryDocuments = (originalDocument: Documents.CalendarEntry, currentDocument: Documents.CalendarEntry) => {
  return new Comparer(currentDocument, {
    description: originalDocument.description,
    start: originalDocument.start,
    end: originalDocument.end,
    day: originalDocument.day,
    title: originalDocument.title,
    entryType: originalDocument.entryType,  
    customer: getCustomerId(originalDocument.customer),
    additionalPrice: originalDocument.additionalPrice,
    prices: currentDocument.prices?.map((currentPrice, index) => {
      const originalPrice = originalDocument.prices[index];

      return new Comparer(currentPrice, {
        price: getPriceId(originalPrice.price),
        quantity: originalPrice.quantity,
      });    
    }),
    resolution: new Comparer(currentDocument.resolution, {
      delay: originalDocument.resolution?.delay,
      status: originalDocument.resolution?.status,
    }),
    transaction: getTransactionId(originalDocument.transaction),
  }, '_id', 'createdAt', 'updatedAt', 'expiresAt');
};

export const expect = baseExpect.extend({
  toHaveBeenSavedAsCalendarDayDocument(req: Requests.CalendarDay, document: Documents.CalendarDay) {
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
  toHaveBeenSavedAsCalendarEntryDocument(req: Requests.CalendarEntry, document: Documents.CalendarEntry) {
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
      additionalPrice: req.entryType === CalendarEntryType.Work ? req.additionalPrice : undefined,
      prices: req.entryType === CalendarEntryType.Work ? document.prices?.map((priceDocument, index) => {
        const priceRequest = req.prices[index];

        return new Comparer(priceDocument, {
          price: priceRequest.priceId,
          quantity: priceRequest.quantity,
        });
      }) : undefined,
    }, '_id', 'createdAt', 'updatedAt', 'expiresAt');

    const errors = comparer.validate();

    return {
      pass: errors.length === 0,
      message: () => `Expected document to be saved as calendar entry document, but it was not:\n${errors.join('\n')}`,
    };
  },
  toHaveBeenDeletedFromDatabase(document: Documents.CalendarDay | Documents.CalendarEntry) {
    return {
      pass: !document,
      message: () => `expected document to be deleted from database, but it was found with id ${document._id}`,
    };
  },
  async toContainMatchingCalendarEntryBaseDocument(received: APIResponse, document: Documents.CalendarEntry) {
    const response = await received.json() as Responses.CalendarEntryLean[];
    
    const matchingResponse = response.find(r => r.calendarEntryId === getCalendarEntryId(document));

    if (!matchingResponse) {
      return {
        pass: false,
        message: () => `expected response to contain a calendar entry with id ${getCalendarEntryId(document)}, but it was not found`,
      };
    }

    const comparer = validateCalendarEntryResponseBase(matchingResponse, document);

    const errors = comparer.validate();

    return {
      pass: errors.length === 0,
      message: () => `Expected document to match calendar entry document, but it did not: ${errors.join('\n')}`,
    };
  },
  async toMatchCalendarEntryDocument(received: APIResponse, document: Documents.CalendarEntry) {
    const response = await received.json() as Responses.CalendarEntry;

    const errors = validateCalendarEntryResponse(response, document).validate();
    
    return {      
      pass: errors.length === 0,
      message: () => `Expected document to match calendar entry document, but it did not:\n${errors.join('\n')}`,
    };
  },
  toHaveBeenResolved(originalDocument: Documents.CalendarEntry, currentDocument: Documents.CalendarEntry, request: Requests.CalendarEntryResolution, transactionId?: Api.Transaction.Id) {
    const comparer = new Comparer(currentDocument, [
      validateCalendarEntryDocuments(originalDocument, currentDocument),
      {
        resolution: new Comparer(currentDocument.resolution, {
          delay: request.status !== CalendarEntryResolutionStatus.NoShow ? request.delay : undefined,
          status: request.status,
        }),
        transaction: currentDocument.resolution?.status === CalendarEntryResolutionStatus.Paid ? transactionId : undefined,
      },
    ], '_id', 'createdAt', 'updatedAt', 'expiresAt');

    const errors = comparer.validate();

    return {
      pass: errors.length === 0,
      message: () => `Expected document to be resolved correctly, but it was not:\n${errors.join('\n')}`,
    };
  },
  toHaveBeenUnresolved(originalDocument: Documents.CalendarEntry, currentDocument: Documents.CalendarEntry) {
    const comparer = new Comparer(currentDocument, [
      validateCalendarEntryDocuments(originalDocument, currentDocument),
      {
        resolution: undefined,
        transaction: undefined,
      },
    ], '_id', 'createdAt', 'updatedAt', 'expiresAt');

    const errors = comparer.validate();

    return {
      pass: errors.length === 0,
      message: () => `Expected document to be unresolved correctly, but it was not:\n${errors.join('\n')}`,
    };
  },
  async toContainMatchingCalendarDayDocument(received: APIResponse, dayInput: Api.Calendar.Day['day'], calendarEntryDocument: Documents.CalendarEntry, calendarDayDocument?: Documents.CalendarDay) {
    const response = await received.json() as Responses.CalendarDay[];
    const matchingResponse = response.find(r => r.day === dayInput);

    if (!matchingResponse) {
      return {
        pass: false,
        message: () => `expected response to contain a calendar day with day ${dayInput}, but it was not found`,
      };
    }
    const entryResponse = matchingResponse.entries?.find(e => e.calendarEntryId === getCalendarEntryId(calendarEntryDocument));
    const comparer = new Comparer(matchingResponse, {
      day: dayInput,
      entries: [entryResponse].map(entry => validateCalendarEntryResponse(entry, calendarEntryDocument)),
      start: calendarDayDocument?.start ?? (matchingResponse.dayType === CalendarDayType.Workday ? WORKDAY_START : undefined),
      end: calendarDayDocument?.end ?? (matchingResponse.dayType === CalendarDayType.Workday ? WORKDAY_END : undefined),
    }, 'dayType');

    const errors = comparer.validate();  

    return {
      pass: errors.length === 0,
      message: () => `Expected response to match calendar entry document, but it did not:\n${errors.join('\n')}`,
    };
  },
});
