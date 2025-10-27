import { DataFactoryFunction } from '@household/shared/types/common';
import { Calendar, Customer, Price, Transaction } from '@household/shared/types/types';
import { faker } from '@faker-js/faker';
import { WORKDAY_END, WORKDAY_START } from '@household/shared/constants';
import { CalendarDayType, CalendarEntryResolutionStatus, CalendarEntryType } from '@household/shared/enums';
import { addSeconds, dateToISODateString, getCustomerId, getPriceId } from '@household/shared/common/utils';
import { calendarEntryDocumentConverter } from '@household/shared/dependencies/converters/calendar-entry-document-converter';
import { createId } from '@household/test/api/utils';

export const calendarDayDataFactory = (() => {
  const createPastCalendarDay = () => {
    return dateToISODateString(faker.date.recent({
      days: 50,
    }));
  };

  const createFutureCalendarDay = () => {
    return dateToISODateString(faker.date.soon({
      days: 50,
    }));
  };

  const createCalendarWorkdayRequest: DataFactoryFunction<Calendar.Day.WorkdayRequest> = (req) => {
    const start = faker.number.int({
      min: WORKDAY_START,
      max: WORKDAY_END - 1,
    });

    return {
      dayType: CalendarDayType.Workday,
      start,
      end: faker.number.int({
        min: start + 1,
        max: WORKDAY_END,
      }),
      ...req,
    };
  };

  const createCalendarVacationRequest = (): Calendar.Day.VacationRequest => {
    return {
      dayType: CalendarDayType.Vacation,
    };
  };

  const createCalendarWorkdayDocument = (ctx?: Partial<Calendar.DayProp> & Partial<Calendar.Day.WorkdayRequest>): Calendar.Day.Document => {
    const { day, ...body } = ctx ?? {};
    const expiresAt = addSeconds(Cypress.env('EXPIRES_IN'));
    return {
      day: day ?? createFutureCalendarDay(),
      ...createCalendarWorkdayRequest(body),
      expiresAt,
    };
  };

  const createCalendarVacationdayDocument = (ctx?: Partial<Calendar.DayProp>): Calendar.Day.Document => {
    const expiresAt = addSeconds(Cypress.env('EXPIRES_IN'));
    return {
      day: createFutureCalendarDay(),
      dayType: CalendarDayType.Vacation,
      expiresAt,  
      end: undefined,
      start: undefined,
      ...ctx,
    };
  };

  const createCalendarHolidayDocument = (ctx?: Partial<Calendar.DayProp>): Calendar.Day.Document => {
    const expiresAt = addSeconds(Cypress.env('EXPIRES_IN'));
    return {
      day: createFutureCalendarDay(),
      dayType: CalendarDayType.Holiday,
      expiresAt,  
      end: undefined,
      start: undefined,
      ...ctx,
    };
  };

  return {
    request: {
      work: createCalendarWorkdayRequest,
      vacation: createCalendarVacationRequest,
    },
    pastDay: createPastCalendarDay,
    futureDay: createFutureCalendarDay,
    document: {
      work: createCalendarWorkdayDocument,
      vacation: createCalendarVacationdayDocument,
      holiday: createCalendarHolidayDocument,
    },
  };
})();

