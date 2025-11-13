import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { Observable, of, throwError } from 'rxjs';
import { calendarApiActions } from '@household/web/app/hairdressing/calendar/state/calendar.actions';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { expectEffectMultipleEmission } from '@household/web/utils/unit-testing';
import { CalendarApiEffects } from '@household/web/app/hairdressing/calendar/state/calendar-api.effects';
import { CalendarService } from '@household/web/services/calendar.service';
import { progressActions } from '@household/web/state/progress/progress.actions';
import { notificationActions } from '@household/web/state/notification/notification.actions';

describe('Calendar API effects', () => {
  let actions$: Observable<any>;
  let effects: CalendarApiEffects;
  let store: MockStore;
  let mockCalendarService: jasmine.SpyObj<CalendarService>;

  beforeEach(() => {
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
          useValue: jasmine.createSpyObj<CalendarService>('CalendarService', [
            'listCalendarDays',
            'updateCalendarDay',
            'deleteCalendarDay',
            'createCalendarEntry',
            'updateCalendarEntry',
            'deleteCalendarEntry',
            'resolveCalendarWorkEntry',
          ]), 
        },
      ],
    });

    effects = TestBed.inject(CalendarApiEffects);
    store = TestBed.inject(MockStore);
    mockCalendarService = TestBed.inject(CalendarService) as jasmine.SpyObj<CalendarService>;
  });

  describe('On List calendar days initiated', () => {
    it('should dispatch [Calendar API] List calendar days completed', (done) => {
      const dateFrom = testDataFactory.calendar.day.pastDay();
      const dateTo = testDataFactory.calendar.day.futureDay();
      const dayResponse = testDataFactory.calendar.day.response.workday();

      mockCalendarService.listCalendarDays.and.returnValue(of([dayResponse]));

      actions$ = of(calendarApiActions.listCalendarDaysInitiated({
        dateFrom,
        dateTo,
      }));

      effects.listCalendarDays.subscribe((result) => {
        expect(result).toEqual(calendarApiActions.listCalendarDaysCompleted({
          days: [dayResponse],
        }));
        expect(mockCalendarService.listCalendarDays).toHaveBeenCalledWith({
          dateFrom, 
          dateTo,
        });
        done();
      });
    });

    it('should dispatch error if unable to get data from API', (done) => {
      const dateFrom = testDataFactory.calendar.day.pastDay();
      const dateTo = testDataFactory.calendar.day.futureDay();

      mockCalendarService.listCalendarDays.and.returnValue(throwError(() => new Error('Calendar API error')));

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
        expect(mockCalendarService.listCalendarDays).toHaveBeenCalledWith({
          dateFrom, 
          dateTo,
        });
        done();
      });
    });
  });

  describe('On Update calendar day initiated', () => {
    it('should dispatch [Calendar API] Update calendar day completed', (done) => {
      const day = testDataFactory.calendar.day.futureDay();
      const request = testDataFactory.calendar.day.request.vacation();

      mockCalendarService.updateCalendarDay.and.returnValue(of(undefined));

      actions$ = of(calendarApiActions.updateCalendarDayInitiated({
        day,
        ...request,
      }));

      effects.updateCalendarDay.subscribe((result) => {
        expect(result).toEqual(calendarApiActions.updateCalendarDayCompleted({
          day,
          ...request,
        }));
        expect(mockCalendarService.updateCalendarDay).toHaveBeenCalledWith(day, request);
        done();
      });
    });

    it('should dispatch error if unable to get data from API', (done) => {
      const day = testDataFactory.calendar.day.futureDay();
      const request = testDataFactory.calendar.day.request.vacation();

      mockCalendarService.updateCalendarDay.and.returnValue(throwError(() => new Error('Calendar API error')));

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
        expect(mockCalendarService.updateCalendarDay).toHaveBeenCalledWith(day, request);
        done();
      });
    });
  });

  describe('On Delete calendar day initiated', () => {
    it('should dispatch [Calendar API] Delete calendar day completed', (done) => {
      const day = testDataFactory.calendar.day.futureDay();

      mockCalendarService.deleteCalendarDay.and.returnValue(of(undefined));

      actions$ = of(calendarApiActions.deleteCalendarDayInitiated({
        day,
      }));

      effects.deleteCalendarDay.subscribe((result) => {
        expect(result).toEqual(calendarApiActions.deleteCalendarDayCompleted({
          day,
        }));
        expect(mockCalendarService.deleteCalendarDay).toHaveBeenCalledWith(day);
        done();
      });
    });

    it('should dispatch error if unable to get data from API', (done) => {
      const day = testDataFactory.calendar.day.futureDay();

      mockCalendarService.deleteCalendarDay.and.returnValue(throwError(() => new Error('Calendar API error')));

      actions$ = of(calendarApiActions.deleteCalendarDayInitiated({
        day,
      }));

      expectEffectMultipleEmission(effects.deleteCalendarDay, [
        progressActions.processFinished(),
        notificationActions.showMessage({
          message: 'Hiba történt',
        }),
      ], () => {
        expect(mockCalendarService.deleteCalendarDay).toHaveBeenCalledWith(day);
        done();
      });
    });
  });

  describe('On Create calendar entry initiated', () => {
    it('should dispatch [Calendar API] Create calendar entry completed with personal entry', (done) => {
      const request = testDataFactory.calendar.entry.request.personal();
      const calendarEntryId = testDataFactory.calendar.entry.id();

      mockCalendarService.createCalendarEntry.and.returnValue(of({
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
        expect(mockCalendarService.createCalendarEntry).toHaveBeenCalledWith(request);
        done();
      });
    });

    it('should dispatch [Calendar API] Create calendar entry completed with work entry', (done) => {
      const request = testDataFactory.calendar.entry.request.work();
      const calendarEntryId = testDataFactory.calendar.entry.id();
      const customer = testDataFactory.customer.response({
        customerId: request.customerId,
      });
      
      mockCalendarService.createCalendarEntry.and.returnValue(of({
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
        expect(mockCalendarService.createCalendarEntry).toHaveBeenCalledWith(request);
        done();
      });
    });

    it('should dispatch error if unable to get data from API', (done) => {
      const request = testDataFactory.calendar.entry.request.personal();

      mockCalendarService.createCalendarEntry.and.returnValue(throwError(() => new Error('Calendar API error')));

      actions$ = of(calendarApiActions.createCalendarEntryInitiated({
        ...request,
      }));

      expectEffectMultipleEmission(effects.createCalendarEntry, [
        progressActions.processFinished(),
        notificationActions.showMessage({
          message: 'Hiba történt',
        }),
      ], () => {
        expect(mockCalendarService.createCalendarEntry).toHaveBeenCalledWith(request);
        done();
      });
    });
  });

  describe('On Update calendar entry initiated', () => {
    it('should dispatch [Calendar API] Update calendar entry completed with personal entry', (done) => {
      const request = testDataFactory.calendar.entry.request.personal();
      const calendarEntryId = testDataFactory.calendar.entry.id();

      mockCalendarService.updateCalendarEntry.and.returnValue(of({
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
        expect(mockCalendarService.updateCalendarEntry).toHaveBeenCalledWith(calendarEntryId, request);
        done();
      });
    });

    it('should dispatch [Calendar API] Update calendar entry completed with work entry', (done) => {
      const request = testDataFactory.calendar.entry.request.work();
      const calendarEntryId = testDataFactory.calendar.entry.id();
      const customer = testDataFactory.customer.response({
        customerId: request.customerId,
      });
      
      mockCalendarService.updateCalendarEntry.and.returnValue(of({
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
        expect(mockCalendarService.updateCalendarEntry).toHaveBeenCalledWith(calendarEntryId, request);
        done();
      });
    });

    it('should dispatch error if unable to get data from API', (done) => {
      const calendarEntryId = testDataFactory.calendar.entry.id();
      const request = testDataFactory.calendar.entry.request.personal();

      mockCalendarService.updateCalendarEntry.and.returnValue(throwError(() => new Error('Calendar API error')));

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
        expect(mockCalendarService.updateCalendarEntry).toHaveBeenCalledWith(calendarEntryId, request);
        done();
      });
    });
  });

  describe('On Delete calendar entry initiated', () => {
    it('should dispatch [Calendar API] Delete calendar entry completed', (done) => {
      const calendarEntryId = testDataFactory.calendar.entry.id();

      mockCalendarService.deleteCalendarEntry.and.returnValue(of(undefined));

      actions$ = of(calendarApiActions.deleteCalendarEntryInitiated({
        calendarEntryId,
      }));

      effects.deleteCalendarEntry.subscribe((result) => {
        expect(result).toEqual(calendarApiActions.deleteCalendarEntryCompleted({
          calendarEntryId,
        }));
        expect(mockCalendarService.deleteCalendarEntry).toHaveBeenCalledWith(calendarEntryId);
        done();
      });
    });

    it('should dispatch error if unable to get data from API', (done) => {
      const calendarEntryId = testDataFactory.calendar.entry.id();

      mockCalendarService.deleteCalendarEntry.and.returnValue(throwError(() => new Error('Calendar API error')));

      actions$ = of(calendarApiActions.deleteCalendarEntryInitiated({
        calendarEntryId,
      }));

      expectEffectMultipleEmission(effects.deleteCalendarEntry, [
        progressActions.processFinished(),
        notificationActions.showMessage({
          message: 'Hiba történt',
        }),
      ], () => {
        expect(mockCalendarService.deleteCalendarEntry).toHaveBeenCalledWith(calendarEntryId);
        done();
      });
    });
  });

  describe('On Resolve calendar work entry initiated', () => {
    it('should dispatch [Calendar API] Resolve calendar work entry completed', (done) => {
      const request = testDataFactory.calendar.entry.resolution.request();
      const calendarEntryId = testDataFactory.calendar.entry.id();
      const day = testDataFactory.calendar.day.pastDay();
      
      mockCalendarService.resolveCalendarWorkEntry.and.returnValue(of({
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
        expect(mockCalendarService.resolveCalendarWorkEntry).toHaveBeenCalledWith(calendarEntryId, request);
        done();
      });
    });

    it('should dispatch error if unable to get data from API', (done) => {
      const request = testDataFactory.calendar.entry.resolution.request();
      const calendarEntryId = testDataFactory.calendar.entry.id();
      const day = testDataFactory.calendar.day.pastDay();

      mockCalendarService.resolveCalendarWorkEntry.and.returnValue(throwError(() => new Error('Calendar API error')));

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
        expect(mockCalendarService.resolveCalendarWorkEntry).toHaveBeenCalledWith(calendarEntryId, request);
        done();
      });
    });
  });
});

