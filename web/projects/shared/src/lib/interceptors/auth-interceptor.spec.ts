import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';

import { authInterceptor } from './auth-interceptor';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { API_URL, authEvents, AuthService, AuthStore, MockSignalStore, provideMockDispatcher, provideMockSignalStore } from '@household/shared-ui';
import { delay, mergeMap, of, tap, throwError, timer } from 'rxjs';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Dispatcher } from '@ngrx/signals/events';

describe('authInterceptor', () => {
  const apiUrl = 'http://api.url';
  let mockAuthService: MockService<AuthService>;
  let mockAuthStore: MockSignalStore<typeof AuthStore>;
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let mockDispatcher: Dispatcher;

  const message = 'testing';
  const token = 'some.web.token';
  const refreshToken = 'some.refresh.token';
  const refreshedToken = 'refreshed.jwt';
  const expiredTokenResponse = [
    {
      message: 'The incoming token has expired',
    },
    {
      status: 401,
      statusText: 'Unauthenticated',
    },
  ] as const;

  const setup = () => {
    TestBed.resetTestingModule();

    mockAuthService = createMockService('refreshToken');

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(
          withInterceptors([authInterceptor]),
        ),
        provideHttpClientTesting(),
        provideMockDispatcher(),
        provideMockSignalStore(AuthStore, 'isLoggedIn', 'idToken', 'refreshToken'),
        {
          provide: AuthService,
          useValue: mockAuthService.service,
        },
        {
          provide: API_URL,
          useValue: apiUrl,
        },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    mockDispatcher = TestBed.inject(Dispatcher);
    mockAuthStore = TestBed.inject<MockSignalStore<typeof AuthStore>>(AuthStore);
    mockAuthStore.refreshToken.set(refreshToken);
  };

  // Sends a request and records how it ended, so the assertions can follow the flushes
  const get = (url: string) => {
    const outcome: {
      response?: any;
      error?: HttpErrorResponse;
      completed: boolean;
    } = {
      completed: false,
    };

    http.get(url).subscribe({
      next: (response) => {
        outcome.response = response;
      },
      error: (error) => {
        outcome.error = error;
      },
      complete: () => {
        outcome.completed = true;
      },
    });

    return outcome;
  };

  const logIn = () => {
    mockAuthStore.isLoggedIn.set(true);
    mockAuthStore.idToken.set(token);
  };

  const mockSuccessfulRefresh = (delayMs = 0) => {
    // A zero delay would still be asynchronous, so it is only applied when requested
    const refreshed$ = of(undefined).pipe(
      tap(() => {
        mockAuthStore.idToken.set(refreshedToken);
      }),
    );

    mockAuthService.functions.refreshToken.mockReturnValue(delayMs ? refreshed$.pipe(delay(delayMs)) : refreshed$);
  };

  beforeEach(() => {
    setup();
  });

  afterEach(() => {
    vi.useRealTimers();
    httpMock.verify();
  });

  describe('forwarding', () => {
    it('should forward request if not an API request', () => {
      logIn();

      const outcome = get('http://not-api.url');
      const req = httpMock.expectOne('http://not-api.url');

      expect(req.request.headers.has('Authorization')).toBe(false);

      req.flush({
        message,
      });

      expect(outcome.response).toEqual({
        message,
      });
      validateFunctionCall(mockAuthService.functions.refreshToken);
      validateFunctionCall(mockDispatcher.dispatch);
    });

    it('should forward if not logged in', () => {
      mockAuthStore.isLoggedIn.set(false);

      const outcome = get(`${apiUrl}/testing`);
      const req = httpMock.expectOne(`${apiUrl}/testing`);

      expect(req.request.headers.has('Authorization')).toBe(false);

      req.flush({
        message,
      });

      expect(outcome.response).toEqual({
        message,
      });
      validateFunctionCall(mockAuthService.functions.refreshToken);
      validateFunctionCall(mockDispatcher.dispatch);
    });

    it('should forward refreshToken request', () => {
      logIn();

      const outcome = get(`${apiUrl}/refreshToken`);
      const req = httpMock.expectOne(`${apiUrl}/refreshToken`);

      expect(req.request.headers.has('Authorization')).toBe(false);

      req.flush({
        message,
      });

      expect(outcome.response).toEqual({
        message,
      });
      validateFunctionCall(mockAuthService.functions.refreshToken);
      validateFunctionCall(mockDispatcher.dispatch);
    });

    it('should forward request with authorization', () => {
      logIn();

      const outcome = get(`${apiUrl}/testing`);
      const req = httpMock.expectOne(`${apiUrl}/testing`);

      expect(req.request.headers.get('Authorization')).toBe(token);

      req.flush({
        message,
      });

      expect(outcome.response).toEqual({
        message,
      });
      validateFunctionCall(mockAuthService.functions.refreshToken);
      validateFunctionCall(mockDispatcher.dispatch);
    });
  });

  describe('response with an error other than 401', () => {
    it('should pass the error through without refreshing the token or logging out', () => {
      logIn();

      const outcome = get(`${apiUrl}/testing`);
      httpMock.expectOne(`${apiUrl}/testing`).flush({
        message,
      }, {
        status: 500,
        statusText: 'Internal server error',
      });

      expect(outcome.error.status).toBe(500);
      expect(outcome.error.error.message).toBe(message);
      validateFunctionCall(mockAuthService.functions.refreshToken);
      validateFunctionCall(mockDispatcher.dispatch);
    });
  });

  describe('response with 401', () => {
    it('should refresh the token and repeat the request if the token has expired', () => {
      logIn();
      mockSuccessfulRefresh();

      const outcome = get(`${apiUrl}/testing`);
      const [initialRequest] = httpMock.match(`${apiUrl}/testing`);

      expect(initialRequest.request.headers.get('Authorization')).toBe(token);

      initialRequest.flush(...expiredTokenResponse);
      const [repeatedRequest] = httpMock.match(`${apiUrl}/testing`);

      expect(repeatedRequest.request.headers.get('Authorization')).toBe(refreshedToken);

      repeatedRequest.flush({
        message,
      });

      expect(outcome.response).toEqual({
        message,
      });
      validateFunctionCall(mockAuthService.functions.refreshToken, {
        refreshToken,
      });
      validateFunctionCall(mockDispatcher.dispatch);
    });

    it('should refresh the token only once if multiple API calls respond with 401', () => {
      vi.useFakeTimers();
      logIn();
      mockSuccessfulRefresh(2000);

      const outcome = get(`${apiUrl}/testing`);
      const secondOutcome = get(`${apiUrl}/second-call`);
      const [initialRequest] = httpMock.match(`${apiUrl}/testing`);
      const [initialSecondRequest] = httpMock.match(`${apiUrl}/second-call`);

      expect(initialRequest.request.headers.get('Authorization')).toBe(token);
      expect(initialSecondRequest.request.headers.get('Authorization')).toBe(token);

      initialRequest.flush(...expiredTokenResponse);
      initialSecondRequest.flush(...expiredTokenResponse);

      vi.advanceTimersByTime(2000);

      const [repeatedRequest] = httpMock.match(`${apiUrl}/testing`);
      const [repeatedSecondRequest] = httpMock.match(`${apiUrl}/second-call`);

      expect(repeatedRequest.request.headers.get('Authorization')).toBe(refreshedToken);
      expect(repeatedSecondRequest.request.headers.get('Authorization')).toBe(refreshedToken);

      repeatedRequest.flush({
        message,
      });
      repeatedSecondRequest.flush({
        message,
      });

      expect(outcome.response).toEqual({
        message,
      });
      expect(secondOutcome.response).toEqual({
        message,
      });
      expect(mockAuthService.functions.refreshToken).toHaveBeenCalledOnce();
      validateFunctionCall(mockDispatcher.dispatch);
    });

    it('should log out if the message is not the expired token one', () => {
      logIn();

      const outcome = get(`${apiUrl}/testing`);
      const initialRequest = httpMock.expectOne(`${apiUrl}/testing`);

      expect(initialRequest.request.headers.get('Authorization')).toBe(token);

      initialRequest.flush({
        message,
      }, {
        status: 401,
        statusText: 'Unauthenticated',
      });

      expect(outcome.error.error.message).toBe(message);
      validateFunctionCall(mockAuthService.functions.refreshToken);
      validateFunctionCall(mockDispatcher.dispatch, authEvents.logOut(), {
        scope: 'self',
      });
    });

    it('should log out if the token could not be refreshed', () => {
      logIn();
      mockAuthService.functions.refreshToken.mockReturnValue(throwError(() => ({
        error: {
          message: 'Refresh token has expired',
        },
      })));

      const outcome = get(`${apiUrl}/testing`);
      httpMock.expectOne(`${apiUrl}/testing`).flush(...expiredTokenResponse);

      expect(outcome.error).toEqual({
        error: {
          message: 'Refresh token has expired',
        },
      });
      validateFunctionCall(mockAuthService.functions.refreshToken, {
        refreshToken,
      });
      validateFunctionCall(mockDispatcher.dispatch, authEvents.logOut(), {
        scope: 'self',
      });
    });

    it('should log out if the repeated request fails', () => {
      logIn();
      mockSuccessfulRefresh();

      const outcome = get(`${apiUrl}/testing`);
      const [initialRequest] = httpMock.match(`${apiUrl}/testing`);

      initialRequest.flush(...expiredTokenResponse);
      const [repeatedRequest] = httpMock.match(`${apiUrl}/testing`);

      repeatedRequest.flush({
        message,
      }, {
        status: 500,
        statusText: 'Internal server error',
      });

      expect(repeatedRequest.request.headers.get('Authorization')).toBe(refreshedToken);
      expect(outcome.error.error.message).toBe(message);
      validateFunctionCall(mockDispatcher.dispatch, authEvents.logOut(), {
        scope: 'self',
      });
    });

    it('should fail the calls waiting for the refresh too if the token could not be refreshed', () => {
      vi.useFakeTimers();
      logIn();
      mockAuthService.functions.refreshToken.mockReturnValue(timer(2000).pipe(mergeMap(() => throwError(() => ({
        error: {
          message: 'Refresh token has expired',
        },
      })))));

      const outcome = get(`${apiUrl}/testing`);
      const secondOutcome = get(`${apiUrl}/second-call`);
      httpMock.expectOne(`${apiUrl}/testing`).flush(...expiredTokenResponse);
      httpMock.expectOne(`${apiUrl}/second-call`).flush(...expiredTokenResponse);

      vi.advanceTimersByTime(2000);

      expect(outcome.error).toBeDefined();
      expect(secondOutcome.error).toBeDefined();
      expect(mockAuthService.functions.refreshToken).toHaveBeenCalledOnce();
    });
  });
});
