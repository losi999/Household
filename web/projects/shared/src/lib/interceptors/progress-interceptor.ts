import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { progressActions } from '../state/progress/progress-actions';
import { Store } from '@ngrx/store';
import { catchError, tap, throwError } from 'rxjs';

export const progressInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);

  return next(req).pipe(tap({
    next: (event) => {
      if (event instanceof HttpResponse) {
        store.dispatch(progressActions.processFinished());
      }
      else {
        store.dispatch(progressActions.processStarted());
      }
    },
  }), catchError((error) => { 
    store.dispatch(progressActions.processFinished());
    return throwError(() => error);
  }));
};
