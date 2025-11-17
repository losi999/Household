import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCheckbox } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatError } from '@angular/material/form-field';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { Customer } from '@household/shared/types/types';
import { CustomerDialogComponent, CustomerDialogResult } from '@household/web/app/hairdressing/customer/customer-dialog/customer-dialog.component';
import { ClearableInputComponent } from '@household/web/app/shared/clearable-input/clearable-input.component';
import { elementSelectorFactory, IElementSelector } from '@household/web/testing/element-selector';
import { setValueOfClearableInput } from '@household/web/testing/utils';

fdescribe('CustomerDialogComponent', () => {
  let fixture: ComponentFixture<CustomerDialogComponent>;
  let mockMatDialogRef: jasmine.SpyObj<MatDialogRef<CustomerDialogComponent, CustomerDialogResult>>;
  let selector: IElementSelector;

  beforeEach(() => {
    mockMatDialogRef = jasmine.createSpyObj(['close']);
  });

  describe('create new customer', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [CustomerDialogComponent],
        providers: [
          {
            provide: MatDialogRef,
            useValue: mockMatDialogRef,
          },
          {
            provide: MAT_DIALOG_DATA,
            useValue: undefined,
          },
        ],
      })
        .compileComponents();
      
      fixture = TestBed.createComponent(CustomerDialogComponent);

      selector = elementSelectorFactory(fixture.debugElement);

      fixture.detectChanges();
    });

    describe('dialog title', () => {
      it('should be rendered', () => {
        const title = selector.getComponent(MatDialogTitle);
        expect(title.nativeElement.textContent).toEqual('Új');
      });
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

    describe('is group checkbox', () => {
      it('should be rendered', () => {
        const input = selector.getComponent(MatCheckbox);
        expect(input).toBeTruthy();
      });

      it('should be unchecked', () => {
        expect(selector.getElementByCss<HTMLInputElement>('input[type="checkbox"]', MatCheckbox).nativeElement.checked).toEqual(false);
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

    describe('rating buttons', () => {
      it('should be rendered', () => {
        const container = selector.getComponentByTestId('rating');
        expect(container.children.length).toEqual(5);
      });

      it('#3 is selected', () => {
        const container = selector.getComponentByTestId('rating');

        expect(container.children[0].classes['mat-primary']).toBeUndefined();
        expect(container.children[1].classes['mat-primary']).toBeUndefined();
        expect(container.children[2].classes['mat-primary']).toBeTrue();
        expect(container.children[3].classes['mat-primary']).toBeUndefined();
        expect(container.children[4].classes['mat-primary']).toBeUndefined();
      });

      for(let i = 0;i < 5 ;i += 1) {
        it(`click on #${i + 1} will select that`, () => {
          const container = selector.getComponentByTestId('rating');
          container.children[i].nativeElement.click();

          fixture.detectChanges();

          for(let j = 0; j < 5; j += 1) {
            if (j === i) {
              expect(container.children[j].classes['mat-primary']).toBeTrue();

            } else {
              expect(container.children[j].classes['mat-primary']).toBeUndefined();

            }
          }
        });
      }
    });

    describe('submit button', () => {
      it('should be rendered', () => {
        const button = selector.getComponentByTestId('submit-button');
        expect(button).toBeTruthy();
      });

      it('should close dialog with form values', () => {
        const request = testDataFactory.customer.request({
          isGroup: true,
        });

        setValueOfClearableInput(selector, request.name, 'name');
        setValueOfClearableInput(selector, request.description, 'description');
        selector.getComponentByTestId<HTMLButtonElement>('rating').children[request.rating - 1].nativeElement.click();
        selector.getElementByCss<HTMLInputElement>('input[type="checkbox"]', MatCheckbox).nativeElement.click();

        fixture.detectChanges();

        selector.getElementByTestId<HTMLButtonElement>('submit-button').nativeElement.click();

        fixture.detectChanges();

        expect(mockMatDialogRef.close).toHaveBeenCalledWith(request);
      });
    });

    describe('cancel button', () => {
      it('should be rendered', () => {
        const button = selector.getComponent(MatDialogClose, MatDialogActions);
        expect(button).toBeTruthy();
      });
    });
  });

  describe('update customer', () => {
    let customer: Customer.Response;

    beforeEach(async () => {
      customer = testDataFactory.customer.response();

      await TestBed.configureTestingModule({
        imports: [CustomerDialogComponent],
        providers: [
          {
            provide: MatDialogRef,
            useValue: mockMatDialogRef,
          },
          {
            provide: MAT_DIALOG_DATA,
            useValue: customer,
          },
        ],
      })
        .compileComponents();
      
      fixture = TestBed.createComponent(CustomerDialogComponent);

      selector = elementSelectorFactory(fixture.debugElement);

      fixture.detectChanges();
    });

    describe('dialog title', () => {
      it('should be rendered', () => {
        const title = selector.getComponent(MatDialogTitle);
        expect(title.nativeElement.textContent).toEqual('Szerkesztés');
      });
    });

    describe('name input', () => {
      it('should be rendered', () => {
        const inputComponent = selector.getComponentByTestId<ClearableInputComponent>('name');
        expect(inputComponent).toBeTruthy();
      });

      it('should be filled', () => {
        const inputComponent = selector.getComponentByTestId<ClearableInputComponent>('name');
        expect(inputComponent.componentInstance.value).toEqual(customer.name);
      });

      it('should display error if form is submitted and its value is empty', () => {
        setValueOfClearableInput(selector, '', 'name');

        fixture.detectChanges();

        selector.getElementByTestId<HTMLButtonElement>('submit-button').nativeElement.click();

        fixture.detectChanges();

        const inputComponent = selector.getComponentByTestId<ClearableInputComponent>('name');
        const error = selector.getComponent(MatError, inputComponent);

        expect(error.nativeElement.textContent).toEqual('Kötelező');
      });
    });

    describe('is group checkbox', () => {
      it('should be rendered', () => {
        const input = selector.getComponent(MatCheckbox);
        expect(input).toBeTruthy();
      });

      it('should be checked', () => {
        expect(selector.getElementByCss<HTMLInputElement>('input[type="checkbox"]', MatCheckbox).nativeElement.checked).toEqual(customer.isGroup);
      });
    });

    describe('description input', () => {
      it('should render', () => {
        const inputComponent = selector.getComponentByTestId<ClearableInputComponent>('description');
        expect(inputComponent).toBeTruthy();
      });

      it('should be filled', () => {
        const inputComponent = selector.getComponentByTestId<ClearableInputComponent>('description');
        expect(inputComponent.componentInstance.value).toEqual(customer.description);
      });
    });

    describe('rating buttons', () => {
      it('should be rendered', () => {
        const container = selector.getComponentByTestId('rating');
        expect(container.children.length).toEqual(5);
      });

      it('saved value is selected', () => {
        const container = selector.getComponentByTestId('rating');

        for (let i = 0; i < 5; i += 1) {
          if (i === customer.rating - 1) {
            expect(container.children[i].classes['mat-primary']).toBeTrue();

          } else {
            expect(container.children[i].classes['mat-primary']).toBeUndefined();
          }
        }
      });

      for (let i = 0;i < 5 ;i += 1) {
        it(`click on #${i + 1} will select that`, () => {
          const container = selector.getComponentByTestId('rating');
          container.children[i].nativeElement.click();

          fixture.detectChanges();

          for (let j = 0; j < 5; j += 1) {
            if (j === i) {
              expect(container.children[j].classes['mat-primary']).toBeTrue();

            } else {
              expect(container.children[j].classes['mat-primary']).toBeUndefined();
            }
          }
        });
      }
    });

    describe('submit button', () => {
      it('should be rendered', () => {
        const button = selector.getComponentByTestId('submit-button');
        expect(button).toBeTruthy();
      });

      it('should close dialog with form values', () => {
        const request = testDataFactory.customer.request({
          isGroup: !customer.isGroup,
        });

        setValueOfClearableInput(selector, request.name, 'name');
        setValueOfClearableInput(selector, request.description, 'description');
        selector.getComponentByTestId<HTMLButtonElement>('rating').children[request.rating - 1].nativeElement.click();
        selector.getElementByCss<HTMLInputElement>('input[type="checkbox"]', MatCheckbox).nativeElement.click();

        fixture.detectChanges();

        selector.getElementByTestId<HTMLButtonElement>('submit-button').nativeElement.click();

        fixture.detectChanges();

        expect(mockMatDialogRef.close).toHaveBeenCalledWith(request);
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
