import { Calendar, Customer, Price, Transaction } from '@household/shared/types/types';
import { CalendarDayType, CalendarEntryResolutionStatus } from '@household/shared/enums';
import { addSeconds, getCustomerId, getPriceId } from '@household/shared/common/utils';
import { calendarEntryDocumentConverter } from '@household/shared/dependencies/converters/calendar-entry-document-converter';
import { createId } from '@household/test/utils';
import { testDataFactory } from '@household/shared/common/test-data-factory';

export const calendarDayDataFactory = (() => {
  const createCalendarWorkdayDocument = (ctx?: Partial<Calendar.DayProp> & Partial<Calendar.Day.WorkdayRequest>): Calendar.Day.Document => {
    const { day, ...body } = ctx ?? {};
    const expiresAt = addSeconds(Number(process.env.EXPIRES_IN));
    return {
      day: day ?? testDataFactory.calendar.day.futureDay(),
      ...testDataFactory.calendar.day.request.workday(body),
      expiresAt,
    };
  };

  const createCalendarVacationdayDocument = (ctx?: Partial<Calendar.DayProp>): Calendar.Day.Document => {
    const expiresAt = addSeconds(Number(process.env.EXPIRES_IN));
    return {
      day: testDataFactory.calendar.day.futureDay(),
      dayType: CalendarDayType.Vacation,
      expiresAt,  
      end: undefined,
      start: undefined,
      ...ctx,
    };
  };

  const createCalendarHolidayDocument = (ctx?: Partial<Calendar.DayProp>): Calendar.Day.Document => {
    const expiresAt = addSeconds(Number(process.env.EXPIRES_IN));
    return {
      day: testDataFactory.calendar.day.futureDay(),
      dayType: CalendarDayType.Holiday,
      expiresAt,  
      end: undefined,
      start: undefined,
      ...ctx,
    };
  };

  return {
    request: testDataFactory.calendar.day.request,
    pastDay: testDataFactory.calendar.day.pastDay,
    futureDay: testDataFactory.calendar.day.futureDay,
    futureWorkday: testDataFactory.calendar.day.futureWorkday,
    futureWeekend: testDataFactory.calendar.day.futureWeekend,
    document: {
      work: createCalendarWorkdayDocument,
      vacation: createCalendarVacationdayDocument,
      holiday: createCalendarHolidayDocument,
    },
  };
})();

export const calendarEntryDataFactory = (() => {
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
        body: testDataFactory.calendar.entry.request.work({
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
      }, Number(process.env.EXPIRES_IN), true),
      resolution: ctx?.resolution ? {
        status: ctx?.resolution.transaction ? CalendarEntryResolutionStatus.Paid : ctx.resolution.status ?? CalendarEntryResolutionStatus.Paid,
        delay: ctx.resolution.status !== CalendarEntryResolutionStatus.NoShow ? ctx.resolution.delay : undefined,
      } : undefined,
      transaction: ctx?.resolution?.transaction,
    };
  };

  const createCalendarPersonalEntryDocument = (ctx?: Omit<Partial<Calendar.Entry.PersonalEntryRequest>, 'entryType'>): Calendar.Entry.Document => {
    return calendarEntryDocumentConverter.create({
      body: testDataFactory.calendar.entry.request.personal(ctx),
    }, Number(process.env.EXPIRES_IN), true);
  };

  const createCalendarIssueEntryDocument = (ctx?: Omit<Partial<Calendar.Entry.IssueEntryRequest>, 'entryType'>): Calendar.Entry.Document => {
    return calendarEntryDocumentConverter.create({
      body: testDataFactory.calendar.entry.request.issue(ctx),
    }, Number(process.env.EXPIRES_IN), true);
  };

  return {
    request: testDataFactory.calendar.entry.request,
    document: {
      personal: createCalendarPersonalEntryDocument,
      issue: createCalendarIssueEntryDocument,
      work: createCalendarWorkEntryDocument,
    },
    resolutionRequest: testDataFactory.calendar.entry.resolution.request,
    id: (createId<Calendar.Entry.Id>),
  };
})();
