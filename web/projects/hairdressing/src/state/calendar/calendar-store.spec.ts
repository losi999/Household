import { TestBed } from '@angular/core/testing';
import { CalendarService } from '@hairdressing/services/calendar-service';
import { CalendarState, CalendarStore, provideCalendarStoreInitialState } from '@hairdressing/state/calendar/calendar-store';
import { createDispatcherSpy, DialogService, MockSignalStore, notificationEvents, provideMockSignalStore, validateDispatcher } from '@household/shared-ui';
import { Dispatcher } from '@ngrx/signals/events';
import { Mock } from 'vitest';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { calendarApiEvents, calendarEvents } from '@hairdressing/state/calendar/calendar-events';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { of, throwError } from 'rxjs';
import { Calendar } from '@household/shared/types/types';
import { CustomerStore } from '@hairdressing/state/customer/customer-store';
import { CalendarWorkdayDialog } from '@hairdressing/app/calendar/calendar-workday-dialog/calendar-workday-dialog';
import { CalendarDayType, CalendarEntryResolutionStatus, CalendarEntryType } from '@household/shared/enums';
import { CalendarEntryDetailsDialog, CalendarEntryDetailsDialogResult } from '@hairdressing/app/calendar/calendar-entry-details-dialog/calendar-entry-details-dialog';
import { CalendarEntryEditDialog } from '@hairdressing/app/calendar/calendar-entry-edit-dialog/calendar-entry-edit-dialog';
import { CalendarEntryPayingDialog } from '@hairdressing/app/calendar/calendar-entry-paying-dialog/calendar-entry-paying-dialog';
import { dayLimitTestCases, defaultDayLimitTestCases } from '@hairdressing/testing/day-limit-test-data';
import { WORKDAY_START, WORKDAY_END } from '@household/shared/constants';
import { LimitedCalendarDay } from '@hairdressing/types';

