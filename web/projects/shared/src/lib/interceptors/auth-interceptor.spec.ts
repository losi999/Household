import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';

import { authInterceptor } from './auth-interceptor';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { API_URL, AuthService } from '@household/shared-ui';
import { catchError, delay, of } from 'rxjs';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

describe('authInterceptor', () => {
  const apiUrl = 'http://api.url';
  let mockAuthService: MockService<AuthService>; 

  const token = 'some.web.token';

  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    vi.useFakeTimers();
    mockAuthService = createMockService('idToken', 'refreshToken', 'isLoggedIn', 'logout');

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(
          withInterceptors([authInterceptor]),
        ),
        provideHttpClientTesting(),
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
    httpMock =
      TestBed.inject(HttpTestingController);
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

    validateFunctionCall(mockAuthService.functions.idToken);
    validateFunctionCall(mockAuthService.functions.refreshToken);
    validateFunctionCall(mockAuthService.functions.isLoggedIn);
    validateFunctionCall(mockAuthService.functions.logout);
    expect.assertions(5);
  });

  it('should forward if not logged in', () => {
    const message = 'testing';
    mockAuthService.functions.isLoggedIn.mockReturnValue(false);

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

    validateFunctionCall(mockAuthService.functions.idToken);
    validateFunctionCall(mockAuthService.functions.refreshToken);
    expect(mockAuthService.functions.isLoggedIn).toHaveBeenCalled();
    validateFunctionCall(mockAuthService.functions.logout);
    expect.assertions(5);
  });

  it('should forward request with authorization', () => {
    const message = 'testing';
    mockAuthService.functions.isLoggedIn.mockReturnValue(true);
    mockAuthService.functions.idToken.mockReturnValue(token);

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

    expect(mockAuthService.functions.idToken).toHaveBeenCalled();
    validateFunctionCall(mockAuthService.functions.refreshToken);
    expect(mockAuthService.functions.isLoggedIn).toHaveBeenCalled();
    validateFunctionCall(mockAuthService.functions.logout);
    expect.assertions(6);
  });

  it('should refresh token if response is 401', () => {
    const message = 'testing';
    const refreshedToken = 'refreshed.jwt';
    mockAuthService.functions.isLoggedIn.mockReturnValue(true);
    mockAuthService.functions.idToken.mockReturnValueOnce(token);
    mockAuthService.functions.idToken.mockReturnValueOnce(refreshedToken);
    mockAuthService.functions.refreshToken.mockReturnValue(of({}));

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

    expect(mockAuthService.functions.idToken).toHaveBeenCalled();
    expect(mockAuthService.functions.refreshToken).toHaveBeenCalled();
    expect(mockAuthService.functions.isLoggedIn).toHaveBeenCalled();
    validateFunctionCall(mockAuthService.functions.logout);
    expect.assertions(7);
  });

  it('should refresh token only once if multiple API calls respond with 401', () => {
    const message = 'testing';
    const refreshedToken = 'refreshed.jwt';
    mockAuthService.functions.isLoggedIn.mockReturnValue(true);
    mockAuthService.functions.idToken.mockReturnValueOnce(token);
    mockAuthService.functions.idToken.mockReturnValueOnce(token);
    mockAuthService.functions.idToken.mockReturnValueOnce(refreshedToken);
    mockAuthService.functions.idToken.mockReturnValueOnce(refreshedToken);
    mockAuthService.functions.refreshToken.mockReturnValue(of({}).pipe(delay(2000)));

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

    expect(mockAuthService.functions.idToken).toHaveBeenCalled();
    expect(mockAuthService.functions.refreshToken).toHaveBeenCalledOnce();
    expect(mockAuthService.functions.isLoggedIn).toHaveBeenCalled();
    validateFunctionCall(mockAuthService.functions.logout);
    expect.assertions(10);
  });

  it('should log out if response is 401 but not "expired token message"', () => {
    const message = 'testing';
    mockAuthService.functions.isLoggedIn.mockReturnValue(true);
    mockAuthService.functions.idToken.mockReturnValue(token);
    mockAuthService.functions.refreshToken.mockReturnValue(of({}));

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

    expect(mockAuthService.functions.idToken).toHaveBeenCalled();
    validateFunctionCall(mockAuthService.functions.refreshToken);
    expect(mockAuthService.functions.isLoggedIn).toHaveBeenCalled();
    expect(mockAuthService.functions.logout).toHaveBeenCalled();
    expect.assertions(6);
  });

  it('should log out if unable to refresh token', () => {
    const message = 'testing';
    const refreshedToken = 'refreshed.jwt';
    mockAuthService.functions.isLoggedIn.mockReturnValue(true);
    mockAuthService.functions.idToken.mockReturnValueOnce(token);
    mockAuthService.functions.idToken.mockReturnValueOnce(refreshedToken);
    mockAuthService.functions.refreshToken.mockReturnValue(of({}));

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

    expect(mockAuthService.functions.idToken).toHaveBeenCalled();
    expect(mockAuthService.functions.refreshToken).toHaveBeenCalled();
    expect(mockAuthService.functions.isLoggedIn).toHaveBeenCalled();
    expect(mockAuthService.functions.logout).toHaveBeenCalled();
    expect.assertions(7);
  });
});
