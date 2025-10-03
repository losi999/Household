import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, withLatestFrom } from 'rxjs';
import { progressActions } from '@household/web/state/progress/progress.actions';
import { notificationActions } from '@household/web/state/notification/notification.actions';
import { calendarActions, calendarApiActions } from '@household/web/state/calendar/calendar.actions';
import { Store } from '@ngrx/store';
import { CalendarService } from '@household/web/services/calendar.service';
import { selectCustomerById } from '@household/web/state/customer/customer.selector';
import { CalendarEntryType } from '@household/shared/enums';
import { dateToISODateString } from '@household/shared/common/utils';

@Injectable()
export class CalendarEffects {
  constructor(private actions: Actions, private store: Store, private calendarService: CalendarService) {}

  loadCalendarMonth = createEffect(() => {
    return this.actions.pipe(
      ofType(calendarActions.listCalendarMonth),
      mergeMap(({ date }) => {
        const dateFrom = dateToISODateString(new Date(date.getFullYear(), date.getMonth(), 1));
        const dateTo = dateToISODateString(new Date(date.getFullYear(), date.getMonth() + 1, 0));

        return this.calendarService.listCalendarDays({
          dateFrom,
          dateTo,
        }).pipe(
          map((entries) => calendarApiActions.listCalendarDaysCompleted({
            entries,
            dateFrom,
            dateTo,
          })),
          catchError(() => {
            return of(progressActions.processFinished(),
              notificationActions.showMessage({
                message: 'Hiba történt',
              }),
            );
          }),
        );
      }),
    );
  });

  loadCalendarDays = createEffect(() => {
    return this.actions.pipe(
      ofType(calendarApiActions.listCalendarDaysInitiated),
      mergeMap(({ dateFrom, dateTo }) => {
        return this.calendarService.listCalendarDays({
          dateFrom,
          dateTo,
        }).pipe(
          map((entries) => calendarApiActions.listCalendarDaysCompleted({
            entries,
            dateFrom,
            dateTo,
          })),
          catchError(() => {
            return of(progressActions.processFinished(),
              notificationActions.showMessage({
                message: 'Hiba történt',
              }),
            );
          }),
        );
      }),
    );
  });

  updateCalendarDay = createEffect(() => {
    return this.actions.pipe(
      ofType(calendarApiActions.updateCalendarDayInitiated),
      mergeMap(({ type, day, ...request }) => {
        return this.calendarService.updateCalendarDay(day, request).pipe(
          map(() => calendarApiActions.updateCalendarDayCompleted({
            day,
            ...request,
          })),
          catchError(() => {
            return of(progressActions.processFinished(),
              notificationActions.showMessage({
                message: 'Hiba történt',
              }),
            );
          }),
        );
      }),
    );
  });

  deleteCalendarDay = createEffect(() => {
    return this.actions.pipe(
      ofType(calendarApiActions.deleteCalendarDayInitiated),
      mergeMap(({ day }) => {
        return this.calendarService.deleteCalendarDay(day).pipe(
          map(() => calendarApiActions.deleteCalendarDayCompleted({
            day,            
          })),
          catchError(() => {
            return of(progressActions.processFinished(),
              notificationActions.showMessage({
                message: 'Hiba történt',
              }),
            );
          }),
        );
      }),
    );
  });
  
  createCalendarEntry = createEffect(() => {
    return this.actions.pipe(
      ofType(calendarApiActions.createCalendarEntryInitiated),
      mergeMap(({ type, ...request }) => {
        return this.calendarService.createCalendarEntry(request).pipe(
          withLatestFrom(request.entryType === CalendarEntryType.Work ? this.store.select(selectCustomerById(request.customerId)) : of(undefined)),
          map(([
            { calendarEntryId },
            customer,
          ]) => {

            return calendarApiActions.createCalendarEntryCompleted({
              calendarEntryId,
              ...request,
              customer,
            });
          }),
            
          catchError(() => {
            return of(progressActions.processFinished(),
              notificationActions.showMessage({
                message: 'Hiba történt',
              }),
            );
          }),
        );
      }),
    );
  });
  
  updateCalendarEntry = createEffect(() => {
    return this.actions.pipe(
      ofType(calendarApiActions.updateCalendarEntryInitiated),
      mergeMap(({ type, calendarEntryId, ...request }) => {
        return this.calendarService.updateCalendarEntry(calendarEntryId, request).pipe(
          withLatestFrom(request.entryType === CalendarEntryType.Work ? this.store.select(selectCustomerById(request.customerId)) : of(undefined)), 
          map(([
            { calendarEntryId },
            customer,
          ]) => calendarApiActions.updateCalendarEntryCompleted({
            calendarEntryId,
            ...request,
            customer,
          })),
          catchError(() => {
            return of(progressActions.processFinished(),
              notificationActions.showMessage({
                message: 'Hiba történt',
              }),
            );
          }),
        );
      }),
    );
  });
  
  deleteCalendarEntry = createEffect(() => {
    return this.actions.pipe(
      ofType(calendarApiActions.deleteCalendarEntryInitiated),
      mergeMap(({ calendarEntryId }) => {
        return this.calendarService.deleteCalendarEntry(calendarEntryId).pipe(
          map(() => calendarApiActions.deleteCalendarEntryCompleted({
            calendarEntryId, 
          })),
          catchError(() => {
            return of(progressActions.processFinished(),
              notificationActions.showMessage({
                message: 'Hiba történt',
              }),
            );
          }),
        );
      }),
    );
  });
  
  payCalendarworkEntry = createEffect(() => {
    return this.actions.pipe(
      ofType(calendarApiActions.payCalendarWorkEntryInitiated),
      mergeMap(({ type, calendarEntryId, day, ...request }) => {
        return this.calendarService.payCalendarWorkEntry(calendarEntryId, request).pipe(
          map(() => 
            calendarApiActions.payCalendarWorkEntryCompleted({
              calendarEntryId,
              day,
            }),
          ),
          catchError(() => {
            return of(progressActions.processFinished(),
              notificationActions.showMessage({
                message: 'Hiba történt',
              }),
            );
          }),
        );
      }),
    );
  });
}

