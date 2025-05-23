import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { AuthService } from '@household/web/services/auth.service';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { progressActions } from '@household/web/state/progress/progress.actions';
import { environment } from '@household/web/environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private store: Store) { }

  private addAuthHeaders(request: HttpRequest<unknown>): HttpRequest<unknown> {
    return request.clone({
      setHeaders: {
        Authorization: this.authService.idToken,
      },
    });
  }

  private refreshTokenInProgress = false;
  private tokenRefreshedSource = new Subject();
  private tokenRefreshed$ = this.tokenRefreshedSource.asObservable();

  private refreshToken(): Observable<any> {
    if (this.refreshTokenInProgress) {
      return new Observable(observer => {
        this.tokenRefreshed$.subscribe(() => {
          observer.next(undefined);
          observer.complete();
        });
      });
    }
    this.refreshTokenInProgress = true;

    return this.authService.refreshToken().pipe(
      tap(() => {
        this.refreshTokenInProgress = false;
        this.tokenRefreshedSource.next(undefined);
      }),
      catchError((error) => {
        this.refreshTokenInProgress = false;
        return throwError(() => error);
      }));
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!request.url.includes(environment.apiUrl)) {
      return next.handle(request);
    }

    if (this.authService.isLoggedIn) {
      const authorizedRequest = this.addAuthHeaders(request);
      return next.handle(authorizedRequest).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            if (error.error.message === 'The incoming token has expired') {
              this.store.dispatch(progressActions.processFinished());
              return this.refreshToken().pipe(
                switchMap(() => {
                  return next.handle(this.addAuthHeaders(request));
                }),
                catchError((error) => {
                  this.authService.logout();
                  return throwError(() => error);
                }),
              );
            }
            this.authService.logout();
          }
          return throwError(() => error);
        }));
    }
    return next.handle(request);
  }
}
