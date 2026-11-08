import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { JobPriceSummary } from '@hairdressing/app/shared/job-price-summary/job-price-summary';
import { createStubComponent, elementSelectorFactory, IconText, IElementSelector } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService } from '@household/shared/common/unit-testing';
import { CalendarEntryResolutionStatus } from '@household/shared/enums';
import { Responses } from '@household/shared/types/responses';
import { CalendarEntryDetailsDialog, CalendarEntryDetailsDialogData } from './calendar-entry-details-dialog';

describe('CalendarEntryDetailsDialog', () => {
  const IconTextStub = createStubComponent(IconText);
  const JobPriceSummaryStub = createStubComponent(JobPriceSummary);

  let fixture: ComponentFixture<CalendarEntryDetailsDialog>;
  let selector: IElementSelector;
  let mockDialogRef: MockService<MatDialogRef<CalendarEntryDetailsDialog>>;

  const pastDay = '2026-11-06';
  const futureDay = '2026-11-20';

  const personalEntry: Responses.CalendarEntryPersonal = testDataFactory.calendar.entry.response.personal({
    day: futureDay,
    start: 36,
    end: 42,
    description: 'Személyes leírás',
  });
  const workEntry: Responses.CalendarEntryWork = testDataFactory.calendar.entry.response.work({
    day: futureDay,
    start: 40,
    end: 48,
    description: 'Munka leírás',
    resolution: undefined,
    prices: [
      {
        ...testDataFactory.price.response(),
        quantity: 1,
      },
    ],
  });

  const getButtonTexts = () => {
    return selector.listComponents(MatDialogClose).map(b => b.nativeElement.textContent.trim());
  };

  const getButton = (text: string) => {
    return selector.listComponents(MatDialogClose).find(b => b.nativeElement.textContent.trim() === text);
  };

  const render = async (dialogData: CalendarEntryDetailsDialogData = personalEntry) => {
    TestBed.resetTestingModule();

    mockDialogRef = createMockService('close');

    await TestBed.configureTestingModule({
      imports: [CalendarEntryDetailsDialog],
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
      .overrideComponent(CalendarEntryDetailsDialog, {
        remove: {
          imports: [
            IconText,
            JobPriceSummary,
          ],
        },
        add: {
          imports: [
            IconTextStub,
            JobPriceSummaryStub,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CalendarEntryDetailsDialog);
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

  describe('content', () => {
    it('should show the title of the entry', async () => {
      await render();

      expect(selector.getComponent(MatDialogTitle).nativeElement.textContent).toBe(personalEntry.title);
    });

    it('should show the formatted day and the time interval', async () => {
      await render();

      const [
        dayText,
        timeText,
      ] = selector.listComponents(IconTextStub);

      expect(dayText.componentInstance.icon()).toBe('calendar_month');
      expect(dayText.componentInstance.text()).toBe('2026. November 20., Friday');
      expect(timeText.componentInstance.icon()).toBe('alarm');
      expect(timeText.componentInstance.text()).toBe('9:00 - 10:30');
    });

    it('should show the description if there is any', async () => {
      await render();

      expect(selector.getComponentByCss('[mat-dialog-content]').nativeElement.textContent).toContain('Személyes leírás');
    });

    it('should not show the price summary of a non-work entry', async () => {
      await render();

      expect(selector.getComponent(JobPriceSummaryStub)).toBeFalsy();
    });

    it('should show the price summary of a work entry with prices', async () => {
      await render(workEntry);

      expect(selector.getComponent(JobPriceSummaryStub).componentInstance.cost()).toBe(workEntry);
    });

    it('should not show the price summary of a work entry without prices', async () => {
      await render({
        ...workEntry,
        prices: [],
      });

      expect(selector.getComponent(JobPriceSummaryStub)).toBeFalsy();
    });
  });

  describe('actions', () => {
    it('should offer delete, edit and close for a non-work entry', async () => {
      await render(personalEntry);

      expect(getButtonTexts()).toEqual([
        'Törlés',
        'Szerkesztés',
        'Bezárás',
      ]);
    });

    it('should offer cancel, edit and close for an unresolved future work entry', async () => {
      await render(workEntry);

      expect(getButtonTexts()).toEqual([
        'Lemondta',
        'Szerkesztés',
        'Bezárás',
      ]);
    });

    it('should offer payment and no-show too for an unresolved past work entry', async () => {
      await render({
        ...workEntry,
        day: pastDay,
      });

      expect(getButtonTexts()).toEqual([
        'Fizetés',
        'Nem jött el',
        'Lemondta',
        'Szerkesztés',
        'Bezárás',
      ]);
    });

    it('should offer only closing for a resolved work entry', async () => {
      await render({
        ...workEntry,
        day: pastDay,
        resolution: {
          status: CalendarEntryResolutionStatus.NoShow,
          delay: undefined,
        },
      });

      expect(getButtonTexts()).toEqual(['Bezárás']);
    });

    it.each([
      [
        'Fizetés',
        'pay',
      ],
      [
        'Nem jött el',
        'noShow',
      ],
      [
        'Lemondta',
        'delete',
      ],
      [
        'Szerkesztés',
        'edit',
      ],
    ])('should close the dialog on %s click with %s', async (text, result) => {
      await render({
        ...workEntry,
        day: pastDay,
      });

      getButton(text).nativeElement.click();

      await fixture.whenStable();

      expect(mockDialogRef.service.close).toHaveBeenCalledWith(result);
    });

    it('should close the dialog without a result on close click', async () => {
      await render();

      getButton('Bezárás').nativeElement.click();

      await fixture.whenStable();

      expect(mockDialogRef.service.close).toHaveBeenCalledWith('');
    });
  });
});