export const calendarEntryDataFactory = (() => {
  const createCalendarPersonalEntryRequest: DataFactoryFunction<Calendar.Entry.PersonalEntryRequest> = (req) => {
    const start = faker.number.int({
      min: WORKDAY_START,
      max: WORKDAY_END - 1,
    });

    return {
      day: calendarDayDataFactory.futureDay(),
      description: faker.word.words({
        count: {
          min: 1,
          max: 5,
        },
      }),
      start,
      end: faker.number.int({
        min: start + 1,
        max: WORKDAY_END,
      }),
      entryType: CalendarEntryType.Personal,
      title: faker.company.buzzVerb(),
      ...req,
    };
  };

  const createCalendarIssueEntryRequest: DataFactoryFunction<Calendar.Entry.IssueEntryRequest> = (req) => {
    const start = faker.number.int({
      min: WORKDAY_START,
      max: WORKDAY_END - 1,
    });

    return {
      day: calendarDayDataFactory.futureDay(),
      description: faker.word.words({
        count: {
          min: 1,
          max: 5,
        },
      }),
      start,
      end: faker.number.int({
        min: start + 1,
        max: WORKDAY_END,
      }),
      entryType: CalendarEntryType.Issue,
      title: faker.company.buzzVerb(),
      ...req,
    };
  };

  const createCalendarWorkEntryRequest = (ctx?: {
    body?: Partial<Omit<Calendar.Entry.WorkEntryRequest, 'prices'>>;
    prices?: {
      custom?: Partial<Price.Base>[];
      listed?: Partial<Customer.Job.ListedPrice<Price.PriceId>>[];
    }
  }): Calendar.Entry.WorkEntryRequest => {
    const start = faker.number.int({
      min: WORKDAY_START,
      max: WORKDAY_END - 1,
    });

    return {
      day: calendarDayDataFactory.futureDay(),
      description: faker.word.words({
        count: {
          min: 1,
          max: 5,
        },
      }),
      start,
      end: faker.number.int({
        min: start + 1,
        max: WORKDAY_END,
      }),
      entryType: CalendarEntryType.Work,
      title: faker.company.buzzVerb(),
      customerId: undefined,
      prices: (ctx?.prices?.custom || ctx?.prices?.listed) ? [
        ...ctx?.prices.custom?.map((p) => {
          return {
            name: faker.commerce.product(),
            amount: faker.number.int({
              min: 1,
              max: 10000,
            }), 
            ...p,
          };
        }) ?? [],
        ...ctx?.prices.listed?.map((p) => {
          return {
            priceId: p.priceId,
            quantity: faker.number.int({
              min: 1,
              max: 5,
            }),
            ...p,
          };
        }) ?? [],
      ] : undefined,
      ...ctx?.body,
    };
  };

  const createCalendarWorkEntryDocument = (ctx?: {
    body?: Omit<Partial<Calendar.Entry.WorkEntryRequest>, 'entryType'>;
    customer: Customer.Document;
    prices?: {
      custom?: Partial<Price.Base>[];
      listed?: (Partial<Customer.Job.Quantity> & {price: Price.Document})[];
    };
    resolution?: {
      transaction?: Transaction.PaymentDocument;
    } & Partial<Calendar.Entry.Delay>
    & Partial<Calendar.Entry.Status<CalendarEntryResolutionStatus>>
  }): Calendar.Entry.Document => {

    return {
      ...calendarEntryDocumentConverter.create({
        body: createCalendarWorkEntryRequest({
          body: {
            ...ctx?.body,
            customerId: getCustomerId(ctx?.customer),
          },
          prices: {
            custom: ctx?.prices?.custom,
            listed: ctx?.prices?.listed?.map(({ price, ...rest }) => {
              return {
                priceId: getPriceId(price),
                ...rest,
              };
            }),
          },
        }),
        customer: ctx?.customer,
        prices: ctx?.prices?.listed?.map((p) => p.price) ?? [],
      }, Cypress.env('EXPIRES_IN'), true),
      resolution: ctx?.resolution ? {
        status: ctx?.resolution.transaction ? CalendarEntryResolutionStatus.Paid : ctx.resolution.status ?? CalendarEntryResolutionStatus.Paid,
        delay: ctx.resolution.status !== CalendarEntryResolutionStatus.NoShow ? ctx.resolution.delay : undefined,
      } : undefined,
      transaction: ctx?.resolution?.transaction,
    };
  };

  const createCalendarPersonalEntryDocument = (ctx?: Omit<Partial<Calendar.Entry.PersonalEntryRequest>, 'entryType'>): Calendar.Entry.Document => {
    return calendarEntryDocumentConverter.create({
      body: createCalendarPersonalEntryRequest(ctx),
    }, Cypress.env('EXPIRES_IN'), true);
  };

  const createCalendarIssueEntryDocument = (ctx?: Omit<Partial<Calendar.Entry.IssueEntryRequest>, 'entryType'>): Calendar.Entry.Document => {
    return calendarEntryDocumentConverter.create({
      body: createCalendarIssueEntryRequest(ctx),
    }, Cypress.env('EXPIRES_IN'), true);
  };

  const createResolutionRequest: DataFactoryFunction<Calendar.Entry.ResolutionRequest> = (req) => {
    const status = req?.status ?? CalendarEntryResolutionStatus.Paid;
    
    return {
      status,
      amount: status === CalendarEntryResolutionStatus.Paid ? faker.number.int({
        min: 1,
        max: 10000,
      }) : undefined, 
      delay: status !== CalendarEntryResolutionStatus.NoShow ? faker.number.int({
        min: 1,
        max: 30,
      }) : undefined,
      ...req,
    };
  }; 

  return {
    request: {
      personal: createCalendarPersonalEntryRequest,
      issue: createCalendarIssueEntryRequest,
      work: createCalendarWorkEntryRequest,
    },
    document: {
      personal: createCalendarPersonalEntryDocument,
      issue: createCalendarIssueEntryDocument,
      work: createCalendarWorkEntryDocument,
    },
    resolutionRequest: createResolutionRequest,
    id: (createId<Calendar.Entry.Id>),
  };
})();
