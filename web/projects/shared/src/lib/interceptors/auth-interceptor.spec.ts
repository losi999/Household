import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';

import { authInterceptor } from './auth-interceptor';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { API_URL, authEvents, AuthService, AuthStore, MockSignalStore, provideMockDispatcher, provideMockSignalStore } from '@household/shared-ui';
import { catchError, delay, of, tap } from 'rxjs';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Dispatcher } from '@ngrx/signals/events';

describe('authInterceptor', () => {
  const apiUrl = 'http://api.url';
  let mockAuthService: MockService<AuthService>; 
  let mockAuthStore: MockSignalStore<typeof AuthStore>;
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let mockDispatcher: Dispatcher;

  const token = 'some.web.token';

  beforeEach(() => {
    vi.useFakeTimers();
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
  });

  afterEach(() => {
    vi.useRealTimers();
    httpMock.verify();
  });

  it('should forward request if not an API request', () => {
    const message = 'testing';
    http.get('http://not-api.url').subscribe({
      next: (resp: any) => {
        expect(resp.message).toBe(message);
      },
    });

    const req = httpMock.expectOne('http://not-api.url');

    req.flush({
      message,
    });

    validateFunctionCall(mockAuthService.functions.refreshToken);
    validateFunctionCall(mockDispatcher.dispatch);
    expect.assertions(3);
  });

  it('should forward if not logged in', () => {
    const message = 'testing';
    mockAuthStore.isLoggedIn.set(false);

    http.get(`${apiUrl}/testing`).subscribe({
      next: (resp: any) => {
        expect(resp.message).toBe(message);
      },
    });

    const req = httpMock.expectOne(`${apiUrl}/testing`);

    req.flush(
      {
        message,
      },
    );

    validateFunctionCall(mockAuthService.functions.refreshToken);
    validateFunctionCall(mockDispatcher.dispatch);
    expect.assertions(3);
  });

  it('should forward refreshToken request', () => {
    const message = 'testing';
    mockAuthStore.isLoggedIn.set(false);

    http.get(`${apiUrl}/refreshToken`).subscribe({
      next: (resp: any) => {
        expect(resp.message).toBe(message);
      },
    });

    const req = httpMock.expectOne(`${apiUrl}/refreshToken`);

    req.flush(
      {
        message,
      },
    );

    validateFunctionCall(mockAuthService.functions.refreshToken);
    validateFunctionCall(mockDispatcher.dispatch);
    expect.assertions(3);
  });

  it('should forward request with authorization', () => {
    const message = 'testing';
    mockAuthStore.isLoggedIn.set(true);
    mockAuthStore.idToken.set(token);

    http.get(`${apiUrl}/testing`).subscribe({
      next: (resp: any) => {
        expect(resp.message).toBe(message);
      },
    });

    const req = httpMock.expectOne(`${apiUrl}/testing`);
    
    expect(req.request.headers.get('Authorization')).toBe(token);

    req.flush(
      {
        message,
      },
    );

    validateFunctionCall(mockAuthService.functions.refreshToken);
    validateFunctionCall(mockDispatcher.dispatch);
    expect.assertions(4);
  });

  it('should refresh token if response is 401', () => {
    const message = 'testing';
    const refreshedToken = 'refreshed.jwt';
    mockAuthStore.isLoggedIn.set(true);
    mockAuthStore.idToken.set(token);
    mockAuthService.functions.refreshToken.mockReturnValue(of(undefined).pipe(
      tap(() => {
        mockAuthStore.idToken.set(refreshedToken);
      }),
    ));

    http.get(`${apiUrl}/testing`).subscribe({
      next: (resp: any) => {
        expect(resp.message).toBe(message);
      },
    });

    const [initialRequest] = httpMock.match(`${apiUrl}/testing`);
    
    expect(initialRequest.request.headers.get('Authorization')).toBe(token);

    initialRequest.flush(
      {
        message: 'The incoming token has expired',
      },
      {
        status: 401,
        statusText: 'Unauthenticated',
      },
    );
    const [refreshedRequest] = httpMock.match(`${apiUrl}/testing`);
    refreshedRequest.flush({
      message,
    });
    
    expect(refreshedRequest.request.headers.get('Authorization')).toBe(refreshedToken);

    expect(mockAuthService.functions.refreshToken).toHaveBeenCalled();
    validateFunctionCall(mockDispatcher.dispatch);
    expect.assertions(5);
  });

  it('should refresh token only once if multiple API calls respond with 401', () => {
    const message = 'testing';
    const refreshedToken = 'refreshed.jwt';
    mockAuthStore.isLoggedIn.set(true);
    mockAuthStore.idToken.set(token);
    mockAuthService.functions.refreshToken.mockReturnValue(of(undefined).pipe(
      delay(2000),
      tap(() => {
        mockAuthStore.idToken.set(refreshedToken);
      }),
    ));

    http.get(`${apiUrl}/testing`).subscribe({
      next: (resp: any) => {
        expect(resp.message).toBe(message);
      },
    });

    http.get(`${apiUrl}/second-call`).subscribe({
      next: (resp: any) => {
        expect(resp.message).toBe(message);
      },
    });

    const [initialRequest] = httpMock.match(`${apiUrl}/testing`);
    const [initialSecondRequest] = httpMock.match(`${apiUrl}/second-call`);
    
    expect(initialRequest.request.headers.get('Authorization')).toBe(token);  
    expect(initialSecondRequest.request.headers.get('Authorization')).toBe(token);

    initialRequest.flush(
      {
        message: 'The incoming token has expired',
      },
      {
        status: 401,
        statusText: 'Unauthenticated',
      },
    );

    initialSecondRequest.flush(
      {
        message: 'The incoming token has expired',
      },
      {
        status: 401,
        statusText: 'Unauthenticated',
      },
    );

    vi.advanceTimersByTime(2000);

    const [refreshedRequest] = httpMock.match(`${apiUrl}/testing`);
    const [refreshedSecondRequest] = httpMock.match(`${apiUrl}/second-call`);
    
    expect(refreshedRequest.request.headers.get('Authorization')).toBe(refreshedToken);
    expect(refreshedSecondRequest.request.headers.get('Authorization')).toBe(refreshedToken);
    
    refreshedRequest.flush({
      message,
    });

    refreshedSecondRequest.flush({
      message,
    });

    expect(mockAuthService.functions.refreshToken).toHaveBeenCalledOnce();
    validateFunctionCall(mockDispatcher.dispatch);
    expect.assertions(8);
  });

  it('should log out if response is 401 but not "expired token message"', () => {
    const message = 'testing';
    mockAuthStore.isLoggedIn.set(true);
    mockAuthStore.idToken.set(token);
    mockAuthService.functions.refreshToken.mockReturnValue(of(undefined));

    http.get(`${apiUrl}/testing`).pipe(
      catchError((err: HttpErrorResponse) => {
        expect(err.error.message).toBe(message);
        return of();
      }),
    ) 
      .subscribe({
        next: () => {},
        
      });

    const initialRequest = httpMock.expectOne(`${apiUrl}/testing`);
    
    expect(initialRequest.request.headers.get('Authorization')).toBe(token);

    initialRequest.flush(
      {
        message,
      },
      {
        status: 401,
        statusText: 'Unauthenticated',
      },
    );

    validateFunctionCall(mockAuthService.functions.refreshToken);
    validateFunctionCall(mockDispatcher.dispatch, authEvents.logOut(), {
      scope: 'self',
    });
    expect.assertions(4);
  });

  it('should log out if unable to refresh token', () => {
    const message = 'testing';
    const refreshedToken = 'refreshed.jwt';
    mockAuthStore.isLoggedIn.set(true);
    mockAuthStore.idToken.set(token);
    mockAuthService.functions.refreshToken.mockReturnValue(of(undefined).pipe(
      tap(() => {
        mockAuthStore.idToken.set(refreshedToken);
      }),
    ));

    http.get(`${apiUrl}/testing`).pipe(
      catchError((err: HttpErrorResponse) => {
        expect(err.error.message).toBe(message);
        return of();
      }),
    )
      .subscribe({
        next: () => { },
      });

    const [initialRequest] = httpMock.match(`${apiUrl}/testing`);
    
    expect(initialRequest.request.headers.get('Authorization')).toBe(token);

    initialRequest.flush(
      {
        message: 'The incoming token has expired',
      },
      {
        status: 401,
        statusText: 'Unauthenticated',
      },
    );
    const [refreshedRequest] = httpMock.match(`${apiUrl}/testing`);
    refreshedRequest.flush({
      message,
    }, {
      status: 500,
      statusText: 'Internal server error',
    });
    
    expect(refreshedRequest.request.headers.get('Authorization')).toBe(refreshedToken);

    expect(mockAuthService.functions.refreshToken).toHaveBeenCalled();    
    validateFunctionCall(mockDispatcher.dispatch, authEvents.logOut(), {
      scope: 'self',
    });
    expect.assertions(5);
  });
});
