import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Login } from './login';
import { authEvents, createStubComponent, elementSelectorFactory, IElementSelector, provideMockDispatcher } from '@household/shared-ui';
import { Toolbar } from '@household/app/shared/toolbar/toolbar';
import { validateFunctionCall } from '@household/shared/common/unit-testing';
import { Dispatcher } from '@ngrx/signals/events';

describe('Login', () => {
  const ToolbarStub = createStubComponent(Toolbar);

  let fixture: ComponentFixture<Login>;
  let selector: IElementSelector;
  let mockDispatcher: Dispatcher;

  const validEmail = 'user@example.com';
  const validPassword = 'password123';

  const getToolbar = () => {
    return selector.getComponent(ToolbarStub);
  };

  const getEmailInput = () => {
    return selector.getElementByTestId<HTMLInputElement>('email');
  };

  const getPasswordInput = () => {
    return selector.getElementByTestId<HTMLInputElement>('password');
  };

  const getEmailError = () => {
    return selector.getElementByTestId('email-error');
  };

  const getPasswordError = () => {
    return selector.getElementByTestId('password-error');
  };

  const getSubmitButton = () => {
    return selector.getElementByTestId<HTMLButtonElement>('submit');
  };

  const typeInto = async (input: HTMLInputElement, value: string) => {
    input.value = value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));

    await fixture.whenStable();
  };

  const render = async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideMockDispatcher()],
    })
      .overrideComponent(Login, {
        remove: {
          imports: [Toolbar],
        },
        add: {
          imports: [ToolbarStub],
        },
      })
      .compileComponents();

    mockDispatcher = TestBed.inject(Dispatcher);

    fixture = TestBed.createComponent(Login);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('toolbar', () => {
    it('should be rendered with the login title', async () => {
      await render();

      expect(getToolbar().componentInstance.title()).toBe('Bejelentkezés');
    });
  });

  describe('email input', () => {
    it('should be rendered', async () => {
      await render();

      expect(getEmailInput()).toBeTruthy();
    });

    it('should not display an error before the user interacts with it', async () => {
      await render();

      expect(getEmailError()).toBeFalsy();
    });

    it('should display the required error if empty', async () => {
      await render();

      await typeInto(getEmailInput().nativeElement, '');

      expect(getEmailError().nativeElement.textContent).toContain('Kötelező');
    });

    it('should display an error if not a valid email address', async () => {
      await render();

      await typeInto(getEmailInput().nativeElement, 'not-an-email');

      expect(getEmailError().nativeElement.textContent).toContain('Érvényes email cím szükséges');
    });

    it('should not display an error if a valid email address', async () => {
      await render();

      await typeInto(getEmailInput().nativeElement, validEmail);

      expect(getEmailError()).toBeFalsy();
    });
  });

  describe('password input', () => {
    it('should be rendered', async () => {
      await render();

      expect(getPasswordInput()).toBeTruthy();
    });

    it('should not display an error before the user interacts with it', async () => {
      await render();

      expect(getPasswordError()).toBeFalsy();
    });

    it('should display the required error if empty', async () => {
      await render();

      await typeInto(getPasswordInput().nativeElement, '');

      expect(getPasswordError().nativeElement.textContent).toContain('Kötelező');
    });

    it('should display an error if shorter than 6 characters', async () => {
      await render();

      await typeInto(getPasswordInput().nativeElement, '12345');

      expect(getPasswordError().nativeElement.textContent).toContain('Legalább 6 karakter szükséges');
    });

    it('should not display an error if at least 6 characters', async () => {
      await render();

      await typeInto(getPasswordInput().nativeElement, '123456');

      expect(getPasswordError()).toBeFalsy();
    });
  });

  describe('submit button', () => {
    it('should be rendered', async () => {
      await render();

      expect(getSubmitButton()).toBeTruthy();
    });

    it('should be disabled if the form is empty', async () => {
      await render();

      expect(getSubmitButton().nativeElement.disabled).toBe(true);
    });

    it('should be disabled if only the email is valid', async () => {
      await render();

      await typeInto(getEmailInput().nativeElement, validEmail);

      expect(getSubmitButton().nativeElement.disabled).toBe(true);
    });

    it('should be disabled if only the password is valid', async () => {
      await render();

      await typeInto(getPasswordInput().nativeElement, validPassword);

      expect(getSubmitButton().nativeElement.disabled).toBe(true);
    });

    it('should be disabled if the email is not valid', async () => {
      await render();

      await typeInto(getEmailInput().nativeElement, 'not-an-email');
      await typeInto(getPasswordInput().nativeElement, validPassword);

      expect(getSubmitButton().nativeElement.disabled).toBe(true);
    });

    it('should be disabled if the password is too short', async () => {
      await render();

      await typeInto(getEmailInput().nativeElement, validEmail);
      await typeInto(getPasswordInput().nativeElement, '12345');

      expect(getSubmitButton().nativeElement.disabled).toBe(true);
    });

    it('should be enabled if both email and password are valid', async () => {
      await render();

      await typeInto(getEmailInput().nativeElement, validEmail);
      await typeInto(getPasswordInput().nativeElement, validPassword);

      expect(getSubmitButton().nativeElement.disabled).toBe(false);
    });

    describe('on click', () => {
      it('should dispatch logInInitiated with the entered credentials', async () => {
        await render();

        await typeInto(getEmailInput().nativeElement, validEmail);
        await typeInto(getPasswordInput().nativeElement, validPassword);

        getSubmitButton().nativeElement.click();

        validateFunctionCall(mockDispatcher.dispatch, authEvents.logInInitiated({
          email: validEmail,
          password: validPassword,
        }), {
          scope: 'self',
        });
      });

      it('should not dispatch anything if the form is not valid', async () => {
        await render();

        await typeInto(getEmailInput().nativeElement, 'not-an-email');
        await typeInto(getPasswordInput().nativeElement, validPassword);

        getSubmitButton().nativeElement.click();

        validateFunctionCall(mockDispatcher.dispatch);
      });
    });
  });
});
