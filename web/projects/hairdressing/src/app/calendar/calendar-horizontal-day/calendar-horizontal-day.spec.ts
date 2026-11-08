import { ComponentFixture, TestBed } from '@angular/core/testing';
import { elementSelectorFactory, IElementSelector } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { LimitedCalendarDay } from '@hairdressing/types';
import { CalendarHorizontalDay } from './calendar-horizontal-day';

describe('CalendarHorizontalDay', () => {
  let fixture: ComponentFixture<CalendarHorizontalDay>;
  let selector: IElementSelector;

  const workEntry = testDataFactory.calendar.entry.response.work({
    start: 40,
    end: 48,
  });
  const personalEntry = testDataFactory.calendar.entry.response.personal({
    start: 50,
    end: 54,
  });
  const issueEntry = testDataFactory.calendar.entry.response.issue({
    start: 56,
    end: 60,
  });

  const regularDay: LimitedCalendarDay = {
    ...testDataFactory.calendar.day.response.regular({
      entries: [
        workEntry,
        personalEntry,
        issueEntry,
      ],
    }),
    calculatedStart: 32,
    calculatedEnd: 80,
  };

  const getColumn = (element: HTMLElement) => element.style.getPropertyValue('grid-column');

  const getPending = () => selector.getElementByCss('.pending');

  const listByClass = (className: string) => {
    return Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll(`.${className}`));
  };

  const render = async (params?: {
    pendingStart?: number;
    pendingEnd?: number;
    calendarDay?: LimitedCalendarDay;
  }) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [CalendarHorizontalDay],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CalendarHorizontalDay);
    fixture.componentRef.setInput('pendingStart', params?.pendingStart ?? 36);
    fixture.componentRef.setInput('pendingEnd', params?.pendingEnd ?? 44);
    fixture.componentRef.setInput('calendarDay', params?.calendarDay ?? regularDay);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('pending interval', () => {
    it('should span from the pending start to the pending end', async () => {
      await render({
        pendingStart: 36,
        pendingEnd: 44,
      });

      expect(getColumn(getPending().nativeElement)).toBe('37 / 45');
    });
  });

  describe('regular day', () => {
    it('should shade the time before and after the working hours', async () => {
      await render();

      const noWork = listByClass('no-work');

      expect(noWork.map(getColumn)).toEqual([
        '1/ 33',
        '81/ 97',
      ]);
    });

    it('should shade the whole day if there are no working hours', async () => {
      await render({
        calendarDay: {
          ...regularDay,
          calculatedStart: undefined,
          calculatedEnd: undefined,
        },
      });

      expect(listByClass('no-work').map(getColumn)).toEqual(['1 / 97']);
    });

    it('should not show vacation or holiday marks', async () => {
      await render();

      expect(listByClass('vacation')).toHaveLength(0);
      expect(listByClass('holiday')).toHaveLength(0);
    });
  });

  describe('vacation day', () => {
    it('should shade the whole day as vacation', async () => {
      await render({
        calendarDay: {
          ...testDataFactory.calendar.day.response.vacation(),
          calculatedStart: undefined,
          calculatedEnd: undefined,
        },
      });

      expect(listByClass('vacation').map(getColumn)).toEqual(['1 / 97']);
      expect(listByClass('no-work')).toHaveLength(0);
    });
  });

  describe('holiday', () => {
    it('should shade the whole day as holiday', async () => {
      await render({
        calendarDay: {
          ...testDataFactory.calendar.day.response.holiday(),
          calculatedStart: undefined,
          calculatedEnd: undefined,
        },
      });

      expect(listByClass('holiday').map(getColumn)).toEqual(['1 / 97']);
      expect(listByClass('no-work')).toHaveLength(0);
    });
  });

  describe('entries', () => {
    it('should show every entry with its type as class on its time interval', async () => {
      await render();

      expect(listByClass('work').map(getColumn)).toEqual(['41 / 49']);
      expect(listByClass('personal').map(getColumn)).toEqual(['51 / 55']);
      expect(listByClass('issue').map(getColumn)).toEqual(['57 / 61']);
    });
  });
});
