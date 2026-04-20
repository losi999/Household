import { isPriceBase } from '@household/shared/common/type-guards';
import { getAccountId, getCalendarEntryId, getCategoryId, getCustomerId, getPriceId, getProductId, getProjectId, getRecipientId } from '@household/shared/common/utils';
import { headerExpiresIn, WORKDAY_END, WORKDAY_START } from '@household/shared/constants';
import { CalendarDayType, CalendarEntryResolutionStatus, CalendarEntryType } from '@household/shared/enums';
import { Account, Calendar, Category, Transaction } from '@household/shared/types/types';
import { test as baseTest, expect as baseExpect } from '@household/test/fixtures/api.fixture';
import { createComparer } from '@household/test/utils';
import { APIResponse } from '@playwright/test';
import { default as moment } from 'moment-timezone';

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
const validateCalendarEntryResponse = (response: Calendar.Entry.Response, document: Calendar.Entry.Document) => {
  if (response.entryType === CalendarEntryType.Work) { 
    return createComparer((compare) => {
      return {
        calendarEntryId: compare(response.calendarEntryId, getCalendarEntryId(document)),
        title: compare(response.title, document.title),
        description: compare(response.description, document.description),
        start: compare(response.start, document.start),
        end: compare(response.end, document.end),
        day: compare(response.day, document.day),
        entryType: compare(response.entryType, document.entryType),
        'customer.customerId': compare(response.customer.customerId, getCustomerId(document.customer)),
        'customer.description': compare(response.customer.description, document.customer.description),
        'customer.name': compare(response.customer.name, document.customer.name),
        'customer.isGroup': compare(response.customer.isGroup, document.customer.isGroup),
        'customer.rating': compare(response.customer.rating, document.customer.rating),
        ...response.customer.blacklistedCustomers.reduce((accumulator, currentValue, index) => {
          const blacklistedCustomerDocument = document.customer.blacklistedCustomers[index];

          return {
            ...accumulator,
            [`customer.blacklistedCustomers[${index}].customerId`]: compare(currentValue.customerId, getCustomerId(blacklistedCustomerDocument)),
            [`customer.blacklistedCustomers[${index}].description`]: compare(currentValue.description, blacklistedCustomerDocument.description),
            [`customer.blacklistedCustomers[${index}].name`]: compare(currentValue.name, blacklistedCustomerDocument.name),
            [`customer.blacklistedCustomers[${index}].isGroup`]: compare(currentValue.isGroup, blacklistedCustomerDocument.isGroup),
            [`customer.blacklistedCustomers[${index}].rating`]: compare(currentValue.rating, blacklistedCustomerDocument.rating),
          };
        }, {}),
        ...response.customer.jobs.reduce((accumulator, currentValue, index) => {
          const prices = currentValue.prices.reduce((priceAccumulator, currentPrice, priceIndex) => {
            const jobPriceDocument = document.customer.jobs[index].prices[priceIndex];

            if(isPriceBase(jobPriceDocument)) {
              return {
                ...priceAccumulator,
                [`jobs[${index}].prices[${priceIndex}].name`]: compare(currentPrice.name, jobPriceDocument.name),
                [`jobs[${index}].prices[${priceIndex}].amount`]: compare(currentPrice.amount, jobPriceDocument.amount),
              }; 
            } 
            return {
              ...priceAccumulator,
              [`jobs[${index}].prices[${priceIndex}].name`]: compare(currentPrice.name, jobPriceDocument.price.name),
              [`jobs[${index}].prices[${priceIndex}].amount`]: compare(currentPrice.amount, jobPriceDocument.price.amount),
              [`jobs[${index}].prices[${priceIndex}].unitOfMeasurement`]: compare(currentPrice.unitOfMeasurement, jobPriceDocument.price.unitOfMeasurement),
              [`jobs[${index}].prices[${priceIndex}].priceId`]: compare(currentPrice.priceId, getPriceId(jobPriceDocument.price)),
              [`jobs[${index}].prices[${priceIndex}].quantity`]: compare(currentPrice.quantity, jobPriceDocument.quantity),
            };
          }, {});

          return {
            ...accumulator,
            [`jobs[${index}].name`]: compare(currentValue.name, document.customer.jobs[index].name),
            [`jobs[${index}].description`]: compare(currentValue.description, document.customer.jobs[index].description),
            [`jobs[${index}].duration`]: compare(currentValue.duration, document.customer.jobs[index].duration),
            ...prices,
          };
        }, {}),
        ...response.prices?.reduce((accumulator, currentValue, index) => {
          const priceDocument = document.prices[index];

          if (isPriceBase(priceDocument)) {
            return {
              ...accumulator,
              [`prices[${index}].name`]: compare(currentValue.name, priceDocument.name),
              [`prices[${index}].amount`]: compare(currentValue.amount, priceDocument.amount),
            };
          }

          return {
            ...accumulator,
            [`prices[${index}].priceId`]: compare(currentValue.priceId, getPriceId(priceDocument.price)),
            [`prices[${index}].quantity`]: compare(currentValue.quantity, priceDocument.quantity),
            [`prices[${index}].name`]: compare(currentValue.name, priceDocument.price.name),
            [`prices[${index}].amount`]: compare(currentValue.amount, priceDocument.price.amount),
            [`prices[${index}].unitOfMeasurement`]: compare(currentValue.unitOfMeasurement, priceDocument.price.unitOfMeasurement),
          };
        }, {}),
      };
    });
  }

  return createComparer((compare) => {
    return {
      calendarEntryId: compare(response.calendarEntryId, getCalendarEntryId(document)),
      title: compare(response.title, document.title),
      description: compare(response.description, document.description),
      start: compare(response.start, document.start),
      end: compare(response.end, document.end),
      day: compare(response.day, document.day),
      entryType: compare(response.entryType, document.entryType),
    };
  });
};

