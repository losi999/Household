import { TestBed } from '@angular/core/testing';
import { authEvents, AuthService, AuthState, AuthStore, createDispatcherSpy, notificationEvents } from '@household/shared-ui';
import { createMockService, MockService, validateFunctionCall, validateNthFunctionCall } from '@household/shared/common/unit-testing';
import { UserType } from '@household/shared/enums';
import { Dispatcher } from '@ngrx/signals/events';
import { jwtDecode } from 'jwt-decode';
import { of, throwError } from 'rxjs';
import { Mock } from 'vitest';

describe('Auth store', () => {
  const initialState: AuthState = {
    idToken: 'initial.id.token',
    refreshToken: 'initial.refresh.token',
    userTypes: [UserType.Hairdresser],
  };
  let store: InstanceType<typeof AuthStore>;
  let mockAuthService: MockService<AuthService>;
  let mockJwtDecode: Mock;
  let dispatcher: Dispatcher;
  let dispatchSpy: Mock;

  beforeEach(() => {
    mockAuthService = createMockService('login');
    mockJwtDecode = vi.fn();

    localStorage.setItem('idToken', initialState.idToken);
    localStorage.setItem('refreshToken', initialState.refreshToken);
    localStorage.setItem('userTypes', initialState.userTypes.join(','));
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

    store = TestBed.inject(AuthStore);
    dispatcher = TestBed.inject(Dispatcher);
    dispatchSpy = createDispatcherSpy(dispatcher);
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should initialize', () => {
    expect(store.idToken()).toBe(initialState.idToken);
    expect(store.refreshToken()).toBe(initialState.refreshToken);
    expect(store.userTypes()).toEqual(initialState.userTypes);
    expect(store.isLoggedIn()).toBe(true);
  });

  describe('dispatching logInInitiated', () => {
    const email = 'dpole@email.com';
    const password = 'password1!';
    const idToken = 'new.id.token';
    const refreshToken = 'new.refresh.token';

    it('should dispatch with returned token from login endpoint', () => {
      mockAuthService.functions.login.mockReturnValue(of({
        idToken,
        refreshToken,
      }));

      dispatcher.dispatch(authEvents.logInInitiated({
        email,
        password,
      }));

      validateFunctionCall(mockAuthService.functions.login, {
        email,
        password,
      });
      expect(store.idToken()).toBe(initialState.idToken);
      expect(store.refreshToken()).toBe(initialState.refreshToken);
      expect(store.userTypes()).toEqual(initialState.userTypes);
      expect(store.isLoggedIn()).toBe(true);
      validateNthFunctionCall(dispatchSpy, 2, authEvents.tokensRetrieved({
        idToken,
        refreshToken,
      }), undefined);
      expect(dispatchSpy).toHaveBeenCalledTimes(2);
    });

    describe('should dispatch notification', () => {
      it('when login endpoint returns incorrect password error', () => {
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
        });
        expect(store.idToken()).toBe(initialState.idToken);
        expect(store.refreshToken()).toBe(initialState.refreshToken);
        expect(store.userTypes()).toEqual(initialState.userTypes);
        expect(store.isLoggedIn()).toBe(true);
        validateNthFunctionCall(dispatchSpy, 2, notificationEvents.showMessage('Hibás felhasználónév vagy jelszó'), undefined);
        expect(dispatchSpy).toHaveBeenCalledTimes(2);
      });

      it('when login endpoint returns wrong user type error', () => {
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
        });
        expect(store.idToken()).toBe(initialState.idToken);
        expect(store.refreshToken()).toBe(initialState.refreshToken);
        expect(store.userTypes()).toEqual(initialState.userTypes);
        expect(store.isLoggedIn()).toBe(true);
        validateNthFunctionCall(dispatchSpy, 2, notificationEvents.showMessage('Nincs jogosultságod ehhez az oldalhoz!'), undefined);
        expect(dispatchSpy).toHaveBeenCalledTimes(2);
      });

      it('when login endpoint returns other error', () => {
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
        });
        expect(store.idToken()).toBe(initialState.idToken);
        expect(store.refreshToken()).toBe(initialState.refreshToken);
        expect(store.userTypes()).toEqual(initialState.userTypes);
        expect(store.isLoggedIn()).toBe(true);
        validateNthFunctionCall(dispatchSpy, 2, notificationEvents.showMessage('Hiba történt'), undefined);
        expect(dispatchSpy).toHaveBeenCalledTimes(2);
      });
          
    });
  });

  describe('dispatching tokensRetrieved', () => {
    const idToken = 'new.id.token';
    const refreshToken = 'new.refresh.token';
    const userType = UserType.Editor;

    it('should store in local storage', () => {
      mockJwtDecode.mockReturnValue({
        'cognito:groups': [userType],
      });

      dispatcher.dispatch(authEvents.tokensRetrieved({
        idToken,
        refreshToken,
      }));
      validateFunctionCall(mockJwtDecode, idToken);
      expect(localStorage.getItem('idToken')).toBe(idToken);
      expect(localStorage.getItem('refreshToken')).toBe(refreshToken);
      expect(localStorage.getItem('userTypes')).toBe(userType);

      expect(store.idToken()).toBe(initialState.idToken);
      expect(store.refreshToken()).toBe(initialState.refreshToken);
      expect(store.userTypes()).toEqual(initialState.userTypes);
      expect(store.isLoggedIn()).toBe(true);
      validateNthFunctionCall(dispatchSpy, 2, authEvents.logInCompleted({
        idToken,
        refreshToken,
        userTypes: [UserType.Editor],
      },
      ), undefined);
      expect(dispatchSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('dispatching logInCompleted', () => {
    const idToken = 'new.id.token';
    const refreshToken = 'new.refresh.token';
    const userType = UserType.Editor;

    it('should update store', () => {
      dispatcher.dispatch(authEvents.logInCompleted({
        idToken,
        refreshToken,
        userTypes: [userType],
      }));

      expect(store.idToken()).toBe(idToken);
      expect(store.refreshToken()).toBe(refreshToken);
      expect(store.userTypes()).toEqual([userType]);
      expect(store.isLoggedIn()).toBe(true);
      expect(dispatchSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('dispatching logOut', () => {
    it('should clear store and local storage', () => {
      dispatcher.dispatch(authEvents.logOut());

      expect(store.idToken()).toBeUndefined();
      expect(store.refreshToken()).toBeUndefined();
      expect(store.userTypes()).toBeUndefined();
      expect(store.isLoggedIn()).toBe(false);
      expect(localStorage.getItem('idToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(localStorage.getItem('userTypes')).toBeNull();
      expect(dispatchSpy).toHaveBeenCalledTimes(1);
    });
  });
});
