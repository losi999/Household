import { TestBed } from '@angular/core/testing';
import { CanMatchFn } from '@angular/router';

import { authenticatedGuard } from './authenticated-guard';
import { validateFunctionCall } from '@household/shared/common/unit-testing';
import { AuthStore, MockSignalStore, navigationEvents, provideMockDispatcher, provideMockSignalStore } from '@household/shared-ui';
import { Dispatcher } from '@ngrx/signals/events';
import { UserType } from '@household/shared/enums';

describe('authenticatedGuard', () => {
  const executeGuard: CanMatchFn = (...guardParameters) => 
    TestBed.runInInjectionContext(() => authenticatedGuard(...guardParameters));
      
  let mockAuthStore: MockSignalStore<typeof AuthStore>;
  let mockDispatcher: Dispatcher;
  const requiredUserType: UserType = UserType.Hairdresser;

  const setup = () => {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        provideMockSignalStore(AuthStore, 'isLoggedIn', 'userTypes'),
        provideMockDispatcher(),
      ],
    });

    mockDispatcher = TestBed.inject(Dispatcher);
    mockAuthStore = TestBed.inject<MockSignalStore<typeof AuthStore>>(AuthStore);
  };

  beforeEach(() => {
    setup();
  });

  it('should allow', () => {
    mockAuthStore.isLoggedIn.set(true);
    mockAuthStore.userTypes.set([requiredUserType]);

    const result = executeGuard({
      data: {
        requiredUserType,
      },
    }, undefined, undefined);

    expect(result).toBe(true);
    validateFunctionCall(mockDispatcher.dispatch);
  });

  it('should allow if the route does not require a user type', () => {
    mockAuthStore.isLoggedIn.set(true);
    mockAuthStore.userTypes.set([]);

    const result = executeGuard({
      data: {},
    }, undefined, undefined);

    expect(result).toBe(true);
    validateFunctionCall(mockDispatcher.dispatch);
  });

  it('should allow if the route has no data', () => {
    mockAuthStore.isLoggedIn.set(true);
    mockAuthStore.userTypes.set([]);

    const result = executeGuard({}, undefined, undefined);

    expect(result).toBe(true);
    validateFunctionCall(mockDispatcher.dispatch);
  });

  it('should deny if not logged in', () => {
    mockAuthStore.isLoggedIn.set(false);

    const result = executeGuard({
      data: {
        requiredUserType,
      },
    }, undefined, undefined);

    expect(result).toBe(false);
    validateFunctionCall(mockDispatcher.dispatch, navigationEvents.loggedOutHomepage(), {
      scope: 'self',
    });
  });

  it('should deny if does not have the required user type', () => {
    mockAuthStore.isLoggedIn.set(true);
    mockAuthStore.userTypes.set([]);

    const result = executeGuard({
      data: {
        requiredUserType,
      },
    }, undefined, undefined);

    expect(result).toBe(false);
    validateFunctionCall(mockDispatcher.dispatch, navigationEvents.loggedOutHomepage(), {
      scope: 'self',
    });
  });
});
