// The dialog classes the event handlers reference import the store, which imports the event handlers back.
// Loading the store first resolves that cycle in the same order as the application does.
import '@hairdressing/state/calendar/calendar-store';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CalendarEntryDetailsDialog, CalendarEntryDetailsDialogResult } from '@hairdressing/app/calendar/calendar-entry-details-dialog/calendar-entry-details-dialog';
import { CalendarEntryEditDialog } from '@hairdressing/app/calendar/calendar-entry-edit-dialog/calendar-entry-edit-dialog';
import { CalendarEntryPayingDialog } from '@hairdressing/app/calendar/calendar-entry-paying-dialog/calendar-entry-paying-dialog';
import { CalendarWorkdayDialog } from '@hairdressing/app/calendar/calendar-workday-dialog/calendar-workday-dialog';
import { calendarApiEvents, calendarEvents } from '@hairdressing/state/calendar/calendar-events';
import { withCalendarEvents } from '@hairdressing/state/calendar/with-calendar-events';
import { createDispatcherSpy, DialogService, validateDispatcher } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { CalendarEntryResolutionStatus, CalendarEntryType } from '@household/shared/enums';
import { signalStore } from '@ngrx/signals';
import { Dispatcher } from '@ngrx/signals/events';
import { of } from 'rxjs';
import { Mock } from 'vitest';

