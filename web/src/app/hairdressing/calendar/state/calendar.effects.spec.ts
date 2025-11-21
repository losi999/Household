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
import { createMockService, expectEffectNotEmitted, Mock, returnDialogAfterClosed } from '@household/web/utils/unit-testing';
import { CalendarEntryEditDialogResult } from '@household/web/app/hairdressing/calendar/calendar-entry-edit-dialog/calendar-entry-edit-dialog.component';
import { CalendarEntryPayingDialogResult } from '@household/web/app/hairdressing/calendar/calendar-entry-paying-dialog/calendar-entry-paying-dialog.component';
import { createWorkEntryTitle } from '@household/shared/common/utils';

describe('Calendar effects', () => {
  let actions$: Observable<any>;
  let effects: CalendarEffects;
  let mockDialogService: Mock<DialogService>;
  let mockMatDialog: Mock<MatDialog>;

  beforeEach(() => {
    mockDialogService = createMockService('openConfirmationDialog');
    mockMatDialog = createMockService('open');

    TestBed.configureTestingModule({
      providers: [
        CalendarEffects,
        provideMockActions(() => actions$),
        {
          provide: DialogService,
          useValue: mockDialogService,
        },
        {
          provide: MatDialog,
          useValue: mockMatDialog, 
        },
      ],
    });

    effects = TestBed.inject(CalendarEffects);
  });

  describe('On List calendar week', () => {
    it('should dispatch [Calendar API] List calendar days initiated', () => {
      const weekStart = new Date(2025, 10, 10);

      actions$ = of(calendarActions.listCalendarWeek({
        weekStart,
      }));

      effects.listCalendarWeek.subscribe((result) => {
        expect(result).toEqual(calendarApiActions.listCalendarDaysInitiated({
          dateFrom: '2025-11-10',
          dateTo: '2025-11-16',
        }));
      });
    });
  });

  describe('On List calendar month', () => {
    it('should dispatch [Calendar API] List calendar days initiated', () => {
      const date = new Date(2025, 10, 10);

      actions$ = of(calendarActions.listCalendarMonth({
        date,
      }));

      effects.listCalendarMonth.subscribe((result) => {
        expect(result).toEqual(calendarApiActions.listCalendarDaysInitiated({
          dateFrom: '2025-11-01',
          dateTo: '2025-11-30',
        }));
      });
    });
  });

  describe('On Set work day', () => {
    it('should dispatch [Calendar API] Delete calendar day initiated', () => {
      const dayResponse = testDataFactory.calendar.day.response.workday();

      mockMatDialog.open.mockReturnValue(returnDialogAfterClosed<CalendarWorkdayDialogResult>({
        day: dayResponse.day,
      }));

      actions$ = of(calendarActions.setWorkDay({
        ...dayResponse,
      }));

      effects.openSetWorkDayDialog.subscribe((result) => {
        expect(result).toEqual(calendarApiActions.deleteCalendarDayInitiated({
          day: dayResponse.day,
        }));
        expect(mockMatDialog.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
          data: dayResponse,
        }));
      });
    });

    it('should dispatch [Calendar API] Update calendar day initiated with vacation', () => {
      const dayResponse = testDataFactory.calendar.day.response.workday();
      const request = testDataFactory.calendar.day.request.vacation();

      mockMatDialog.open.mockReturnValue(returnDialogAfterClosed<CalendarWorkdayDialogResult>({
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
        expect(mockMatDialog.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
          data: dayResponse,
        }));
      });
    });

    it('should dispatch [Calendar API] Update calendar day initiated with workday', () => {
      const dayResponse = testDataFactory.calendar.day.response.workday();
      const request = testDataFactory.calendar.day.request.workday();

      mockMatDialog.open.mockReturnValue(returnDialogAfterClosed<CalendarWorkdayDialogResult>({
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
        expect(mockMatDialog.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
          data: dayResponse,
        }));
      });
    });

    it('should NOT dispatch if dialog is cancelled', () => {
      const dayResponse = testDataFactory.calendar.day.response.workday();

      mockMatDialog.open.mockReturnValue(returnDialogAfterClosed<CalendarWorkdayDialogResult>());

      actions$ = of(calendarActions.setWorkDay({
        ...dayResponse,
      }));

      expectEffectNotEmitted(effects.openSetWorkDayDialog, () => {
        expect(mockMatDialog.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
          data: dayResponse,
        }));
      });
    });
  });

  describe('On View calendar entry', () => {
    it('should dispatch [Calendar] Update calendar entry', () => {
      const entryResponse = testDataFactory.calendar.entry.response.personal();

      mockMatDialog.open.mockReturnValue(returnDialogAfterClosed<CalendarEntryDetailsDialogResult>(CalendarEntryDetailsDialogResult.Edit));

      actions$ = of(calendarActions.viewCalendarEntry({
        ...entryResponse,
      }));

      effects.openCalendarEntryDialog.subscribe((result) => {
        expect(result).toEqual(calendarActions.updateCalendarEntry(entryResponse));
        expect(mockMatDialog.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
          data: entryResponse,
        }));
      });
    });

    it('should dispatch [Calendar] Delete calendar entry', () => {
      const entryResponse = testDataFactory.calendar.entry.response.personal();

      mockMatDialog.open.mockReturnValue(returnDialogAfterClosed<CalendarEntryDetailsDialogResult>(CalendarEntryDetailsDialogResult.Delete));

      actions$ = of(calendarActions.viewCalendarEntry({
        ...entryResponse,
      }));

      effects.openCalendarEntryDialog.subscribe((result) => {
        expect(result).toEqual(calendarActions.deleteCalendarEntry({
          calendarEntryId: entryResponse.calendarEntryId,
          title: entryResponse.title,
        }));
        expect(mockMatDialog.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
          data: entryResponse,
        }));
      });
    });

    it('should dispatch [Calendar] Pay calendar work entry', () => {
      const entryResponse = testDataFactory.calendar.entry.response.work();

      mockMatDialog.open.mockReturnValue(returnDialogAfterClosed<CalendarEntryDetailsDialogResult>(CalendarEntryDetailsDialogResult.Pay));

      actions$ = of(calendarActions.viewCalendarEntry({
        ...entryResponse,
      }));

      effects.openCalendarEntryDialog.subscribe((result) => {
        expect(result).toEqual(calendarActions.payCalendarWorkEntry(entryResponse));
        expect(mockMatDialog.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
          data: entryResponse,
        }));
      });
    });

    it('should dispatch [Calendar API] Resolve calendar work entry initiated', () => {
      const entryResponse = testDataFactory.calendar.entry.response.work();

      mockMatDialog.open.mockReturnValue(returnDialogAfterClosed<CalendarEntryDetailsDialogResult>(CalendarEntryDetailsDialogResult.NoShow));

      actions$ = of(calendarActions.viewCalendarEntry({
        ...entryResponse,
      }));

      effects.openCalendarEntryDialog.subscribe((result) => {
        expect(result).toEqual(calendarApiActions.resolveCalendarWorkEntryInitiated({
          calendarEntryId: entryResponse.calendarEntryId,
          status: CalendarEntryResolutionStatus.NoShow,
          day: entryResponse.day,
        }));
        expect(mockMatDialog.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
          data: entryResponse,
        }));
      });
    });

    it('should NOT dispatch if dialog is cancelled', () => {
      const entryResponse = testDataFactory.calendar.entry.response.work();

      mockMatDialog.open.mockReturnValue(returnDialogAfterClosed<CalendarEntryDetailsDialogResult>());

      actions$ = of(calendarActions.viewCalendarEntry({
        ...entryResponse,
      }));

      expectEffectNotEmitted(effects.openCalendarEntryDialog, () => {
        expect(mockMatDialog.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
          data: entryResponse,
        }));
      });
    });
  });

  describe('On Create calendar entry', () => {
    it('should dispatch [Calendar API] Create calendar entry initiated', () => {
      const request = testDataFactory.calendar.entry.request.personal();

      mockMatDialog.open.mockReturnValue(returnDialogAfterClosed<CalendarEntryEditDialogResult>(request));

      actions$ = of(calendarActions.createCalendarEntry({
        entryType: CalendarEntryType.Personal,
      }));

      effects.openCreateCalendarEntryDialog.subscribe((result) => {
        expect(result).toEqual(calendarApiActions.createCalendarEntryInitiated(request));
        expect(mockMatDialog.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
          data: {
            entryType: CalendarEntryType.Personal,
          },
        }));
      });
    });

    it('should NOT dispatch if dialog is cancelled', () => {
      mockMatDialog.open.mockReturnValue(returnDialogAfterClosed<CalendarEntryEditDialogResult>());

      actions$ = of(calendarActions.createCalendarEntry({
        entryType: CalendarEntryType.Personal,
      }));

      expectEffectNotEmitted(effects.openCreateCalendarEntryDialog, () => {
        expect(mockMatDialog.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
          data: {
            entryType: CalendarEntryType.Personal,
          },
        }));
      });
    });
  });

  describe('On Update calendar entry', () => {
    it('should dispatch [Calendar API] Update calendar entry initiated', () => {
      const entryResponse = testDataFactory.calendar.entry.response.personal();
      const request = testDataFactory.calendar.entry.request.personal();

      mockMatDialog.open.mockReturnValue(returnDialogAfterClosed<CalendarEntryEditDialogResult>(request));

      actions$ = of(calendarActions.updateCalendarEntry({
        ...entryResponse,
      }));

      effects.openUpdateCalendarEntryDialog.subscribe((result) => {
        expect(result).toEqual(calendarApiActions.updateCalendarEntryInitiated({
          calendarEntryId: entryResponse.calendarEntryId,
          ...request,
        }));
        expect(mockMatDialog.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
          data: entryResponse,
        }));
      });
    });

    it('should NOT dispatch if dialog is cancelled', () => {
      const entryResponse = testDataFactory.calendar.entry.response.personal();

      mockMatDialog.open.mockReturnValue(returnDialogAfterClosed<CalendarEntryEditDialogResult>());

      actions$ = of(calendarActions.updateCalendarEntry({
        ...entryResponse,
      }));

      expectEffectNotEmitted(effects.openUpdateCalendarEntryDialog, () => {
        expect(mockMatDialog.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
          data: entryResponse,
        }));
      });
    });
  });

  describe('On Delete calendar entry', () => {
    it('should dispatch [Calendar API] Delete calendar entry initiated', () => {
      const entryResponse = testDataFactory.calendar.entry.response.personal();

      mockDialogService.openConfirmationDialog.mockReturnValue(of(true));

      actions$ = of(calendarActions.deleteCalendarEntry({
        calendarEntryId: entryResponse.calendarEntryId,
        title: entryResponse.title,
      }));

      effects.openDeleteCalendarEntryDialog.subscribe((result) => {
        expect(result).toEqual(calendarApiActions.deleteCalendarEntryInitiated({
          calendarEntryId: entryResponse.calendarEntryId,
        }));
        expect(mockDialogService.openConfirmationDialog).toHaveBeenCalledWith(expect.objectContaining({
          content: entryResponse.title,
        }));
      });
    });

    it('should NOT dispatch if dialog is cancelled', () => {
      const entryResponse = testDataFactory.calendar.entry.response.personal();

      mockDialogService.openConfirmationDialog.mockReturnValue(of(false));

      actions$ = of(calendarActions.deleteCalendarEntry({
        calendarEntryId: entryResponse.calendarEntryId,
        title: entryResponse.title,
      }));

      expectEffectNotEmitted(effects.openDeleteCalendarEntryDialog, () => {
        expect(mockDialogService.openConfirmationDialog).toHaveBeenCalledWith(expect.objectContaining({
          content: entryResponse.title,
        }));
      });
    });
  });

  describe('On Pay calendar work entry', () => {
    it('should dispatch [Calendar API] Resolve calendar work entry initiated', () => {
      const entryResponse = testDataFactory.calendar.entry.response.work();
      const request = testDataFactory.calendar.entry.resolution.request();

      mockMatDialog.open.mockReturnValue(returnDialogAfterClosed<CalendarEntryPayingDialogResult>(request));

      actions$ = of(calendarActions.payCalendarWorkEntry(entryResponse));

      effects.openWorkEntryPayingDialog.subscribe((result) => {
        expect(result).toEqual(calendarApiActions.resolveCalendarWorkEntryInitiated({
          calendarEntryId: entryResponse.calendarEntryId,
          ...request,
          day: entryResponse.day,
        }));
        expect(mockMatDialog.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
          data: entryResponse,
        }));
      });
    });

    it('should NOT dispatch if dialog is cancelled', () => {
      const entryResponse = testDataFactory.calendar.entry.response.work();

      mockMatDialog.open.mockReturnValue(returnDialogAfterClosed<CalendarEntryPayingDialogResult>());

      actions$ = of(calendarActions.payCalendarWorkEntry(entryResponse));

      expectEffectNotEmitted(effects.openWorkEntryPayingDialog, () => {
        expect(mockMatDialog.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
          data: entryResponse,
        }));
      });
    });
  });

  describe('On Create calendar entry with proposal', () => {
    it('should dispatch [Calendar API] Create calendar entry initiated', () => {
      const request = testDataFactory.calendar.entry.request.work();
      const customer = testDataFactory.customer.response();
      const job = customer.jobs[0];
      const day = testDataFactory.calendar.day.futureDay();
      const start = 10;

      mockMatDialog.open.mockReturnValue(returnDialogAfterClosed<CalendarEntryEditDialogResult>(request));

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
        expect(mockMatDialog.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
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
      });
    });

    it('should NOT dispatch if dialog is cancelled', () => {
      const customer = testDataFactory.customer.response();
      const job = customer.jobs[0];
      const day = testDataFactory.calendar.day.futureDay();
      const start = 10;

      mockMatDialog.open.mockReturnValue(returnDialogAfterClosed<CalendarEntryEditDialogResult>());

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

      expectEffectNotEmitted(effects.createCalendarEntryWithProposal, () => { expect(mockMatDialog.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
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
      });
    });
  });

  describe('On Confirm calendar entry proposal', () => {
    it('should dispatch [Calendar API] Create calendar entry initiated', () => {
      const customer = testDataFactory.customer.response();
      const job = customer.jobs[0];
      const day = testDataFactory.calendar.day.futureDay();
      const start = 10;

      mockDialogService.openConfirmationDialog.mockReturnValue(of(true));

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
          prices: expect.any(Array) as any,
        }));
      });
    });

    it('should NOT dispatch if dialog is cancelled', () => {
      const customer = testDataFactory.customer.response();
      const job = customer.jobs[0];
      const day = testDataFactory.calendar.day.futureDay();
      const start = 10;

      mockDialogService.openConfirmationDialog.mockReturnValue(of(false));

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
      expectEffectNotEmitted(effects.confirmCalendarEntryProposal);
    });
  });

});

