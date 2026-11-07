import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIcon } from '@angular/material/icon';
import { calendarEvents } from '@hairdressing/state/calendar/calendar-events';
import { CustomerJob, LimitedCalendarDay } from '@hairdressing/types';
import { elementSelectorFactory, IElementSelector, provideMockDispatcher } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { validateFunctionCall } from '@household/shared/common/unit-testing';
import { CalendarEntryResolutionStatus } from '@household/shared/enums';
import { Responses } from '@household/shared/types/responses';
import { Dispatcher } from '@ngrx/signals/events';
import { CalendarVerticalDay } from './calendar-vertical-day';

describe('CalendarVerticalDay', () => {
  let fixture: ComponentFixture<CalendarVerticalDay>;
  let selector: IElementSelector;
  let mockDispatcher: Dispatcher;

  const pastDay = '2026-11-06';
  const today = '2026-11-10';
  const futureDay = '2026-11-20';

  const customer = testDataFactory.customer.response();
  const job: CustomerJob = {
    ...testDataFactory.customer.job.response({
      duration: 4,
    }),
    customer,
  };

  const workEntry: Responses.CalendarEntryWork = testDataFactory.calendar.entry.response.work({
    title: 'Hajvágás',
    start: 40,
    end: 44,
    resolution: undefined,
  });
  const personalEntry: Responses.CalendarEntryPersonal = testDataFactory.calendar.entry.response.personal({
    title: 'Ebéd',
    start: 48,
    end: 52,
  });

  const createRegularDay = (day: string, entries: Responses.CalendarEntry[] = []): LimitedCalendarDay => {
    return {
      ...testDataFactory.calendar.day.response.regular({
        day,
        entries,
      }),
      calculatedStart: 32,
      calculatedEnd: 60,
    };
  };

  const getStyle = (element: HTMLElement, property: string) => element.style.getPropertyValue(property);

  const listByClass = (className: string) => {
    return Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll(`.${className}`));
  };

  const listEntryButtons = () => {
    return Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button:not(.pending)'));
  };

  const listProposalButtons = () => {
    return Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button.pending'));
  };

  const render = async (params?: {
    day?: LimitedCalendarDay;
    column?: number;
    pendingCustomerJob?: CustomerJob;
  }) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [CalendarVerticalDay],
      providers: [provideMockDispatcher()],
    })
      .compileComponents();

    mockDispatcher = TestBed.inject(Dispatcher);

    fixture = TestBed.createComponent(CalendarVerticalDay);
    fixture.componentRef.setInput('day', params?.day ?? createRegularDay(futureDay));
    fixture.componentRef.setInput('column', params?.column ?? 3);
    fixture.componentRef.setInput('pendingCustomerJob', params?.pendingCustomerJob);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['Date'],
    });
    vi.setSystemTime(new Date(2026, 10, 10, 12));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('day background', () => {
    it('should shade the time outside of the working hours of a regular day', async () => {
      await render({
        column: 4,
      });

      const noWork = listByClass('no-work');

      expect(noWork.map(e => getStyle(e, 'grid-row'))).toEqual([
        '1/ 33',
        '61/ 97',
      ]);
      expect(noWork.map(e => getStyle(e, 'grid-column'))).toEqual([
        '4',
        '4',
      ]);
    });

    it('should shade the whole regular day if there are no working hours', async () => {
      await render({
        day: {
          ...createRegularDay(futureDay),
          calculatedStart: undefined,
          calculatedEnd: undefined,
        },
      });

      expect(listByClass('no-work').map(e => getStyle(e, 'grid-row'))).toEqual(['1 / 97']);
    });

    it('should shade a vacation day', async () => {
      await render({
        day: {
          ...testDataFactory.calendar.day.response.vacation({
            day: futureDay,
          }),
          calculatedStart: undefined,
          calculatedEnd: undefined,
        },
      });

      expect(listByClass('vacation').map(e => getStyle(e, 'grid-row'))).toEqual(['1 / 97']);
      expect(listByClass('no-work')).toHaveLength(0);
    });

    it('should shade a holiday', async () => {
      await render({
        day: {
          ...testDataFactory.calendar.day.response.holiday({
            day: futureDay,
          }),
          calculatedStart: undefined,
          calculatedEnd: undefined,
        },
      });

      expect(listByClass('holiday').map(e => getStyle(e, 'grid-row'))).toEqual(['1 / 97']);
      expect(listByClass('no-work')).toHaveLength(0);
    });
  });

  describe('entries', () => {
    it('should show a button with the title and the time interval for every entry', async () => {
      await render({
        day: createRegularDay(futureDay, [
          workEntry,
          personalEntry,
        ]),
        column: 5,
      });

      const buttons = listEntryButtons();

      expect(buttons.map(b => b.textContent.trim())).toEqual([
        'Hajvágás',
        'Ebéd',
      ]);
      expect(buttons.map(b => getStyle(b, 'grid-row'))).toEqual([
        '41 / 45',
        '49 / 53',
      ]);
      expect(buttons.map(b => getStyle(b, 'grid-column'))).toEqual([
        '5',
        '5',
      ]);
      expect(buttons[0].classList).toContain('work');
      expect(buttons[1].classList).toContain('personal');
    });

    it('should show the payment badge on an unresolved work entry of a past day', async () => {
      await render({
        day: createRegularDay(pastDay, [workEntry]),
      });

      expect(selector.getComponent(MatIcon).nativeElement.textContent).toBe('attach_money');
    });

    it('should show the payment badge on a work entry of today', async () => {
      await render({
        day: createRegularDay(today, [workEntry]),
      });

      expect(selector.getComponent(MatIcon)).toBeTruthy();
    });

    it('should not show the payment badge on a work entry of a future day', async () => {
      await render({
        day: createRegularDay(futureDay, [workEntry]),
      });

      expect(selector.getComponent(MatIcon)).toBeFalsy();
    });

    it('should not show the payment badge on a resolved work entry', async () => {
      await render({
        day: createRegularDay(pastDay, [
          {
            ...workEntry,
            resolution: {
              status: CalendarEntryResolutionStatus.Paid,
              delay: undefined,
            },
          },
        ]),
      });

      expect(selector.getComponent(MatIcon)).toBeFalsy();
    });

    it('should not show the payment badge on a non-work entry', async () => {
      await render({
        day: createRegularDay(pastDay, [personalEntry]),
      });

      expect(selector.getComponent(MatIcon)).toBeFalsy();
    });

    it('should mark a work entry with no-show resolution', async () => {
      await render({
        day: createRegularDay(pastDay, [
          {
            ...workEntry,
            resolution: {
              status: CalendarEntryResolutionStatus.NoShow,
              delay: undefined,
            },
          },
          personalEntry,
        ]),
      });

      const buttons = listEntryButtons();

      expect(buttons[0].classList).toContain('no-show');
      expect(buttons[1].classList).not.toContain('no-show');
    });

    it('should dispatch viewCalendarEntry with the day of the calendar day on click', async () => {
      await render({
        day: createRegularDay(futureDay, [workEntry]),
      });

      listEntryButtons()[0].click();

      await fixture.whenStable();

      validateFunctionCall(mockDispatcher.dispatch, calendarEvents.viewCalendarEntry({
        ...workEntry,
        day: futureDay,
      }), {
        scope: 'self',
      });
    });
  });

  describe('proposals', () => {
    it('should not be shown without a pending customer job', async () => {
      await render({
        day: createRegularDay(futureDay),
      });

      expect(listProposalButtons()).toHaveLength(0);
    });

    it('should show the whole working time of a free day', async () => {
      await render({
        day: createRegularDay(futureDay),
        column: 2,
        pendingCustomerJob: job,
      });

      const proposals = listProposalButtons();

      expect(proposals.map(b => b.textContent.trim())).toEqual(['8:00 - 15:00']);
      expect(proposals.map(b => getStyle(b, 'grid-row'))).toEqual(['33 / 61']);
      expect(proposals.map(b => getStyle(b, 'grid-column'))).toEqual(['2']);
    });

    it('should show the free intervals around the entries', async () => {
      await render({
        day: createRegularDay(futureDay, [workEntry]),
        pendingCustomerJob: job,
      });

      expect(listProposalButtons().map(b => b.textContent.trim())).toEqual([
        '8:00 - 10:00',
        '11:00 - 15:00',
      ]);
    });

    it('should leave out the intervals shorter than the job', async () => {
      await render({
        day: createRegularDay(futureDay, [
          {
            ...workEntry,
            start: 36,
            end: 58,
          },
        ]),
        pendingCustomerJob: job,
      });

      expect(listProposalButtons().map(b => b.textContent.trim())).toEqual(['8:00 - 9:00']);
    });

    it('should not be blocked by issue entries', async () => {
      await render({
        day: createRegularDay(futureDay, [
          testDataFactory.calendar.entry.response.issue({
            start: 40,
            end: 44,
          }),
        ]),
        pendingCustomerJob: job,
      });

      expect(listProposalButtons().map(b => b.textContent.trim())).toEqual(['8:00 - 15:00']);
    });

    it('should not be shown on a past day', async () => {
      await render({
        day: createRegularDay(pastDay),
        pendingCustomerJob: job,
      });

      expect(listProposalButtons()).toHaveLength(0);
    });

    it('should not be shown on today', async () => {
      await render({
        day: createRegularDay(today),
        pendingCustomerJob: job,
      });

      expect(listProposalButtons()).toHaveLength(0);
    });

    it('should not be shown on a vacation day', async () => {
      await render({
        day: {
          ...testDataFactory.calendar.day.response.vacation({
            day: futureDay,
          }),
          calculatedStart: 32,
          calculatedEnd: 60,
        },
        pendingCustomerJob: job,
      });

      expect(listProposalButtons()).toHaveLength(0);
    });

    it('should not be shown on a holiday', async () => {
      await render({
        day: {
          ...testDataFactory.calendar.day.response.holiday({
            day: futureDay,
          }),
          calculatedStart: 32,
          calculatedEnd: 60,
        },
        pendingCustomerJob: job,
      });

      expect(listProposalButtons()).toHaveLength(0);
    });

    it('should not be shown if a blacklisted customer has an appointment that day', async () => {
      const blacklisted = testDataFactory.customer.response();

      await render({
        day: createRegularDay(futureDay, [
          {
            ...workEntry,
            customer: blacklisted,
          },
        ]),
        pendingCustomerJob: {
          ...job,
          customer: {
            ...customer,
            blacklistedCustomers: [blacklisted],
          },
        },
      });

      expect(listProposalButtons()).toHaveLength(0);
    });

    it('should dispatch createCalendarEntryWithProposal on click if the interval is longer than the job', async () => {
      await render({
        day: createRegularDay(futureDay, [workEntry]),
        pendingCustomerJob: job,
      });

      listProposalButtons()[1].click();

      await fixture.whenStable();

      validateFunctionCall(mockDispatcher.dispatch, calendarEvents.createCalendarEntryWithProposal({
        customerJob: job,
        day: futureDay,
        timeInterval: {
          start: 44,
          end: 60,
        },
      }), {
        scope: 'self',
      });
    });

    it('should dispatch confirmCalendarEntryProposal on click if the interval is exactly as long as the job', async () => {
      await render({
        day: createRegularDay(futureDay, [
          {
            ...workEntry,
            start: 36,
            end: 56,
          },
        ]),
        pendingCustomerJob: job,
      });

      listProposalButtons()[0].click();

      await fixture.whenStable();

      validateFunctionCall(mockDispatcher.dispatch, calendarEvents.confirmCalendarEntryProposal({
        customerJob: job,
        day: futureDay,
        timeInterval: {
          start: 32,
          end: 36,
        },
      }), {
        scope: 'self',
      });
    });
  });
});
