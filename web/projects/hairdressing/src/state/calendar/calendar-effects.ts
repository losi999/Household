import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY, exhaustMap, filter, map, mergeMap, tap, withLatestFrom } from 'rxjs';
// import { calendarActions, calendarApiActions } from '@household/web/app/hairdressing/calendar/state/calendar.actions';
import { CalendarDayType, CalendarEntryResolutionStatus, CalendarEntryType } from '@household/shared/enums';
import { addDays, createDate, createWorkEntryTitle, dateToISODateString, timeSlotToTimeString } from '@household/shared/common/utils';
// import { CalendarWorkdayDialog, CalendarWorkdayDialogData, CalendarWorkdayDialogResult } from '@household/web/app/hairdressing/calendar/calendar-workday-dialog/calendar-workday-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '@household/shared-ui';
import { calendarActions, calendarApiActions } from '@hairdressing/state/calendar/calendar-actions';
import { selectQueryParams } from '@hairdressing/state/router/router-selector';
import { getRouterSelectors } from '@ngrx/router-store';
import { Store } from '@ngrx/store';
import { getISOWeek, startOfISOWeek, setISOWeek, startOfYear, endOfISOWeek, lastDayOfISOWeek, lastDayOfYear, lastDayOfISOWeekYear, startOfMonth, endOfMonth } from 'date-fns';
import { CalendarWorkdayDialog, CalendarWorkdayDialogData, CalendarWorkdayDialogResult } from '@hairdressing/app/calendar/calendar-workday-dialog/calendar-workday-dialog';
import { CalendarEntryDetailsDialog, CalendarEntryDetailsDialogData, CalendarEntryDetailsDialogResult } from '@hairdressing/app/calendar/calendar-entry-details-dialog/calendar-entry-details-dialog';
import { CalendarEntryPayingDialog, CalendarEntryPayingDialogData, CalendarEntryPayingDialogResult } from '@hairdressing/app/calendar/calendar-entry-paying-dialog/calendar-entry-paying-dialog';
// import { CalendarEntryDetailsDialog, CalendarEntryDetailsDialogData, CalendarEntryDetailsDialogResult } from '@household/web/app/hairdressing/calendar/calendar-entry-details-dialog/calendar-entry-details-dialog.component';
// import { CalendarEntryEditDialog, CalendarEntryEditDialogData, CalendarEntryEditDialogResult } from '@household/web/app/hairdressing/calendar/calendar-entry-edit-dialog/calendar-entry-edit-dialog.component';
// import { CalendarEntryPayingDialog, CalendarEntryPayingDialogData, CalendarEntryPayingDialogResult } from '@household/web/app/hairdressing/calendar/calendar-entry-paying-dialog/calendar-entry-paying-dialog.component';

@Injectable()
export class CalendarEffects {
  private store = inject(Store);
  private actions = inject(Actions);
  private dialog = inject(MatDialog);
  private dialogService = inject(DialogService);

  listCalendarWeek = createEffect(() => {
    return this.actions.pipe(
      ofType(calendarActions.listCalendarWeek),
      map(({ week, year },
      ) => {
        return calendarApiActions.listCalendarDaysInitiated({
          dateFrom: dateToISODateString(startOfISOWeek(setISOWeek(new Date(year, 0), week))),
          dateTo: dateToISODateString(endOfISOWeek(setISOWeek(new Date(year, 0), week))),
        });
      }),
    );
  });

  listCalendarMonth = createEffect(() => {
    return this.actions.pipe(
      ofType(calendarActions.listCalendarMonth),
      map(({ date }) => {
        const dateFrom = dateToISODateString(startOfMonth(date));
        const dateTo = dateToISODateString(endOfMonth(date));

        return calendarApiActions.listCalendarDaysInitiated({
          dateFrom,
          dateTo,
        });
      }),
    );
  });

