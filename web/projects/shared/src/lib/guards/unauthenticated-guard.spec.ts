import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { unauthenticatedGuard } from './unauthenticated-guard';
import { AuthService, navigationEvents } from '@household/shared-ui';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { Dispatcher } from '@ngrx/signals/events';

describe('unauthenticatedGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
    TestBed.runInInjectionContext(() => unauthenticatedGuard(...guardParameters));
  let mockAuthService: MockService<AuthService>;
  let mockDispatcher: { dispatch: (...args: any) => any };

  beforeEach(() => {
    mockAuthService = createMockService('isLoggedIn');
    mockDispatcher = {
      dispatch: vi.fn(), 
    };
        
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService.service,
        },
        {
          provide: Dispatcher,
          useValue: mockDispatcher,
        },
      ],
    });
  });

  it('should allow', () => {
    mockAuthService.functions.isLoggedIn.mockReturnValue(false);
    const result = executeGuard(undefined, undefined);

    expect(result).toBe(true);
    validateFunctionCall(mockDispatcher.dispatch);
  });

  it('should deny if logged in', () => {
    mockAuthService.functions.isLoggedIn.mockReturnValue(true);
    const result = executeGuard(undefined, undefined);

    expect(result).toBe(false);
    validateFunctionCall(mockDispatcher.dispatch, navigationEvents.loggedInHomepage(), {
      scope: 'self',
    });
  });
});
