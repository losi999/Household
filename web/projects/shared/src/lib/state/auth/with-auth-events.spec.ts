import { TestBed } from '@angular/core/testing';
import { AuthService, createDispatcherSpy, notificationEvents, stubLocalStorage, validateDispatcher } from '@household/shared-ui';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { UserType } from '@household/shared/enums';
import { signalStore, withState } from '@ngrx/signals';
import { Dispatcher } from '@ngrx/signals/events';
import { jwtDecode } from 'jwt-decode';
import { of, throwError } from 'rxjs';
import { Mock } from 'vitest';
import { authApiEvents, authEvents } from './auth-events';
import { AuthState } from './auth-store';
import { withAuthEvents } from './with-auth-events';

describe('withAuthEvents', () => {
  let dispatcher: Dispatcher;
  let dispatchSpy: Mock;
  let mockAuthService: MockService<AuthService>;
  let mockJwtDecode: Mock;

  const state: AuthState = {
    idToken: 'initial.id.token',
    refreshToken: 'initial.refresh.token',
    userTypes: [UserType.Hairdresser],
  };

  const setup = () => {
    TestBed.resetTestingModule();
    stubLocalStorage();

    mockAuthService = createMockService('login', 'refreshToken');
    mockJwtDecode = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService.service,
        },
        {
          provide: jwtDecode,
          useValue: mockJwtDecode,
        },
      ],
    });

    // The refresh token handler reads the refresh token from the state
    TestBed.inject(signalStore({
      providedIn: 'root',
    }, withState<AuthState>(state), withAuthEvents()));
    dispatcher = TestBed.inject(Dispatcher);
    dispatchSpy = createDispatcherSpy(dispatcher);
  };

  beforeEach(() => {
    setup();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('dispatching logInInitiated', () => {
    const email = 'dpole@email.com';
    const password = 'password1!';
    const idToken = 'new.id.token';
    const refreshToken = 'new.refresh.token';

    it('should call API and dispatch the retrieved tokens', () => {
      mockAuthService.functions.login.mockReturnValue(of({
        idToken,
        refreshToken,
      }));

      dispatcher.dispatch(authEvents.logInInitiated({
        email,
        password,
        requiredUserType: UserType.Editor,
      }));

      validateFunctionCall(mockAuthService.functions.login, {
        email,
        password,
        requiredUserType: UserType.Editor,
      });
      validateDispatcher(dispatchSpy, authEvents.tokensRetrieved({
        idToken,
        refreshToken,
      }));
    });

    it('should call API and show notification if the email or password is incorrect', () => {
      mockAuthService.functions.login.mockReturnValue(throwError(() => ({
        error: {
          message: 'Incorrect email or password',
        },
      })));

      dispatcher.dispatch(authEvents.logInInitiated({
        email,
        password,
      }));

      validateFunctionCall(mockAuthService.functions.login, {
        email,
        password,
        requiredUserType: undefined,
      });
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hibás felhasználónév vagy jelszó'));
    });

    it('should call API and show notification if the user type is not the required one', () => {
      mockAuthService.functions.login.mockReturnValue(throwError(() => ({
        error: {
          message: 'User does not have the required user type',
        },
      })));

      dispatcher.dispatch(authEvents.logInInitiated({
        email,
        password,
      }));

      validateFunctionCall(mockAuthService.functions.login, {
        email,
        password,
        requiredUserType: undefined,
      });
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Nincs jogosultságod ehhez az oldalhoz!'));
    });

    it('should call API and show notification if there is an other error', () => {
      mockAuthService.functions.login.mockReturnValue(throwError(() => ({
        error: {
          message: 'Some other error',
        },
      })));

      dispatcher.dispatch(authEvents.logInInitiated({
        email,
        password,
      }));

      validateFunctionCall(mockAuthService.functions.login, {
        email,
        password,
        requiredUserType: undefined,
      });
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
    });
  });

  describe('dispatching tokensRetrieved', () => {
    const idToken = 'new.id.token';
    const refreshToken = 'new.refresh.token';

    it('should store the tokens and the user types in local storage and dispatch login completed', () => {
      mockJwtDecode.mockReturnValue({
        'cognito:groups': [
          UserType.Editor,
          UserType.Hairdresser,
        ],
      });

      dispatcher.dispatch(authEvents.tokensRetrieved({
        idToken,
        refreshToken,
      }));

      validateFunctionCall(mockJwtDecode, idToken);
      expect(localStorage.getItem('idToken')).toBe(idToken);
      expect(localStorage.getItem('refreshToken')).toBe(refreshToken);
      expect(localStorage.getItem('userTypes')).toBe(`${UserType.Editor},${UserType.Hairdresser}`);
      validateDispatcher(dispatchSpy, authEvents.logInCompleted({
        idToken,
        refreshToken,
        userTypes: [
          UserType.Editor,
          UserType.Hairdresser,
        ],
      }));
    });

    it('should use no user types if the token has no groups', () => {
      mockJwtDecode.mockReturnValue({});

      dispatcher.dispatch(authEvents.tokensRetrieved({
        idToken,
        refreshToken,
      }));

      expect(localStorage.getItem('userTypes')).toBe('');
      validateDispatcher(dispatchSpy, authEvents.logInCompleted({
        idToken,
        refreshToken,
        userTypes: [],
      }));
    });
  });

  describe('dispatching logOut', () => {
    it('should clear local storage', () => {
      localStorage.setItem('idToken', 'id.token');
      localStorage.setItem('refreshToken', 'refresh.token');
      localStorage.setItem('userTypes', UserType.Editor);

      dispatcher.dispatch(authEvents.logOut());

      expect(localStorage.getItem('idToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(localStorage.getItem('userTypes')).toBeNull();
      validateDispatcher(dispatchSpy);
    });
  });

  describe('dispatching refreshTokenInitiated', () => {
    it('should call API with the stored refresh token and dispatch the retrieved tokens', () => {
      const idToken = 'new.id.token';
      mockAuthService.functions.refreshToken.mockReturnValue(of({
        idToken,
      }));

      dispatcher.dispatch(authApiEvents.refreshTokenInitiated());

      validateFunctionCall(mockAuthService.functions.refreshToken, {
        refreshToken: state.refreshToken,
      });
      validateDispatcher(dispatchSpy, authEvents.tokensRetrieved({
        idToken,
        refreshToken: state.refreshToken,
      }));
    });
  });
});
