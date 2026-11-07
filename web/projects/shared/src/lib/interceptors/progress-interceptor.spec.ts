import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { progressInterceptor } from './progress-interceptor';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Dispatcher } from '@ngrx/signals/events';
import { validateFunctionCall, validateNthFunctionCall } from '@household/shared/common/unit-testing';
import { progressEvents, provideMockDispatcher } from '@household/shared-ui';
import { catchError, of } from 'rxjs';

describe('progressInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let mockDispatcher: Dispatcher;

  const setup = () => {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(
          withInterceptors([progressInterceptor]),
        ),
        provideHttpClientTesting(),
        provideMockDispatcher(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    mockDispatcher = TestBed.inject(Dispatcher);
  };

  beforeEach(() => {
    setup();
  });

  it('should start progress on request', () => {
    http.get('http://testing').subscribe({
      next: () => { },
    });

    httpMock.expectOne('http://testing');
    
    expect(mockDispatcher.dispatch).toHaveBeenCalledOnce();    
    validateFunctionCall(mockDispatcher.dispatch, progressEvents.processStarted(), {
      scope: 'self',
    });
  });

  it('should end progress on response', () => {
    http.get('http://testing').subscribe({
      next: () => { },
    });

    const req = httpMock.expectOne('http://testing');
    req.flush({
      message: 'OK',
    });
    
    expect(mockDispatcher.dispatch).toHaveBeenCalledTimes(2);    
    validateNthFunctionCall(mockDispatcher.dispatch, 1, progressEvents.processStarted(), {
      scope: 'self',
    });
    validateNthFunctionCall(mockDispatcher.dispatch, 2, progressEvents.processFinished(), {
      scope: 'self',
    });
  });

  it('should end progress if the request is cancelled', () => {
    const subscription = http.get('http://testing').subscribe();

    const req = httpMock.expectOne('http://testing');
    subscription.unsubscribe();

    expect(req.cancelled).toBe(true);
    expect(mockDispatcher.dispatch).toHaveBeenCalledTimes(2);
    validateNthFunctionCall(mockDispatcher.dispatch, 2, progressEvents.processFinished(), {
      scope: 'self',
    });
  });

  it('should end progress on error', () => {
    http.get('http://testing').pipe(catchError(() => {
      return of();
    }))
      .subscribe({
        next: () => { },
      });

    const req = httpMock.expectOne('http://testing');
    req.flush({
      message: 'not OK',
    }, {
      status: 500,
      statusText: 'Internal server error',
    });
    
    expect(mockDispatcher.dispatch).toHaveBeenCalledTimes(2);    
    validateNthFunctionCall(mockDispatcher.dispatch, 1, progressEvents.processStarted(), {
      scope: 'self',
    });
    validateNthFunctionCall(mockDispatcher.dispatch, 2, progressEvents.processFinished(), {
      scope: 'self',
    });
  });
});
