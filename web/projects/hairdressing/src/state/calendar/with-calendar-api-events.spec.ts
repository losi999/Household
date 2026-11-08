import { TestBed } from '@angular/core/testing';
import { CalendarService } from '@hairdressing/services/calendar-service';
import { calendarApiEvents } from '@hairdressing/state/calendar/calendar-events';
import { CustomerStore } from '@hairdressing/state/customer/customer-store';
import { withCalendarApiEvents } from '@hairdressing/state/calendar/with-calendar-api-events';
import { createDispatcherSpy, MockSignalStore, notificationEvents, provideMockSignalStore, validateDispatcher } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { signalStore } from '@ngrx/signals';
import { Dispatcher } from '@ngrx/signals/events';
import { of, throwError } from 'rxjs';
import { Mock } from 'vitest';

describe('withCalendarApiEvents', () => {
  let dispatcher: Dispatcher;
  let dispatchSpy: Mock;
  let mockCalendarService: MockService<CalendarService>;
  let mockCustomerStore: MockSignalStore<typeof CustomerStore>;

  const setup = () => {
    TestBed.resetTestingModule();

    mockCalendarService = createMockService('listCalendarDays', 'updateCalendarDay', 'deleteCalendarDay', 'createCalendarEntry', 'updateCalendarEntry', 'deleteCalendarEntry', 'resolveCalendarWorkEntry');

    TestBed.configureTestingModule({
      providers: [
        {
          provide: CalendarService,
          useValue: mockCalendarService.service,
        },
        provideMockSignalStore(CustomerStore, 'customerList'),
      ],
    });

    TestBed.inject(signalStore({
      providedIn: 'root',
    }, withCalendarApiEvents()));
    dispatcher = TestBed.inject(Dispatcher);
    dispatchSpy = createDispatcherSpy(dispatcher);
    mockCustomerStore = TestBed.inject<MockSignalStore<typeof CustomerStore>>(CustomerStore);
  };

  beforeEach(() => {
    setup();
  });

  describe('dispatching listCalendarDaysInitiated', () => {
    const dateFrom = testDataFactory.calendar.day.pastDay();
    const dateTo = testDataFactory.calendar.day.futureDay();
    it('should call API and dispatch response', () => {
      const calendarList = [testDataFactory.calendar.day.response.regular()];
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
    });
  });

  describe('dispatching createCalendarEntryInitiated', () => {
    const entryRequest = testDataFactory.calendar.entry.request.work();
    
    it('should call API and dispatch response without customer if it is not a work entry', () => {
      const personalRequest = testDataFactory.calendar.entry.request.personal();
      const calendarEntryId = testDataFactory.calendar.entry.id();
      mockCalendarService.functions.createCalendarEntry.mockReturnValue(of({
        calendarEntryId,
      }));
      mockCustomerStore.customerList.set([testDataFactory.customer.response()]);

      dispatcher.dispatch(calendarApiEvents.createCalendarEntryInitiated(personalRequest));

      validateFunctionCall(mockCalendarService.functions.createCalendarEntry, personalRequest);
      validateDispatcher(dispatchSpy, calendarApiEvents.createCalendarEntryCompleted({
        ...personalRequest,
        calendarEntryId,
        customer: undefined,
      }));
    });

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
    });
  });

  describe('dispatching updateCalendarEntryInitiated', () => {
    const entryRequest = testDataFactory.calendar.entry.request.work();
    const calendarEntryId = testDataFactory.calendar.entry.id();
    
    it('should call API and dispatch response without customer if it is not a work entry', () => {
      const personalRequest = testDataFactory.calendar.entry.request.personal();
      mockCalendarService.functions.updateCalendarEntry.mockReturnValue(of({
        calendarEntryId,
      }));
      mockCustomerStore.customerList.set([testDataFactory.customer.response()]);

      dispatcher.dispatch(calendarApiEvents.updateCalendarEntryInitiated({
        calendarEntryId,
        ...personalRequest,
      }));

      validateFunctionCall(mockCalendarService.functions.updateCalendarEntry, calendarEntryId, personalRequest);
      validateDispatcher(dispatchSpy, calendarApiEvents.updateCalendarEntryCompleted({
        ...personalRequest,
        calendarEntryId,
        customer: undefined,
      }));
    });

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
    });
  });
});
