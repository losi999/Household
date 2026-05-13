import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { calendarApiEvents, calendarEvents } from '@hairdressing/state/calendar/calendar-events';
import { DialogService, dispatchIfConfirmed } from '@household/shared-ui';
import { createWorkEntryTitle, dateToISODateString, timeSlotToTimeString } from '@household/shared/common/utils';
import { signalStoreFeature } from '@ngrx/signals';
import { Events, withEventHandlers } from '@ngrx/signals/events';
import { exhaustMap, filter, map } from 'rxjs';
import { startOfISOWeek, setISOWeek, endOfISOWeek, startOfMonth, endOfMonth } from 'date-fns';
import { CalendarWorkdayDialog, CalendarWorkdayDialogData, CalendarWorkdayDialogResult } from '@hairdressing/app/calendar/calendar-workday-dialog/calendar-workday-dialog';
import { CalendarDayType, CalendarEntryResolutionStatus, CalendarEntryType } from '@household/shared/enums';
import { CalendarEntryDetailsDialog, CalendarEntryDetailsDialogData, CalendarEntryDetailsDialogResult } from '@hairdressing/app/calendar/calendar-entry-details-dialog/calendar-entry-details-dialog';
import { CalendarEntryEditDialog, CalendarEntryEditDialogData, CalendarEntryEditDialogResult } from '@hairdressing/app/calendar/calendar-entry-edit-dialog/calendar-entry-edit-dialog';
import { CalendarEntryPayingDialog, CalendarEntryPayingDialogData, CalendarEntryPayingDialogResult } from '@hairdressing/app/calendar/calendar-entry-paying-dialog/calendar-entry-paying-dialog';

