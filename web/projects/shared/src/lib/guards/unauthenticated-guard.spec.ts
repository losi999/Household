import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { unauthenticatedGuard } from './unauthenticated-guard';
import { AuthStore, MockSignalStore, navigationEvents, provideMockDispatcher, provideMockSignalStore } from '@household/shared-ui';
import { validateFunctionCall } from '@household/shared/common/unit-testing';
import { Dispatcher } from '@ngrx/signals/events';

describe('unauthenticatedGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
    TestBed.runInInjectionContext(() => unauthenticatedGuard(...guardParameters));

  let mockAuthStore: MockSignalStore<typeof AuthStore>;
  let mockDispatcher: Dispatcher;

  beforeEach(() => {        
    TestBed.configureTestingModule({
      providers: [
        provideMockSignalStore(AuthStore, 'isLoggedIn'),
        provideMockDispatcher(),
      ],
    });

    mockDispatcher = TestBed.inject(Dispatcher);
    mockAuthStore = TestBed.inject<MockSignalStore<typeof AuthStore>>(AuthStore);
  });

  it('should allow', () => {
    mockAuthStore.isLoggedIn.set(false);
    const result = executeGuard(undefined, undefined);

    expect(result).toBe(true);
    validateFunctionCall(mockDispatcher.dispatch);
  });

  it('should deny if logged in', () => {
    mockAuthStore.isLoggedIn.set(true);
    const result = executeGuard(undefined, undefined);

    expect(result).toBe(false);
    validateFunctionCall(mockDispatcher.dispatch, navigationEvents.loggedInHomepage(), {
      scope: 'self',
    });
  });
});
