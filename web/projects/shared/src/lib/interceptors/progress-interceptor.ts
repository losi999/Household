import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { progressEvents } from '@household/shared-ui';
import { injectDispatch } from '@ngrx/signals/events';
import { catchError, finalize, tap, throwError } from 'rxjs';

export const progressInterceptor: HttpInterceptorFn = (req, next) => {
  const progressEventsDispatcher = injectDispatch(progressEvents);

  let isInProgress = false;
  const finishProgress = () => {
    if (isInProgress) {
      isInProgress = false;
      progressEventsDispatcher.processFinished();
    }
  };

  return next(req).pipe(tap({
    next: (event) => {
      if (event instanceof HttpResponse) {
        finishProgress();
      } else if (!isInProgress) {
        isInProgress = true;
        progressEventsDispatcher.processStarted();
      }
    },
  }), catchError((error) => {
    finishProgress();
    return throwError(() => error);
  }), finalize(finishProgress));
};
