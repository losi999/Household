import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuItem } from '@angular/material/menu';
import { provideRouter, Router } from '@angular/router';
import { Toolbar } from '@hairdressing/app/shared/toolbar/toolbar';
import { calendarEvents } from '@hairdressing/state/calendar/calendar-events';
import { CalendarStore } from '@hairdressing/state/calendar/calendar-store';
import { customerApiEvents } from '@hairdressing/state/customer/customer-events';
import { CustomerStore } from '@hairdressing/state/customer/customer-store';
import { priceApiEvents } from '@hairdressing/state/price/price-events';
import { LimitedCalendarDay } from '@hairdressing/types';
import { createStubComponent, elementSelectorFactory, IElementSelector, MockSignalStore, navigationEvents, provideMockDispatcher, provideMockSignalStore } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { validateFunctionCall } from '@household/shared/common/unit-testing';
import { CalendarEntryType } from '@household/shared/enums';
import { Responses } from '@household/shared/types/responses';
import { Dispatcher } from '@ngrx/signals/events';
import { CalendarVerticalDay } from '../calendar-vertical-day/calendar-vertical-day';
import { CalendarHome } from './calendar-home';

describe('CalendarHome', () => {
  const ToolbarStub = createStubComponent(Toolbar);
  const CalendarVerticalDayStub = createStubComponent(CalendarVerticalDay);

  let fixture: ComponentFixture<CalendarHome>;
  let selector: IElementSelector;
  let mockCalendarStore: MockSignalStore<typeof CalendarStore>;
  let mockCustomerStore: MockSignalStore<typeof CustomerStore>;
  let mockDispatcher: Dispatcher;

  // Tuesday of the ISO week 46 of 2026
  const todayDate = new Date(2026, 10, 10, 12);

  const customerJob = testDataFactory.customer.job.response({
    name: 'haircut',
    title: 'Hajvágás',
    duration: 6,
  });
  const customer = testDataFactory.customer.response({
    jobs: [customerJob],
  });

  const monday: LimitedCalendarDay = {
    ...testDataFactory.calendar.day.response.regular({
      day: '2026-11-09',
      entries: [],
    }),
    calculatedStart: 32,
    calculatedEnd: 80,
  };
  const tuesday: LimitedCalendarDay = {
    ...testDataFactory.calendar.day.response.regular({
      day: '2026-11-10',
      entries: [
        testDataFactory.calendar.entry.response.personal({
          start: 20,
          end: 90,
        }),
      ],
    }),
    calculatedStart: 32,
    calculatedEnd: 80,
  };
  const wednesday: LimitedCalendarDay = {
    ...testDataFactory.calendar.day.response.holiday({
      day: '2026-11-11',
    }),
    calculatedStart: undefined,
    calculatedEnd: undefined,
  };

  const getToolbar = () => {
    return selector.getComponent(ToolbarStub);
  };

  const getDayStubs = () => {
    return selector.listComponents(CalendarVerticalDayStub);
  };

  const getButton = (text: string) => {
    return Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('.week-stepper button'))
      .find(b => b.textContent.includes(text));
  };

  const listHeaders = () => {
    return Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.days-of-week .day'));
  };

  const listSettingsButtons = () => {
    return Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('.days-of-week .day button'));
  };

  const listTimes = () => {
    return Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.calendar .time'));
  };

  const render = async (params?: {
    queryParams?: { [key: string]: string };
    days?: { [date: string]: LimitedCalendarDay };
    customerList?: Responses.Customer[];
  }) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [CalendarHome],
      providers: [
        provideMockSignalStore(CalendarStore, 'days'),
        provideMockSignalStore(CustomerStore, 'customerList'),
        provideMockDispatcher(),
        provideRouter([]),
      ],
    })
      .overrideComponent(CalendarHome, {
        remove: {
          imports: [
            Toolbar,
            CalendarVerticalDay,
          ],
        },
        add: {
          imports: [
            ToolbarStub,
            CalendarVerticalDayStub,
          ],
        },
      })
      .compileComponents();

    mockCalendarStore = TestBed.inject<MockSignalStore<typeof CalendarStore>>(CalendarStore);
    mockCustomerStore = TestBed.inject<MockSignalStore<typeof CustomerStore>>(CustomerStore);
    mockDispatcher = TestBed.inject(Dispatcher);

    mockCalendarStore.days.set(params?.days ?? {
      [monday.day]: monday,
      [tuesday.day]: tuesday,
      [wednesday.day]: wednesday,
    });
    mockCustomerStore.customerList.set(params?.customerList ?? [customer]);

    await TestBed.inject(Router).navigate([], {
      queryParams: params?.queryParams ?? {},
    });

    fixture = TestBed.createComponent(CalendarHome);
    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['Date'],
    });
    vi.setSystemTime(todayDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('toolbar', () => {
    it('should have the calendar title', async () => {
      await render();

      expect(getToolbar().componentInstance.title()).toBe('Naptár');
    });

    it('should dispatch createCalendarEntry for a work entry', async () => {
      await render();

      selector.getElementByCss('hairdressing-toolbar button').nativeElement.click();
      await fixture.whenStable();

      selector.listComponents(MatMenuItem)[0].nativeElement.click();
      await fixture.whenStable();

      expect(selector.listComponents(MatMenuItem).map(i => i.nativeElement.textContent.trim())).toEqual([
        'Munka',
        'Személyes',
        'Probléma',
      ]);
      validateFunctionCall(mockDispatcher.dispatch, calendarEvents.createCalendarEntry({
        entryType: CalendarEntryType.Work,
      }), {
        scope: 'self',
      });
    });

    it('should dispatch createCalendarEntry for a personal entry', async () => {
      await render();

      selector.getElementByCss('hairdressing-toolbar button').nativeElement.click();
      await fixture.whenStable();

      selector.listComponents(MatMenuItem)[1].nativeElement.click();
      await fixture.whenStable();

      validateFunctionCall(mockDispatcher.dispatch, calendarEvents.createCalendarEntry({
        entryType: CalendarEntryType.Personal,
      }), {
        scope: 'self',
      });
    });

    it('should dispatch createCalendarEntry for an issue entry', async () => {
      await render();

      selector.getElementByCss('hairdressing-toolbar button').nativeElement.click();
      await fixture.whenStable();

      selector.listComponents(MatMenuItem)[2].nativeElement.click();
      await fixture.whenStable();

      validateFunctionCall(mockDispatcher.dispatch, calendarEvents.createCalendarEntry({
        entryType: CalendarEntryType.Issue,
      }), {
        scope: 'self',
      });
    });
  });

  describe('initialization', () => {
    it('should dispatch the listing of customers and prices', async () => {
      await render();

      validateFunctionCall(mockDispatcher.dispatch, customerApiEvents.listCustomersInitiated(), {
        scope: 'self',
      });
      validateFunctionCall(mockDispatcher.dispatch, priceApiEvents.listPricesInitiated(), {
        scope: 'self',
      });
    });

    it('should list the current week by default', async () => {
      await render();

      validateFunctionCall(mockDispatcher.dispatch, calendarEvents.listCalendarWeek({
        year: 2026,
        week: 46,
      }), {
        scope: 'self',
      });
    });

    it('should list the week given in the query parameters', async () => {
      await render({
        queryParams: {
          year: '2025',
          week: '10',
        },
      });

      validateFunctionCall(mockDispatcher.dispatch, calendarEvents.listCalendarWeek({
        year: 2025,
        week: 10,
      }), {
        scope: 'self',
      });
    });

    it('should list the week of the given date', async () => {
      await render({
        queryParams: {
          weekOf: '2026-03-04',
        },
      });

      validateFunctionCall(mockDispatcher.dispatch, calendarEvents.listCalendarWeek({
        year: 2026,
        week: 10,
      }), {
        scope: 'self',
      });
    });
  });

  describe('week stepper', () => {
    it('should dispatch changeCalendarWeek to the previous week', async () => {
      await render();

      getButton('Előző hét').click();
      await fixture.whenStable();

      validateFunctionCall(mockDispatcher.dispatch, navigationEvents.changeCalendarWeek({
        year: undefined,
        week: 45,
        weekOf: undefined,
      }), {
        scope: 'self',
      });
    });

    it('should dispatch changeCalendarWeek to the next week', async () => {
      await render();

      getButton('Következő hét').click();
      await fixture.whenStable();

      validateFunctionCall(mockDispatcher.dispatch, navigationEvents.changeCalendarWeek({
        year: undefined,
        week: 47,
        weekOf: undefined,
      }), {
        scope: 'self',
      });
    });

    it('should keep the year if it is not the current one', async () => {
      await render({
        queryParams: {
          year: '2025',
          week: '10',
        },
      });

      getButton('Következő hét').click();
      await fixture.whenStable();

      validateFunctionCall(mockDispatcher.dispatch, navigationEvents.changeCalendarWeek({
        year: 2025,
        week: 11,
        weekOf: undefined,
      }), {
        scope: 'self',
      });
    });

    it('should step to the last week of the previous year from the first week', async () => {
      await render({
        queryParams: {
          year: '2026',
          week: '1',
        },
      });

      getButton('Előző hét').click();
      await fixture.whenStable();

      validateFunctionCall(mockDispatcher.dispatch, navigationEvents.changeCalendarWeek({
        year: 2025,
        week: 52,
        weekOf: undefined,
      }), {
        scope: 'self',
      });
    });

    it('should step to the first week of the next year from the last week', async () => {
      await render({
        queryParams: {
          year: '2026',
          week: '53',
        },
      });

      getButton('Következő hét').click();
      await fixture.whenStable();

      validateFunctionCall(mockDispatcher.dispatch, navigationEvents.changeCalendarWeek({
        year: 2027,
        week: 1,
        weekOf: undefined,
      }), {
        scope: 'self',
      });
    });

    it('should dispatch changeCalendarWeek without a week on today button', async () => {
      await render({
        queryParams: {
          year: '2025',
          week: '10',
        },
      });

      getButton('Ma').click();
      await fixture.whenStable();

      validateFunctionCall(mockDispatcher.dispatch, navigationEvents.changeCalendarWeek({
        year: undefined,
        week: undefined,
        weekOf: undefined,
      }), {
        scope: 'self',
      });
    });
  });

  describe('pending customer job', () => {
    it('should not be shown without query parameters', async () => {
      await render();

      expect(fixture.nativeElement.querySelector('.pending')).toBeNull();
    });

    it('should be shown with the title and the duration of the job', async () => {
      await render({
        queryParams: {
          customerId: customer.customerId,
          jobName: 'haircut',
        },
      });

      expect(fixture.nativeElement.querySelector('.pending span').textContent.replace(/\s+/g, ' ').trim()).toBe('Időpont keresése... Hajvágás (1:30 óra)');
    });

    it('should not be shown if the customer is unknown', async () => {
      await render({
        queryParams: {
          customerId: testDataFactory.customer.id(),
          jobName: 'haircut',
        },
      });

      expect(fixture.nativeElement.querySelector('.pending')).toBeNull();
    });

    it('should not be shown if the job is unknown', async () => {
      await render({
        queryParams: {
          customerId: customer.customerId,
          jobName: 'unknown',
        },
      });

      expect(fixture.nativeElement.querySelector('.pending')).toBeNull();
    });

    it('should be passed to every day', async () => {
      await render({
        queryParams: {
          customerId: customer.customerId,
          jobName: 'haircut',
        },
      });

      getDayStubs().forEach((d) => {
        expect(d.componentInstance.pendingCustomerJob()).toEqual({
          customer,
          ...customerJob,
        });
      });
    });
  });

  describe('days of week', () => {
    it('should show a header for every day of the week', async () => {
      await render();

      expect(listHeaders()).toHaveLength(7);
      expect(listHeaders()[0].textContent.replace(/\s+/g, ' ').trim()).toContain('2026 Nov 09. Monday');
      expect(listHeaders()[6].textContent.replace(/\s+/g, ' ').trim()).toContain('2026 Nov 15. Sunday');
    });

    it('should show a settings button for every loaded non-holiday day', async () => {
      await render();

      expect(listSettingsButtons()).toHaveLength(2);
    });

    it('should dispatch setWorkDay on settings click', async () => {
      await render();

      listSettingsButtons()[1].click();
      await fixture.whenStable();

      validateFunctionCall(mockDispatcher.dispatch, calendarEvents.setWorkDay(tuesday as Exclude<Responses.CalendarDay, Responses.CalendarDayHoliday>), {
        scope: 'self',
      });
    });

    it('should not show any settings button if no day is loaded', async () => {
      await render({
        days: {},
      });

      expect(listHeaders()).toHaveLength(7);
      expect(listSettingsButtons()).toHaveLength(0);
      expect(getDayStubs()).toHaveLength(0);
    });
  });

  describe('vertical days', () => {
    it('should be shown for every loaded day in its column', async () => {
      await render();

      const days = getDayStubs();

      expect(days.map(d => d.componentInstance.day())).toEqual([
        monday,
        tuesday,
        wednesday,
      ]);
      expect(days.map(d => d.componentInstance.column())).toEqual([
        2,
        3,
        4,
      ]);
    });
  });

  describe('time column', () => {
    it('should show the default working time range', async () => {
      await render({
        days: {},
      });

      const times = listTimes();

      expect(times).toHaveLength(29);
      expect(times[0].textContent.trim()).toBe('7:00');
      expect(times[28].textContent.trim()).toBe('21:00');
      expect(times[0].style.getPropertyValue('grid-row')).toBe('29');
    });

    it('should extend to the entries outside of the default range', async () => {
      await render();

      const times = listTimes();

      expect(times[0].textContent.trim()).toBe('5:00');
      expect(times[times.length - 1].textContent.trim()).toBe('22:30');
    });
  });

  describe('calendar grid', () => {
    it('should collapse the rows outside of the default working time range', async () => {
      await render({
        days: {},
      });

      expect(selector.getElementByCss('.calendar').nativeElement.style.getPropertyValue('grid-template-rows')).toBe('repeat(28, auto) repeat(56, 20px) repeat(12, auto)');
    });

    it('should expand the rows to the entries', async () => {
      await render();

      expect(selector.getElementByCss('.calendar').nativeElement.style.getPropertyValue('grid-template-rows')).toBe('repeat(20, auto) repeat(70, 20px) repeat(6, auto)');
    });
  });
});