export const withCalendarEvents = () => {
  return signalStoreFeature(
    withEventHandlers(() => {
      const events = inject(Events);
      const dialog = inject(MatDialog);
      const dialogService = inject(DialogService);
      
      return {
        listCalendarWeek: events.on(calendarEvents.listCalendarWeek).pipe(
          map(({ payload: { week, year } }) => {
            return calendarApiEvents.listCalendarDaysInitiated({
              dateFrom: dateToISODateString(startOfISOWeek(setISOWeek(new Date(year, 0), week))),
              dateTo: dateToISODateString(endOfISOWeek(setISOWeek(new Date(year, 0), week))),
            });
          }),
        ),
        listCalendarMonth: events.on(calendarEvents.listCalendarMonth).pipe(
          map(({ payload }) => {
            const dateFrom = dateToISODateString(startOfMonth(payload));
            const dateTo = dateToISODateString(endOfMonth(payload));
          
            return calendarApiEvents.listCalendarDaysInitiated({
              dateFrom,
              dateTo,
            });
          }),
        ),
        openSetWorkDayDialog: events.on(calendarEvents.setWorkDay).pipe(
          exhaustMap(({ payload }) => {
            return dialog.open<CalendarWorkdayDialog, CalendarWorkdayDialogData, CalendarWorkdayDialogResult>(CalendarWorkdayDialog, {
              data: payload,
              width: '900px',
              disableClose: true,
            }).afterClosed();
          }),
          filter(req => !!req),
          map((value) => {
            if (!value.dayType) {
              return calendarApiEvents.deleteCalendarDayInitiated({
                day: value.day,
              });
            }
          
            switch(value.dayType) {
              case CalendarDayType.Vacation: {
                return calendarApiEvents.updateCalendarDayInitiated({
                  dayType: CalendarDayType.Vacation,
                  day: value.day,
                });
              }
              case CalendarDayType.Workday: {
                return calendarApiEvents.updateCalendarDayInitiated({
                  dayType: CalendarDayType.Workday,
                  day: value.day,
                  start: value.start,
                  end: value.end,
                });
              }
            }
          }),
        ),
        openCalendarEntryDialog: events.on(calendarEvents.viewCalendarEntry).pipe(
          exhaustMap(({ payload: entry }) => {
            return dialog.open<CalendarEntryDetailsDialog, CalendarEntryDetailsDialogData, CalendarEntryDetailsDialogResult>(CalendarEntryDetailsDialog, {
              data: entry,
              width: '900px',
            }).afterClosed()
              .pipe(
                filter(result => !!result),
                map((result) => {
                  switch(result) {
                    case CalendarEntryDetailsDialogResult.Edit: {
                      return calendarEvents.updateCalendarEntry(entry);
                    }
                    case CalendarEntryDetailsDialogResult.Delete: {
                      return calendarEvents.deleteCalendarEntry({
                        calendarEntryId: entry.calendarEntryId,
                        title: entry.title,
                      });
                    }
                    case CalendarEntryDetailsDialogResult.Pay: {
                      if (entry.entryType === CalendarEntryType.Work) {
                        return calendarEvents.payCalendarWorkEntry(entry);
                      }
          
                      return undefined;
                    }
                    case CalendarEntryDetailsDialogResult.NoShow: {
                      if (entry.entryType === CalendarEntryType.Work) {
                        return calendarEvents.confirmNoShowResolution(entry);
                      }
          
                      return undefined;
                    }
                  }
                }),
              );
          }),
        ),
        openCreateCalendarEntryDialog: events.on(calendarEvents.createCalendarEntry).pipe(
          exhaustMap(({ payload: { entryType } }) => {
            return dialog.open<CalendarEntryEditDialog, CalendarEntryEditDialogData, CalendarEntryEditDialogResult>(CalendarEntryEditDialog, {
              data: {
                entryType,
              },
              width: '900px',
              disableClose: true,
            }).afterClosed();
          }),
          filter(req => !!req),
          map((request) => {
            return calendarApiEvents.createCalendarEntryInitiated(request);
          }),
        ),
        openUpdateCalendarEntryDialog: events.on(calendarEvents.updateCalendarEntry).pipe(
          exhaustMap(({ payload: entry }) => {
            return dialog.open<CalendarEntryEditDialog, CalendarEntryEditDialogData, CalendarEntryEditDialogResult>(CalendarEntryEditDialog, {
              data: structuredClone(entry),
              width: '900px',
              disableClose: true,
            }).afterClosed()
              .pipe(filter(req => !!req),
                map((request) => {
                  return calendarApiEvents.updateCalendarEntryInitiated({
                    calendarEntryId: entry.calendarEntryId,
                    ...request,
                  });
                }));
          }),
        ),
        openDeleteCalendarEntryDialog: events.on(calendarEvents.deleteCalendarEntry).pipe(
          exhaustMap(({ payload: { calendarEntryId, title } }) => {
            return dialogService.openConfirmationDialog({
              title: 'Törölni akarod ezt a bejegyzést a naptárból?', 
              content: title,
            }).pipe(
              dispatchIfConfirmed(calendarApiEvents.deleteCalendarEntryInitiated({
                calendarEntryId,
              })),
            );
          }),
        ),
        openWorkEntryPayingDialog: events.on(calendarEvents.payCalendarWorkEntry).pipe(
          exhaustMap(({ payload: calendarEntry }) => {
            return dialog.open<CalendarEntryPayingDialog, CalendarEntryPayingDialogData, CalendarEntryPayingDialogResult>(CalendarEntryPayingDialog, {
              data: calendarEntry,
              width: '900px',
              maxHeight: '90vh',
              disableClose: true,
            }).afterClosed()
              .pipe(filter(req => !!req),
                map((request) => {
                  return calendarApiEvents.resolveCalendarWorkEntryInitiated({
                    calendarEntryId: calendarEntry.calendarEntryId,
                    ...request,
                    day: calendarEntry.day,
                  });
                }),
              );
          }),
        ),
        createCalendarEntryWithProposal: events.on(calendarEvents.createCalendarEntryWithProposal).pipe(
          exhaustMap(({ payload: { customerJob: { customer, ...job }, day, timeInterval } }) => {
            return dialog.open<CalendarEntryEditDialog, CalendarEntryEditDialogData, CalendarEntryEditDialogResult>(CalendarEntryEditDialog, {
              data: {
                entryType: CalendarEntryType.Work,
                customer,
                day,
                description: job.description,
                title: createWorkEntryTitle(customer, job),
                prices: job.prices,
                start: timeInterval.start,
                end: timeInterval.start + job.duration,
              },
              width: '900px',
              disableClose: true,
            }).afterClosed();
          }),
          filter(req => !!req),
          map((request) => {
            return calendarApiEvents.createCalendarEntryInitiated(request);
          }),
        ),
        confirmCalendarEntryProposal: events.on(calendarEvents.confirmCalendarEntryProposal).pipe(
          exhaustMap(({ payload: { day, timeInterval, customerJob: { customer, ...job } } }) => {
            const title = createWorkEntryTitle(customer, job);
            return dialogService.openConfirmationDialog({
              title: 'Rögzíted ezt a munkát erre az időpontra?',
              content: `${title} ${new Date(day).toLocaleString('hu', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              })} ${timeSlotToTimeString(timeInterval.start)}-${timeSlotToTimeString(timeInterval.end)}`,
            }).pipe(
              dispatchIfConfirmed(calendarApiEvents.createCalendarEntryInitiated({
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
              })),
            );
          }),
        ),
        confirmNoShowResolution: events.on(calendarEvents.confirmNoShowResolution).pipe(
          exhaustMap(({ payload: entry }) => {
            return dialogService.openConfirmationDialog({
              title: 'Megerősíted, hogy nem jött el?',
              content: `${entry.title}`,
            }).pipe(
              dispatchIfConfirmed(calendarApiEvents.resolveCalendarWorkEntryInitiated({
                calendarEntryId: entry.calendarEntryId,
                status: CalendarEntryResolutionStatus.NoShow,
                day: entry.day,
              })),              
            );
          }),
        ),
      };
    }),
  );
};
