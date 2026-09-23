import { CustomerJob } from '@hairdressing/types';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';

export const calendarEvents = eventGroup({
  source: 'Calendar',
  events: {
    listCalendarWeek: type<{year: number; week: number}>(),
    listCalendarMonth: type<Date>(),
    payCalendarWorkEntry: type<Responses.CalendarEntryWork>(),
    viewCalendarEntry: type<Responses.CalendarEntry>(),
    setWorkDay: type<Exclude<Responses.CalendarDay, Responses.CalendarDayHoliday>>(),
    createCalendarEntry: type<Api.Calendar.Entry.EntryType>(),
    updateCalendarEntry: type<Responses.CalendarEntry>(),
    deleteCalendarEntry: type<Pick<Responses.CalendarEntry, 'calendarEntryId' | 'title'>>(),
    setCashPaymentDialog: type<Responses.CalendarEntryWork>(),
    confirmCalendarEntryProposal: type<Api.Calendar.Day & {customerJob: CustomerJob; timeInterval: Api.Calendar.TimeInterval}>(),
    confirmNoShowResolution: type<Responses.CalendarEntry>(),
    createCalendarEntryWithProposal: type<Api.Calendar.Day & {customerJob: CustomerJob; timeInterval: Api.Calendar.TimeInterval}>(),
  },
});

export const calendarApiEvents = eventGroup({
  source: 'Calendar API',
  events: {
    listCalendarDaysInitiated: type<Api.Calendar.DateRange>(),
    listCalendarDaysCompleted: type<Responses.CalendarDay[]>(),
    updateCalendarDayInitiated: type<Api.Calendar.Day & Requests.CalendarDay>(),
    updateCalendarDayCompleted: type<Api.Calendar.Day & Requests.CalendarDay>(),
    deleteCalendarDayInitiated: type<Api.Calendar.Day>(),
    deleteCalendarDayCompleted: type<Api.Calendar.Day>(),
    createCalendarEntryInitiated: type<Requests.CalendarEntry>(),
    createCalendarEntryCompleted: type<Api.Calendar.Entry.CalendarEntryId & Requests.CalendarEntry & {customer: Responses.Customer }>(),
    updateCalendarEntryInitiated: type<Api.Calendar.Entry.CalendarEntryId & Requests.CalendarEntry>(),
    updateCalendarEntryCompleted: type<Api.Calendar.Entry.CalendarEntryId & Requests.CalendarEntry & {customer: Responses.Customer }>(),
    deleteCalendarEntryInitiated: type<Api.Calendar.Entry.CalendarEntryId>(),
    deleteCalendarEntryCompleted: type<Api.Calendar.Entry.CalendarEntryId>(),
    resolveCalendarWorkEntryInitiated: type<Api.Calendar.Entry.CalendarEntryId & Api.Calendar.Day & Requests.CalendarEntryResolution>(),
    resolveCalendarWorkEntryCompleted: type<Api.Calendar.Entry.CalendarEntryId & Api.Calendar.Day & Requests.CalendarEntryResolution>(),
  },
});
