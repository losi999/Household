import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatError } from '@angular/material/form-field';
import { faker } from '@faker-js/faker';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { Customer } from '@household/shared/types/types';
import { CustomerJobDialogComponent, CustomerJobDialogData, CustomerJobDialogResult } from '@household/web/app/hairdressing/customer/customer-job-dialog/customer-job-dialog.component';
import { ClearableInputComponent } from '@household/web/app/shared/clearable-input/clearable-input.component';
import { DurationStepperComponent } from '@household/web/app/shared/duration-stepper/duration-stepper.component';
import { JobPriceCalculatorComponent } from '@household/web/app/shared/job-price-calculator/job-price-calculator.component';
import { elementSelectorFactory, IElementSelector } from '@household/web/testing/element-selector';
import { createMockService, Mock } from '@household/web/utils/unit-testing';
import { provideMockStore } from '@ngrx/store/testing';

describe('CustomerJobDialogComponent', () => {
  let fixture: ComponentFixture<CustomerJobDialogComponent>;
  let mockMatDialogRef: Mock<MatDialogRef<CustomerJobDialogComponent, CustomerJobDialogResult>>;
  let selector: IElementSelector;
  let dialogData: CustomerJobDialogData;
  let customerId: Customer.Id;

  beforeEach(() => {
    mockMatDialogRef = createMockService('close');
  
    customerId = testDataFactory.customer.id();
  });

  describe('create new customer job', () => {
    beforeEach(async () => {
      dialogData = {
        customerId,
      };

      await TestBed.configureTestingModule({
        imports: [CustomerJobDialogComponent],
        providers: [
          provideMockStore({
            initialState: {},
          }),
          {
            provide: MatDialogRef,
            useValue: mockMatDialogRef,
          },
          {
            provide: MAT_DIALOG_DATA,
            useValue: dialogData,
          },
        ],
      })
        .compileComponents();

      fixture = TestBed.createComponent(CustomerJobDialogComponent);
    
      selector = elementSelectorFactory(fixture.debugElement);

      fixture.detectChanges();
    });

    describe('dialog title', () => {
      it('should be rendered', () => {
        const title = selector.getComponent(MatDialogTitle);
        expect(title.nativeElement.textContent).toEqual('Új');
      });

      describe('name input', () => {
        it('should be rendered', () => {
          const inputComponent = selector.getComponentByTestId<ClearableInputComponent>('name');
          expect(inputComponent).toBeTruthy();
        });

        it('should be empty', () => {
          const inputComponent = selector.getComponentByTestId<ClearableInputComponent>('name');
          expect(inputComponent.componentInstance.value).toEqual(null);
        });

        it('should display error if form is submitted and its value is empty', () => {
          selector.getElementByTestId<HTMLButtonElement>('submit-button').nativeElement.click();

          fixture.detectChanges();

          const inputComponent = selector.getComponentByTestId<ClearableInputComponent>('name');
          const error = selector.getComponent(MatError, inputComponent);

          expect(error.nativeElement.textContent).toEqual('Kötelező');
        });
      });

      describe('description input', () => {
        it('should render', () => {
          const inputComponent = selector.getComponentByTestId<ClearableInputComponent>('description');
          expect(inputComponent).toBeTruthy();
        });

        it('should be empty', () => {
          const inputComponent = selector.getComponentByTestId<ClearableInputComponent>('description');
          expect(inputComponent.componentInstance.value).toEqual(null);
        });
      });

      describe('duration stepper', () => {
        it('should render', () => {
          const durationComponent = selector.getComponent(DurationStepperComponent);
          expect(durationComponent).toBeTruthy();
        });

        it('should be set to 1 (0:15)', () => {
          const durationComponent = selector.getComponent(DurationStepperComponent);
          expect(durationComponent.componentInstance.value).toEqual(1);
        });
      });

      describe('job price calculator', () => {
        it('should render', () => {
          const calculatorComponent = selector.getComponent(JobPriceCalculatorComponent);
          expect(calculatorComponent).toBeTruthy();
        });

        it('should be empty', () => {
          const calculatorComponent = selector.getComponent(JobPriceCalculatorComponent);
          expect(calculatorComponent.componentInstance.value).toEqual([]);
        });

        it('should display error message if nothing is selected', () => {
          const calculatorComponent = selector.getComponent(JobPriceCalculatorComponent);
          calculatorComponent.componentInstance.changed([]);

          fixture.detectChanges();

          const error = selector.getComponent(MatError, calculatorComponent);
          expect(error.nativeElement.textContent).toEqual('Legalább 1 elem kiválasztása kötelező');
        });
      });

      describe('submit button', () => {
        it('should be rendered', () => {
          const button = selector.getComponentByTestId('submit-button');
          expect(button).toBeTruthy();
        });

        it('should close dialog with form values', () => {
          const request = testDataFactory.customer.job.request();
          const listedPrice = testDataFactory.price.response();
          const customPrice = testDataFactory.price.base();
          const quantity = faker.number.int({
            min: 1,
            max: 5,
          });

          selector.getComponentByTestId<ClearableInputComponent>('name').componentInstance.changed(request.name);
          selector.getComponentByTestId<ClearableInputComponent>('description').componentInstance.changed(request.description);
          selector.getComponent(DurationStepperComponent).componentInstance.changed(request.duration);
          selector.getComponent(JobPriceCalculatorComponent).componentInstance.changed([
            {
              price: listedPrice,
              quantity,
            },
            customPrice,
          ]);

          fixture.detectChanges();

          selector.getElementByTestId<HTMLButtonElement>('submit-button').nativeElement.click();

          fixture.detectChanges();

          expect(mockMatDialogRef.close).toHaveBeenCalledWith({
            name: request.name,
            description: request.description,
            duration: request.duration,
            customerId,
            jobName: undefined,
            prices: [
              {
                priceId: listedPrice.priceId,
                quantity,
              },
              customPrice,
            ],
          });
        });
      });

      describe('cancel button', () => {
        it('should be rendered', () => {
          const button = selector.getComponent(MatDialogClose, MatDialogActions);
          expect(button).toBeTruthy();
        });
      });
    });
  });

  describe('update existing customer job', () => {
    let existingJob: Customer.Job.Response;
    beforeEach(async () => {
      existingJob = testDataFactory.customer.job.response();

      dialogData = {
        customerId,
        job: existingJob,
      };

      await TestBed.configureTestingModule({
        imports: [CustomerJobDialogComponent],
        providers: [
          provideMockStore({
            initialState: {},
          }),
          {
            provide: MatDialogRef,
            useValue: mockMatDialogRef,
          },
          {
            provide: MAT_DIALOG_DATA,
            useValue: dialogData,
          },
        ],
      })
        .compileComponents();

      fixture = TestBed.createComponent(CustomerJobDialogComponent);
    
      selector = elementSelectorFactory(fixture.debugElement);

      fixture.detectChanges();
    });

    describe('dialog title', () => {
      it('should be rendered', () => {
        const title = selector.getComponent(MatDialogTitle);
        expect(title.nativeElement.textContent).toEqual('Szerkesztés');
      });

      describe('name input', () => {
        it('should be rendered', () => {
          const inputComponent = selector.getComponentByTestId<ClearableInputComponent>('name');
          expect(inputComponent).toBeTruthy();
        });

        it('should be set to existing value', () => {
          const inputComponent = selector.getComponentByTestId<ClearableInputComponent>('name');
          expect(inputComponent.componentInstance.value).toEqual(existingJob.name);
        });

        it('should display error if form is submitted and its value is empty', () => {
          selector.getComponentByTestId<ClearableInputComponent>('name').componentInstance.changed('');

          selector.getElementByTestId<HTMLButtonElement>('submit-button').nativeElement.click();

          fixture.detectChanges();

          const inputComponent = selector.getComponentByTestId<ClearableInputComponent>('name');
          const error = selector.getComponent(MatError, inputComponent);

          expect(error.nativeElement.textContent).toEqual('Kötelező');
        });
      });

      describe('description input', () => {
        it('should render', () => {
          const inputComponent = selector.getComponentByTestId<ClearableInputComponent>('description');
          expect(inputComponent).toBeTruthy();
        });

        it('should be set to existing value', () => {
          const inputComponent = selector.getComponentByTestId<ClearableInputComponent>('description');
          expect(inputComponent.componentInstance.value).toEqual(existingJob.description);
        });
      });

      describe('duration stepper', () => {
        it('should render', () => {
          const durationComponent = selector.getComponent(DurationStepperComponent);
          expect(durationComponent).toBeTruthy();
        });

        it('should be set to existing value', () => {
          const durationComponent = selector.getComponent(DurationStepperComponent);
          expect(durationComponent.componentInstance.value).toEqual(existingJob.duration);
        });
      });

      describe('job price calculator', () => {
        it('should render', () => {
          const calculatorComponent = selector.getComponent(JobPriceCalculatorComponent);
          expect(calculatorComponent).toBeTruthy();
        });

        it('should be set to existing value', () => {
          const { quantity, ...price } = existingJob.prices[0];

          const calculatorComponent = selector.getComponent(JobPriceCalculatorComponent);

          expect(calculatorComponent.componentInstance.value).toEqual([
            {
              quantity,
              amount: null,
              name: null,
              price,
            },
          ]);
        });

        it.skip('should display error message if nothing is selected', () => {
          const calculatorComponent = selector.getComponent(JobPriceCalculatorComponent);
          console.log(calculatorComponent.nativeElement);
          calculatorComponent.componentInstance.changed([]);

          fixture.detectChanges();

          console.log(selector.getComponent(JobPriceCalculatorComponent).nativeElement);

          const error = selector.getComponent(MatError, calculatorComponent);
          expect(error.nativeElement.textContent).toEqual('Legalább 1 elem kiválasztása kötelező');
        });
      });

      describe('submit button', () => {
        it('should be rendered', () => {
          const button = selector.getComponentByTestId('submit-button');
          expect(button).toBeTruthy();
        });

        it('should close dialog with form values', () => {
          const request = testDataFactory.customer.job.request();
          const listedPrice = testDataFactory.price.response();
          const customPrice = testDataFactory.price.base();
          const quantity = faker.number.int({
            min: 1,
            max: 5,
          });

          selector.getComponentByTestId<ClearableInputComponent>('name').componentInstance.changed(request.name);
          selector.getComponentByTestId<ClearableInputComponent>('description').componentInstance.changed(request.description);
          selector.getComponent(DurationStepperComponent).componentInstance.changed(request.duration);
          selector.getComponent(JobPriceCalculatorComponent).componentInstance.changed([
            {
              price: listedPrice,
              quantity,
            },
            customPrice,
          ]);

          fixture.detectChanges();

          selector.getElementByTestId<HTMLButtonElement>('submit-button').nativeElement.click();

          fixture.detectChanges();

          expect(mockMatDialogRef.close).toHaveBeenCalledWith({
            name: request.name,
            description: request.description,
            duration: request.duration,
            customerId,
            jobName: existingJob.name,
            prices: [
              {
                priceId: listedPrice.priceId,
                quantity,
              },
              customPrice,
            ],
          });
        });
      });

      describe('cancel button', () => {
        it('should be rendered', () => {
          const button = selector.getComponent(MatDialogClose, MatDialogActions);
          expect(button).toBeTruthy();
        });
      });
    });
  });
});
