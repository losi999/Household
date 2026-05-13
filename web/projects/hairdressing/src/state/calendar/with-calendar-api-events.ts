import { inject } from '@angular/core';
import { CalendarService } from '@hairdressing/services/calendar.service';
import { calendarApiEvents } from '@hairdressing/state/calendar/calendar-events';
import { CustomerStore } from '@hairdressing/state/customer/customer-store';
import { notificationEvents } from '@household/shared-ui';
import { CalendarEntryType } from '@household/shared/enums';
import { signalStoreFeature } from '@ngrx/signals';
import { Events, withEventHandlers } from '@ngrx/signals/events';
import { mergeMap, map, catchError } from 'rxjs';

export const withCalendarApiEvents = () => {
  return signalStoreFeature(
    withEventHandlers(() => {
      const events = inject(Events);
      const calendarService = inject(CalendarService);
      const customerStore = inject(CustomerStore);

      return {
        listCalendarDays: events.on(calendarApiEvents.listCalendarDaysInitiated).pipe(
          mergeMap(({ payload: { dateFrom, dateTo } }) => calendarService.listCalendarDays({
            dateFrom,
            dateTo,
          })),
          map((days) => calendarApiEvents.listCalendarDaysCompleted(days)),
          catchError(() => {
            return [notificationEvents.showMessage('Hiba történt')];
          })),
        updateCalendarDay: events.on(calendarApiEvents.updateCalendarDayInitiated).pipe(
          mergeMap(({ payload: { day, ...request } }) => {
            return calendarService.updateCalendarDay(day, request).pipe(
              map(() => calendarApiEvents.updateCalendarDayCompleted({
                day,
                ...request,
              })),
              catchError(() => {
                return [notificationEvents.showMessage('Hiba történt')];
              }),
            );
          }),
        ),
        deleteCalendarDay: events.on(calendarApiEvents.deleteCalendarDayInitiated).pipe(
          mergeMap(({ payload: { day } }) => {
            return calendarService.deleteCalendarDay(day).pipe(
              map(() => calendarApiEvents.deleteCalendarDayCompleted({
                day,            
              })),
              catchError(() => {
                return [notificationEvents.showMessage('Hiba történt')];
              }),
            );
          }),
        ),
        createCalendarEntry: events.on(calendarApiEvents.createCalendarEntryInitiated).pipe(
          mergeMap(({ payload }) => {
            return calendarService.createCalendarEntry(payload).pipe(
              map(({ calendarEntryId }) => {
                return calendarApiEvents.createCalendarEntryCompleted({
                  calendarEntryId,
                  ...payload,
                  customer: payload.entryType === CalendarEntryType.Work ? customerStore.customerList().find(c => c.customerId === payload.customerId) : undefined,
                });
              }),
              catchError(() => {
                return [notificationEvents.showMessage('Hiba történt')];
              }),
            );
          }),
        ),
        updateCalendarEntry: events.on(calendarApiEvents.updateCalendarEntryInitiated).pipe(
          mergeMap(({ payload: { calendarEntryId, ...request } }) => {
            return calendarService.updateCalendarEntry(calendarEntryId, request).pipe(
              map(({ calendarEntryId }) => calendarApiEvents.updateCalendarEntryCompleted({
                calendarEntryId,
                ...request,
                customer: request.entryType === CalendarEntryType.Work ? customerStore.customerList().find(c => c.customerId === request.customerId) : undefined,
              })),
              catchError(() => {
                return [notificationEvents.showMessage('Hiba történt')];
              }),
            );
          }),
        ),
        deleteCalendarEntry: events.on(calendarApiEvents.deleteCalendarEntryInitiated).pipe(
          mergeMap(({ payload: { calendarEntryId } }) => {
            console.log('delete entry', calendarEntryId);
            return calendarService.deleteCalendarEntry(calendarEntryId).pipe(
              map(() => calendarApiEvents.deleteCalendarEntryCompleted({
                calendarEntryId, 
              })),
              catchError(() => {
                return [notificationEvents.showMessage('Hiba történt')];
              }),
            );
          }),
        ),
        resolveCalendarWorkEntry: events.on(calendarApiEvents.resolveCalendarWorkEntryInitiated).pipe(
          mergeMap(({ payload: { calendarEntryId, day, ...request } }) => {
            return calendarService.resolveCalendarWorkEntry(calendarEntryId, request).pipe(
              map(() => 
                calendarApiEvents.resolveCalendarWorkEntryCompleted({
                  calendarEntryId,
                  day,
                  ...request,
                }),
              ),
              catchError(() => {
                return [notificationEvents.showMessage('Hiba történt')];
              }),
            );
          }),
        ),
      };
    }),
  );
};
