import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { progressEvents } from '@household/shared-ui';
import { injectDispatch } from '@ngrx/signals/events';
import { catchError, tap, throwError } from 'rxjs';

export const progressInterceptor: HttpInterceptorFn = (req, next) => {
  const progressEventsDispatcher = injectDispatch(progressEvents);

  return next(req).pipe(tap({
    next: (event) => {
      if (event instanceof HttpResponse) {
        progressEventsDispatcher.processFinished();
      }
      else {
        progressEventsDispatcher.processStarted();
      }
    },
  }), catchError((error) => { 
    progressEventsDispatcher.processFinished();
    return throwError(() => error);
  }));
};