  openSetWorkDayDialog = createEffect(() => {
    return this.actions.pipe(
      ofType(calendarActions.setWorkDay),
      exhaustMap(({ type, ...day }) => {
        return this.dialog.open<CalendarWorkdayDialog, CalendarWorkdayDialogData, CalendarWorkdayDialogResult>(CalendarWorkdayDialog, {
          data: day,
          width: '900px',
          disableClose: true,
        }).afterClosed();
      }),
      filter(req => !!req),
      map((value) => {
        if (!value.dayType) {
          return calendarApiActions.deleteCalendarDayInitiated({
            day: value.day,
          });
        }

        switch(value.dayType) {
          case CalendarDayType.Vacation: {
            return calendarApiActions.updateCalendarDayInitiated({
              dayType: CalendarDayType.Vacation,
              day: value.day,
            });
          }
          case CalendarDayType.Workday: {
            return calendarApiActions.updateCalendarDayInitiated({
              dayType: CalendarDayType.Workday,
              day: value.day,
              start: value.start,
              end: value.end,
            });
          }
        }
      }),
    );
  });

  openCalendarEntryDialog = createEffect(() => {
    return this.actions.pipe(
      ofType(calendarActions.viewCalendarEntry),
      exhaustMap(({ type, ...entry }) => {
        return this.dialog.open<CalendarEntryDetailsDialog, CalendarEntryDetailsDialogData, CalendarEntryDetailsDialogResult>(CalendarEntryDetailsDialog, {
          data: entry,
          width: '900px',
        }).afterClosed()
          .pipe(
            filter(result => !!result),
            map((result) => {
              switch(result) {
                case CalendarEntryDetailsDialogResult.Edit: {
                  return calendarActions.updateCalendarEntry(entry);
                }
                case CalendarEntryDetailsDialogResult.Delete: {
                  return calendarActions.deleteCalendarEntry({
                    calendarEntryId: entry.calendarEntryId,
                    title: entry.title,
                  });
                }
                case CalendarEntryDetailsDialogResult.Pay: {
                  if (entry.entryType === CalendarEntryType.Work) {
                    return calendarActions.payCalendarWorkEntry(entry);
                  }

                  return undefined;
                }
                case CalendarEntryDetailsDialogResult.NoShow: {
                  if (entry.entryType === CalendarEntryType.Work) {
                    return calendarActions.confirmNoShowResolution(entry);
                  }

                  return undefined;
                }
              }
            }),
          );
      }),
    );
  });

  // openCreateCalendarEntryDialog = createEffect(() => {
  //   return this.actions.pipe(
  //     ofType(calendarActions.createCalendarEntry),
  //     exhaustMap(({ entryType }) => {
  //       return this.dialog.open<CalendarEntryEditDialog, CalendarEntryEditDialogData, CalendarEntryEditDialogResult>(CalendarEntryEditDialog, {
  //         data: {
  //           entryType,
  //         },
  //         width: '900px',
  //         disableClose: true,
  //       }).afterClosed();
  //     }),
  //     filter(req => !!req),
  //     map((request) => {
  //       return calendarApiActions.createCalendarEntryInitiated(request);
  //     }),
  //   );
  // });

  // openUpdateCalendarEntryDialog = createEffect(() => {
  //   return this.actions.pipe(
  //     ofType(calendarActions.updateCalendarEntry),
  //     exhaustMap(({ type, ...entry }) => {
  //       return this.dialog.open<CalendarEntryEditDialog, CalendarEntryEditDialogData, CalendarEntryEditDialogResult>(CalendarEntryEditDialog, {
  //         data: entry,
  //         width: '900px',
  //         disableClose: true,
  //       }).afterClosed()
  //         .pipe(filter(req => !!req),
  //           map((request) => {
  //             return calendarApiActions.updateCalendarEntryInitiated({
  //               calendarEntryId: entry.calendarEntryId,
  //               ...request,
  //             });
  //           }));
  //     }),
  //   );
  // });
  
