import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CalendarService } from '@hairdressing/services/calendar-service';
import { calendarApiEvents, calendarEvents } from '@hairdressing/state/calendar/calendar-events';
import { CalendarState, CalendarStore, provideCalendarStoreInitialState } from '@hairdressing/state/calendar/calendar-store';
import { CustomerStore } from '@hairdressing/state/customer/customer-store';
import { DialogService, provideMockSignalStore } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService } from '@household/shared/common/unit-testing';
import { CalendarDayType, CalendarEntryType } from '@household/shared/enums';
import { Dispatcher } from '@ngrx/signals/events';
import { of } from 'rxjs';

// The behavior of each store feature is covered in its own spec (with-calendar-reducer.spec.ts,
// with-calendar-events.spec.ts, with-calendar-api-events.spec.ts). This spec only verifies that the store
// provides its initial state and has every feature wired in.
describe('Calendar store', () => {
  let initialState: CalendarState;
  let store: InstanceType<typeof CalendarStore>;
  let dispatcher: Dispatcher;
  let mockCalendarService: MockService<CalendarService>;
  let mockDialogService: MockService<DialogService>;
  let mockMatDialog: MockService<MatDialog>;

  const setup = (initial?: Partial<CalendarState>) => {
    TestBed.resetTestingModule();

    initialState = {
      days: {},
      ...initial,
    };

    mockCalendarService = createMockService('listCalendarDays', 'updateCalendarDay', 'deleteCalendarDay', 'createCalendarEntry', 'updateCalendarEntry', 'deleteCalendarEntry', 'resolveCalendarWorkEntry');
    mockDialogService = createMockService('openConfirmationDialog');
    mockMatDialog = createMockService('open');

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
  };

  it('should initialize with the provided state', () => {
    const day = testDataFactory.calendar.day.futureWorkday();
    const days = {
      [day]: {
        ...testDataFactory.calendar.day.response.regular({
          day,
        }),
        calculatedStart: 10,
        calculatedEnd: 20,
      },
    };

    setup({
      days,
    });

    expect(store.days()).toEqual(days);
  });

  it('should initialize with the default state', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: CalendarService,
          useValue: createMockService('listCalendarDays').service,
        },
        {
          provide: MatDialog,
          useValue: createMockService('open').service,
        },
        {
          provide: DialogService,
          useValue: createMockService('openConfirmationDialog').service,
        },
        provideCalendarStoreInitialState(),
        provideMockSignalStore(CustomerStore, 'customerList'),
      ],
    });

    store = TestBed.inject(CalendarStore);

    expect(store.days()).toEqual({});
  });

  it('should have the reducer wired in', () => {
    setup();
    const day = testDataFactory.calendar.day.futureWorkday();
    const dayResponse = testDataFactory.calendar.day.response.holiday({
      day,
      entries: [],
    });

    dispatcher.dispatch(calendarApiEvents.listCalendarDaysCompleted([dayResponse]));

    expect(store.days()).toEqual({
      [day]: {
        ...dayResponse,
        calculatedStart: undefined,
        calculatedEnd: undefined,
      },
    });
  });

  it('should have the UI event handlers wired in', () => {
    setup();
    mockMatDialog.functions.open.mockReturnValue({
      afterClosed: () => of(undefined),
    } as MatDialogRef<any>);

    dispatcher.dispatch(calendarEvents.createCalendarEntry({
      entryType: CalendarEntryType.Personal,
    }));

    expect(mockMatDialog.functions.open).toHaveBeenCalledWith(expect.anything(), expect.anything());
  });

  it('should have the API event handlers and the reducer work together', () => {
    setup();
    const day = testDataFactory.calendar.day.futureWorkday();
    const dayResponse = testDataFactory.calendar.day.response.regular({
      day,
      entries: [],
    });
    setup({
      days: {
        [day]: {
          ...dayResponse,
          calculatedStart: dayResponse.start,
          calculatedEnd: dayResponse.end,
        },
      },
    });
    mockCalendarService.functions.deleteCalendarDay.mockReturnValue(of(undefined));

    dispatcher.dispatch(calendarApiEvents.deleteCalendarDayInitiated({
      day,
    }));

    expect(mockCalendarService.functions.deleteCalendarDay).toHaveBeenCalledWith(day);
    expect(store.days()[day]).toEqual(expect.objectContaining({
      dayType: CalendarDayType.Regular,
      start: undefined,
      end: undefined,
    }));
  });
});
