import { TestBed } from '@angular/core/testing';
import { authEvents, AuthService, AuthState, AuthStore, stubLocalStorage } from '@household/shared-ui';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { UserType } from '@household/shared/enums';
import { Dispatcher } from '@ngrx/signals/events';
import { jwtDecode } from 'jwt-decode';
import { of } from 'rxjs';
import { Mock } from 'vitest';

// The behavior of each store feature is covered in its own spec (with-auth-reducer.spec.ts,
// with-auth-events.spec.ts). This spec only verifies that the store reads its initial state from local storage
// and has every feature wired in.
describe('Auth store', () => {
  let store: InstanceType<typeof AuthStore>;
  let dispatcher: Dispatcher;
  let mockAuthService: MockService<AuthService>;
  let mockJwtDecode: Mock;

  const storedState: AuthState = {
    idToken: 'stored.id.token',
    refreshToken: 'stored.refresh.token',
    userTypes: [UserType.Hairdresser],
  };

  const setup = (stored?: AuthState) => {
    TestBed.resetTestingModule();
    stubLocalStorage();

    if (stored) {
      localStorage.setItem('idToken', stored.idToken);
      localStorage.setItem('refreshToken', stored.refreshToken);
      localStorage.setItem('userTypes', stored.userTypes.join(','));
    }

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

    store = TestBed.inject(AuthStore);
    dispatcher = TestBed.inject(Dispatcher);
  };

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should initialize with the state stored in local storage', () => {
    setup(storedState);

    expect(store.idToken()).toBe(storedState.idToken);
    expect(store.refreshToken()).toBe(storedState.refreshToken);
    expect(store.userTypes()).toEqual(storedState.userTypes);
    expect(store.isLoggedIn()).toBe(true);
  });

  it('should initialize as logged out if local storage is empty', () => {
    setup();

    expect(store.idToken()).toBeNull();
    expect(store.refreshToken()).toBeNull();
    expect(store.userTypes()).toEqual([]);
    expect(store.isLoggedIn()).toBe(false);
  });

  it('should have the reducer wired in', () => {
    setup(storedState);

    dispatcher.dispatch(authEvents.logOut());

    expect(store.idToken()).toBeUndefined();
    expect(store.refreshToken()).toBeUndefined();
    expect(store.userTypes()).toBeUndefined();
    expect(store.isLoggedIn()).toBe(false);
  });

  it('should have the event handlers and the reducer work together', () => {
    const idToken = 'new.id.token';
    const refreshToken = 'new.refresh.token';
    setup(storedState);
    mockAuthService.functions.login.mockReturnValue(of({
      idToken,
      refreshToken,
    }));
    mockJwtDecode.mockReturnValue({
      'cognito:groups': [UserType.Editor],
    });

    dispatcher.dispatch(authEvents.logInInitiated({
      email: 'dpole@email.com',
      password: 'password1!',
    }));

    validateFunctionCall(mockAuthService.functions.login, {
      email: 'dpole@email.com',
      password: 'password1!',
      requiredUserType: undefined,
    });
    expect(store.idToken()).toBe(idToken);
    expect(store.refreshToken()).toBe(refreshToken);
    expect(store.userTypes()).toEqual([UserType.Editor]);
    expect(store.isLoggedIn()).toBe(true);
  });
});
