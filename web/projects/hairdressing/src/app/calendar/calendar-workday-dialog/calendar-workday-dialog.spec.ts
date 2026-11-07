import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonToggle } from '@angular/material/button-toggle';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatRadioButton } from '@angular/material/radio';
import { MatSlider } from '@angular/material/slider';
import { elementSelectorFactory, IElementSelector } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService } from '@household/shared/common/unit-testing';
import { CalendarDayType } from '@household/shared/enums';
import { CalendarWorkdayDialog, CalendarWorkdayDialogData } from './calendar-workday-dialog';

describe('CalendarWorkdayDialog', () => {
  let fixture: ComponentFixture<CalendarWorkdayDialog>;
  let selector: IElementSelector;
  let mockDialogRef: MockService<MatDialogRef<CalendarWorkdayDialog>>;

  const regularDay: CalendarWorkdayDialogData = testDataFactory.calendar.day.response.regular({
    day: '2026-11-20',
    start: 36,
    end: 60,
  });
  const vacationDay: CalendarWorkdayDialogData = testDataFactory.calendar.day.response.vacation({
    day: '2026-11-21',
  });

  const getDayTypeToggles = () => {
    return selector.listComponents(MatButtonToggle, MatDialogContent);
  };

  const getShiftRadios = () => {
    return selector.listComponents(MatRadioButton, MatDialogContent);
  };

  const getContentText = () => {
    return selector.getComponent(MatDialogContent).nativeElement.textContent.replace(/\s+/g, ' ').trim();
  };

  const getActionButton = (text: string) => {
    return Array.from<HTMLButtonElement>(
      selector.getComponent(MatDialogActions).nativeElement.querySelectorAll('button'),
    ).find(b => b.textContent.trim() === text);
  };

  const clickToggle = async (index: number) => {
    getDayTypeToggles()[index].nativeElement.querySelector('button').click();

    await fixture.whenStable();
  };

  const clickRadio = async (index: number) => {
    getShiftRadios()[index].nativeElement.querySelector('input').click();

    await fixture.whenStable();
  };

  const render = async (dialogData: CalendarWorkdayDialogData = regularDay) => {
    TestBed.resetTestingModule();

    mockDialogRef = createMockService('close');

    await TestBed.configureTestingModule({
      imports: [CalendarWorkdayDialog],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: dialogData,
        },
        {
          provide: MatDialogRef,
          useValue: mockDialogRef.service,
        },
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CalendarWorkdayDialog);
    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('title', () => {
    it('should be the workday settings title', async () => {
      await render();

      expect(selector.getComponent(MatDialogTitle).nativeElement.textContent.trim()).toBe('Munkanap beállításai');
    });
  });

  describe('day type selector', () => {
    it('should offer workday and vacation', async () => {
      await render();

      expect(getDayTypeToggles().map(t => t.nativeElement.textContent.trim())).toEqual([
        'Munkanap',
        'Szabadság',
      ]);
    });

    it('should select workday for a regular day', async () => {
      await render(regularDay);

      expect(getDayTypeToggles()[0].componentInstance.checked).toBe(true);
      expect(getDayTypeToggles()[1].componentInstance.checked).toBe(false);
    });

    it('should select vacation for a vacation day', async () => {
      await render(vacationDay);

      expect(getDayTypeToggles()[0].componentInstance.checked).toBe(false);
      expect(getDayTypeToggles()[1].componentInstance.checked).toBe(true);
    });
  });

  describe('shift settings', () => {
    it('should be shown for a regular day', async () => {
      await render(regularDay);

      expect(getShiftRadios().map(r => r.nativeElement.textContent.trim())).toEqual([
        'Délelőtt',
        'Délután',
        'Egyéni',
      ]);
      expect(selector.getComponent(MatSlider)).toBeTruthy();
    });

    it('should be hidden for a vacation day', async () => {
      await render(vacationDay);

      expect(getShiftRadios()).toHaveLength(0);
      expect(selector.getComponent(MatSlider)).toBeFalsy();
      expect(selector.getComponent(MatDivider)).toBeTruthy();
    });

    it('should select the custom shift with the working hours of the day by default', async () => {
      await render(regularDay);

      expect(getShiftRadios()[2].componentInstance.checked).toBe(true);
      expect(getContentText()).toContain('9:00 - 15:00 (időtartam: 6:00 óra)');
    });

    it('should set the morning shift', async () => {
      await render(regularDay);

      await clickRadio(0);

      expect(getShiftRadios()[0].componentInstance.checked).toBe(true);
      expect(getContentText()).toContain('8:00 - 15:00 (időtartam: 7:00 óra)');
    });

    it('should set the afternoon shift', async () => {
      await render(regularDay);

      await clickRadio(1);

      expect(getShiftRadios()[1].componentInstance.checked).toBe(true);
      expect(getContentText()).toContain('13:00 - 20:00 (időtartam: 7:00 óra)');
    });

    it('should restore the working hours of the day on custom shift', async () => {
      await render(regularDay);

      await clickRadio(0);
      await clickRadio(2);

      expect(getContentText()).toContain('9:00 - 15:00 (időtartam: 6:00 óra)');
    });

    it('should show the default workday if a vacation day is switched to workday', async () => {
      await render(vacationDay);

      await clickToggle(0);

      expect(getShiftRadios()).toHaveLength(3);
      expect(getContentText()).toContain('7:00 - 21:00 (időtartam: 14:00 óra)');
    });

    it('should hide the shift settings if a regular day is switched to vacation', async () => {
      await render(regularDay);

      await clickToggle(1);

      expect(getShiftRadios()).toHaveLength(0);
    });
  });

  describe('save button', () => {
    it('should close with the working hours of a regular day', async () => {
      await render(regularDay);

      getActionButton('Mentés').click();

      await fixture.whenStable();

      expect(mockDialogRef.service.close).toHaveBeenCalledWith({
        dayType: CalendarDayType.Regular,
        day: regularDay.day,
        start: 36,
        end: 60,
      });
    });

    it('should close with the selected shift', async () => {
      await render(regularDay);

      await clickRadio(1);

      getActionButton('Mentés').click();

      await fixture.whenStable();

      expect(mockDialogRef.service.close).toHaveBeenCalledWith({
        dayType: CalendarDayType.Regular,
        day: regularDay.day,
        start: 52,
        end: 80,
      });
    });

    it('should close as vacation if vacation is selected', async () => {
      await render(regularDay);

      await clickToggle(1);

      getActionButton('Mentés').click();

      await fixture.whenStable();

      expect(mockDialogRef.service.close).toHaveBeenCalledWith({
        dayType: CalendarDayType.Vacation,
        day: regularDay.day,
      });
    });

    it('should close as regular day with the default hours if a vacation day is switched to workday', async () => {
      await render(vacationDay);

      await clickToggle(0);

      getActionButton('Mentés').click();

      await fixture.whenStable();

      expect(mockDialogRef.service.close).toHaveBeenCalledWith({
        dayType: CalendarDayType.Regular,
        day: vacationDay.day,
        start: 28,
        end: 84,
      });
    });
  });

  describe('reset button', () => {
    it('should close with the day only', async () => {
      await render(regularDay);

      getActionButton('Alaphelyzetbe állítás').click();

      await fixture.whenStable();

      expect(mockDialogRef.service.close).toHaveBeenCalledWith({
        day: regularDay.day,
      });
    });
  });

  describe('cancel button', () => {
    it('should be shown', async () => {
      await render();

      expect(getActionButton('Mégse')).toBeTruthy();
    });
  });
});
