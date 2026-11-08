import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonToggle } from '@angular/material/button-toggle';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { JobPriceCalculator } from '@hairdressing/app/shared/job-price-calculator/job-price-calculator';
import { AmountInput, createStubComponent, elementSelectorFactory, IconText, IElementSelector } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService } from '@household/shared/common/unit-testing';
import { CalendarEntryResolutionStatus } from '@household/shared/enums';
import { Responses } from '@household/shared/types/responses';
import { CalendarEntryPayingDialog, CalendarEntryPayingDialogData } from './calendar-entry-paying-dialog';

describe('CalendarEntryPayingDialog', () => {
  const IconTextStub = createStubComponent(IconText);
  const JobPriceCalculatorStub = createStubComponent(JobPriceCalculator);
  const AmountInputStub = createStubComponent(AmountInput);

  let fixture: ComponentFixture<CalendarEntryPayingDialog>;
  let selector: IElementSelector;
  let mockDialogRef: MockService<MatDialogRef<CalendarEntryPayingDialog>>;

  const price: Responses.Price = testDataFactory.price.response();
  const entry: Responses.CalendarEntryWork = testDataFactory.calendar.entry.response.work({
    day: '2026-11-06',
    start: 40,
    end: 48,
    description: 'Munka leírás',
    additionalPrice: 500,
    prices: [
      {
        ...price,
        quantity: 2,
      },
    ],
  });

  const getCashToggle = () => {
    return selector.listComponents(MatButtonToggle, MatDialogContent)[0];
  };

  const getTransferToggle = () => {
    return selector.listComponents(MatButtonToggle, MatDialogContent)[1];
  };

  const getAmountInput = () => {
    return selector.getComponent(AmountInputStub, MatDialogContent);
  };

  const getSaveButton = () => {
    return selector.getComponentByCss<unknown, HTMLButtonElement>('button[matButton="filled"]', MatDialogActions);
  };

  const clickToggle = async (toggle: ReturnType<typeof getCashToggle>) => {
    toggle.nativeElement.querySelector('button').click();

    await fixture.whenStable();
  };

  const render = async (dialogData: CalendarEntryPayingDialogData = entry) => {
    TestBed.resetTestingModule();

    mockDialogRef = createMockService('close');

    await TestBed.configureTestingModule({
      imports: [CalendarEntryPayingDialog],
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
      .overrideComponent(CalendarEntryPayingDialog, {
        remove: {
          imports: [
            IconText,
            JobPriceCalculator,
            AmountInput,
          ],
        },
        add: {
          imports: [
            IconTextStub,
            JobPriceCalculatorStub,
            AmountInputStub,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CalendarEntryPayingDialog);
    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('content', () => {
    it('should show the title of the entry', async () => {
      await render();

      expect(selector.getComponent(MatDialogTitle).nativeElement.textContent).toBe(entry.title);
    });

    it('should show the formatted day and the time interval', async () => {
      await render();

      const [
        dayText,
        timeText,
      ] = selector.listComponents(IconTextStub);

      expect(dayText.componentInstance.text()).toBe('2026. November 6.');
      expect(timeText.componentInstance.text()).toBe('10:00 - 12:00');
    });

    it('should show the description', async () => {
      await render();

      expect(selector.getComponent(MatDialogContent).nativeElement.textContent).toContain('Munka leírás');
    });

    it('should not show the description if there is none', async () => {
      await render({
        ...entry,
        description: undefined,
      });

      expect(selector.getComponent(MatDialogContent).nativeElement.textContent).not.toContain('Munka leírás');
    });

    it('should pass the cost of the entry to the price calculator', async () => {
      await render();

      expect(selector.getComponent(JobPriceCalculatorStub).componentInstance.value()).toEqual({
        additionalPrice: 500,
        prices: [
          {
            price,
            quantity: 2,
          },
        ],
      });
    });

    it('should pass an empty price list to the calculator if the entry has no prices', async () => {
      await render({
        ...entry,
        prices: undefined,
      });

      expect(selector.getComponent(JobPriceCalculatorStub).componentInstance.value().prices).toEqual([]);
    });

    it('should offer cash and transfer payment', async () => {
      await render();

      expect(getCashToggle().nativeElement.textContent.trim()).toBe('Készpénz');
      expect(getTransferToggle().nativeElement.textContent.trim()).toBe('Utalás');
    });
  });

  describe('amount input', () => {
    it('should be hidden until a payment type is selected', async () => {
      await render();

      expect(getAmountInput()).toBeFalsy();
    });

    it('should be shown for cash payment', async () => {
      await render();

      await clickToggle(getCashToggle());

      expect(getAmountInput().componentInstance.label()).toBe('Kapott összeg');
      expect(getAmountInput().componentInstance.currency()).toBe('Ft');
      expect(getAmountInput().componentInstance.signHidden()).toBe(true);
    });

    it('should be hidden for transfer payment', async () => {
      await render();

      await clickToggle(getTransferToggle());

      expect(getAmountInput()).toBeFalsy();
    });

    it('should show the minimum validation error of a zero amount', async () => {
      await render();

      await clickToggle(getCashToggle());

      expect(getAmountInput().componentInstance.errors().map(e => e.message)).toEqual(['Az összegnek nagyobbnak kell lennie, mint 0']);
    });
  });

  describe('save button', () => {
    it('should close with a pending transfer on transfer payment', async () => {
      await render();

      await clickToggle(getTransferToggle());

      getSaveButton().nativeElement.click();

      await fixture.whenStable();

      expect(mockDialogRef.service.close).toHaveBeenCalledWith({
        status: CalendarEntryResolutionStatus.PendingTransfer,
        delay: undefined,
      });
    });

    it('should close with a pending transfer if no payment type is selected', async () => {
      await render();

      getSaveButton().nativeElement.click();

      await fixture.whenStable();

      expect(mockDialogRef.service.close).toHaveBeenCalledWith({
        status: CalendarEntryResolutionStatus.PendingTransfer,
        delay: undefined,
      });
    });

    it('should close with the paid amount on cash payment', async () => {
      await render();

      await clickToggle(getCashToggle());

      getAmountInput().componentInstance.value.set(12000);

      await fixture.whenStable();

      getSaveButton().nativeElement.click();

      await fixture.whenStable();

      expect(mockDialogRef.service.close).toHaveBeenCalledWith({
        status: CalendarEntryResolutionStatus.Paid,
        amount: 12000,
        delay: undefined,
      });
    });

    it('should not close on cash payment with a zero amount', async () => {
      await render();

      await clickToggle(getCashToggle());

      getSaveButton().nativeElement.click();

      await fixture.whenStable();

      expect(mockDialogRef.service.close).not.toHaveBeenCalled();
      expect(getAmountInput().componentInstance.touched()).toBe(true);
    });
  });
});
