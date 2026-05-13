import { CustomerJob } from '@hairdressing/types';
import { Calendar, Customer } from '@household/shared/types/types';
import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';

export const calendarEvents = eventGroup({
  source: 'Calendar',
  events: {
    listCalendarWeek: type<{year: number; week: number}>(),
    listCalendarMonth: type<Date>(),
    payCalendarWorkEntry: type<Calendar.Entry.WorkEntryResponse>(),
    viewCalendarEntry: type<Calendar.Entry.Response>(),
    setWorkDay: type<Exclude<Calendar.Day.Response, Calendar.Day.HolidayResponse>>(),
    createCalendarEntry: type<Calendar.Entry.EntryType>(),
    updateCalendarEntry: type<Calendar.Entry.Response>(),
    deleteCalendarEntry: type<Pick<Calendar.Entry.Response, 'calendarEntryId' | 'title'>>(),
    setCashPaymentDialog: type<Calendar.Entry.WorkEntryResponse>(),
    confirmCalendarEntryProposal: type<Calendar.DayProp & {customerJob: CustomerJob; timeInterval: Calendar.TimeInterval}>(),
    confirmNoShowResolution: type<Calendar.Entry.Response>(),
    createCalendarEntryWithProposal: type<Calendar.DayProp & {customerJob: CustomerJob; timeInterval: Calendar.TimeInterval}>(),
  },
});

export const calendarApiEvents = eventGroup({
  source: 'Calendar API',
  events: {
    listCalendarDaysInitiated: type<Calendar.DateRange>(),
    listCalendarDaysCompleted: type<Calendar.Day.Response[]>(),
    updateCalendarDayInitiated: type<Calendar.DayProp & Calendar.Day.Request>(),
    updateCalendarDayCompleted: type<Calendar.DayProp & Calendar.Day.Request>(),
    deleteCalendarDayInitiated: type<Calendar.DayProp>(),
    deleteCalendarDayCompleted: type<Calendar.DayProp>(),
    createCalendarEntryInitiated: type<Calendar.Entry.Request>(),
    createCalendarEntryCompleted: type<Calendar.Entry.CalendarEntryId & Calendar.Entry.Request & {customer: Customer.Response }>(),
    updateCalendarEntryInitiated: type<Calendar.Entry.CalendarEntryId & Calendar.Entry.Request>(),
    updateCalendarEntryCompleted: type<Calendar.Entry.CalendarEntryId & Calendar.Entry.Request & {customer: Customer.Response }>(),
    deleteCalendarEntryInitiated: type<Calendar.Entry.CalendarEntryId>(),
    deleteCalendarEntryCompleted: type<Calendar.Entry.CalendarEntryId>(),
    resolveCalendarWorkEntryInitiated: type<Calendar.Entry.CalendarEntryId & Calendar.DayProp & Calendar.Entry.ResolutionRequest>(),
    resolveCalendarWorkEntryCompleted: type<Calendar.Entry.CalendarEntryId & Calendar.DayProp & Calendar.Entry.ResolutionRequest>(),
  },
});
