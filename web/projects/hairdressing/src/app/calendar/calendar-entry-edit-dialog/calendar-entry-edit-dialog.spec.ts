import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconButton } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatSlider } from '@angular/material/slider';
import { CalendarHorizontalDay } from '@hairdressing/app/calendar/calendar-horizontal-day/calendar-horizontal-day';
import { CustomerAutocompleteInput } from '@hairdressing/app/customer/customer-autocomplete-input/customer-autocomplete-input';
import { DurationStepper } from '@hairdressing/app/shared/duration-stepper/duration-stepper';
import { calendarEvents } from '@hairdressing/state/calendar/calendar-events';
import { CalendarStore } from '@hairdressing/state/calendar/calendar-store';
import { LimitedCalendarDay } from '@hairdressing/types';
import { ClearableInput, createStubComponent, elementSelectorFactory, IElementSelector, MockSignalStore, provideMockDispatcher, provideMockSignalStore } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { CalendarEntryType } from '@household/shared/enums';
import { Responses } from '@household/shared/types/responses';
import { Dispatcher } from '@ngrx/signals/events';
import { CalendarEntryEditDialog, CalendarEntryEditDialogData } from './calendar-entry-edit-dialog';

describe('CalendarEntryEditDialog', () => {
  const ClearableInputStub = createStubComponent(ClearableInput);
  const DurationStepperStub = createStubComponent(DurationStepper);
  const CustomerAutocompleteInputStub = createStubComponent(CustomerAutocompleteInput);
  const CalendarHorizontalDayStub = createStubComponent(CalendarHorizontalDay);

  let fixture: ComponentFixture<CalendarEntryEditDialog>;
  let selector: IElementSelector;
  let mockDialogRef: MockService<MatDialogRef<CalendarEntryEditDialog>>;
  let mockDispatcher: Dispatcher;
  let mockCalendarStore: MockSignalStore<typeof CalendarStore>;

  // Friday
  const day = '2026-11-20';
  // Saturday
  const weekendDay = '2026-11-21';

  const haircut = testDataFactory.customer.job.response({
    name: 'haircut',
    title: 'Hajvágás',
    description: 'Rövid',
    duration: 6,
    additionalPrice: 300,
  });
  const coloring = testDataFactory.customer.job.response({
    name: 'coloring',
    title: 'Festés',
    description: null,
    duration: 10,
  });
  const customer = testDataFactory.customer.response({
    jobs: [
      haircut,
      coloring,
    ],
  });

  const personalEntry: Responses.CalendarEntryPersonal = testDataFactory.calendar.entry.response.personal({
    day,
    start: 40,
    end: 48,
    title: 'Ebéd',
    description: 'Étterem',
  });
  const issueEntry: Responses.CalendarEntryIssue = testDataFactory.calendar.entry.response.issue({
    day,
    start: 40,
    end: 48,
  });
  const workEntry: Responses.CalendarEntryWork = testDataFactory.calendar.entry.response.work({
    day,
    start: 40,
    end: 46,
    title: 'Hajvágás',
    customer,
  });
  const otherWorkEntry: Responses.CalendarEntryWork = testDataFactory.calendar.entry.response.work({
    day,
    start: 44,
    end: 50,
    title: 'Másik',
  });

  const createLimitedDay = (data: Partial<LimitedCalendarDay> = {}): LimitedCalendarDay => {
    return {
      ...testDataFactory.calendar.day.response.regular({
        day,
        entries: [],
      }),
      calculatedStart: 32,
      calculatedEnd: 80,
      ...data,
    } as LimitedCalendarDay;
  };

  const getTitle = () => {
    return selector.getComponent(MatDialogTitle).nativeElement.textContent.trim();
  };

  const getClearableInput = (label: string) => {
    return selector.listComponents(ClearableInputStub).find(i => i.componentInstance.label() === label);
  };

  const getCustomerInput = () => {
    return selector.getComponent(CustomerAutocompleteInputStub);
  };

  const getJobSelect = () => {
    return selector.getComponent(MatSelect);
  };

  const getDurationStepper = () => {
    return selector.getComponent(DurationStepperStub);
  };

  const getHorizontalDay = () => {
    return selector.getComponent(CalendarHorizontalDayStub);
  };

  const getSlider = () => {
    return selector.getComponent(MatSlider);
  };

  const getDateInput = () => {
    return selector.getElementByCss<HTMLInputElement>('input[matInput]');
  };

  const getContentText = () => {
    return fixture.nativeElement.querySelector('[mat-dialog-content]').textContent.replace(/\s+/g, ' ').trim();
  };

  const listWarnings = () => {
    return Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('[mat-dialog-content] > mat-error')).map(e => e.textContent.trim());
  };

  const getActionButton = (text: string) => {
    return Array.from<HTMLButtonElement>(
      selector.getComponent(MatDialogActions).nativeElement.querySelectorAll('button'),
    ).find(b => b.textContent.trim() === text);
  };

  const hold = async (index: number) => {
    const button = selector.listComponents(MatIconButton)[index].nativeElement;

    button.dispatchEvent(new Event('pointerdown'));
    button.dispatchEvent(new Event('pointerup'));

    await fixture.whenStable();
  };

  const openJobSelect = async () => {
    getJobSelect().nativeElement.querySelector<HTMLElement>('.mat-mdc-select-trigger').click();

    await fixture.whenStable();
  };

  const render = async (params?: {
    dialogData?: CalendarEntryEditDialogData;
    days?: { [date: string]: LimitedCalendarDay };
  }) => {
    TestBed.resetTestingModule();

    mockDialogRef = createMockService('close');

    await TestBed.configureTestingModule({
      imports: [CalendarEntryEditDialog],
      providers: [
        provideMockSignalStore(CalendarStore, 'days'),
        provideMockDispatcher(),
        provideNativeDateAdapter(),
        {
          provide: MAT_DIALOG_DATA,
          useValue: params?.dialogData ?? personalEntry,
        },
        {
          provide: MatDialogRef,
          useValue: mockDialogRef.service,
        },
      ],
    })
      .overrideComponent(CalendarEntryEditDialog, {
        remove: {
          imports: [
            ClearableInput,
            DurationStepper,
            CustomerAutocompleteInput,
            CalendarHorizontalDay,
          ],
        },
        add: {
          imports: [
            ClearableInputStub,
            DurationStepperStub,
            CustomerAutocompleteInputStub,
            CalendarHorizontalDayStub,
          ],
        },
      })
      .compileComponents();

    mockCalendarStore = TestBed.inject<MockSignalStore<typeof CalendarStore>>(CalendarStore);
    mockDispatcher = TestBed.inject(Dispatcher);

    mockCalendarStore.days.set(params?.days ?? {
      [day]: createLimitedDay(),
    });

    fixture = TestBed.createComponent(CalendarEntryEditDialog);
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

  describe('dialog title', () => {
    it('should be the create title of a work entry', async () => {
      await render({
        dialogData: {
          entryType: CalendarEntryType.Work,
          day,
        },
      });

      expect(getTitle()).toBe('Munka rögzítése');
    });

    it('should be the edit title of a work entry', async () => {
      await render({
        dialogData: workEntry,
      });

      expect(getTitle()).toBe('Munka szerkesztése');
    });

    it('should be the create title of a personal entry', async () => {
      await render({
        dialogData: {
          entryType: CalendarEntryType.Personal,
          day,
        },
      });

      expect(getTitle()).toBe('Személyes program rögzítése');
    });

    it('should be the edit title of a personal entry', async () => {
      await render({
        dialogData: personalEntry,
      });

      expect(getTitle()).toBe('Személyes program szerkesztése');
    });

    it('should be the create title of an issue', async () => {
      await render({
        dialogData: {
          entryType: CalendarEntryType.Issue,
          day,
        },
      });

      expect(getTitle()).toBe('Probléma rögzítése');
    });

    it('should be the edit title of an issue', async () => {
      await render({
        dialogData: issueEntry,
      });

      expect(getTitle()).toBe('Probléma szerkesztése');
    });
  });

  describe('non-work entry', () => {
    it('should not show the customer and job inputs', async () => {
      await render();

      expect(getCustomerInput()).toBeFalsy();
      expect(getJobSelect()).toBeFalsy();
    });

    it('should show the title input filled with the title of the entry', async () => {
      await render();

      expect(getClearableInput('Megnevezés').componentInstance.value()).toBe('Ebéd');
    });

    it('should show the description input filled with the description of the entry', async () => {
      await render();

      expect(getClearableInput('Leírás').componentInstance.type()).toBe('area');
      expect(getClearableInput('Leírás').componentInstance.value()).toBe('Étterem');
    });

    it('should require the title', async () => {
      await render({
        dialogData: {
          entryType: CalendarEntryType.Personal,
          day,
        },
      });

      expect(getClearableInput('Megnevezés').componentInstance.value()).toBe('');
      expect(getClearableInput('Megnevezés').componentInstance.errors().map(e => e.message)).toEqual(['Kötelező']);
    });
  });

  describe('date input', () => {
    it('should show the day of the entry', async () => {
      await render();

      expect(getDateInput().nativeElement.value).toBe('11/20/2026');
    });

    it('should default to today for a new entry', async () => {
      await render({
        dialogData: {
          entryType: CalendarEntryType.Personal,
        },
        days: {
          '2026-11-10': createLimitedDay({
            day: '2026-11-10',
          }),
        },
      });

      expect(getDateInput().nativeElement.value).toBe('11/10/2026');
    });
  });

  describe('time settings', () => {
    it('should show the duration of the entry in the stepper', async () => {
      await render();

      expect(getDurationStepper().componentInstance.value()).toBe(8);
    });

    it('should default to one hour for a new entry', async () => {
      await render({
        dialogData: {
          entryType: CalendarEntryType.Personal,
          day,
        },
      });

      expect(getDurationStepper().componentInstance.value()).toBe(4);
    });

    it('should show the start and the end of the entry', async () => {
      await render();

      expect(getContentText()).toContain('10:00 - 12:00');
    });

    it('should default the start to the current time slot for a new entry', async () => {
      await render({
        dialogData: {
          entryType: CalendarEntryType.Personal,
          day,
        },
      });

      expect(getContentText()).toContain('12:15 - 13:15');
    });

    it('should limit the start by the duration', async () => {
      await render();

      expect(getSlider().componentInstance.max).toBe(88);
    });

    it('should move the start back if the entry would exceed the day', async () => {
      await render({
        dialogData: {
          ...personalEntry,
          start: 90,
          end: 100,
        },
      });

      expect(getContentText()).toContain('21:30 - 24:00');
    });

    it('should move the start earlier by the left hold button', async () => {
      await render();

      await hold(1);

      expect(getContentText()).toContain('9:45 - 11:45');
    });

    it('should move the start later by the right hold button', async () => {
      await render();

      await hold(2);

      expect(getContentText()).toContain('10:15 - 12:15');
    });

    it('should update the end if the duration changes', async () => {
      await render();

      getDurationStepper().componentInstance.value.set(4);

      await fixture.whenStable();

      expect(getContentText()).toContain('10:00 - 11:00');
    });
  });

  describe('calendar day', () => {
    it('should be passed to the horizontal day with the pending interval', async () => {
      const limitedDay = createLimitedDay({
        entries: [otherWorkEntry],
      });

      await render({
        days: {
          [day]: limitedDay,
        },
      });

      expect(getHorizontalDay().componentInstance.calendarDay()).toEqual(limitedDay);
      expect(getHorizontalDay().componentInstance.pendingStart()).toBe(40);
      expect(getHorizontalDay().componentInstance.pendingEnd()).toBe(48);
    });

    it('should not contain the edited entry', async () => {
      await render({
        dialogData: workEntry,
        days: {
          [day]: createLimitedDay({
            entries: [
              workEntry,
              otherWorkEntry,
            ],
          }),
        },
      });

      expect(getHorizontalDay().componentInstance.calendarDay().entries).toEqual([otherWorkEntry]);
    });

    it('should dispatch listCalendarMonth if the day is not loaded', async () => {
      await render({
        days: {},
      });

      validateFunctionCall(mockDispatcher.dispatch, calendarEvents.listCalendarMonth(new Date(day)), {
        scope: 'self',
      });
    });

    it('should not dispatch listCalendarMonth if the day is loaded', async () => {
      await render();

      validateFunctionCall(mockDispatcher.dispatch);
    });
  });

  describe('work entry', () => {
    it('should show the customer input with the customer of the entry', async () => {
      await render({
        dialogData: workEntry,
      });

      expect(getCustomerInput().componentInstance.label()).toBe('Vendég');
      expect(getCustomerInput().componentInstance.value()).toEqual(customer);
    });

    it('should not show the job select without a customer', async () => {
      await render({
        dialogData: {
          entryType: CalendarEntryType.Work,
          day,
        },
      });

      expect(getJobSelect()).toBeFalsy();
    });

    it('should show the job select after a customer is selected', async () => {
      await render({
        dialogData: {
          entryType: CalendarEntryType.Work,
          day,
        },
      });

      getCustomerInput().componentInstance.value.set(customer);

      await fixture.whenStable();

      expect(getJobSelect()).toBeTruthy();
    });

    it('should offer the jobs of the customer and the custom job', async () => {
      await render({
        dialogData: workEntry,
      });

      await openJobSelect();

      expect(selector.listComponents(MatOption).map(o => o.nativeElement.textContent.replace(/\s+/g, ' ').trim())).toEqual([
        'haircut (1:30 óra)',
        'coloring (2:30 óra)',
        'Egyéb',
      ]);
    });

    it('should select the job matching the title of the entry', async () => {
      await render({
        dialogData: workEntry,
      });

      expect(getJobSelect().componentInstance.value).toBe(fixture.componentInstance.entryForm.job().value());
      expect(fixture.componentInstance.entryForm.job().value()).toBe(haircut);
    });

    it('should take the duration of the selected job', async () => {
      await render({
        dialogData: {
          ...workEntry,
          start: 40,
          end: 60,
        },
      });

      expect(getDurationStepper().componentInstance.value()).toBe(6);
    });

    it('should not show the title and description inputs for a predefined job', async () => {
      await render({
        dialogData: workEntry,
      });

      expect(getClearableInput('Megnevezés')).toBeFalsy();
      expect(getClearableInput('Leírás')).toBeFalsy();
    });

    it('should show the title and description inputs for the custom job', async () => {
      await render({
        dialogData: workEntry,
      });

      await openJobSelect();

      selector.listComponents(MatOption)[2].nativeElement.click();

      await fixture.whenStable();

      expect(getClearableInput('Megnevezés')).toBeTruthy();
      expect(getClearableInput('Leírás')).toBeTruthy();
    });

    it('should take the duration, title and description of a newly selected job', async () => {
      await render({
        dialogData: workEntry,
      });

      await openJobSelect();

      selector.listComponents(MatOption)[1].nativeElement.click();

      await fixture.whenStable();

      expect(getDurationStepper().componentInstance.value()).toBe(10);
      expect(fixture.componentInstance.entryForm.title().value()).toBe('Festés');
      expect(fixture.componentInstance.entryForm.description().value()).toBe('');
    });

    it('should clear the job if the customer is removed', async () => {
      await render({
        dialogData: workEntry,
      });

      getCustomerInput().componentInstance.value.set(null);

      await fixture.whenStable();

      expect(getJobSelect()).toBeFalsy();
      expect(fixture.componentInstance.entryForm.job().value()).toBeNull();
    });

    it('should require the customer', async () => {
      await render({
        dialogData: {
          entryType: CalendarEntryType.Work,
          day,
        },
      });

      expect(getCustomerInput().componentInstance.errors().map(e => e.message)).toEqual(['Kötelező']);
    });
  });

  describe('warnings', () => {
    it('should not be shown if there is nothing to warn about', async () => {
      await render({
        dialogData: workEntry,
      });

      expect(listWarnings()).toEqual([]);
    });

    it('should warn if the duration is shorter than the one of the job', async () => {
      await render({
        dialogData: workEntry,
      });

      getDurationStepper().componentInstance.value.set(2);

      await fixture.whenStable();

      expect(listWarnings()).toEqual(['Időtartam kevesebb, mint a munkához rögzített']);
    });

    it('should warn on weekend', async () => {
      await render({
        dialogData: {
          ...workEntry,
          day: weekendDay,
        },
        days: {
          [weekendDay]: createLimitedDay({
            day: weekendDay,
          }),
        },
      });

      expect(listWarnings()).toEqual(['Hétvége']);
    });

    it('should warn on vacation', async () => {
      await render({
        dialogData: workEntry,
        days: {
          [day]: {
            ...testDataFactory.calendar.day.response.vacation({
              day,
            }),
            calculatedStart: undefined,
            calculatedEnd: undefined,
          },
        },
      });

      expect(listWarnings()).toEqual(['Ezt a napot szabadságnak jelölted']);
    });

    it('should warn on holiday', async () => {
      await render({
        dialogData: workEntry,
        days: {
          [day]: {
            ...testDataFactory.calendar.day.response.holiday({
              day,
            }),
            calculatedStart: undefined,
            calculatedEnd: undefined,
          },
        },
      });

      expect(listWarnings()).toEqual(['Munkaszüneti nap']);
    });

    it('should warn on overtime before the working hours', async () => {
      await render({
        dialogData: {
          ...workEntry,
          start: 28,
          end: 34,
        },
      });

      expect(listWarnings()).toEqual(['Túlóra']);
    });

    it('should warn on overtime after the working hours', async () => {
      await render({
        dialogData: {
          ...workEntry,
          start: 78,
          end: 84,
        },
      });

      expect(listWarnings()).toEqual(['Túlóra']);
    });

    it('should warn on overlapping with a work entry', async () => {
      await render({
        dialogData: workEntry,
        days: {
          [day]: createLimitedDay({
            entries: [otherWorkEntry],
          }),
        },
      });

      expect(listWarnings()).toEqual(['Ütközik az alábbi munkával: Másik']);
    });

    it('should warn on overlapping with a personal entry', async () => {
      await render({
        dialogData: {
          ...personalEntry,
          calendarEntryId: undefined,
        },
        days: {
          [day]: createLimitedDay({
            entries: [
              testDataFactory.calendar.entry.response.personal({
                start: 44,
                end: 50,
                title: 'Kávé',
              }),
            ],
          }),
        },
      });

      expect(listWarnings()).toEqual(['Ütközik az alábbi személyes programmal: Kávé']);
    });

    it('should warn on overlapping with an issue', async () => {
      await render({
        dialogData: {
          ...personalEntry,
          calendarEntryId: undefined,
        },
        days: {
          [day]: createLimitedDay({
            entries: [
              testDataFactory.calendar.entry.response.issue({
                start: 44,
                end: 50,
                title: 'Beteg',
              }),
            ],
          }),
        },
      });

      expect(listWarnings()).toEqual(['Ütközik az alábbi problémával: Beteg']);
    });

    it('should not warn on an entry that only touches the edited one', async () => {
      await render({
        dialogData: {
          ...personalEntry,
          calendarEntryId: undefined,
        },
        days: {
          [day]: createLimitedDay({
            entries: [
              testDataFactory.calendar.entry.response.personal({
                start: 48,
                end: 52,
              }),
            ],
          }),
        },
      });

      expect(listWarnings()).toEqual([]);
    });
  });

  describe('cancel button', () => {
    it('should be shown', async () => {
      await render();

      expect(getActionButton('Mégse')).toBeTruthy();
    });
  });

  describe('save button', () => {
    it('should close with the personal entry', async () => {
      await render();

      getActionButton('Mentés').click();

      await fixture.whenStable();

      expect(mockDialogRef.service.close).toHaveBeenCalledWith({
        entryType: CalendarEntryType.Personal,
        day,
        start: 40,
        end: 48,
        title: 'Ebéd',
        description: 'Étterem',
      });
    });

    it('should close with the modified values', async () => {
      await render();

      getClearableInput('Megnevezés').componentInstance.value.set('Vacsora');
      getClearableInput('Leírás').componentInstance.value.set('');
      getDurationStepper().componentInstance.value.set(4);

      await fixture.whenStable();

      getActionButton('Mentés').click();

      await fixture.whenStable();

      expect(mockDialogRef.service.close).toHaveBeenCalledWith({
        entryType: CalendarEntryType.Personal,
        day,
        start: 40,
        end: 44,
        title: 'Vacsora',
        description: undefined,
      });
    });

    it('should not close without a title', async () => {
      await render();

      getClearableInput('Megnevezés').componentInstance.value.set('');

      await fixture.whenStable();

      getActionButton('Mentés').click();

      await fixture.whenStable();

      expect(mockDialogRef.service.close).not.toHaveBeenCalled();
      expect(getClearableInput('Megnevezés').componentInstance.touched()).toBe(true);
    });

    it('should close with the work entry of the selected job', async () => {
      await render({
        dialogData: workEntry,
      });

      getActionButton('Mentés').click();

      await fixture.whenStable();

      expect(mockDialogRef.service.close).toHaveBeenCalledWith({
        entryType: CalendarEntryType.Work,
        day,
        start: 40,
        end: 46,
        title: 'Hajvágás',
        description: 'Rövid',
        customerId: customer.customerId,
        additionalPrice: 300,
        prices: haircut.prices.map((p) => {
          return {
            priceId: p.priceId,
            quantity: p.quantity,
          };
        }),
      });
    });

    it('should not close a work entry without a customer', async () => {
      await render({
        dialogData: {
          entryType: CalendarEntryType.Work,
          day,
        },
      });

      getActionButton('Mentés').click();

      await fixture.whenStable();

      expect(mockDialogRef.service.close).not.toHaveBeenCalled();
    });
  });
});
