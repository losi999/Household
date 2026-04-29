import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';
import { CalendarEffects } from '@household/web/app/hairdressing/calendar/state/calendar.effects';
import { DialogService } from '@household/web/services/dialog.service';
import { MatDialog } from '@angular/material/dialog';
import { calendarActions, calendarApiActions } from '@household/web/app/hairdressing/calendar/state/calendar.actions';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { CalendarEntryDetailsDialogResult } from '@household/web/app/hairdressing/calendar/calendar-entry-details-dialog/calendar-entry-details-dialog.component';
import { CalendarWorkdayDialogResult } from '@household/web/app/hairdressing/calendar/calendar-workday-dialog/calendar-workday-dialog.component';
import { CalendarEntryResolutionStatus, CalendarEntryType } from '@household/shared/enums';
import { expectEffectNotEmitted, returnDialogAfterClosed } from '@household/web/utils/unit-testing';
import { CalendarEntryEditDialogResult } from '@household/web/app/hairdressing/calendar/calendar-entry-edit-dialog/calendar-entry-edit-dialog.component';
import { CalendarEntryPayingDialogResult } from '@household/web/app/hairdressing/calendar/calendar-entry-paying-dialog/calendar-entry-paying-dialog.component';
import { createWorkEntryTitle } from '@household/shared/common/utils';

