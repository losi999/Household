import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { Observable, of, throwError } from 'rxjs';
import { calendarApiActions } from '@household/web/app/hairdressing/calendar/state/calendar.actions';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, expectEffectMultipleEmission, Mock, validateFunctionCall } from '@household/web/utils/unit-testing';
import { CalendarApiEffects } from '@household/web/app/hairdressing/calendar/state/calendar-api.effects';
import { CalendarService } from '@household/web/services/calendar.service';
import { progressActions } from '@household/web/state/progress/progress.actions';
import { notificationActions } from '@household/web/state/notification/notification.actions';

describe('Calendar API effects', () => {
  let actions$: Observable<any>;
  let effects: CalendarApiEffects;
  let store: MockStore;
  let mockCalendarService: Mock<CalendarService>;

  beforeEach(() => {
    mockCalendarService = createMockService('listCalendarDays', 'updateCalendarDay', 'deleteCalendarDay', 'createCalendarEntry', 'updateCalendarEntry', 'deleteCalendarEntry', 'resolveCalendarWorkEntry');

    TestBed.configureTestingModule({
      providers: [
        CalendarApiEffects,
        provideMockActions(() => actions$),
        provideMockStore({
          initialState: {
            customers: {},
          },
        }),
        {
          provide: CalendarService,
          useValue: mockCalendarService,
        },
      ],
    });

    effects = TestBed.inject(CalendarApiEffects);
    store = TestBed.inject(MockStore);
  });

  describe('On List calendar days initiated', () => {
    it('should dispatch [Calendar API] List calendar days completed', () => {
      const dateFrom = testDataFactory.calendar.day.pastDay();
      const dateTo = testDataFactory.calendar.day.futureDay();
      const dayResponse = testDataFactory.calendar.day.response.workday();

      mockCalendarService.listCalendarDays.mockReturnValue(of([dayResponse]));

      actions$ = of(calendarApiActions.listCalendarDaysInitiated({
        dateFrom,
        dateTo,
      }));

      effects.listCalendarDays.subscribe((result) => {
        expect(result).toEqual(calendarApiActions.listCalendarDaysCompleted({
          days: [dayResponse],
        }));
        validateFunctionCall(mockCalendarService.listCalendarDays, {
          dateFrom,
          dateTo,
        });
      });
    });

    it('should dispatch error if unable to get data from API', () => {
      const dateFrom = testDataFactory.calendar.day.pastDay();
      const dateTo = testDataFactory.calendar.day.futureDay();

      mockCalendarService.listCalendarDays.mockReturnValue(throwError(() => new Error('Calendar API error')));

      actions$ = of(calendarApiActions.listCalendarDaysInitiated({
        dateFrom,
        dateTo,
      }));

      expectEffectMultipleEmission(effects.listCalendarDays, [
        progressActions.processFinished(),
        notificationActions.showMessage({
          message: 'Hiba történt',
        }),
      ], () => {
        validateFunctionCall(mockCalendarService.listCalendarDays, {
          dateFrom,
          dateTo,
        });
      });
    });
  });

  describe('On Update calendar day initiated', () => {
    it('should dispatch [Calendar API] Update calendar day completed', () => {
      const day = testDataFactory.calendar.day.futureDay();
      const request = testDataFactory.calendar.day.request.vacation();

      mockCalendarService.updateCalendarDay.mockReturnValue(of(undefined));

      actions$ = of(calendarApiActions.updateCalendarDayInitiated({
        day,
        ...request,
      }));

      effects.updateCalendarDay.subscribe((result) => {
        expect(result).toEqual(calendarApiActions.updateCalendarDayCompleted({
          day,
          ...request,
        }));
        validateFunctionCall(mockCalendarService.updateCalendarDay, day, request);
      });
    });

    it('should dispatch error if unable to get data from API', () => {
      const day = testDataFactory.calendar.day.futureDay();
      const request = testDataFactory.calendar.day.request.vacation();

      mockCalendarService.updateCalendarDay.mockReturnValue(throwError(() => new Error('Calendar API error')));

      actions$ = of(calendarApiActions.updateCalendarDayInitiated({
        day,
        ...request,
      }));

      expectEffectMultipleEmission(effects.updateCalendarDay, [
        progressActions.processFinished(),
        notificationActions.showMessage({
          message: 'Hiba történt',
        }),
      ], () => {
        validateFunctionCall(mockCalendarService.updateCalendarDay, day, request);
      });
    });
  });

  describe('On Delete calendar day initiated', () => {
    it('should dispatch [Calendar API] Delete calendar day completed', () => {
      const day = testDataFactory.calendar.day.futureDay();

      mockCalendarService.deleteCalendarDay.mockReturnValue(of(undefined));

      actions$ = of(calendarApiActions.deleteCalendarDayInitiated({
        day,
      }));

      effects.deleteCalendarDay.subscribe((result) => {
        expect(result).toEqual(calendarApiActions.deleteCalendarDayCompleted({
          day,
        }));
        validateFunctionCall(mockCalendarService.deleteCalendarDay, day);
      });
    });

    it('should dispatch error if unable to get data from API', () => {
      const day = testDataFactory.calendar.day.futureDay();

      mockCalendarService.deleteCalendarDay.mockReturnValue(throwError(() => new Error('Calendar API error')));

      actions$ = of(calendarApiActions.deleteCalendarDayInitiated({
        day,
      }));

      expectEffectMultipleEmission(effects.deleteCalendarDay, [
        progressActions.processFinished(),
        notificationActions.showMessage({
          message: 'Hiba történt',
        }),
      ], () => {
        validateFunctionCall(mockCalendarService.deleteCalendarDay, day);
      });
    });
  });

  describe('On Create calendar entry initiated', () => {
    it('should dispatch [Calendar API] Create calendar entry completed with personal entry', () => {
      const request = testDataFactory.calendar.entry.request.personal();
      const calendarEntryId = testDataFactory.calendar.entry.id();

      mockCalendarService.createCalendarEntry.mockReturnValue(of({
        calendarEntryId,
      }));

      actions$ = of(calendarApiActions.createCalendarEntryInitiated({
        ...request,
      }));

      effects.createCalendarEntry.subscribe((result) => {
        expect(result).toEqual(calendarApiActions.createCalendarEntryCompleted({
          calendarEntryId,
          ...request,
          customer: undefined,
        }));
        validateFunctionCall(mockCalendarService.createCalendarEntry, request);
      });
    });

    it('should dispatch [Calendar API] Create calendar entry completed with work entry', () => {
      const request = testDataFactory.calendar.entry.request.work();
      const calendarEntryId = testDataFactory.calendar.entry.id();
      const customer = testDataFactory.customer.response({
        customerId: request.customerId,
      });
      
      mockCalendarService.createCalendarEntry.mockReturnValue(of({
        calendarEntryId,
      }));

      store.setState({
        customers: {
          customerList: [customer],
        },
      });

      actions$ = of(calendarApiActions.createCalendarEntryInitiated({
        ...request,
        customerId: request.customerId,
      }));

      effects.createCalendarEntry.subscribe((result) => {
        expect(result).toEqual(calendarApiActions.createCalendarEntryCompleted({
          calendarEntryId,
          ...request,
          customer,
        }));
        validateFunctionCall(mockCalendarService.createCalendarEntry, request);
      });
    });

    it('should dispatch error if unable to get data from API', () => {
      const request = testDataFactory.calendar.entry.request.personal();

      mockCalendarService.createCalendarEntry.mockReturnValue(throwError(() => new Error('Calendar API error')));

      actions$ = of(calendarApiActions.createCalendarEntryInitiated({
        ...request,
      }));

      expectEffectMultipleEmission(effects.createCalendarEntry, [
        progressActions.processFinished(),
        notificationActions.showMessage({
          message: 'Hiba történt',
        }),
      ], () => {
        validateFunctionCall(mockCalendarService.createCalendarEntry, request);
      });
    });
  });

  describe('On Update calendar entry initiated', () => {
    it('should dispatch [Calendar API] Update calendar entry completed with personal entry', () => {
      const request = testDataFactory.calendar.entry.request.personal();
      const calendarEntryId = testDataFactory.calendar.entry.id();

      mockCalendarService.updateCalendarEntry.mockReturnValue(of({
        calendarEntryId,
      }));

      actions$ = of(calendarApiActions.updateCalendarEntryInitiated({
        ...request,
        calendarEntryId,
      }));

      effects.updateCalendarEntry.subscribe((result) => {
        expect(result).toEqual(calendarApiActions.updateCalendarEntryCompleted({
          calendarEntryId,
          ...request,
          customer: undefined,
        }));
        validateFunctionCall(mockCalendarService.updateCalendarEntry, calendarEntryId, request);
      });
    });

    it('should dispatch [Calendar API] Update calendar entry completed with work entry', () => {
      const request = testDataFactory.calendar.entry.request.work();
      const calendarEntryId = testDataFactory.calendar.entry.id();
      const customer = testDataFactory.customer.response({
        customerId: request.customerId,
      });
      
      mockCalendarService.updateCalendarEntry.mockReturnValue(of({
        calendarEntryId,
      }));

      store.setState({
        customers: {
          customerList: [customer],
        },
      });

      actions$ = of(calendarApiActions.updateCalendarEntryInitiated({
        ...request,
        calendarEntryId,
        customerId: request.customerId,
      }));

      effects.updateCalendarEntry.subscribe((result) => {
        expect(result).toEqual(calendarApiActions.updateCalendarEntryCompleted({
          calendarEntryId,
          ...request,
          customer,
        }));
        validateFunctionCall(mockCalendarService.updateCalendarEntry, calendarEntryId, request);
      });
    });

    it('should dispatch error if unable to get data from API', () => {
      const calendarEntryId = testDataFactory.calendar.entry.id();
      const request = testDataFactory.calendar.entry.request.personal();

      mockCalendarService.updateCalendarEntry.mockReturnValue(throwError(() => new Error('Calendar API error')));

      actions$ = of(calendarApiActions.updateCalendarEntryInitiated({
        calendarEntryId,
        ...request,
      }));

      expectEffectMultipleEmission(effects.updateCalendarEntry, [
        progressActions.processFinished(),
        notificationActions.showMessage({
          message: 'Hiba történt',
        }),
      ], () => {
        validateFunctionCall(mockCalendarService.updateCalendarEntry, calendarEntryId, request);
      });
    });
  });

  describe('On Delete calendar entry initiated', () => {
    it('should dispatch [Calendar API] Delete calendar entry completed', () => {
      const calendarEntryId = testDataFactory.calendar.entry.id();

      mockCalendarService.deleteCalendarEntry.mockReturnValue(of(undefined));

      actions$ = of(calendarApiActions.deleteCalendarEntryInitiated({
        calendarEntryId,
      }));

      effects.deleteCalendarEntry.subscribe((result) => {
        expect(result).toEqual(calendarApiActions.deleteCalendarEntryCompleted({
          calendarEntryId,
        }));
        validateFunctionCall(mockCalendarService.deleteCalendarEntry, calendarEntryId);
      });
    });

    it('should dispatch error if unable to get data from API', () => {
      const calendarEntryId = testDataFactory.calendar.entry.id();

      mockCalendarService.deleteCalendarEntry.mockReturnValue(throwError(() => new Error('Calendar API error')));

      actions$ = of(calendarApiActions.deleteCalendarEntryInitiated({
        calendarEntryId,
      }));

      expectEffectMultipleEmission(effects.deleteCalendarEntry, [
        progressActions.processFinished(),
        notificationActions.showMessage({
          message: 'Hiba történt',
        }),
      ], () => {
        validateFunctionCall(mockCalendarService.deleteCalendarEntry, calendarEntryId);
      });
    });
  });

  describe('On Resolve calendar work entry initiated', () => {
    it('should dispatch [Calendar API] Resolve calendar work entry completed', () => {
      const request = testDataFactory.calendar.entry.resolution.request();
      const calendarEntryId = testDataFactory.calendar.entry.id();
      const day = testDataFactory.calendar.day.pastDay();
      
      mockCalendarService.resolveCalendarWorkEntry.mockReturnValue(of({
        calendarEntryId,
      }));

      actions$ = of(calendarApiActions.resolveCalendarWorkEntryInitiated({
        ...request,
        calendarEntryId,
        day,
      }));

      effects.resolveCalendarWorkEntry.subscribe((result) => {
        expect(result).toEqual(calendarApiActions.resolveCalendarWorkEntryCompleted({
          calendarEntryId,
          ...request,
          day,
        }));
        validateFunctionCall(mockCalendarService.resolveCalendarWorkEntry, calendarEntryId, request);
      });
    });

    it('should dispatch error if unable to get data from API', () => {
      const request = testDataFactory.calendar.entry.resolution.request();
      const calendarEntryId = testDataFactory.calendar.entry.id();
      const day = testDataFactory.calendar.day.pastDay();

      mockCalendarService.resolveCalendarWorkEntry.mockReturnValue(throwError(() => new Error('Calendar API error')));

      actions$ = of(calendarApiActions.resolveCalendarWorkEntryInitiated({
        ...request,
        calendarEntryId,
        day,
      }));

      expectEffectMultipleEmission(effects.resolveCalendarWorkEntry, [
        progressActions.processFinished(),
        notificationActions.showMessage({
          message: 'Hiba történt',
        }),
      ], () => {
        validateFunctionCall(mockCalendarService.resolveCalendarWorkEntry, calendarEntryId, request);
      });
    });
  });
});

