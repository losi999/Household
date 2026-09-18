import { CalendarDayType, CalendarEntryResolutionStatus } from '@household/shared/enums';
import { addSeconds, getCustomerId, getPriceId } from '@household/shared/common/utils';
import { calendarEntryDocumentConverter } from '@household/shared/dependencies/converters/calendar-entry-document-converter';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { Api } from '@household/shared/types/api';
import { Documents } from '@household/shared/types/documents';
import { Requests } from '@household/shared/types/requests';

export const calendarDayDataFactory = (() => {
  const createCalendarWorkdayDocument = (ctx?: Partial<Api.Calendar.Day> & Partial<Requests.CalendarDayWorkday>): Documents.CalendarDay => {
    const { day, ...body } = ctx ?? {};
    const expiresAt = addSeconds(Number(process.env.EXPIRES_IN));
    return {
      day: day ?? testDataFactory.calendar.day.futureDay(),
      ...testDataFactory.calendar.day.request.workday(body),
      expiresAt,
    };
  };

  const createCalendarVacationdayDocument = (ctx?: Partial<Api.Calendar.Day>): Documents.CalendarDay => {
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

  const createCalendarHolidayDocument = (ctx?: Partial<Api.Calendar.Day>): Documents.CalendarDay => {
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
    body?: Omit<Partial<Requests.CalendarEntryWork>, 'entryType'>;
    customer: Documents.Customer;
    prices?: (Partial<Api.Customer.Job.Quantity> & {price: Documents.Price})[];
    resolution?: {
      transaction?: Documents.PaymentTransaction;
    } & Partial<Api.Calendar.Entry.Delay>
    & Partial<Api.Calendar.Entry.Status<CalendarEntryResolutionStatus>>
  }): Documents.CalendarEntry => {

    return {
      ...calendarEntryDocumentConverter.create({
        body: testDataFactory.calendar.entry.request.work({
          body: {
            ...ctx?.body,
            customerId: getCustomerId(ctx?.customer),
          },
          prices: ctx?.prices?.map(({ price, ...rest }) => {
            return {
              priceId: getPriceId(price),
              ...rest,
            };
          }),
        }),
        customer: ctx?.customer,
        prices: ctx?.prices?.map((p) => p.price) ?? [],
      }, Number(process.env.EXPIRES_IN), true),
      resolution: ctx?.resolution ? {
        status: ctx?.resolution.transaction ? CalendarEntryResolutionStatus.Paid : ctx.resolution.status ?? CalendarEntryResolutionStatus.Paid,
        delay: ctx.resolution.status !== CalendarEntryResolutionStatus.NoShow ? ctx.resolution.delay : undefined,
      } : undefined,
      transaction: ctx?.resolution?.transaction,
    };
  };

  const createCalendarPersonalEntryDocument = (ctx?: Omit<Partial<Requests.CalendarEntryPersonal>, 'entryType'>): Documents.CalendarEntry => {
    return calendarEntryDocumentConverter.create({
      body: testDataFactory.calendar.entry.request.personal(ctx),
    }, Number(process.env.EXPIRES_IN), true);
  };

  const createCalendarIssueEntryDocument = (ctx?: Omit<Partial<Requests.CalendarEntryIssue>, 'entryType'>): Documents.CalendarEntry => {
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
    id: testDataFactory.calendar.entry.id,
  };
})();
