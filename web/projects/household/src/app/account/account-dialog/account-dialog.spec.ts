import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountDialog, AccountDialogData } from './account-dialog';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { ClearableInput, createStubComponent, elementSelectorFactory, IElementSelector } from '@household/shared-ui';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { MatButtonToggle } from '@angular/material/button-toggle';
import { AccountType } from '@household/shared/enums';
import { testDataFactory } from '@household/shared/common/test-data-factory';

describe('AccountDialog', () => {
  const ClearableInputStub = createStubComponent(ClearableInput);

  let fixture: ComponentFixture<AccountDialog>;
  let selector: IElementSelector;
  let mockDialogRef: MockService<MatDialogRef<AccountDialog>>;

  const getNameInput = () => {
    return selector.getComponentByTestId<ClearableInput>('name', MatDialogContent);
  };

  const getCurrencyInput = () => {
    return selector.getComponentByTestId<ClearableInput>('currency', MatDialogContent);
  };

  const getAccountTypeButton = (testId: string) => {
    return selector.getComponentByTestId<MatButtonToggle>(testId, MatDialogContent);
  };

  const getSaveButton = () => {
    return selector.getElementByTestId<HTMLButtonElement>('save-button', MatDialogActions);
  };

  const setValue = async (input: ClearableInput, value: string) => {
    input.value.set(value);

    await fixture.whenStable();
  };

  const fillRequiredFields = async () => {
    await setValue(getNameInput().componentInstance, 'account name');
    await setValue(getCurrencyInput().componentInstance, 'Ft');
  };

  const render = async (dialogData: AccountDialogData = undefined) => {
    TestBed.resetTestingModule();

    mockDialogRef = createMockService('close');

    await TestBed.configureTestingModule({
      imports: [AccountDialog],
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
      .overrideComponent(AccountDialog, {
        remove: {
          imports: [ClearableInput],
        },
        add: {
          imports: [ClearableInputStub],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AccountDialog);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('dialog title', () => {
    it('should be the create title if no account is given', async () => {
      await render();

      expect(selector.getComponent(MatDialogTitle).nativeElement.textContent).toBe('Új számla');
    });

    it('should be the edit title if an account is given', async () => {
      await render(testDataFactory.account.response());

      expect(selector.getComponent(MatDialogTitle).nativeElement.textContent).toBe('Számla szerkesztése');
    });
  });

  describe('when updating an account', () => {
    const account = testDataFactory.account.response({
      accountType: AccountType.Loan,
    });

    it('should fill the inputs with the values of the account', async () => {
      await render(account);

      expect(getNameInput().componentInstance.value()).toBe(account.name);
      expect(getCurrencyInput().componentInstance.value()).toBe(account.currency);
      expect(getAccountTypeButton('account-type-loan').componentInstance.checked).toBe(true);
    });

    it('should enable saving without changing anything', async () => {
      await render(account);

      expect(getSaveButton().nativeElement.disabled).toBe(false);
    });

    it('should close the dialog with the values of the account', async () => {
      await render(account);

      getSaveButton().nativeElement.click();

      validateFunctionCall(mockDialogRef.functions.close, {
        name: account.name,
        currency: account.currency,
        accountType: AccountType.Loan,
      });
    });

    it('should close the dialog with the changed values', async () => {
      await render(account);
      await setValue(getNameInput().componentInstance, 'new name');
      await setValue(getCurrencyInput().componentInstance, 'EUR');
      getAccountTypeButton('account-type-cash').nativeElement.querySelector('button').click();
      await fixture.whenStable();

      getSaveButton().nativeElement.click();

      validateFunctionCall(mockDialogRef.functions.close, {
        name: 'new name',
        currency: 'EUR',
        accountType: AccountType.Cash,
      });
    });
  });

  describe('name input', () => {
    it('should be empty', async () => {
      await render();

      expect(getNameInput().componentInstance.label()).toBe('Név');
      expect(getNameInput().componentInstance.value()).toBe('');
    });

    it('should be required', async () => {
      await render();

      expect(getNameInput().componentInstance.errors().map(error => error.message)).toEqual(['Kötelező']);
    });
  });

  describe('currency input', () => {
    it('should be empty', async () => {
      await render();

      expect(getCurrencyInput().componentInstance.label()).toBe('Pénznem');
      expect(getCurrencyInput().componentInstance.value()).toBe('');
    });

    it('should be required', async () => {
      await render();

      expect(getCurrencyInput().componentInstance.errors().map(error => error.message)).toEqual(['Kötelező']);
    });
  });

  describe('account type selector', () => {
    it('should be set to bank account by default', async () => {
      await render();

      expect(getAccountTypeButton('account-type-bank-account').componentInstance.checked).toBe(true);
      expect(fixture.componentInstance.accountForm.accountType().value()).toBe(AccountType.BankAccount);
    });

    describe('on click', () => {
      [
        [
          'account-type-bank-account',
          AccountType.BankAccount,
        ],
        [
          'account-type-cash',
          AccountType.Cash,
        ],
        [
          'account-type-credit-card',
          AccountType.CreditCard,
        ],
        [
          'account-type-loan',
          AccountType.Loan,
        ],
        [
          'account-type-cafeteria',
          AccountType.Cafeteria,
        ],
      ].forEach(([
        testId,
        accountType,
      ]) => {
        it(`should set the account type to ${accountType}`, async () => {
          await render();

          getAccountTypeButton(testId).nativeElement.querySelector('button').click();
          await fixture.whenStable();

          expect(getAccountTypeButton(testId).componentInstance.checked).toBe(true);
          expect(fixture.componentInstance.accountForm.accountType().value()).toBe(accountType);
        });
      });
    });
  });

  describe('save button', () => {
    it('should be disabled if the form is invalid', async () => {
      await render();

      expect(getSaveButton().nativeElement.disabled).toBe(true);
    });

    it('should be enabled if every required field is filled', async () => {
      await render();
      await fillRequiredFields();

      expect(getSaveButton().nativeElement.disabled).toBe(false);
    });

    it('should not close the dialog if the form is invalid', async () => {
      await render();

      getSaveButton().nativeElement.click();
      await fixture.whenStable();

      validateFunctionCall(mockDialogRef.functions.close);
    });

    it('should close the dialog with the entered values', async () => {
      await render();
      await fillRequiredFields();
      getAccountTypeButton('account-type-credit-card').nativeElement.querySelector('button').click();
      await fixture.whenStable();

      getSaveButton().nativeElement.click();

      validateFunctionCall(mockDialogRef.functions.close, {
        name: 'account name',
        currency: 'Ft',
        accountType: AccountType.CreditCard,
      });
    });
  });

  describe('cancel button', () => {
    it('should be rendered', async () => {
      await render();

      expect(selector.getComponent(MatDialogClose, MatDialogActions)).toBeTruthy();
    });
  });
});