describe('withCalendarEvents', () => {
  let dispatcher: Dispatcher;
  let dispatchSpy: Mock;
  let mockDialogService: MockService<DialogService>;
  let mockMatDialog: MockService<MatDialog>;

  const setup = () => {
    TestBed.resetTestingModule();

    mockDialogService = createMockService('openConfirmationDialog');
    mockMatDialog = createMockService('open');

    TestBed.configureTestingModule({
      providers: [
        {
          provide: MatDialog,
          useValue: mockMatDialog.service,
        },
        {
          provide: DialogService,
          useValue: mockDialogService.service,
        },
      ],
    });

    TestBed.inject(signalStore({
      providedIn: 'root',
    }, withCalendarEvents()));
    dispatcher = TestBed.inject(Dispatcher);
    dispatchSpy = createDispatcherSpy(dispatcher);
  };

  beforeEach(() => {
    setup();
  });

  describe('dispatching listCalendarWeek', () => {
    it('should calculate week and dispatch #1', () => {    

      dispatcher.dispatch(calendarEvents.listCalendarWeek({
        year: 2026,
        week: 23,
      })); 
    
      validateDispatcher(dispatchSpy, calendarApiEvents.listCalendarDaysInitiated({
        dateFrom: '2026-06-01',
        dateTo: '2026-06-07',
      }));
    });

    it('should calculate week and dispatch #2', () => {    

      dispatcher.dispatch(calendarEvents.listCalendarWeek({
        year: 2026,
        week: 1,
      })); 
    
      validateDispatcher(dispatchSpy, calendarApiEvents.listCalendarDaysInitiated({
        dateFrom: '2025-12-29',
        dateTo: '2026-01-04',
      }));
    });

    it('should calculate week and dispatch #3', () => {    

      dispatcher.dispatch(calendarEvents.listCalendarWeek({
        year: 2027,
        week: 1,
      })); 
    
      validateDispatcher(dispatchSpy, calendarApiEvents.listCalendarDaysInitiated({
        dateFrom: '2027-01-04',
        dateTo: '2027-01-10',
      }));
    });
  });

  describe('dispatching listCalendarMonth', () => {
    it('should calculate month and dispatch', () => {    

      dispatcher.dispatch(calendarEvents.listCalendarMonth(new Date(2026, 5, 3))); 
    
      validateDispatcher(dispatchSpy, calendarApiEvents.listCalendarDaysInitiated({
        dateFrom: '2026-06-01',
        dateTo: '2026-06-30',
      }));
    });
  });

  describe('dispatching setWorkDay', () => {
    it('should open dialog and reset calendar day if submitted', () => {
      const dayResponse = testDataFactory.calendar.day.response.regular(); 

      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of({
          day: dayResponse.day,
        }),
      } as MatDialogRef<any>);
    
      dispatcher.dispatch(calendarEvents.setWorkDay(dayResponse)); 
    
      validateFunctionCall(mockMatDialog.functions.open, CalendarWorkdayDialog, {
        data: dayResponse,
        width: '900px',
        disableClose: true,
      });
      validateDispatcher(dispatchSpy, calendarApiEvents.deleteCalendarDayInitiated({
        day: dayResponse.day,
      }));
    });

    it('should open dialog and update calendar day to vacation if submitted', () => {
      const dayResponse = testDataFactory.calendar.day.response.regular(); 

      const request = testDataFactory.calendar.day.request.vacation();

      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of({
          day: dayResponse.day,
          ...request,
        }),
      } as MatDialogRef<any>);
    
      dispatcher.dispatch(calendarEvents.setWorkDay(dayResponse)); 
    
      validateFunctionCall(mockMatDialog.functions.open, CalendarWorkdayDialog, {
        data: dayResponse,
        width: '900px',
        disableClose: true,
      });
      validateDispatcher(dispatchSpy, calendarApiEvents.updateCalendarDayInitiated({
        day: dayResponse.day,
        ...request,
      }));
    });

    it('should open dialog and update calendar day to workday if submitted', () => {
      const dayResponse = testDataFactory.calendar.day.response.regular(); 

      const request = testDataFactory.calendar.day.request.workday();

      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of({
          day: dayResponse.day,
          ...request,
        }),
      } as MatDialogRef<any>);
    
      dispatcher.dispatch(calendarEvents.setWorkDay(dayResponse)); 
    
      validateFunctionCall(mockMatDialog.functions.open, CalendarWorkdayDialog, {
        data: dayResponse,
        width: '900px',
        disableClose: true,
      });
      validateDispatcher(dispatchSpy, calendarApiEvents.updateCalendarDayInitiated({
        day: dayResponse.day,
        ...request,
      }));
    });
    
    it('should open dialog and not dispatch anything if cancelled', () => {   
      const dayResponse = testDataFactory.calendar.day.response.regular(); 

      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>);
    
      dispatcher.dispatch(calendarEvents.setWorkDay(dayResponse)); 
    
      validateFunctionCall(mockMatDialog.functions.open, CalendarWorkdayDialog, {
        data: dayResponse,
        width: '900px',
        disableClose: true,
      });
      validateDispatcher(dispatchSpy);
    });
  });

  describe('dispatching viewCalendarEntry', () => {
    it('should open dialog and dispatch edit if submitted', () => {
      const entryResponse = testDataFactory.calendar.entry.response.work();

      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(CalendarEntryDetailsDialogResult.Edit),
      } as MatDialogRef<any>);
    
      dispatcher.dispatch(calendarEvents.viewCalendarEntry(entryResponse)); 
    
      validateFunctionCall(mockMatDialog.functions.open, CalendarEntryDetailsDialog, {
        data: entryResponse,
        width: '900px',
      });
      validateDispatcher(dispatchSpy, calendarEvents.updateCalendarEntry(entryResponse));
    });

    it('should open dialog and dispatch delete if submitted', () => {
      const entryResponse = testDataFactory.calendar.entry.response.work();

      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(CalendarEntryDetailsDialogResult.Delete),
      } as MatDialogRef<any>);
    
      dispatcher.dispatch(calendarEvents.viewCalendarEntry(entryResponse)); 
    
      validateFunctionCall(mockMatDialog.functions.open, CalendarEntryDetailsDialog, {
        data: entryResponse,
        width: '900px',
      });
      validateDispatcher(dispatchSpy, calendarEvents.deleteCalendarEntry({
        calendarEntryId: entryResponse.calendarEntryId,
        title: entryResponse.title,
      }));
    });

    it('should open dialog and dispatch pay if submitted', () => {
      const entryResponse = testDataFactory.calendar.entry.response.work();

      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(CalendarEntryDetailsDialogResult.Pay),
      } as MatDialogRef<any>);
    
      dispatcher.dispatch(calendarEvents.viewCalendarEntry(entryResponse)); 
    
      validateFunctionCall(mockMatDialog.functions.open, CalendarEntryDetailsDialog, {
        data: entryResponse,
        width: '900px',
      });
      validateDispatcher(dispatchSpy, calendarEvents.payCalendarWorkEntry(entryResponse));
    });

    it('should open dialog and dispatch no show if submitted', () => {
      const entryResponse = testDataFactory.calendar.entry.response.work();

      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(CalendarEntryDetailsDialogResult.NoShow),
      } as MatDialogRef<any>);
    
      dispatcher.dispatch(calendarEvents.viewCalendarEntry(entryResponse)); 
    
      validateFunctionCall(mockMatDialog.functions.open, CalendarEntryDetailsDialog, {
        data: entryResponse,
        width: '900px',
      });
      validateDispatcher(dispatchSpy, calendarEvents.confirmNoShowResolution(entryResponse));
    });

    it('should open dialog and not dispatch anything if cancelled', () => {   
      const entryResponse = testDataFactory.calendar.entry.response.work();

      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>);
    
      dispatcher.dispatch(calendarEvents.viewCalendarEntry(entryResponse)); 
    
      validateFunctionCall(mockMatDialog.functions.open, CalendarEntryDetailsDialog, {
        data: entryResponse,
        width: '900px',
      });
      validateDispatcher(dispatchSpy);
    });

    it('should open dialog and not dispatch an event if pay is selected for a non-work entry', () => {
      const entryResponse = testDataFactory.calendar.entry.response.personal();
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(CalendarEntryDetailsDialogResult.Pay),
      } as MatDialogRef<any>);

      dispatcher.dispatch(calendarEvents.viewCalendarEntry(entryResponse));

      validateDispatcher(dispatchSpy);
    });

    it('should open dialog and not dispatch an event if no show is selected for a non-work entry', () => {
      const entryResponse = testDataFactory.calendar.entry.response.issue();
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(CalendarEntryDetailsDialogResult.NoShow),
      } as MatDialogRef<any>);

      dispatcher.dispatch(calendarEvents.viewCalendarEntry(entryResponse));

      validateDispatcher(dispatchSpy);
    });
  });

  describe('dispatching createCalendarEntry', () => {
    it('should open dialog and dispatch if submitted', () => {
      const calendarRequest = testDataFactory.calendar.entry.request.work();
      const entryType = CalendarEntryType.Work;
          
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(calendarRequest),
      } as MatDialogRef<any>);
    
      dispatcher.dispatch(calendarEvents.createCalendarEntry({
        entryType,
      })); 
    
      validateFunctionCall(mockMatDialog.functions.open, CalendarEntryEditDialog, {
        data: {
          entryType,
        },
        width: '900px',
        disableClose: true,
      });
      validateDispatcher(dispatchSpy, calendarApiEvents.createCalendarEntryInitiated(calendarRequest));
    });
    
    it('should open dialog and not dispatch anything if cancelled', () => {   
      const entryType = CalendarEntryType.Work;

      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>);
    
      dispatcher.dispatch(calendarEvents.createCalendarEntry({
        entryType,
      })); 
    
      validateFunctionCall(mockMatDialog.functions.open, CalendarEntryEditDialog, {
        data: {
          entryType,
        },
        width: '900px',
        disableClose: true,
      });
      validateDispatcher(dispatchSpy);
    });
  });

  describe('dispatching updateCalendarEntry', () => {
    const originalCalendarEntry = testDataFactory.calendar.entry.response.work();
    it('should open dialog and dispatch if submitted', () => {
      const calendarRequest = testDataFactory.calendar.entry.request.work();
          
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(calendarRequest),
      } as MatDialogRef<any>);
    
      dispatcher.dispatch(calendarEvents.updateCalendarEntry(originalCalendarEntry)); 
    
      validateFunctionCall(mockMatDialog.functions.open, CalendarEntryEditDialog, {
        data: originalCalendarEntry,
        width: '900px',
        disableClose: true,
      });
      validateDispatcher(dispatchSpy, calendarApiEvents.updateCalendarEntryInitiated({
        calendarEntryId: originalCalendarEntry.calendarEntryId,
        ...calendarRequest,
      }));
    });
    
    it('should open dialog and not dispatch anything if cancelled', () => {   
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>);
    
      dispatcher.dispatch(calendarEvents.updateCalendarEntry(originalCalendarEntry)); 
    
      validateFunctionCall(mockMatDialog.functions.open, CalendarEntryEditDialog, {
        data: originalCalendarEntry,
        width: '900px',
        disableClose: true,
      });
      validateDispatcher(dispatchSpy);
    });
  });

  describe('dispatching deleteCalendarEntry', () => {
    const originalCalendarEntry = testDataFactory.calendar.entry.response.work();

    it('should open dialog and dispatch if confirmed', () => {
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(true));
    
      dispatcher.dispatch(calendarEvents.deleteCalendarEntry(originalCalendarEntry)); 
    
      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Törölni akarod ezt a bejegyzést a naptárból?', 
        content: originalCalendarEntry.title,
      });
      validateDispatcher(dispatchSpy, calendarApiEvents.deleteCalendarEntryInitiated({
        calendarEntryId: originalCalendarEntry.calendarEntryId,
      }));
    });
    
    it('should open dialog and not dispatch anything if cancelled', () => {    
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(false));
    
      dispatcher.dispatch(calendarEvents.deleteCalendarEntry(originalCalendarEntry)); 
    
      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Törölni akarod ezt a bejegyzést a naptárból?', 
        content: originalCalendarEntry.title,
      });
      validateDispatcher(dispatchSpy);
    });
  });

  describe('dispatching payCalendarWorkEntry', () => {
    const originalCalendarEntry = testDataFactory.calendar.entry.response.work();
    it('should open dialog and dispatch if submitted', () => {
      const resolutionRequest = testDataFactory.calendar.entry.resolution.request();
          
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(resolutionRequest),
      } as MatDialogRef<any>);
    
      dispatcher.dispatch(calendarEvents.payCalendarWorkEntry(originalCalendarEntry)); 
    
      validateFunctionCall(mockMatDialog.functions.open, CalendarEntryPayingDialog, {
        data: originalCalendarEntry,
        width: '900px',
        maxHeight: '90vh',
        disableClose: true,
      });
      validateDispatcher(dispatchSpy, calendarApiEvents.resolveCalendarWorkEntryInitiated({
        calendarEntryId: originalCalendarEntry.calendarEntryId,
        ...resolutionRequest,
        day: originalCalendarEntry.day,
      }));
    });
    
    it('should open dialog and not dispatch anything if cancelled', () => {   
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>);
    
      dispatcher.dispatch(calendarEvents.payCalendarWorkEntry(originalCalendarEntry)); 
    
      validateFunctionCall(mockMatDialog.functions.open, CalendarEntryPayingDialog, {
        data: originalCalendarEntry,
        width: '900px',
        maxHeight: '90vh',
        disableClose: true,
      });
      validateDispatcher(dispatchSpy);
    });
  });

  describe('dispatching createCalendarEntryWithProposal', () => {
    const customer = testDataFactory.customer.response();
    const job = testDataFactory.customer.job.response();
    const day = testDataFactory.calendar.day.futureWorkday();
    const start = 20;

    it('should open dialog and dispatch if submitted', () => {
      const calendarRequest = testDataFactory.calendar.entry.request.work();
          
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(calendarRequest),
      } as MatDialogRef<any>);
    
      dispatcher.dispatch(calendarEvents.createCalendarEntryWithProposal({
        customerJob: {
          customer,
          ...job,
        },
        timeInterval: {
          start,
          end: start + job.duration,
        },
        day,
      })); 
    
      validateFunctionCall(mockMatDialog.functions.open, CalendarEntryEditDialog, {
        data: {
          entryType: CalendarEntryType.Work,
          customer,
          day,
          description: job.description,
          title: job.title,
          prices: job.prices,
          start: start,
          end: start + job.duration,
        },
        width: '900px',
        disableClose: true,
      });
      validateDispatcher(dispatchSpy, calendarApiEvents.createCalendarEntryInitiated(calendarRequest)); 
    });
    
    it('should open dialog and not dispatch anything if cancelled', () => {   
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>);
    
      dispatcher.dispatch(calendarEvents.createCalendarEntryWithProposal({
        customerJob: {
          customer,
          ...job,
        },
        timeInterval: {
          start,
          end: start + job.duration,
        },
        day,
      })); 
    
      validateFunctionCall(mockMatDialog.functions.open, CalendarEntryEditDialog, {
        data: {
          entryType: CalendarEntryType.Work,
          customer,
          day,
          description: job.description,
          title: job.title,
          prices: job.prices,
          start: start,
          end: start + job.duration,
        },
        width: '900px',
        disableClose: true,
      });
      validateDispatcher(dispatchSpy);
    });
  });

  describe('dispatching confirmCalendarEntryProposal', () => {
    const customer = testDataFactory.customer.response();
    const job = testDataFactory.customer.job.response();
    const day = testDataFactory.calendar.day.futureWorkday();
    const start = 20;

    it('should open dialog and dispatch if confirmed', () => {
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(true));
    
      dispatcher.dispatch(calendarEvents.confirmCalendarEntryProposal({
        customerJob: {
          customer,
          ...job,
        },
        timeInterval: {
          start,
          end: start + job.duration,
        },
        day,
      })); 
    
      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Rögzíted ezt a munkát erre az időpontra?',
        content: expect.any(String),
      });
      validateDispatcher(dispatchSpy, calendarApiEvents.createCalendarEntryInitiated({
        entryType: CalendarEntryType.Work,
        day,
        title: job.title,
        start: start,
        end: start + job.duration,
        description: job.description,
        additionalPrice: job.additionalPrice,
        prices: job.prices.map((p) => {
          return {
            priceId: p.priceId,
            quantity: p.quantity,
          };
        }),
        customerId: customer.customerId,
      }));
    });
    
    it('should open dialog and not dispatch anything if cancelled', () => {    
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(false)); 
      
      dispatcher.dispatch(calendarEvents.confirmCalendarEntryProposal({
        customerJob: {
          customer,
          ...job,
        },
        timeInterval: {
          start,
          end: start + job.duration,
        },
        day,
      })); 
    
      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Rögzíted ezt a munkát erre az időpontra?',
        content: expect.any(String),
      });
      validateDispatcher(dispatchSpy);
    });
  });

  describe('dispatching confirmNoShowResolution', () => {
    const originalCalendarEntry = testDataFactory.calendar.entry.response.work();

    it('should open dialog and dispatch if confirmed', () => {
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(true));
    
      dispatcher.dispatch(calendarEvents.confirmNoShowResolution(originalCalendarEntry)); 
    
      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Megerősíted, hogy nem jött el?',
        content: `${originalCalendarEntry.title}`,
      });
      validateDispatcher(dispatchSpy, calendarApiEvents.resolveCalendarWorkEntryInitiated({
        calendarEntryId: originalCalendarEntry.calendarEntryId,
        status: CalendarEntryResolutionStatus.NoShow,
        day: originalCalendarEntry.day,
      }));
    });
    
    it('should open dialog and not dispatch anything if cancelled', () => {    
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(false));
    
      dispatcher.dispatch(calendarEvents.confirmNoShowResolution(originalCalendarEntry)); 
    
      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Megerősíted, hogy nem jött el?',
        content: `${originalCalendarEntry.title}`,
      });
      validateDispatcher(dispatchSpy);
    });
  });
});
