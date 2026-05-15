import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { progressInterceptor } from './progress-interceptor';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Dispatcher } from '@ngrx/signals/events';
import { validateFunctionCall, validateNthFunctionCall } from '@household/shared/common/unit-testing';
import { progressEvents } from '@household/shared-ui';
import { catchError, of } from 'rxjs';

describe('progressInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let mockDispatcher: { dispatch: (...args: any) => any };

  beforeEach(() => {
    mockDispatcher = {
      dispatch: vi.fn(), 
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(
          withInterceptors([progressInterceptor]),
        ),
        provideHttpClientTesting(),
        {
          provide: Dispatcher,
          useValue: mockDispatcher,
        },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock =
      TestBed.inject(HttpTestingController);
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

  it('should end progress on repsonse', () => {
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
