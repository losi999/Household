import { DataFactoryFunction } from '@household/shared/types/common';
import { Calendar, Customer, Price } from '@household/shared/types/types';
import { faker } from '@faker-js/faker';
import { WORKDAY_END, WORKDAY_START } from '@household/shared/constants';
import { CalendarDayType, CalendarEntryType, PaymentType } from '@household/shared/enums';
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

  const createCalendarVacationRequest: DataFactoryFunction<Calendar.Day.VacationRequest> = (req) => {
    return {
      dayType: CalendarDayType.Vacation,
      ...req,
    };
  };

  const createCalendarDayDocument = (ctx?: (Partial<Calendar.DayProp> & Calendar.Day.DayType<CalendarDayType.Holiday | CalendarDayType.Vacation>) | (Partial<Calendar.DayProp> & Calendar.Day.DayType<CalendarDayType.Workday> & {
    body?: Omit<Partial<Calendar.Day.WorkdayRequest>, 'dayType'>
  })): Calendar.Day.Document => {
    const day = ctx?.day ?? createFutureCalendarDay();
    const dayType = ctx?.dayType ?? CalendarDayType.Workday;
    const expiresAt = addSeconds(Cypress.env('EXPIRES_IN'));

    if (dayType === CalendarDayType.Workday) {
      return {
        day,
        ...createCalendarWorkdayRequest(),
        expiresAt,
      };
    }

    return {
      day,
      ...createCalendarVacationRequest(),
      dayType,
      expiresAt,  
      end: undefined,
      start: undefined,
    };
    
  };

  return {
    workdayRequest: createCalendarWorkdayRequest,
    vacationRequest: createCalendarVacationRequest,
    pastDay: createPastCalendarDay,
    futureDay: createFutureCalendarDay,
    document: createCalendarDayDocument,
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

  const createCalendarEntryDocument = (ctx?: {
    body?: Omit<Partial<Calendar.Entry.WorkEntryRequest>, 'entryType'>;
    entryType: CalendarEntryType.Work;
    customer: Customer.Document;
    prices?: {
      custom?: Partial<Price.Base>[];
      listed?: (Partial<Customer.Job.Quantity> & {price: Price.Document})[];
    } ; 
  } | {
    body?: Omit<Partial<Calendar.Entry.PersonalEntryRequest>, 'entryType'>;
    entryType: CalendarEntryType.Personal;
  }| {
    body?: Omit<Partial<Calendar.Entry.IssueEntryRequest>, 'entryType'>;
    entryType: CalendarEntryType.Issue;
  }): Calendar.Entry.Document => {
    switch (ctx?.entryType) {
      case CalendarEntryType.Issue: {
        return calendarEntryDocumentConverter.create({
          body: createCalendarIssueEntryRequest(ctx?.body),
        }, Cypress.env('EXPIRES_IN'), true);
      }
      case CalendarEntryType.Work: {
        return calendarEntryDocumentConverter.create({
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
        }, Cypress.env('EXPIRES_IN'), true);
      }
      case CalendarEntryType.Personal: 
      default:{
        return calendarEntryDocumentConverter.create({
          body: createCalendarPersonalEntryRequest(ctx?.body),
        }, Cypress.env('EXPIRES_IN'), true);
      }
    }
  };

  const createPaymentRequest: DataFactoryFunction<Calendar.Entry.PaymentRequest> = (req) => {
    return {
      paymentType: PaymentType.Cash,
      amount: faker.number.int({
        min: 1,
        max: 10000,
      }), 
      ...req,
    };
  }; 

  return {
    personalEntryRequest: createCalendarPersonalEntryRequest,
    issueEntryRequest: createCalendarIssueEntryRequest,
    workEntryRequest: createCalendarWorkEntryRequest,
    document: createCalendarEntryDocument,
    paymentRequest: createPaymentRequest,
    id: (createId<Calendar.Entry.Id>),
  };
})();