describe('Calendar effects', () => {
  let actions$: Observable<any>;
  let effects: CalendarEffects;
  let mockDialogService: jasmine.SpyObj<DialogService>;
  let mockMatDialog: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CalendarEffects,
        provideMockActions(() => actions$),
        {
          provide: DialogService,
          useValue: jasmine.createSpyObj<DialogService>('DialogService', ['openConfirmationDialog']), 
        },
        {
          provide: MatDialog,
          useValue: jasmine.createSpyObj<MatDialog>('MatDialog', ['open']), 
        },
      ],
    });

    effects = TestBed.inject(CalendarEffects);
    mockMatDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    mockDialogService = TestBed.inject(DialogService) as jasmine.SpyObj<DialogService>;
  });

  describe('On List calendar week', () => {
    it('should dispatch [Calendar API] List calendar days initiated', (done) => {
      const weekStart = new Date(2025, 10, 10);

      actions$ = of(calendarActions.listCalendarWeek({
        weekStart,
      }));

      effects.listCalendarWeek.subscribe((result) => {
        expect(result).toEqual(calendarApiActions.listCalendarDaysInitiated({
          dateFrom: '2025-11-10',
          dateTo: '2025-11-16',
        }));
        done();
      });
    });
  });

  describe('On List calendar month', () => {
    it('should dispatch [Calendar API] List calendar days initiated', (done) => {
      const date = new Date(2025, 10, 10);

      actions$ = of(calendarActions.listCalendarMonth({
        date,
      }));

      effects.listCalendarMonth.subscribe((result) => {
        expect(result).toEqual(calendarApiActions.listCalendarDaysInitiated({
          dateFrom: '2025-11-01',
          dateTo: '2025-11-30',
        }));
        done();
      });
    });
  });

  describe('On Set work day', () => {
    it('should dispatch [Calendar API] Delete calendar day initiated', (done) => {
      const dayResponse = testDataFactory.calendar.day.response.workday();

      mockMatDialog.open.and.returnValue(returnDialogAfterClosed<CalendarWorkdayDialogResult>({
        day: dayResponse.day,
      }));

      actions$ = of(calendarActions.setWorkDay({
        ...dayResponse,
      }));

      effects.openSetWorkDayDialog.subscribe((result) => {
        expect(result).toEqual(calendarApiActions.deleteCalendarDayInitiated({
          day: dayResponse.day,
        }));
        expect(mockMatDialog.open).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({
          data: dayResponse,
        }));
        done();
      });
    });

    it('should dispatch [Calendar API] Update calendar day initiated with vacation', (done) => {
      const dayResponse = testDataFactory.calendar.day.response.workday();
      const request = testDataFactory.calendar.day.request.vacation();

      mockMatDialog.open.and.returnValue(returnDialogAfterClosed<CalendarWorkdayDialogResult>({
        day: dayResponse.day,
        ...request,
      }));

      actions$ = of(calendarActions.setWorkDay({
        ...dayResponse,
      }));

      effects.openSetWorkDayDialog.subscribe((result) => {
        expect(result).toEqual(calendarApiActions.updateCalendarDayInitiated({
          day: dayResponse.day,
          ...request,
        }));
        expect(mockMatDialog.open).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({
          data: dayResponse,
        }));
        done();
      });
    });

    it('should dispatch [Calendar API] Update calendar day initiated with workday', (done) => {
      const dayResponse = testDataFactory.calendar.day.response.workday();
      const request = testDataFactory.calendar.day.request.workday();

      mockMatDialog.open.and.returnValue(returnDialogAfterClosed<CalendarWorkdayDialogResult>({
        day: dayResponse.day,
        ...request,
      }));

      actions$ = of(calendarActions.setWorkDay({
        ...dayResponse,
      }));

      effects.openSetWorkDayDialog.subscribe((result) => {
        expect(result).toEqual(calendarApiActions.updateCalendarDayInitiated({
          day: dayResponse.day,
          ...request,
        }));
        expect(mockMatDialog.open).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({
          data: dayResponse,
        }));
        done();
      });
    });

    it('should NOT dispatch if dialog is cancelled', (done) => {
      const dayResponse = testDataFactory.calendar.day.response.workday();

      mockMatDialog.open.and.returnValue(returnDialogAfterClosed<CalendarWorkdayDialogResult>());

      actions$ = of(calendarActions.setWorkDay({
        ...dayResponse,
      }));

      expectEffectNotEmitted(effects.openSetWorkDayDialog, () => {
        expect(mockMatDialog.open).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({
          data: dayResponse,
        }));
        done();
      });
    });
  });

  describe('On View calendar entry', () => {
    it('should dispatch [Calendar] Update calendar entry', (done) => {
      const entryResponse = testDataFactory.calendar.entry.response.personal();

      mockMatDialog.open.and.returnValue(returnDialogAfterClosed<CalendarEntryDetailsDialogResult>(CalendarEntryDetailsDialogResult.Edit));

      actions$ = of(calendarActions.viewCalendarEntry({
        ...entryResponse,
      }));

      effects.openCalendarEntryDialog.subscribe((result) => {
        expect(result).toEqual(calendarActions.updateCalendarEntry(entryResponse));
        expect(mockMatDialog.open).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({
          data: entryResponse,
        }));
        done();
      });
    });

    it('should dispatch [Calendar] Delete calendar entry', (done) => {
      const entryResponse = testDataFactory.calendar.entry.response.personal();

      mockMatDialog.open.and.returnValue(returnDialogAfterClosed<CalendarEntryDetailsDialogResult>(CalendarEntryDetailsDialogResult.Delete));

      actions$ = of(calendarActions.viewCalendarEntry({
        ...entryResponse,
      }));

      effects.openCalendarEntryDialog.subscribe((result) => {
        expect(result).toEqual(calendarActions.deleteCalendarEntry({
          calendarEntryId: entryResponse.calendarEntryId,
          title: entryResponse.title,
        }));
        expect(mockMatDialog.open).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({
          data: entryResponse,
        }));
        done();
      });
    });

    it('should dispatch [Calendar] Pay calendar work entry', (done) => {
      const entryResponse = testDataFactory.calendar.entry.response.work();

      mockMatDialog.open.and.returnValue(returnDialogAfterClosed<CalendarEntryDetailsDialogResult>(CalendarEntryDetailsDialogResult.Pay));

      actions$ = of(calendarActions.viewCalendarEntry({
        ...entryResponse,
      }));

      effects.openCalendarEntryDialog.subscribe((result) => {
        expect(result).toEqual(calendarActions.payCalendarWorkEntry(entryResponse));
        expect(mockMatDialog.open).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({
          data: entryResponse,
        }));
        done();
      });
    });

    it('should dispatch [Calendar API] Resolve calendar work entry initiated', (done) => {
      const entryResponse = testDataFactory.calendar.entry.response.work();

      mockMatDialog.open.and.returnValue(returnDialogAfterClosed<CalendarEntryDetailsDialogResult>(CalendarEntryDetailsDialogResult.NoShow));

      actions$ = of(calendarActions.viewCalendarEntry({
        ...entryResponse,
      }));

      effects.openCalendarEntryDialog.subscribe((result) => {
        expect(result).toEqual(calendarApiActions.resolveCalendarWorkEntryInitiated({
          calendarEntryId: entryResponse.calendarEntryId,
          status: CalendarEntryResolutionStatus.NoShow,
          day: entryResponse.day,
        }));
        expect(mockMatDialog.open).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({
          data: entryResponse,
        }));
        done();
      });
    });

    it('should NOT dispatch if dialog is cancelled', (done) => {
      const entryResponse = testDataFactory.calendar.entry.response.work();

      mockMatDialog.open.and.returnValue(returnDialogAfterClosed<CalendarEntryDetailsDialogResult>());

      actions$ = of(calendarActions.viewCalendarEntry({
        ...entryResponse,
      }));

      expectEffectNotEmitted(effects.openCalendarEntryDialog, () => {
        expect(mockMatDialog.open).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({
          data: entryResponse,
        }));
        done();
      });
    });
  });

  describe('On Create calendar entry', () => {
    it('should dispatch [Calendar API] Create calendar entry initiated', (done) => {
      const request = testDataFactory.calendar.entry.request.personal();

      mockMatDialog.open.and.returnValue(returnDialogAfterClosed<CalendarEntryEditDialogResult>(request));

      actions$ = of(calendarActions.createCalendarEntry({
        entryType: CalendarEntryType.Personal,
      }));

      effects.openCreateCalendarEntryDialog.subscribe((result) => {
        expect(result).toEqual(calendarApiActions.createCalendarEntryInitiated(request));
        expect(mockMatDialog.open).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({
          data: {
            entryType: CalendarEntryType.Personal,
          },
        }));
        done();
      });
    });

    it('should NOT dispatch if dialog is cancelled', (done) => {
      mockMatDialog.open.and.returnValue(returnDialogAfterClosed<CalendarEntryEditDialogResult>());

      actions$ = of(calendarActions.createCalendarEntry({
        entryType: CalendarEntryType.Personal,
      }));

      expectEffectNotEmitted(effects.openCreateCalendarEntryDialog, () => {
        expect(mockMatDialog.open).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({
          data: {
            entryType: CalendarEntryType.Personal,
          },
        }));
        done();
      });
    });
  });

  describe('On Update calendar entry', () => {
    it('should dispatch [Calendar API] Update calendar entry initiated', (done) => {
      const entryResponse = testDataFactory.calendar.entry.response.personal();
      const request = testDataFactory.calendar.entry.request.personal();

      mockMatDialog.open.and.returnValue(returnDialogAfterClosed<CalendarEntryEditDialogResult>(request));

      actions$ = of(calendarActions.updateCalendarEntry({
        ...entryResponse,
      }));

      effects.openUpdateCalendarEntryDialog.subscribe((result) => {
        expect(result).toEqual(calendarApiActions.updateCalendarEntryInitiated({
          calendarEntryId: entryResponse.calendarEntryId,
          ...request,
        }));
        expect(mockMatDialog.open).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({
          data: entryResponse,
        }));
        done();
      });
    });

    it('should NOT dispatch if dialog is cancelled', (done) => {
      const entryResponse = testDataFactory.calendar.entry.response.personal();

      mockMatDialog.open.and.returnValue(returnDialogAfterClosed<CalendarEntryEditDialogResult>());

      actions$ = of(calendarActions.updateCalendarEntry({
        ...entryResponse,
      }));

      expectEffectNotEmitted(effects.openUpdateCalendarEntryDialog, () => {
        expect(mockMatDialog.open).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({
          data: entryResponse,
        }));
        done();
      });
    });
  });

  describe('On Delete calendar entry', () => {
    it('should dispatch [Calendar API] Delete calendar entry initiated', (done) => {
      const entryResponse = testDataFactory.calendar.entry.response.personal();

      mockDialogService.openConfirmationDialog.and.returnValue(of(true));

      actions$ = of(calendarActions.deleteCalendarEntry({
        calendarEntryId: entryResponse.calendarEntryId,
        title: entryResponse.title,
      }));

      effects.openDeleteCalendarEntryDialog.subscribe((result) => {
        expect(result).toEqual(calendarApiActions.deleteCalendarEntryInitiated({
          calendarEntryId: entryResponse.calendarEntryId,
        }));
        expect(mockDialogService.openConfirmationDialog).toHaveBeenCalledWith(jasmine.objectContaining({
          content: entryResponse.title,
        }));
        done();
      });
    });

    it('should NOT dispatch if dialog is cancelled', (done) => {
      const entryResponse = testDataFactory.calendar.entry.response.personal();

      mockDialogService.openConfirmationDialog.and.returnValue(of(false));

      actions$ = of(calendarActions.deleteCalendarEntry({
        calendarEntryId: entryResponse.calendarEntryId,
        title: entryResponse.title,
      }));

      expectEffectNotEmitted(effects.openDeleteCalendarEntryDialog, () => {
        expect(mockDialogService.openConfirmationDialog).toHaveBeenCalledWith(jasmine.objectContaining({
          content: entryResponse.title,
        }));
        done();
      });
    });
  });

  describe('On Pay calendar work entry', () => {
    it('should dispatch [Calendar API] Resolve calendar work entry initiated', (done) => {
      const entryResponse = testDataFactory.calendar.entry.response.work();
      const request = testDataFactory.calendar.entry.resolution.request();

      mockMatDialog.open.and.returnValue(returnDialogAfterClosed<CalendarEntryPayingDialogResult>(request));

      actions$ = of(calendarActions.payCalendarWorkEntry(entryResponse));

      effects.openWorkEntryPayingDialog.subscribe((result) => {
        expect(result).toEqual(calendarApiActions.resolveCalendarWorkEntryInitiated({
          calendarEntryId: entryResponse.calendarEntryId,
          ...request,
          day: entryResponse.day,
        }));
        expect(mockMatDialog.open).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({
          data: entryResponse,
        }));
        done();
      });
    });

    it('should NOT dispatch if dialog is cancelled', (done) => {
      const entryResponse = testDataFactory.calendar.entry.response.work();

      mockMatDialog.open.and.returnValue(returnDialogAfterClosed<CalendarEntryPayingDialogResult>());

      actions$ = of(calendarActions.payCalendarWorkEntry(entryResponse));

      expectEffectNotEmitted(effects.openWorkEntryPayingDialog, () => {
        expect(mockMatDialog.open).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({
          data: entryResponse,
        }));
        done();
      });
    });
  });

  describe('On Create calendar entry with proposal', () => {
    it('should dispatch [Calendar API] Create calendar entry initiated', (done) => {
      const request = testDataFactory.calendar.entry.request.work();
      const customer = testDataFactory.customer.response();
      const job = customer.jobs[0];
      const day = testDataFactory.calendar.day.futureDay();
      const start = 10;

      mockMatDialog.open.and.returnValue(returnDialogAfterClosed<CalendarEntryEditDialogResult>(request));

      actions$ = of(calendarActions.createCalendarEntryWithProposal({
        day,
        customerJob: {
          customer,
          ...job,
        },
        timeInterval: {
          start,
          end: start + 1,
        },
      }));

      effects.createCalendarEntryWithProposal.subscribe((result) => {
        expect(result).toEqual(calendarApiActions.createCalendarEntryInitiated(request));
        expect(mockMatDialog.open).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({
          data: {
            entryType: CalendarEntryType.Work,
            customer,
            day,
            description: job.description,
            title: createWorkEntryTitle(customer, job),
            prices: job.prices,
            start,
            end: start + job.duration,
          },
        }));
        done();
      });
    });

    it('should NOT dispatch if dialog is cancelled', (done) => {
      const customer = testDataFactory.customer.response();
      const job = customer.jobs[0];
      const day = testDataFactory.calendar.day.futureDay();
      const start = 10;

      mockMatDialog.open.and.returnValue(returnDialogAfterClosed<CalendarEntryEditDialogResult>());

      actions$ = of(calendarActions.createCalendarEntryWithProposal({
        day,
        customerJob: {
          customer,
          ...job,
        },
        timeInterval: {
          start,
          end: start + 1,
        },
      }));

      expectEffectNotEmitted(effects.createCalendarEntryWithProposal, () => { expect(mockMatDialog.open).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({
        data: {
          entryType: CalendarEntryType.Work,
          customer,
          day,
          description: job.description,
          title: createWorkEntryTitle(customer, job),
          prices: job.prices,
          start,
          end: start + job.duration,
        },
      }));
      done();
      });
    });
  });

  describe('On Confirm calendar entry proposal', () => {
    it('should dispatch [Calendar API] Create calendar entry initiated', (done) => {
      const customer = testDataFactory.customer.response();
      const job = customer.jobs[0];
      const day = testDataFactory.calendar.day.futureDay();
      const start = 10;

      mockDialogService.openConfirmationDialog.and.returnValue(of(true));

      actions$ = of(calendarActions.confirmCalendarEntryProposal({
        day,
        customerJob: {
          customer,
          ...job,
        },
        timeInterval: {
          start,
          end: start + 1,
        },
      }));

      effects.confirmCalendarEntryProposal.subscribe((result) => {
        expect(result).toEqual(calendarApiActions.createCalendarEntryInitiated({
          customerId: customer.customerId,
          day,
          title: createWorkEntryTitle(customer, job),
          start,
          end: start + 1,
          description: job.description,
          entryType: CalendarEntryType.Work,
          prices: jasmine.any(Array) as any,
        }));
        done();
      });
    });

    it('should NOT dispatch if dialog is cancelled', (done) => {
      const customer = testDataFactory.customer.response();
      const job = customer.jobs[0];
      const day = testDataFactory.calendar.day.futureDay();
      const start = 10;

      mockDialogService.openConfirmationDialog.and.returnValue(of(false));

      actions$ = of(calendarActions.confirmCalendarEntryProposal({
        day,
        customerJob: {
          customer,
          ...job,
        },
        timeInterval: {
          start,
          end: start + 1,
        },
      }));

      expectEffectNotEmitted(effects.confirmCalendarEntryProposal, done);
    });
  });

});

