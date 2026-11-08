import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerJobDialog, CustomerJobDialogData } from './customer-job-dialog';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { DurationStepper } from '@hairdressing/app/shared/duration-stepper/duration-stepper';
import { JobPriceCalculator } from '@hairdressing/app/shared/job-price-calculator/job-price-calculator';
import { ClearableInput, createStubComponent, elementSelectorFactory, IElementSelector } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { MatButton } from '@angular/material/button';

describe('CustomerJobDialog', () => {
  const ClearableInputStub = createStubComponent(ClearableInput);
  const DurationStepperStub = createStubComponent(DurationStepper);
  const JobPriceCalculatorStub = createStubComponent(JobPriceCalculator);

  let fixture: ComponentFixture<CustomerJobDialog>;
  let selector: IElementSelector;
  let mockDialogRef: MockService<MatDialogRef<CustomerJobDialog>>;

  const customerId = testDataFactory.customer.id();
  const price = testDataFactory.price.response();
  const job = testDataFactory.customer.job.response({
    prices: [
      {
        ...price,
        quantity: 3,
      },
    ],
  });

  const getNameInput = () => {
    return selector.getComponentByTestId<ClearableInput>('name');
  };

  const getDescriptionInput = () => {
    return selector.getComponentByTestId<ClearableInput>('description');
  };

  const getDurationStepper = () => {
    return selector.getComponent<DurationStepper>(DurationStepperStub);
  };

  const getPriceCalculator = () => {
    return selector.getComponent<JobPriceCalculator>(JobPriceCalculatorStub);
  };

  const getSaveButton = () => {
    return selector.getComponent<MatButton, HTMLButtonElement>(MatButton, MatDialogActions);
  };

  const setValue = async (input: ClearableInput, value: string) => {
    input.value.set(value);

    await fixture.whenStable();
  };

  const render = async (dialogData: CustomerJobDialogData = {
    customerId,
  }) => {
    TestBed.resetTestingModule();

    mockDialogRef = createMockService('close');

    await TestBed.configureTestingModule({
      imports: [CustomerJobDialog],
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
      .overrideComponent(CustomerJobDialog, {
        remove: {
          imports: [
            ClearableInput,
            DurationStepper,
            JobPriceCalculator,
          ],
        },
        add: {
          imports: [
            ClearableInputStub,
            DurationStepperStub,
            JobPriceCalculatorStub,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerJobDialog);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('dialog title', () => {
    it('should be the create title if no job is given', async () => {
      await render();

      expect(selector.getComponent(MatDialogTitle).nativeElement.textContent).toBe('Új munka');
    });

    it('should be the edit title if a job is given', async () => {
      await render({
        customerId,
        job,
      });

      expect(selector.getComponent(MatDialogTitle).nativeElement.textContent).toBe('Munka szerkesztése');
    });
  });

  describe('name input', () => {
    it('should be empty and required if no job is given', async () => {
      await render();

      expect(getNameInput().componentInstance.label()).toBe('Munka neve');
      expect(getNameInput().componentInstance.value()).toBe('');
      expect(getNameInput().componentInstance.errors().map(error => error.message)).toEqual(['Kötelező']);
    });

    it('should be filled with the name of the job', async () => {
      await render({
        customerId,
        job,
      });

      expect(getNameInput().componentInstance.value()).toBe(job.name);
      expect(getNameInput().componentInstance.errors()).toEqual([]);
    });
  });

  describe('description input', () => {
    it('should be an empty text area if no job is given', async () => {
      await render();

      expect(getDescriptionInput().componentInstance.label()).toBe('Megjegyzés');
      expect(getDescriptionInput().componentInstance.type()).toBe('area');
      expect(getDescriptionInput().componentInstance.value()).toBe('');
    });

    it('should be filled with the description of the job', async () => {
      await render({
        customerId,
        job,
      });

      expect(getDescriptionInput().componentInstance.value()).toBe(job.description);
    });
  });

  describe('duration stepper', () => {
    it('should have the minimal duration if no job is given', async () => {
      await render();

      expect(getDurationStepper().componentInstance.value()).toBe(1);
    });

    it('should have the duration of the job', async () => {
      await render({
        customerId,
        job,
      });

      expect(getDurationStepper().componentInstance.value()).toBe(job.duration);
    });
  });

  describe('price calculator', () => {
    it('should be empty and required if no job is given', async () => {
      await render();

      expect(getPriceCalculator().componentInstance.value()).toEqual({
        additionalPrice: 0,
        prices: [],
      });
      expect(getPriceCalculator().componentInstance.errors().map(error => error.message)).toEqual(['Legalább egy ár megadása kötelező']);
    });

    it('should have the prices and the additional price of the job', async () => {
      await render({
        customerId,
        job,
      });

      expect(getPriceCalculator().componentInstance.value()).toMatchObject({
        additionalPrice: job.additionalPrice,
        prices: [
          {
            price,
            quantity: 3,
          },
        ],
      });
      expect(getPriceCalculator().componentInstance.errors()).toEqual([]);
    });
  });

  describe('save button', () => {
    it('should be rendered', async () => {
      await render();

      expect(getSaveButton().nativeElement.textContent).toBe('Mentés');
    });

    it('should not close the dialog if the name is empty', async () => {
      await render();

      getSaveButton().nativeElement.click();

      await fixture.whenStable();

      validateFunctionCall(mockDialogRef.functions.close);
      expect(getNameInput().componentInstance.touched()).toBe(true);
    });

    it('should not close the dialog if there are no prices', async () => {
      await render();

      await setValue(getNameInput().componentInstance, 'Hajvágás');

      getSaveButton().nativeElement.click();

      validateFunctionCall(mockDialogRef.functions.close);
    });

    it('should close the dialog with the entered values', async () => {
      await render();

      await setValue(getNameInput().componentInstance, 'Hajvágás');
      await setValue(getDescriptionInput().componentInstance, '  Rövid  ');
      getDurationStepper().componentInstance.value.set(6);
      getPriceCalculator().componentInstance.value.set({
        additionalPrice: 500,
        prices: [
          {
            price,
            quantity: 2,
          },
        ],
      });

      await fixture.whenStable();

      getSaveButton().nativeElement.click();

      validateFunctionCall(mockDialogRef.functions.close, {
        name: 'Hajvágás',
        description: 'Rövid',
        duration: 6,
        additionalPrice: 500,
        prices: [
          {
            priceId: price.priceId,
            quantity: 2,
          },
        ],
        jobName: undefined,
        customerId,
      });
    });

    it('should close the dialog with an undefined description if it is blank', async () => {
      await render();

      await setValue(getNameInput().componentInstance, 'Hajvágás');
      await setValue(getDescriptionInput().componentInstance, '  ');
      getPriceCalculator().componentInstance.value.set({
        additionalPrice: 0,
        prices: [
          {
            price,
            quantity: 1,
          },
        ],
      });

      await fixture.whenStable();

      getSaveButton().nativeElement.click();

      validateFunctionCall(mockDialogRef.functions.close, {
        name: 'Hajvágás',
        description: undefined,
        duration: 1,
        additionalPrice: 0,
        prices: [
          {
            priceId: price.priceId,
            quantity: 1,
          },
        ],
        jobName: undefined,
        customerId,
      });
    });

    it('should close the dialog with the values of the edited job', async () => {
      await render({
        customerId,
        job,
      });

      getSaveButton().nativeElement.click();

      validateFunctionCall(mockDialogRef.functions.close, {
        name: job.name,
        description: job.description,
        duration: job.duration,
        additionalPrice: job.additionalPrice,
        prices: [
          {
            priceId: price.priceId,
            quantity: 3,
          },
        ],
        jobName: job.name,
        customerId,
      });
    });
  });

  describe('cancel button', () => {
    it('should be rendered', async () => {
      await render();

      expect(selector.getComponent(MatDialogClose, MatDialogActions).nativeElement.textContent).toBe('Mégse');
    });
  });
});
