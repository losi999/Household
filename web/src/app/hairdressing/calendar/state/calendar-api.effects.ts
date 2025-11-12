import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, withLatestFrom } from 'rxjs';
import { progressActions } from '@household/web/state/progress/progress.actions';
import { notificationActions } from '@household/web/state/notification/notification.actions';
import { calendarApiActions } from '@household/web/app/hairdressing/calendar/state/calendar.actions';
import { Store } from '@ngrx/store';
import { CalendarService } from '@household/web/services/calendar.service';
import { selectCustomerById } from '@household/web/app/hairdressing/customer/state/customer.selector';
import { CalendarEntryType } from '@household/shared/enums';

@Injectable()
export class CalendarApiEffects {
  constructor(private actions: Actions, private store: Store, private calendarService: CalendarService) {}

  listCalendarDays = createEffect(() => {
    return this.actions.pipe(
      ofType(calendarApiActions.listCalendarDaysInitiated),
      mergeMap(({ dateFrom, dateTo }) => this.calendarService.listCalendarDays({
        dateFrom,
        dateTo,
      })),
      map((days) => calendarApiActions.listCalendarDaysCompleted({
        days,
      })),
      catchError(() => {
        return of(progressActions.processFinished(),
          notificationActions.showMessage({
            message: 'Hiba történt',
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
  
  resolveCalendarWorkEntry = createEffect(() => {
    return this.actions.pipe(
      ofType(calendarApiActions.resolveCalendarWorkEntryInitiated),
      mergeMap(({ type, calendarEntryId, day, ...request }) => {
        return this.calendarService.resolveCalendarWorkEntry(calendarEntryId, request).pipe(
          map(() => 
            calendarApiActions.resolveCalendarWorkEntryCompleted({
              calendarEntryId,
              day,
              ...request,
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