export const expect = baseExpect.extend({
  toHaveBeenSavedAsCalendarDayDocument(req: Calendar.Day.Request, document: Calendar.Day.Document) {
    const comparer = createComparer((compare) => {
      return {
        dayType: compare(document.dayType, req.dayType),
        start: compare(document.start, req.dayType === CalendarDayType.Workday ? req.start : undefined),
        end: compare(document.end, req.dayType === CalendarDayType.Workday ? req.end : undefined),
      };
    });

    const message = comparer.validate(document, '_id', 'createdAt', 'updatedAt', 'expiresAt', 'day');

    return {
      pass: !message,
      message: () => message,
    };
  },
  toHaveBeenSavedAsCalendarEntryDocument(req: Calendar.Entry.Request, document: Calendar.Entry.Document) {
    const comparer = createComparer((compare) => {

      return {
        title: compare(document.title, req.title),
        entryType: compare(document.entryType, req.entryType),
        description: compare(document.description, req.description),
        start: compare(document.start, req.start),
        end: compare(document.end, req.end),
        day: compare(document.day, req.day),
        resolution: compare(document.resolution, undefined),
        transaction: compare(document.transaction, undefined),
        ...(req.entryType === CalendarEntryType.Work ? {
          customer: compare(getCustomerId(document.customer), req.customerId),
          ...document.prices?.reduce((accumulator, currentValue, index) => {
            const priceRequest = req.prices[index];

            if (isPriceBase(currentValue) && isPriceBase(priceRequest)) {
              return {
                ...accumulator,
                [`prices[${index}].name`]: compare(currentValue.name, priceRequest.name),
                [`prices[${index}].amount`]: compare(currentValue.amount, priceRequest.amount),
              };
            }

            if (!isPriceBase(currentValue) && !isPriceBase(priceRequest)) {
              return {
                ...accumulator,
                [`prices[${index}].priceId`]: compare(getPriceId(currentValue.price), priceRequest.priceId),
                [`prices[${index}].quantity`]: compare(currentValue.quantity, priceRequest.quantity),
              };
            }

            return {
              ...accumulator,
              [`prices[${index}].priceType`]: compare(isPriceBase(currentValue) ? 'custom' : 'listed', isPriceBase(priceRequest) ? 'custom' : 'listed'),
            };
          }, {}),
        } : {
          customer: compare(document.customer, undefined),
          prices: compare(document.prices, undefined),
        }),
      };
    });

    const message = comparer.validate(document, '_id', 'createdAt', 'updatedAt', 'expiresAt', 'customer', 'prices');

    return {
      pass: !message,
      message: () => message,
    };
  },
  toHaveBeenDeletedFromDatabase(document: Calendar.Day.Document | Calendar.Entry.Document) {
    return {
      pass: !document,
      message: () => `expected document to be deleted from database, but it was found with id ${document._id}`,
    };
  },
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
  async toMatchCalendarEntryDocument(received: APIResponse, document: Calendar.Entry.Document) {
    const response = await received.json() as Calendar.Entry.Response;

    const message = validateCalendarEntryResponse(response, document).validate(response as any, 'resolution', 'prices', 'customer'); // TODO
    return {
      pass: !message,
      message: () => message,
    };
  },
  toHaveBeenResolved(originalDocument: Calendar.Entry.Document, currentDocument: Calendar.Entry.Document, request: Calendar.Entry.ResolutionRequest, transactionDocument?: Transaction.PaymentDocument, categoryId?: Category.Id, accountId?: Account.Id) {
    const comparer = createComparer((compare) => {
      let transaction;
      if (request.status === CalendarEntryResolutionStatus.Paid) {
        const expectedIssuedAt = moment.tz(currentDocument.day, 'Europe/Budapest'); 
        expectedIssuedAt.set({
          hour: Math.floor(currentDocument.end / 4),
          minute: (currentDocument.end % 4) * 15,
        });

        transaction = {
          'transaction.amount': compare(transactionDocument.amount, request.amount),
          'transaction.transactionType': compare(transactionDocument.transactionType, 'payment'),
          'transaction.account': compare(getAccountId(transactionDocument.account), accountId),
          'transaction.category': compare(getCategoryId(transactionDocument.category), categoryId),
          'transaction.project': compare(getProjectId(transactionDocument.project), undefined),
          'transaction.recipient': compare(getRecipientId(transactionDocument.recipient), undefined),
          'transaction.issuedAt': compare(transactionDocument.issuedAt.toISOString(), expectedIssuedAt.toISOString()),
          'transaction.invoiceNumber': compare(transactionDocument.invoiceNumber, undefined),
          'transaction.billingStartDate': compare(transactionDocument.billingStartDate?.toISOString(), undefined),
          'transaction.billingEndDate': compare(transactionDocument.billingEndDate?.toISOString(), undefined),
          'transaction.quantity': compare(transactionDocument.quantity, undefined),
          'transaction.product': compare(getProductId(transactionDocument.product), undefined),
        };
      } else {
        transaction = {
          transaction: compare(currentDocument.transaction, undefined),
        };
      }

      return {
        description: compare(currentDocument.description, originalDocument.description),
        start: compare(currentDocument.start, originalDocument.start),
        end: compare(currentDocument.end, originalDocument.end),
        day: compare(currentDocument.day, originalDocument.day),
        title: compare(currentDocument.title, originalDocument.title),
        entryType: compare(currentDocument.entryType, originalDocument.entryType),  
        customerId: compare(getCustomerId(currentDocument.customer), getCustomerId(originalDocument.customer)),
        'resolution.delay': compare(currentDocument.resolution.delay, request.status !== CalendarEntryResolutionStatus.NoShow ? request.delay : undefined),
        'resolution.status': compare(currentDocument.resolution.status, request.status),
        ...transaction,
        ...currentDocument.prices?.reduce((accumulator, currentValue, index) => {
          const originalPrice = originalDocument.prices[index];

          if (isPriceBase(currentValue) && isPriceBase(originalPrice)) {
            return {
              ...accumulator,
              [`prices[${index}].name`]: compare(currentValue.name, originalPrice.name),
              [`prices[${index}].amount`]: compare(currentValue.amount, originalPrice.amount),
            };
          }

          if (!isPriceBase(currentValue) && !isPriceBase(originalPrice)) {
            return {
              ...accumulator,
              [`prices[${index}].priceId`]: compare(getPriceId(currentValue.price), getPriceId(originalPrice.price)),
              [`prices[${index}].quantity`]: compare(currentValue.quantity, originalPrice.quantity),
            };
          }

          return {
            ...accumulator,
            [`prices[${index}]`]: compare(currentDocument.prices?.[index], originalDocument.prices?.[index]),
          };
        }, {}),
      };
    });

    const message = comparer.validate(currentDocument, '_id', 'createdAt', 'updatedAt', 'expiresAt', 'customer', 'prices', 'resolution', 'transaction');

    return {
      pass: !message,
      message: () => message,
    };
  },
  async toMatchCalendarDayDocumentInResponseList(received: APIResponse, dayInput: Calendar.DayProp['day'], calendarEntryDocument: Calendar.Entry.Document, calendarDayDocument?: Calendar.Day.Document) {
    const response = await received.json() as Calendar.Day.Response[];
    const matchingResponse = response.find(r => r.day === dayInput);

    if (!matchingResponse) {
      return {
        pass: false,
        message: () => `expected response to contain a calendar day with day ${dayInput}, but it was not found`,
      };
    }

    if (matchingResponse.dayType === CalendarDayType.Workday) {
      const comparer = createComparer((compare) => {
        const entryResponse = matchingResponse.entries?.find(e => e.calendarEntryId === getCalendarEntryId(calendarEntryDocument));

        return {
          day: compare(matchingResponse.day, dayInput),
          dayType: compare(matchingResponse.dayType, CalendarDayType.Workday),
          start: compare(matchingResponse.start, calendarDayDocument?.start ?? WORKDAY_START),
          end: compare(matchingResponse.end, calendarDayDocument?.end ?? WORKDAY_END),
          ...validateCalendarEntryResponse(entryResponse, calendarEntryDocument).getNormalized('entries.'),
        };
      });

      const message = comparer.validate(matchingResponse, 'entries');  
      return {
        pass: !message,
        message: () => message,
      };
    }

    if (matchingResponse.dayType === CalendarDayType.Weekend) {
      const comparer = createComparer((compare) => {
        const entryResponse = matchingResponse.entries?.find(e => e.calendarEntryId === getCalendarEntryId(calendarEntryDocument));

        return {
          day: compare(matchingResponse.day, dayInput),
          dayType: compare(matchingResponse.dayType, CalendarDayType.Weekend),
          start: compare(matchingResponse.start, calendarDayDocument?.start ?? undefined),
          end: compare(matchingResponse.end, calendarDayDocument?.end ?? undefined),
          ...validateCalendarEntryResponse(entryResponse, calendarEntryDocument).getNormalized('entries.'),
        };
      });

      const message = comparer.validate(matchingResponse, 'entries');  
      return {
        pass: !message,
        message: () => message,
      };
    }

    if (matchingResponse.dayType === CalendarDayType.Vacation) {
      const comparer = createComparer((compare) => {
        const entryResponse = matchingResponse.entries?.find(e => e.calendarEntryId === getCalendarEntryId(calendarEntryDocument));

        return {
          day: compare(matchingResponse.day, dayInput),
          dayType: compare(matchingResponse.dayType, CalendarDayType.Vacation),
          ...validateCalendarEntryResponse(entryResponse, calendarEntryDocument).getNormalized('entries.'),
        };
      });

      const message = comparer.validate(matchingResponse, 'entries');  
      return {
        pass: !message,
        message: () => message,
      };
    }

    const comparer = createComparer((compare) => {
      const entryResponse = matchingResponse.entries?.find(e => e.calendarEntryId === getCalendarEntryId(calendarEntryDocument));

      return {
        day: compare(matchingResponse.day, dayInput),
        dayType: compare(matchingResponse.dayType, CalendarDayType.Holiday),
        ...validateCalendarEntryResponse(entryResponse, calendarEntryDocument).getNormalized('entries.'),
      };
    });

    const message = comparer.validate(matchingResponse, 'entries');  
    return {
      pass: !message,
      message: () => message,
    };

  },
});