describe('Calendar store', () => {
  let initialState: CalendarState; 
  let store: InstanceType<typeof CalendarStore>;
  let dispatcher: Dispatcher;
  let dispatchSpy: Mock;
  let mockCalendarService: MockService<CalendarService>;
  let mockDialogService: MockService<DialogService>;
  let mockMatDialog: MockService<MatDialog>;
  let mockCustomerStore: MockSignalStore<typeof CustomerStore>;

  const validateState = (currentValue?: Partial<CalendarState>) => {
    expect(store.days(), 'days').toEqual(currentValue?.days ?? initialState.days);
  };

  const setup = (initial?: Partial<CalendarState>) => {
    TestBed.resetTestingModule();
    initialState = {
      days: {},
      ...initial,
    };
    TestBed.configureTestingModule({
      providers: [
        {
          provide: CalendarService,
          useValue: mockCalendarService.service,
        },
        {
          provide: MatDialog,
          useValue: mockMatDialog.service,
        },
        {
          provide: DialogService,
          useValue: mockDialogService.service,
        },
        provideCalendarStoreInitialState(initialState),
        provideMockSignalStore(CustomerStore, 'customerList'),
      ],
    });

    store = TestBed.inject(CalendarStore);
    dispatcher = TestBed.inject(Dispatcher);
    dispatchSpy = createDispatcherSpy(dispatcher);
    mockCustomerStore = TestBed.inject<MockSignalStore<typeof CustomerStore>>(CustomerStore);
  };

  beforeEach(() => {
    mockCalendarService = createMockService('listCalendarDays', 'updateCalendarDay', 'deleteCalendarDay', 'createCalendarEntry', 'updateCalendarEntry', 'deleteCalendarEntry', 'resolveCalendarWorkEntry');
    mockDialogService = createMockService('openConfirmationDialog');
    mockMatDialog = createMockService('open');
  
    setup();
  });

  it('should initialize', () => {
    validateState();
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
      validateState();
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
      validateState();
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
      validateState();
    });
  });

  describe('dispatching listCalendarMonth', () => {
    it('should calculate month and dispatch', () => {    

      dispatcher.dispatch(calendarEvents.listCalendarMonth(new Date(2026, 5, 3))); 
    
      validateDispatcher(dispatchSpy, calendarApiEvents.listCalendarDaysInitiated({
        dateFrom: '2026-06-01',
        dateTo: '2026-06-30',
      }));
      validateState();
    });
  });

  describe('dispatching setWorkDay', () => {
    it('should open dialog and reset calendar day if submitted', () => {
      const dayResponse = testDataFactory.calendar.day.response.workday(); 

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
      validateState();
    });

    it('should open dialog and update calendar day to vacation if submitted', () => {
      const dayResponse = testDataFactory.calendar.day.response.workday(); 

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
      validateState();
    });

    it('should open dialog and update calendar day to workday if submitted', () => {
      const dayResponse = testDataFactory.calendar.day.response.workday(); 

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
      validateState();
    });
    
    it('should open dialog and not dispatch anything if cancelled', () => {   
      const dayResponse = testDataFactory.calendar.day.response.workday(); 

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
      validateState();
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
      validateState();
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
      validateState();
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
      validateState();
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
      validateState();
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
      validateState();
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
      validateState();
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
      validateState();
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
      validateState();
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
      validateState();
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
      validateState();
    });
    
    it('should open dialog and not dispatch anything if cancelled', () => {    
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(false));
    
      dispatcher.dispatch(calendarEvents.deleteCalendarEntry(originalCalendarEntry)); 
    
      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Törölni akarod ezt a bejegyzést a naptárból?', 
        content: originalCalendarEntry.title,
      });
      validateDispatcher(dispatchSpy);
      validateState();
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
      validateState();
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
      validateState();
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
      validateState();
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
      validateState();
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
      validateState();
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
      validateState();
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
      validateState();
    });
    
    it('should open dialog and not dispatch anything if cancelled', () => {    
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(false));
    
      dispatcher.dispatch(calendarEvents.confirmNoShowResolution(originalCalendarEntry)); 
    
      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Megerősíted, hogy nem jött el?',
        content: `${originalCalendarEntry.title}`,
      });
      validateDispatcher(dispatchSpy);
      validateState();
    });
  });

  describe('dispatching listCalendarDaysInitiated', () => {
    const dateFrom = testDataFactory.calendar.day.pastDay();
    const dateTo = testDataFactory.calendar.day.futureDay();
    it('should call API and dispatch response', () => {
      const calendarList = [testDataFactory.calendar.day.response.workday()];
      mockCalendarService.functions.listCalendarDays.mockReturnValue(of(calendarList));
    
      dispatcher.dispatch(calendarApiEvents.listCalendarDaysInitiated({
        dateFrom,
        dateTo,
      }));
    
      validateFunctionCall(mockCalendarService.functions.listCalendarDays, {
        dateFrom,
        dateTo,
      });
      validateDispatcher(dispatchSpy, calendarApiEvents.listCalendarDaysCompleted(calendarList));
      validateState();
    });
    
    it('should call API and show notification if there is an error', () => {
      mockCalendarService.functions.listCalendarDays.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));
    
      dispatcher.dispatch(calendarApiEvents.listCalendarDaysInitiated({
        dateFrom,
        dateTo,
      }));
    
      validateFunctionCall(mockCalendarService.functions.listCalendarDays, {
        dateFrom,
        dateTo,
      });
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
      validateState();
    });
  });

  describe('dispatching updateCalendarDayInitiated', () => {
    const day = testDataFactory.calendar.day.futureDay();
    const dayRequest = testDataFactory.calendar.day.request.workday();

    it('should call API and dispatch response', () => {
      mockCalendarService.functions.updateCalendarDay.mockReturnValue(of(undefined));
    
      dispatcher.dispatch(calendarApiEvents.updateCalendarDayInitiated({
        day,
        ...dayRequest,
      }));
    
      validateFunctionCall(mockCalendarService.functions.updateCalendarDay, day, dayRequest);
      validateDispatcher(dispatchSpy, calendarApiEvents.updateCalendarDayCompleted({
        day,
        ...dayRequest,
      }));
      validateState();
    });
    
    it('should call API and show notification if there is an error', () => {
      mockCalendarService.functions.updateCalendarDay.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));
    
      dispatcher.dispatch(calendarApiEvents.updateCalendarDayInitiated({
        day,
        ...dayRequest,
      }));
    
      validateFunctionCall(mockCalendarService.functions.updateCalendarDay, day, dayRequest);
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
      validateState();
    });
  });

  describe('dispatching deleteCalendarDayInitiated', () => {
    const day = testDataFactory.calendar.day.futureDay();
    
    it('should call API and dispatch response', () => {
      mockCalendarService.functions.deleteCalendarDay.mockReturnValue(of(undefined));
    
      dispatcher.dispatch(calendarApiEvents.deleteCalendarDayInitiated({
        day,
      }));
    
      validateFunctionCall(mockCalendarService.functions.deleteCalendarDay, day);
      validateDispatcher(dispatchSpy, calendarApiEvents.deleteCalendarDayCompleted({
        day,
      }));
      validateState();
    });
    
    it('should call API and show notification if there is an error', () => {
      mockCalendarService.functions.deleteCalendarDay.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));
    
      dispatcher.dispatch(calendarApiEvents.deleteCalendarDayInitiated({
        day,
      }));
    
      validateFunctionCall(mockCalendarService.functions.deleteCalendarDay, day);
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
      validateState();
    });
  });

  describe('dispatching createCalendarEntryInitiated', () => {
    const entryRequest = testDataFactory.calendar.entry.request.work();
    
    it('should call API and dispatch response', () => {
      const calendarEntryId = testDataFactory.calendar.entry.id();
      const customerResponse = testDataFactory.customer.response({
        customerId: entryRequest.customerId,
      });
      mockCalendarService.functions.createCalendarEntry.mockReturnValue(of({
        calendarEntryId,
      }));

      mockCustomerStore.customerList.set([customerResponse]);
    
      dispatcher.dispatch(calendarApiEvents.createCalendarEntryInitiated(entryRequest));
    
      validateFunctionCall(mockCalendarService.functions.createCalendarEntry, entryRequest);
      validateDispatcher(dispatchSpy, calendarApiEvents.createCalendarEntryCompleted({
        ...entryRequest,
        calendarEntryId,
        customer: customerResponse,
      }));
      validateState();
    });
    
    it('should call API and show notification if there is an error', () => {
      mockCalendarService.functions.createCalendarEntry.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));
    
      dispatcher.dispatch(calendarApiEvents.createCalendarEntryInitiated(entryRequest));
    
      validateFunctionCall(mockCalendarService.functions.createCalendarEntry, entryRequest);
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
      validateState();
    });
  });

  describe('dispatching updateCalendarEntryInitiated', () => {
    const entryRequest = testDataFactory.calendar.entry.request.work();
    const calendarEntryId = testDataFactory.calendar.entry.id();
    
    it('should call API and dispatch response', () => {
      const customerResponse = testDataFactory.customer.response({
        customerId: entryRequest.customerId,
      });
      mockCalendarService.functions.updateCalendarEntry.mockReturnValue(of({
        calendarEntryId,
      }));

      mockCustomerStore.customerList.set([customerResponse]);
    
      dispatcher.dispatch(calendarApiEvents.updateCalendarEntryInitiated({
        calendarEntryId,
        ...entryRequest,
      }));
    
      validateFunctionCall(mockCalendarService.functions.updateCalendarEntry, calendarEntryId, entryRequest);
      validateDispatcher(dispatchSpy, calendarApiEvents.updateCalendarEntryCompleted({
        ...entryRequest,
        calendarEntryId,
        customer: customerResponse,
      }));
      validateState();
    });
    
    it('should call API and show notification if there is an error', () => {
      mockCalendarService.functions.updateCalendarEntry.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));
    
      dispatcher.dispatch(calendarApiEvents.updateCalendarEntryInitiated({
        calendarEntryId,
        ...entryRequest,
      }));
    
      validateFunctionCall(mockCalendarService.functions.updateCalendarEntry, calendarEntryId, entryRequest);
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
      validateState();
    });
  });

  describe('dispatching deleteCalendarEntryInitiated', () => {
    const calendarEntryId = testDataFactory.calendar.entry.id();
    
    it('should call API and dispatch response', () => {
      mockCalendarService.functions.deleteCalendarEntry.mockReturnValue(of(undefined));
    
      dispatcher.dispatch(calendarApiEvents.deleteCalendarEntryInitiated({
        calendarEntryId,
      }));
    
      validateFunctionCall(mockCalendarService.functions.deleteCalendarEntry, calendarEntryId);
      validateDispatcher(dispatchSpy, calendarApiEvents.deleteCalendarEntryCompleted({
        calendarEntryId,
      }));
      validateState();
    });
    
    it('should call API and show notification if there is an error', () => {
      mockCalendarService.functions.deleteCalendarEntry.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));
    
      dispatcher.dispatch(calendarApiEvents.deleteCalendarEntryInitiated({
        calendarEntryId,
      }));
    
      validateFunctionCall(mockCalendarService.functions.deleteCalendarEntry, calendarEntryId);
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
      validateState();
    });
  });

  describe('dispatching resolveCalendarWorkEntryInitiated', () => {
    const resolutionRequest = testDataFactory.calendar.entry.resolution.request();
    const day = testDataFactory.calendar.day.futureWorkday();
    const calendarEntryId = testDataFactory.calendar.entry.id();
    
    it('should call API and dispatch response', () => {
      mockCalendarService.functions.resolveCalendarWorkEntry.mockReturnValue(of({
        calendarEntryId,
      }));
    
      dispatcher.dispatch(calendarApiEvents.resolveCalendarWorkEntryInitiated({
        calendarEntryId,
        day,
        ...resolutionRequest,
      }));
    
      validateFunctionCall(mockCalendarService.functions.resolveCalendarWorkEntry, calendarEntryId, resolutionRequest);
      validateDispatcher(dispatchSpy, calendarApiEvents.resolveCalendarWorkEntryCompleted({
        ...resolutionRequest,
        calendarEntryId,
        day,
      }));
      validateState();
    });
    
    it('should call API and show notification if there is an error', () => {
      mockCalendarService.functions.resolveCalendarWorkEntry.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));
    
      dispatcher.dispatch(calendarApiEvents.resolveCalendarWorkEntryInitiated({
        calendarEntryId,
        day,
        ...resolutionRequest,
      }));
    
      validateFunctionCall(mockCalendarService.functions.resolveCalendarWorkEntry, calendarEntryId, resolutionRequest);
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
      validateState();
    });
  });

  describe('dispatching listCalendarDaysCompleted', () => {
    let day: string;
    let workEntry: Calendar.Entry.WorkEntryResponse;
    let issueEntry: Calendar.Entry.IssueEntryResponse;
    let personalEntry: Calendar.Entry.PersonalEntryResponse;

    beforeEach(() => {
      day = testDataFactory.calendar.day.futureDay();
      workEntry = testDataFactory.calendar.entry.response.work({
        day,
      });
      issueEntry = testDataFactory.calendar.entry.response.issue({
        day,
      });
      personalEntry = testDataFactory.calendar.entry.response.personal({
        day,
      });
    });

    describe('should update store', () => {
      it('with holiday', () => {
        const dayResponse = testDataFactory.calendar.day.response.holiday({
          day,
          entries: [
            workEntry,
            personalEntry,
            issueEntry,
          ],
        });

        dispatcher.dispatch(calendarApiEvents.listCalendarDaysCompleted([dayResponse]));
        validateState({
          days: {
            [day]: {
              ...dayResponse,
              calculatedEnd: undefined,
              calculatedStart: undefined,
            },
          },
        });
        validateDispatcher(dispatchSpy);
      });

      it('with vacation', () => {
        const dayResponse = testDataFactory.calendar.day.response.vacation({
          day,
          entries: [
            workEntry,
            personalEntry,
            issueEntry,
          ],
        });

        dispatcher.dispatch(calendarApiEvents.listCalendarDaysCompleted([dayResponse]));
        validateState({
          days: {
            [day]: {
              ...dayResponse,
              calculatedEnd: undefined,
              calculatedStart: undefined,
            },
          },
        });
        validateDispatcher(dispatchSpy);
      });
      
      it('with weekend without planned work', () => {
        const dayResponse = testDataFactory.calendar.day.response.weekend({
          day,
          entries: [
            workEntry,
            personalEntry,
            issueEntry,
          ],
          start: undefined,
          end: undefined,
        });

        dispatcher.dispatch(calendarApiEvents.listCalendarDaysCompleted([dayResponse]));
        validateState({
          days: {
            [day]: {
              ...dayResponse,
              calculatedEnd: undefined,
              calculatedStart: undefined,
            },
          },
        });
        validateDispatcher(dispatchSpy);
      });
      
      it('with weekend with planned work', () => {
        const dayResponse = testDataFactory.calendar.day.response.weekend({
          day,
          entries: [
            personalEntry,
            issueEntry,
          ],
        });

        dispatcher.dispatch(calendarApiEvents.listCalendarDaysCompleted([dayResponse]));
        validateState({
          days: {
            [day]: {
              ...dayResponse,
              calculatedEnd: dayResponse.end,
              calculatedStart: dayResponse.start,
            },
          },
        });
        validateDispatcher(dispatchSpy);
      });
      
      it('with workday with planned work', () => {
        const dayResponse = testDataFactory.calendar.day.response.workday({
          day,
          entries: [
            personalEntry,
            issueEntry,
          ],
        });

        dispatcher.dispatch(calendarApiEvents.listCalendarDaysCompleted([dayResponse]));
        validateState({
          days: {
            [day]: {
              ...dayResponse,
              calculatedEnd: dayResponse.end,
              calculatedStart: dayResponse.start,
            },
          },
        });
        validateDispatcher(dispatchSpy);
      });

      describe('with work entry', () => {
        dayLimitTestCases.forEach(({ earliestStart, latestEnd, plannedStart, plannedEnd, calculatedStart, calculatedEnd }, index) => {
          it(`should calculate day limits #${index + 1}: ${earliestStart}-${latestEnd} ${plannedStart}-${plannedEnd} -> ${calculatedStart}-${calculatedEnd}`, () => {
            const dayResponse = testDataFactory.calendar.day.response.workday({
              day,
              start: plannedStart,
              end: plannedEnd,
              entries: [
                issueEntry,
                personalEntry,
                testDataFactory.calendar.entry.response.work({
                  day,
                  start: earliestStart,
                  end: earliestStart + 1,
                }),
                testDataFactory.calendar.entry.response.work({
                  day,
                  start: latestEnd - 1,
                  end: latestEnd,
                }),
              ],
            });

            dispatcher.dispatch(calendarApiEvents.listCalendarDaysCompleted([dayResponse]));
            validateState({
              days: {
                [day]: {
                  ...dayResponse,
                  calculatedEnd,
                  calculatedStart,
                },
              },
            });
            validateDispatcher(dispatchSpy);
          });
        });
      });
    });
  });

  describe('dispatching updateCalendarDayCompleted', () => {
    let day: string;
    let workEntry: Calendar.Entry.WorkEntryResponse;
    let issueEntry: Calendar.Entry.IssueEntryResponse;
    let personalEntry: Calendar.Entry.PersonalEntryResponse;

    beforeEach(() => {
      day = testDataFactory.calendar.day.futureDay();
      workEntry = testDataFactory.calendar.entry.response.work({
        day,
      });
      issueEntry = testDataFactory.calendar.entry.response.issue({
        day,
      });
      personalEntry = testDataFactory.calendar.entry.response.personal({
        day,
      });
    });

    describe('should update store', () => {
      it('to vacation', () => {
        setup({
          days: {
            [day]: {
              ...testDataFactory.calendar.day.response.workday({
                day,
                entries: [
                  workEntry,
                  personalEntry,
                  issueEntry,
                ],
                start: WORKDAY_START,
                end: WORKDAY_END,
              }),
              calculatedStart: WORKDAY_START,
              calculatedEnd: WORKDAY_END,
            },
          },
        });
        const request = testDataFactory.calendar.day.request.vacation();

        dispatcher.dispatch(calendarApiEvents.updateCalendarDayCompleted({
          day,
          ...request,
        }));
        validateState({
          days: {
            [day]: {
              calculatedStart: undefined,
              calculatedEnd: undefined,
              dayType: CalendarDayType.Vacation,
              entries: [
                workEntry,
                personalEntry,
                issueEntry,
              ],
              day,
            },
          },
        });
        validateDispatcher(dispatchSpy);
      });

      it('to workday', () => {
        setup({
          days: {
            [day]: {
              ...testDataFactory.calendar.day.response.vacation({
                day,
                entries: [
                  personalEntry,
                  issueEntry,
                ],
              }),
              calculatedStart: undefined,
              calculatedEnd: undefined,
            },
          },
        });
        const request = testDataFactory.calendar.day.request.workday();

        dispatcher.dispatch(calendarApiEvents.updateCalendarDayCompleted({
          day,
          ...request,
        }));
        validateState({
          days: {
            [day]: {
              calculatedStart: request.start,
              calculatedEnd: request.end,
              dayType: CalendarDayType.Workday,
              start: request.start,
              end: request.end,
              entries: [
                personalEntry,
                issueEntry,
              ],
              day,
            },
          },
        });
        validateDispatcher(dispatchSpy);
      });

      it('weekend to workday', () => {
        setup({
          days: {
            [day]: {
              ...testDataFactory.calendar.day.response.weekend({
                day,
                entries: [
                  personalEntry,
                  issueEntry,
                ],
              }),
              calculatedStart: undefined,
              calculatedEnd: undefined,
            },
          },
        });
        const request = testDataFactory.calendar.day.request.workday();

        dispatcher.dispatch(calendarApiEvents.updateCalendarDayCompleted({
          day,
          ...request,
        }));
        validateState({
          days: {
            [day]: {
              calculatedStart: request.start,
              calculatedEnd: request.end,
              dayType: CalendarDayType.Weekend,
              start: request.start,
              end: request.end,
              entries: [
                personalEntry,
                issueEntry,
              ],
              day,
            },
          },
        });
        validateDispatcher(dispatchSpy);
      });

      describe('with work entry', () => {
        dayLimitTestCases.forEach(({ earliestStart, latestEnd, plannedStart, plannedEnd, calculatedStart, calculatedEnd }, index) => {
          it(`should calculate day limits #${index + 1}: ${earliestStart}-${latestEnd} ${plannedStart}-${plannedEnd} -> ${calculatedStart}-${calculatedEnd}`, () => {
            const originalDay = testDataFactory.calendar.day.response.workday({
              day,
              start: WORKDAY_START,
              end: WORKDAY_END,
              entries: [
                issueEntry,
                personalEntry,
                testDataFactory.calendar.entry.response.work({
                  day,
                  start: earliestStart,
                  end: earliestStart + 1,
                }),
                testDataFactory.calendar.entry.response.work({
                  day,
                  start: latestEnd - 1,
                  end: latestEnd,
                }),
              ],
            });

            setup({
              days: {
                [day]: {
                  ...originalDay,
                  calculatedStart: undefined,
                  calculatedEnd: undefined,
                },
              },
            });

            const request = testDataFactory.calendar.day.request.workday({
              start: plannedStart,
              end: plannedEnd,
            });

            dispatcher.dispatch(calendarApiEvents.updateCalendarDayCompleted({
              day,
              ...request,
            }));
            validateState({
              days: {
                [day]: {
                  ...originalDay,
                  calculatedStart: calculatedStart,
                  calculatedEnd: calculatedEnd,
                  dayType: CalendarDayType.Workday,
                  start: request.start,
                  end: request.end,
                },
              },
            });
            validateDispatcher(dispatchSpy);
          });
        });
      });
    });
  });

  describe('dispatching deleteCalendarDayCompleted', () => {
    let day: string;
    let issueEntry: Calendar.Entry.IssueEntryResponse;
    let personalEntry: Calendar.Entry.PersonalEntryResponse;

    beforeEach(() => {
      day = testDataFactory.calendar.day.futureDay();
      issueEntry = testDataFactory.calendar.entry.response.issue({
        day,
      });
      personalEntry = testDataFactory.calendar.entry.response.personal({
        day,
      });
    });

    describe('should update store', () => {
      it('with vacation deleted', () => {
        setup({
          days: {
            [day]: {
              ...testDataFactory.calendar.day.response.vacation({
                day,
                entries: [
                  issueEntry,
                  personalEntry,
                ],
              }),
              calculatedStart: undefined,
              calculatedEnd: undefined,
            },
          },
        });

        dispatcher.dispatch(calendarApiEvents.deleteCalendarDayCompleted({
          day,
        }));

        validateState({
          days: {
            [day]: {
              calculatedStart: WORKDAY_START,
              calculatedEnd: WORKDAY_END,
              dayType: CalendarDayType.Workday,
              start: WORKDAY_START,
              end: WORKDAY_END,
              entries: [
                issueEntry,
                personalEntry,
              ],
              day,
            },
          },
        });
        validateDispatcher(dispatchSpy);
      });

      it('with planned work deleted from weekend', () => {
        setup({
          days: {
            [day]: {
              ...testDataFactory.calendar.day.response.weekend({
                day,
                entries: [
                  issueEntry,
                  personalEntry,
                ],
              }),
              calculatedStart: undefined,
              calculatedEnd: undefined,
            },
          },
        });

        dispatcher.dispatch(calendarApiEvents.deleteCalendarDayCompleted({
          day,
        }));

        validateState({
          days: {
            [day]: {
              calculatedStart: undefined,
              calculatedEnd: undefined,
              dayType: CalendarDayType.Weekend,
              start: undefined,
              end: undefined,
              entries: [
                issueEntry,
                personalEntry,
              ],
              day,
            },
          },
        });
        validateDispatcher(dispatchSpy);
      });

      it('with planned work deleted from workday', () => {
        setup({
          days: {
            [day]: {
              ...testDataFactory.calendar.day.response.workday({
                day,
                entries: [
                  issueEntry,
                  personalEntry,
                ],
              }),
              calculatedStart: undefined,
              calculatedEnd: undefined,
            },
          },
        });

        dispatcher.dispatch(calendarApiEvents.deleteCalendarDayCompleted({
          day,
        }));

        validateState({
          days: {
            [day]: {
              calculatedStart: WORKDAY_START,
              calculatedEnd: WORKDAY_END,
              dayType: CalendarDayType.Workday,
              start: WORKDAY_START,
              end: WORKDAY_END,
              entries: [
                issueEntry,
                personalEntry,
              ],
              day,
            },
          },
        });
        validateDispatcher(dispatchSpy);
      });

      describe('with work entry', () => {
        defaultDayLimitTestCases.forEach(({ earliestStart, latestEnd, plannedStart, plannedEnd, calculatedStart, calculatedEnd }, index) => {
          it(`should recalculate limits of workday #${index + 1}: ${earliestStart}-${latestEnd} ${plannedStart}-${plannedEnd} -> ${calculatedStart}-${calculatedEnd}`, () => {
            const day = testDataFactory.calendar.day.futureDay();
            const originalDay = testDataFactory.calendar.day.response.workday({
              day,
              entries: [
                issueEntry,
                personalEntry,
                testDataFactory.calendar.entry.response.work({
                  day,
                  start: earliestStart,
                  end: earliestStart + 1,
                }),
                testDataFactory.calendar.entry.response.work({
                  day,
                  start: latestEnd - 1,
                  end: latestEnd,
                }),
              ],
            });

            setup({
              days: {
                [day]: {
                  ...originalDay,
                  calculatedStart: undefined,
                  calculatedEnd: undefined,
                },
              },
            });

            dispatcher.dispatch(calendarApiEvents.deleteCalendarDayCompleted({
              day,
            }));

            validateState({
              days: {
                [day]: {
                  ...originalDay,
                  calculatedStart: calculatedStart,
                  calculatedEnd: calculatedEnd,
                  dayType: CalendarDayType.Workday,
                  start: WORKDAY_START,
                  end: WORKDAY_END,
                },
              },
            });
            validateDispatcher(dispatchSpy);
          });
        });
      });
    });
  });

  describe('dispatching createCalendarEntryCompleted', () => {
    let day: string;
    let originalDay: LimitedCalendarDay;
    let calendarEntryId: Calendar.Entry.Id;

    beforeEach(() => {
      day = testDataFactory.calendar.day.futureDay();
      calendarEntryId = testDataFactory.calendar.entry.id();
    });

    const createPersonalEntryTest = () => {
      it('with a personal entry', () => {
        const request = testDataFactory.calendar.entry.request.personal({
          day,
        });
        dispatcher.dispatch(calendarApiEvents.createCalendarEntryCompleted({
          calendarEntryId,
          customer: undefined,
          ...request,
        }));

        validateState({
          days: {
            [day]: {
              ...originalDay,
              entries: [
                {
                  ...request,
                  calendarEntryId,
                },
              ],
            },
          },
        });
        validateDispatcher(dispatchSpy);
      });
    };

    const createIssueEntryTest = () => {
      it('with a issue entry', () => {
        const request = testDataFactory.calendar.entry.request.issue({
          day,
        });

        dispatcher.dispatch(calendarApiEvents.createCalendarEntryCompleted({
          calendarEntryId,
          customer: undefined,
          ...request,
        }));

        validateState({
          days: {
            [day]: {
              ...originalDay,
              entries: [
                {
                  ...request,
                  calendarEntryId,
                },
              ],
            },
          },
        });
        validateDispatcher(dispatchSpy);
      });
    };

    const createWorkEntryTest = () => {
      it('with a work entry', () => {
        const customerResponse = testDataFactory.customer.response();
        const request = testDataFactory.calendar.entry.request.work({
          body: {
            day,
          },
        });
        dispatcher.dispatch(calendarApiEvents.createCalendarEntryCompleted({
          calendarEntryId,
          customer: customerResponse,
          ...request,
        }));
          
        const { start, end, description, title, entryType, additionalPrice } = request;

        validateState({
          days: {
            [day]: {
              ...originalDay,
              entries: [
                {
                  calendarEntryId,
                  day,
                  start,
                  end,
                  description,
                  title,
                  additionalPrice,
                  prices: undefined,
                  resolution: undefined,
                  entryType,
                  customer: customerResponse,
                },
              ],
            },
          },
        });
        validateDispatcher(dispatchSpy);
      });
    };

    describe('should update store', () => {
      describe('on a vacation', () => {
        beforeEach(() => {
          originalDay = {
            ...testDataFactory.calendar.day.response.vacation({
              day,
            }),
            calculatedStart: undefined,
            calculatedEnd: undefined,
          };

          setup({
            days: {
              [day]: originalDay,
            },
          });
        });

        createPersonalEntryTest();
        createIssueEntryTest();
        createWorkEntryTest();
      });

      describe('on a holiday', () => {
        beforeEach(() => {
          originalDay = {
            ...testDataFactory.calendar.day.response.holiday({
              day,
            }),
            calculatedStart: undefined,
            calculatedEnd: undefined,
          };

          setup({
            days: {
              [day]: originalDay,
            },
          });
        });

        createPersonalEntryTest();
        createIssueEntryTest();
        createWorkEntryTest();
      });

      describe('on a weekend without planned work', () => {
        beforeEach(() => {
          originalDay = {
            ...testDataFactory.calendar.day.response.weekend({
              day,
              start: undefined,
              end: undefined,
            }),
            calculatedStart: undefined,
            calculatedEnd: undefined,
          };

          setup({
            days: {
              [day]: originalDay,
            },
          });
        });

        createPersonalEntryTest();
        createIssueEntryTest();
        createWorkEntryTest();
      });

      describe('on a workday', () => {
        beforeEach(() => {
          originalDay = {
            ...testDataFactory.calendar.day.response.workday({
              day,
              start: WORKDAY_START,
              end: WORKDAY_END,
            }),
            calculatedStart: WORKDAY_START,
            calculatedEnd: WORKDAY_END,
          };

          setup({
            days: {
              [day]: originalDay,
            },
          });
        });

        createPersonalEntryTest();
        createIssueEntryTest();

        dayLimitTestCases.forEach(({ earliestStart, latestEnd, plannedStart, plannedEnd, calculatedStart, calculatedEnd }, index) => {
          it(`with a work entry with limits recalculated #${index + 1}: ${earliestStart}-${latestEnd} ${plannedStart}-${plannedEnd} -> ${calculatedStart}-${calculatedEnd}`, () => {
            originalDay = {
              ...testDataFactory.calendar.day.response.workday({
                day,
                start: plannedStart,
                end: plannedEnd,
                entries: [
                  testDataFactory.calendar.entry.response.work({
                    day,
                    start: latestEnd - 1,
                    end: latestEnd,
                  }),
                ],
              }),
              calculatedStart: undefined,
              calculatedEnd: undefined,
            };

            setup ({
              days: {
                [day]: originalDay,
              },
            });
            const customerResponse = testDataFactory.customer.response();
            const request = testDataFactory.calendar.entry.request.work({
              body: {
                day,
                start: earliestStart,
                end: earliestStart + 1,
              },
            });

            dispatcher.dispatch(calendarApiEvents.createCalendarEntryCompleted({
              calendarEntryId,
              customer: customerResponse,
              ...request,
            }));
          
            const { start, end, description, title, entryType, additionalPrice } = request;

            validateState({
              days: {
                [day]: {
                  ...originalDay,
                  calculatedStart,
                  calculatedEnd,
                  entries: [
                    {
                      calendarEntryId,
                      day,
                      start,
                      end,
                      description,
                      title,
                      entryType,
                      additionalPrice,
                      prices: undefined,
                      resolution: undefined,
                      customer: customerResponse,
                    },
                    ...originalDay.entries,
                  ],
                },
              },
            });
            validateDispatcher(dispatchSpy);
          });
        });
      });
    });
  });

  describe('dispatching updateCalendarEntryCompleted', () => {
    let calendarEntryId: Calendar.Entry.Id;
      
    beforeEach(() => {
      calendarEntryId = testDataFactory.calendar.entry.id(); 
    });

    describe('on the same', () => {
      let day: string;
      let originalDay: LimitedCalendarDay;
      let originalEntry: Calendar.Entry.Response;

      beforeEach(() => {
        day = testDataFactory.calendar.day.futureDay();
      });

      const updatePersonalEntryTest = () => {
        it('should update personal entry', () => {
          originalEntry = testDataFactory.calendar.entry.response.personal({
            calendarEntryId,
            day,
          });

          setup({
            days: {
              [day]: {
                ...originalDay,
                entries: [originalEntry],
              },

            },
          });

          const request = testDataFactory.calendar.entry.request.personal({
            day,
          });

          dispatcher.dispatch(calendarApiEvents.updateCalendarEntryCompleted({
            calendarEntryId,
            day,
            ...request,
            customer: undefined,
          }));

          validateState({
            days: {
              [day]: {
                ...originalDay,
                entries: [
                  {
                    ...request,
                    calendarEntryId,
                  },
                ],
              },
            },
          });
          validateDispatcher(dispatchSpy);
        });
      };

      const updateIssueEntryTest = () => {
        it('should update issue entry', () => {
          originalEntry = testDataFactory.calendar.entry.response.issue({
            calendarEntryId,
            day,
          });

          setup({
            days: {
              [day]: {
                ...originalDay,
                entries: [originalEntry],
              },

            },
          });

          const request = testDataFactory.calendar.entry.request.issue({
            day,
          });

          dispatcher.dispatch(calendarApiEvents.updateCalendarEntryCompleted({
            calendarEntryId,
            day,
            ...request,
            customer: undefined,
          }));

          validateState({
            days: {
              [day]: {
                ...originalDay,
                entries: [
                  {
                    ...request,
                    calendarEntryId,
                  },
                ],
              },
            },
          });
          validateDispatcher(dispatchSpy);
        });
      };

      const updateWorkEntryTest = () => {
        it('should update work entry', () => {
          originalEntry = testDataFactory.calendar.entry.response.work({
            calendarEntryId,
            day,
          });

          setup({
            days: {
              [day]: {
                ...originalDay,
                entries: [originalEntry],
              },

            },
          });
            
          const customerResponse = testDataFactory.customer.response();
          const request = testDataFactory.calendar.entry.request.work({
            body: {
              day,
            },
          });

          dispatcher.dispatch(calendarApiEvents.updateCalendarEntryCompleted({
            calendarEntryId,
            day,
            ...request,
            customer: customerResponse,
          }));

          const { start, end, description, title, entryType, additionalPrice } = request;

          validateState({
            days: {
              [day]: {
                ...originalDay,
                entries: [
                  {
                    calendarEntryId,
                    day,
                    start,
                    end,
                    description,
                    title,
                    additionalPrice,
                    prices: undefined,
                    resolution: undefined,
                    entryType,
                    customer: customerResponse,
                  },
                ],
              },
            },
          });
          validateDispatcher(dispatchSpy);
        });
      };

      describe('vacation day', () => {
        beforeEach(() => {
          originalDay = {
            ...testDataFactory.calendar.day.response.vacation({
              day,
            }),
            calculatedStart: undefined,
            calculatedEnd: undefined,
          };
        });
         
        updatePersonalEntryTest();
        updateIssueEntryTest();
        updateWorkEntryTest();
      });

      describe('holiday', () => {
        beforeEach(() => {
          originalDay = {
            ...testDataFactory.calendar.day.response.holiday({
              day,
            }),
            calculatedStart: undefined,
            calculatedEnd: undefined,
          };
        });
         
        updatePersonalEntryTest();
        updateIssueEntryTest();
        updateWorkEntryTest();
      });

      describe('weekend without planned work', () => {
        beforeEach(() => {
          originalDay = {
            ...testDataFactory.calendar.day.response.weekend({
              day,
              start: undefined,
              end: undefined,
            }),
            calculatedStart: undefined,
            calculatedEnd: undefined,
          };
        });
         
        updatePersonalEntryTest();
        updateIssueEntryTest();
        updateWorkEntryTest();
      });

      describe('workday', () => {
        beforeEach(() => {
          originalDay = {
            ...testDataFactory.calendar.day.response.weekend({
              day,
              start: WORKDAY_START,
              end: WORKDAY_END,
            }),
            calculatedStart: WORKDAY_START,
            calculatedEnd: WORKDAY_END,
          };
        });
         
        updatePersonalEntryTest();
        updateIssueEntryTest();

        dayLimitTestCases.forEach(({ earliestStart, latestEnd, plannedStart, plannedEnd, calculatedStart, calculatedEnd }, index) => {
          it(`should update work entry with limits recalculated #${index + 1}: ${earliestStart}-${latestEnd} ${plannedStart}-${plannedEnd} -> ${calculatedStart}-${calculatedEnd}`, () => {
            originalEntry = testDataFactory.calendar.entry.response.work({
              calendarEntryId,
              day,
            });

            const untouchedEntry = testDataFactory.calendar.entry.response.work({
              day,
              start: latestEnd - 1,
              end: latestEnd,
            });

            originalDay = {
              ...testDataFactory.calendar.day.response.workday({
                day,
                entries: [
                  originalEntry,
                  untouchedEntry,
                ],
                start: plannedStart,
                end: plannedEnd,
              }),                
              calculatedStart: undefined,
              calculatedEnd: undefined,
            };

            setup({
              days: {
                [day]: originalDay,
              },
            });

            const customerResponse = testDataFactory.customer.response();
            const request = testDataFactory.calendar.entry.request.work({
              body: {
                day,
                start: earliestStart,
                end: earliestStart + 1,
              },
            });

            dispatcher.dispatch(calendarApiEvents.updateCalendarEntryCompleted({
              calendarEntryId,
              day,
              ...request,
              customer: customerResponse,
            }));

            const { start, end, description, title, entryType, additionalPrice } = request;

            validateState({
              days: {
                [day]: {
                  ...originalDay,
                  calculatedStart,
                  calculatedEnd,
                  entries: [
                    {
                      calendarEntryId,
                      day,
                      start,
                      end,
                      description,
                      title,
                      additionalPrice,
                      prices: undefined,
                      resolution: undefined,
                      entryType,
                      customer: customerResponse,
                    },
                    untouchedEntry,
                  ],
                },
              },
            });
            validateDispatcher(dispatchSpy);
          
          });
        });
      });
      
    });

    describe('on different', () => {
      let dayFrom: string;
      let dayTo: string;
      let originalDayFrom: LimitedCalendarDay;
      let originalDayTo: LimitedCalendarDay;
      let originalEntry: Calendar.Entry.Response;

      beforeEach(() => {
        dayFrom = testDataFactory.calendar.day.pastDay();
        dayTo = testDataFactory.calendar.day.futureDay();
      });

      const updatePersonalEntryTest = () => {
        it('should update personal entry', () => {
          originalEntry = testDataFactory.calendar.entry.response.personal({
            calendarEntryId,
            day: dayFrom,
          });

          setup({
            days: {
              [dayFrom]: {
                ...originalDayFrom,
                entries: [originalEntry],
              },
              [dayTo]: originalDayTo,
            },
          });

          const request = testDataFactory.calendar.entry.request.personal({
            day: dayTo,
          });

          dispatcher.dispatch(calendarApiEvents.updateCalendarEntryCompleted({
            calendarEntryId,
            day: dayTo,
            ...request,
            customer: undefined,
          }));

          validateState({
            days: {
              [dayFrom]: {
                ...originalDayFrom,
                entries: [],
              },
              [dayTo]: {
                ...originalDayTo,
                entries: [
                  {
                    calendarEntryId,
                    ...request,
                  },
                ],
              },
            },
          });
          validateDispatcher(dispatchSpy);
        });
      };

      const updateIssueEntryTest = () => {
        it('should update issue entry', () => {
          originalEntry = testDataFactory.calendar.entry.response.issue({
            calendarEntryId,
            day: dayFrom,
          });

          setup({
            days: {
              [dayFrom]: {
                ...originalDayFrom,
                entries: [originalEntry],
              },
              [dayTo]: originalDayTo,
            },
          });

          const request = testDataFactory.calendar.entry.request.issue({
            day: dayTo,
          });

          dispatcher.dispatch(calendarApiEvents.updateCalendarEntryCompleted({
            calendarEntryId,
            day: dayTo,
            ...request,
            customer: undefined,
          }));

          validateState({
            days: {
              [dayFrom]: {
                ...originalDayFrom,
                entries: [],
              },
              [dayTo]: {
                ...originalDayTo,
                entries: [
                  {
                    calendarEntryId,
                    ...request,
                  },
                ],
              },
            },
          });
          validateDispatcher(dispatchSpy);
        });
      };

      const updateWorkEntryTest = () => {
        it('should update work entry', () => {
          originalEntry = testDataFactory.calendar.entry.response.work({
            calendarEntryId,
            day: dayFrom,
          });

          setup({
            days: {
              [dayFrom]: {
                ...originalDayFrom,
                entries: [originalEntry],
              },
              [dayTo]: originalDayTo,
            },
          });
            
          const customerResponse = testDataFactory.customer.response();
          const request = testDataFactory.calendar.entry.request.work({
            body: {
              day: dayTo,
            },
          });

          dispatcher.dispatch(calendarApiEvents.updateCalendarEntryCompleted({
            calendarEntryId,
            day: dayTo,
            ...request,
            customer: customerResponse,
          }));

          const { start, end, description, title, entryType, additionalPrice } = request;

          validateState({
            days: {
              [dayFrom]: {
                ...originalDayFrom,
                entries: [ ],
              },
              [dayTo]: {
                ...originalDayTo,
                entries: [
                  {
                    calendarEntryId,
                    day: dayTo,
                    start,
                    end,
                    description,
                    title,
                    additionalPrice,
                    prices: undefined,
                    resolution: undefined,
                    entryType,
                    customer: customerResponse,
                  },
                ],
              },
            },
          });
          validateDispatcher(dispatchSpy);
        });
      };

      describe('vacation day', () => {
        beforeEach(() => {
          originalDayFrom = {
            ...testDataFactory.calendar.day.response.vacation({
              day: dayFrom,
            }),
            calculatedStart: undefined,
            calculatedEnd: undefined,
          };

          originalDayTo = {
            ...testDataFactory.calendar.day.response.vacation({
              day: dayTo,
            }),
            calculatedStart: undefined,
            calculatedEnd: undefined,
          };
        });
         
        updatePersonalEntryTest();
        updateIssueEntryTest();
        updateWorkEntryTest();
      });

      describe('holiday', () => {
        beforeEach(() => {
          originalDayFrom = {
            ...testDataFactory.calendar.day.response.holiday({
              day: dayFrom,
            }),
            calculatedStart: undefined,
            calculatedEnd: undefined,
          };

          originalDayTo = {
            ...testDataFactory.calendar.day.response.holiday({
              day: dayTo,
            }),
            calculatedStart: undefined,
            calculatedEnd: undefined,
          };
        });
         
        updatePersonalEntryTest();
        updateIssueEntryTest();
        updateWorkEntryTest();
      });

      describe('weekend without planned work', () => {
        beforeEach(() => {
          originalDayFrom = {
            ...testDataFactory.calendar.day.response.weekend({
              day: dayFrom,
              start: undefined,
              end: undefined,
            }),
            calculatedStart: undefined,
            calculatedEnd: undefined,
          };

          originalDayTo = {
            ...testDataFactory.calendar.day.response.weekend({
              day: dayTo,
              start: undefined,
              end: undefined,
            }),
            calculatedStart: undefined,
            calculatedEnd: undefined,
          };
        });
         
        updatePersonalEntryTest();
        updateIssueEntryTest();
        updateWorkEntryTest();
      });

      describe('workday', () => {
        beforeEach(() => {
          originalDayFrom = {
            ...testDataFactory.calendar.day.response.workday({
              day: dayFrom,
              start: WORKDAY_START,
              end: WORKDAY_END,
            }),
            calculatedStart: WORKDAY_START,
            calculatedEnd: WORKDAY_END,
          };

          originalDayTo = {
            ...testDataFactory.calendar.day.response.workday({
              day: dayTo,
              start: WORKDAY_START,
              end: WORKDAY_END,
            }),
            calculatedStart: WORKDAY_START,
            calculatedEnd: WORKDAY_END,
          };
        });
         
        updatePersonalEntryTest();
        updateIssueEntryTest();

        dayLimitTestCases.forEach(({ earliestStart, latestEnd, plannedStart, plannedEnd, calculatedStart, calculatedEnd }, index) => {
          it(`should update work entry with limits recalculated #${index + 1}: ${earliestStart}-${latestEnd} ${plannedStart}-${plannedEnd} -> ${calculatedStart}-${calculatedEnd}`, () => {
            originalEntry = testDataFactory.calendar.entry.response.work({
              calendarEntryId,
              day: dayFrom,
            });

            const untouchedEntry = testDataFactory.calendar.entry.response.work({
              day: dayTo,
              start: latestEnd - 1,
              end: latestEnd,
            });

            originalDayFrom = {
              ...testDataFactory.calendar.day.response.workday({
                day: dayFrom,
                start: plannedStart,
                end: plannedEnd,
                entries: [originalEntry],
              }),
              calculatedStart: undefined,
              calculatedEnd: undefined,
            };

            originalDayTo = {
              ...testDataFactory.calendar.day.response.workday({
                day: dayTo,
                start: plannedStart,
                end: plannedEnd,
                entries: [untouchedEntry],
              }),
              calculatedStart: undefined,
              calculatedEnd: undefined,
            };

            setup({
              days: {
                [dayFrom]: originalDayFrom,
                [dayTo]: originalDayTo,
              },
            });

            const customerResponse = testDataFactory.customer.response();
            const request = testDataFactory.calendar.entry.request.work({
              body: {
                day: dayTo,
                start: earliestStart,
                end: earliestStart + 1,
              },
            });

            dispatcher.dispatch(calendarApiEvents.updateCalendarEntryCompleted({
              calendarEntryId,
              day: dayTo,
              ...request,
              customer: customerResponse,
            }));

            const { start, end, description, title, entryType, additionalPrice } = request;

            validateState({
              days: {
                [dayFrom]: {
                  ...originalDayFrom,
                  calculatedStart: plannedStart,
                  calculatedEnd: plannedEnd,
                  entries: [ ],
                },
                [dayTo]: {
                  ...originalDayTo,
                  calculatedStart,
                  calculatedEnd,
                  entries: [
                    {
                      calendarEntryId,
                      day: dayTo,
                      start,
                      end,
                      description,
                      title,
                      additionalPrice,
                      prices: undefined,
                      resolution: undefined,
                      entryType,
                      customer: customerResponse,
                    },
                    untouchedEntry,
                  ],
                },
              },
            });
            validateDispatcher(dispatchSpy);
          
          });
        });
      });
      
    });
  });

  describe('dispatching deleteCalendarEntryCompleted', () => {
    let day: string;
    let originalDay: LimitedCalendarDay;
    let calendarEntryId: Calendar.Entry.Id;
    let originalEntry: Calendar.Entry.Response;

    beforeEach(() => {
      day = testDataFactory.calendar.day.futureDay();
      calendarEntryId = testDataFactory.calendar.entry.id();
    });

    const deletePersonalEntryTest = () => {
      it('should delete a personal entry', () => { 
        originalEntry = testDataFactory.calendar.entry.response.personal({
          calendarEntryId,
          day,
        });

        setup({
          days: {
            [day]: {
              ...originalDay,
              entries: [originalEntry],
            },
          },
        });

        dispatcher.dispatch(calendarApiEvents.deleteCalendarEntryCompleted({
          calendarEntryId,
        }));

        validateState({
          days: {
            [day]: {
              ...originalDay,
              entries: [],
            },
          },
        });
        validateDispatcher(dispatchSpy);
      });
    };

    const deleteIssueEntryTest = () => {
      it('should delete a issue entry', () => { 
        originalEntry = testDataFactory.calendar.entry.response.issue({
          calendarEntryId,
          day,
        });

        setup({
          days: {
            [day]: {
              ...originalDay,
              entries: [originalEntry],
            },
          },
        });

        dispatcher.dispatch(calendarApiEvents.deleteCalendarEntryCompleted({
          calendarEntryId,
        }));

        validateState({
          days: {
            [day]: {
              ...originalDay,
              entries: [],
            },
          },
        });
        validateDispatcher(dispatchSpy);
      });
    };

    const deleteWorkEntryTest = () => {
      it('should delete a work entry', () => { 
        originalEntry = testDataFactory.calendar.entry.response.work({
          calendarEntryId,
          day,
        });

        setup({
          days: {
            [day]: {
              ...originalDay,
              entries: [originalEntry],
            },
          },
        });

        dispatcher.dispatch(calendarApiEvents.deleteCalendarEntryCompleted({
          calendarEntryId,
        }));

        validateState({
          days: {
            [day]: {
              ...originalDay,
              entries: [],
            },
          },
        });
        validateDispatcher(dispatchSpy);
      });
    };

    describe('from a vacation', () => {
      beforeEach(() => {
        originalDay = {
          ...testDataFactory.calendar.day.response.vacation({
            day,
          }),
          calculatedStart: undefined,
          calculatedEnd: undefined,
        };
      });

      deletePersonalEntryTest();
      deleteIssueEntryTest();
      deleteWorkEntryTest();
    });

    describe('from a holiday', () => {
      beforeEach(() => {
        originalDay = {
          ...testDataFactory.calendar.day.response.holiday({
            day,
          }),
          calculatedStart: undefined,
          calculatedEnd: undefined,
        };
      });

      deletePersonalEntryTest();
      deleteIssueEntryTest();
      deleteWorkEntryTest();
    });

    describe('from a weekend without planned work', () => {
      beforeEach(() => {
        originalDay = {
          ...testDataFactory.calendar.day.response.weekend({
            day,
            start: undefined,
            end: undefined,
          }),
          calculatedStart: undefined,
          calculatedEnd: undefined,
        };
      });

      deletePersonalEntryTest();
      deleteIssueEntryTest();
      deleteWorkEntryTest();
    });

    describe('from a workday', () => {
      beforeEach(() => {
        originalDay = {
          ...testDataFactory.calendar.day.response.workday({
            day,
            start: WORKDAY_START,
            end: WORKDAY_END,
          }),
          calculatedStart: WORKDAY_START,
          calculatedEnd: WORKDAY_END,
        };
      });

      deletePersonalEntryTest();
      deleteIssueEntryTest();

      dayLimitTestCases.forEach(({ earliestStart, latestEnd, plannedStart, plannedEnd, calculatedStart, calculatedEnd }, index) => {
        it(`should delete work entry with limits recalculated #${index + 1}: ${earliestStart}-${latestEnd} ${plannedStart}-${plannedEnd} -> ${calculatedStart}-${calculatedEnd}`, () => {
          originalEntry = testDataFactory.calendar.entry.response.work({
            calendarEntryId,
            day,
          });

          const earliestEntry = testDataFactory.calendar.entry.response.work({
            day,
            start: earliestStart,
            end: earliestStart + 1,
          });

          const latestEntry = testDataFactory.calendar.entry.response.work({
            day,
            start: latestEnd - 1,
            end: latestEnd,
          });

          originalDay = {
            ...testDataFactory.calendar.day.response.workday({
              day,
              start: plannedStart,
              end: plannedEnd,
              entries: [
                earliestEntry,
                originalEntry,
                latestEntry,
              ],
            }),
            calculatedStart: undefined,
            calculatedEnd: undefined,
          };

          setup({
            days: {
              [day]: originalDay,
            },
          });

          dispatcher.dispatch(calendarApiEvents.deleteCalendarEntryCompleted({
            calendarEntryId,
          }));

          validateState({
            days: {
              [day]: {
                ...originalDay,
                entries: [
                  earliestEntry,
                  latestEntry,
                ],
                calculatedStart,
                calculatedEnd,
              },
            },
          });
          validateDispatcher(dispatchSpy);
        });
      });
    });
  });

  describe('dispatching resolveCalendarWorkEntryCompleted', () => {
    let day: string;
    let calendarEntryId: Calendar.Entry.Id;
    let originalDay: LimitedCalendarDay;
    let originalEntry: Calendar.Entry.WorkEntryResponse;

    beforeEach(() => {
      day = testDataFactory.calendar.day.pastDay();
      calendarEntryId = testDataFactory.calendar.entry.id();
      originalEntry = testDataFactory.calendar.entry.response.work({
        calendarEntryId,
        day,
      });
      originalDay = {
        ...testDataFactory.calendar.day.response.workday({
          day,
          entries: [originalEntry],
          start: WORKDAY_START,
          end: WORKDAY_END,
        }),
        calculatedStart: WORKDAY_START,
        calculatedEnd: WORKDAY_END,
      };

      setup({
        days: {
          [day]: originalDay,
        },
      });
    });

    describe('should resolve work entry', () => {
      it('with no show', () => {
        const request = testDataFactory.calendar.entry.resolution.request({
          status: CalendarEntryResolutionStatus.NoShow,
        });

        dispatcher.dispatch(calendarApiEvents.resolveCalendarWorkEntryCompleted({
          calendarEntryId,
          day,
          ...request,
        }));

        validateState({
          days: {
            [day]: {
              ...originalDay,
              entries: [
                {
                  ...originalEntry,
                  resolution: {
                    status: CalendarEntryResolutionStatus.NoShow,
                    delay: undefined,
                  },
                },
              ],
            },
          },
        });
        validateDispatcher(dispatchSpy);
      });

      it('with paid', () => {   
        const delay = 5;   
        const request = testDataFactory.calendar.entry.resolution.request({
          status: CalendarEntryResolutionStatus.Paid,
          delay,
        });

        dispatcher.dispatch(calendarApiEvents.resolveCalendarWorkEntryCompleted({
          calendarEntryId,
          day,
          ...request,
        }));

        validateState({
          days: {
            [day]: {
              ...originalDay,
              entries: [
                {
                  ...originalEntry,
                  resolution: {
                    status: CalendarEntryResolutionStatus.Paid,
                    delay,
                  },
                },
              ],
            },
          },
        });
        validateDispatcher(dispatchSpy);
      });

      it('with pending transfer', () => {   
        const delay = 5;   
        const request = testDataFactory.calendar.entry.resolution.request({
          status: CalendarEntryResolutionStatus.PendingTransfer,
          delay,
        });

        dispatcher.dispatch(calendarApiEvents.resolveCalendarWorkEntryCompleted({
          calendarEntryId,
          day,
          ...request,
        }));

        validateState({
          days: {
            [day]: {
              ...originalDay,
              entries: [
                {
                  ...originalEntry,
                  resolution: {
                    status: CalendarEntryResolutionStatus.PendingTransfer,
                    delay,
                  },
                },
              ],
            },
          },
        });
        validateDispatcher(dispatchSpy);
      });
    });
  });
});
  
