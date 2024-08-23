import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { progressActions } from 'src/app/state/progress.actions';

@Injectable()
export class ProgressInterceptor implements HttpInterceptor {
  constructor(private store: Store) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          this.store.dispatch(progressActions.processFinished());
        }
        else {
          this.store.dispatch(progressActions.processStarted());
        }
      },
    }));
  }
}
