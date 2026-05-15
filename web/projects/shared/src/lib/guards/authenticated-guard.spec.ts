import { TestBed } from '@angular/core/testing';
import { CanMatchFn } from '@angular/router';

import { authenticatedGuard } from './authenticated-guard';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { AuthService, navigationEvents } from '@household/shared-ui';
import { Dispatcher } from '@ngrx/signals/events';

describe('authenticatedGuard', () => {
  const executeGuard: CanMatchFn = (...guardParameters) => 
    TestBed.runInInjectionContext(() => authenticatedGuard(...guardParameters));
  let mockAuthService: MockService<AuthService>;
  let mockDispatcher: { dispatch: (...args: any) => any };
  const requiredUserType = 'requiredUserType';

  beforeEach(() => {
    mockAuthService = createMockService('hasUserType', 'isLoggedIn');
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
    mockAuthService.functions.isLoggedIn.mockReturnValue(true);
    mockAuthService.functions.hasUserType.mockReturnValue(true);

    const result = executeGuard({
      data: {
        requiredUserType,
      },
    }, undefined);

    expect(result).toBe(true);
    validateFunctionCall(mockDispatcher.dispatch);
  });

  it('should deny if not logged in', () => {
    mockAuthService.functions.isLoggedIn.mockReturnValue(false);

    const result = executeGuard({
      data: {
        requiredUserType,
      },
    }, undefined);

    expect(result).toBe(false);
    validateFunctionCall(mockDispatcher.dispatch, navigationEvents.loggedOutHomepage(), {
      scope: 'self',
    });
  });

  it('should deny if does not have the required user type', () => {
    mockAuthService.functions.isLoggedIn.mockReturnValue(true);
    mockAuthService.functions.hasUserType.mockReturnValue(false);

    const result = executeGuard({
      data: {
        requiredUserType,
      },
    }, undefined);

    expect(result).toBe(false);
    validateFunctionCall(mockDispatcher.dispatch, navigationEvents.loggedOutHomepage(), {
      scope: 'self',
    });
  });
});
