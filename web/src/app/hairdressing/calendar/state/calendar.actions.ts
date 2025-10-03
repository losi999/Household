import { Calendar, Customer } from '@household/shared/types/types';
import { createActionGroup, props } from '@ngrx/store';

export const calendarActions = createActionGroup({
  source: 'Calendar',
  events: {
    'List calendar month': props<{date: Date}>(),
    'Open paying dialog': props<Calendar.Entry.WorkEntryResponse>(),
  },
});

export const calendarApiActions = createActionGroup({
  source: 'Calendar API',
  events: {
    'List calendar days initiated': props<Calendar.DateRange>(),
    'List calendar days completed': props<Calendar.DateRange & {entries: Calendar.Day.Response[]}>(),
    'Update calendar day initiated': props<Calendar.DayProp & Calendar.Day.Request>(),
    'Update calendar day completed': props<Calendar.DayProp & Calendar.Day.Request>(),
    'Delete calendar day initiated': props<Calendar.DayProp>(),
    'Delete calendar day completed': props<Calendar.DayProp>(),
    'Create calendar entry initiated': props<Calendar.Entry.Request>(),
    'Create calendar entry completed': props<Calendar.Entry.CalendarEntryId & Calendar.Entry.Request & {customer: Customer.Response }>(),
    'Update calendar entry initiated': props<Calendar.Entry.CalendarEntryId & Calendar.Entry.Request>(),
    'Update calendar entry completed': props<Calendar.Entry.CalendarEntryId & Calendar.Entry.Request & {customer: Customer.Response }>(),
    'Delete calendar entry initiated': props<Calendar.Entry.CalendarEntryId>(),
    'Delete calendar entry completed': props<Calendar.Entry.CalendarEntryId>(),
    'Pay calendar work entry initiated': props<Calendar.Entry.CalendarEntryId & Calendar.DayProp & Calendar.Entry.PaymentRequest>(),
    'Pay calendar work entry completed': props<Calendar.Entry.CalendarEntryId & Calendar.DayProp>(),
  },
});