  openDeleteCalendarEntryDialog = createEffect(() => {
    return this.actions.pipe(
      ofType(calendarActions.deleteCalendarEntry),
      exhaustMap(({ calendarEntryId, title }) => {
        return this.dialogService.openConfirmationDialog({
          title: 'Törölni akarod ezt a bejegyzést a naptárból?', 
          content: title,
        }).pipe(
          filter(confirmed => confirmed),
          map(() => {
            return calendarApiActions.deleteCalendarEntryInitiated({
              calendarEntryId,
            });
          }),
        );
      }),
    );
  });

  openWorkEntryPayingDialog = createEffect(() => {
    return this.actions.pipe(
      ofType(calendarActions.payCalendarWorkEntry),
      exhaustMap(({ type, ...calendarEntry }) => {
        return this.dialog.open<CalendarEntryPayingDialog, CalendarEntryPayingDialogData, CalendarEntryPayingDialogResult>(CalendarEntryPayingDialog, {
          data: calendarEntry,
          width: '900px',
          maxHeight: '90vh',
          disableClose: true,
        }).afterClosed()
          .pipe(filter(req => !!req),
            map((request) => {
              return calendarApiActions.resolveCalendarWorkEntryInitiated({
                calendarEntryId: calendarEntry.calendarEntryId,
                ...request,
                day: calendarEntry.day,
              });
            }),
          );
      }),
    );
  });

  // createCalendarEntryWithProposal = createEffect(() => {
  //   return this.actions.pipe(
  //     ofType(calendarActions.createCalendarEntryWithProposal),
  //     exhaustMap(({ customerJob: { customer, ...job }, day, timeInterval }) => {
  //       return this.dialog.open<CalendarEntryEditDialog, CalendarEntryEditDialogData, CalendarEntryEditDialogResult>(CalendarEntryEditDialog, {
  //         data: {
  //           entryType: CalendarEntryType.Work,
  //           customer,
  //           day,
  //           description: job.description,
  //           title: createWorkEntryTitle(customer, job),
  //           prices: job.prices,
  //           start: timeInterval.start,
  //           end: timeInterval.start + job.duration,
  //         },
  //         width: '900px',
  //         disableClose: true,
  //       }).afterClosed();
  //     }),
  //     filter(req => !!req),
  //     map((request) => {
  //       return calendarApiActions.createCalendarEntryInitiated(request);
  //     }),
  //   );
  // });

  confirmCalendarEntryProposal = createEffect(() => {
    return this.actions.pipe(
      ofType(calendarActions.confirmCalendarEntryProposal),
      exhaustMap(({ day, timeInterval, customerJob: { customer, ...job } }) => {
        const title = createWorkEntryTitle(customer, job);
        return this.dialogService.openConfirmationDialog({
          title: 'Rögzíted ezt a munkát erre az időpontra?',
          content: `${title} ${new Date(day).toLocaleString('hu', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          })} ${timeSlotToTimeString(timeInterval.start)}-${timeSlotToTimeString(timeInterval.end)}`,
        }).pipe(
          filter(confirmed => confirmed),
          map(() => {
            return calendarApiActions.createCalendarEntryInitiated({
              entryType: CalendarEntryType.Work,
              day,
              title,
              start: timeInterval.start,
              end: timeInterval.end,
              description: job.description,
              additionalPrice: job.additionalPrice,
              prices: job.prices.map((p) => {
                return {
                  priceId: p.priceId,
                  quantity: p.quantity,
                };
              }),
              customerId: customer.customerId,
            });
          }),
        );
      }),
    );
  });

  confirmNoShowResolution = createEffect(() => {
    return this.actions.pipe(
      ofType(calendarActions.confirmNoShowResolution),
      exhaustMap(({ type, ...entry }) => {
        return this.dialogService.openConfirmationDialog({
          title: 'Megerősíted, hogy nem jött el?',
          content: `${entry.title}`,
        }).pipe(
          filter(confirmed => confirmed),
          map(() => {
            return calendarApiActions.resolveCalendarWorkEntryInitiated({
              calendarEntryId: entry.calendarEntryId,
              status: CalendarEntryResolutionStatus.NoShow,
              day: entry.day,
            });
          }),
        );
      }),
    );
  });
}

