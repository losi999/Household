import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_URL, authEvents, AuthService, AuthStore } from '@household/shared-ui';
import { injectDispatch } from '@ngrx/signals/events';
import { catchError, Observable, Subject, switchMap, tap, throwError } from 'rxjs';

let refreshTokenInProgress = false;
const tokenRefreshedSource = new Subject();
const tokenRefreshed$ = tokenRefreshedSource.asObservable();

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const apiUrl = inject(API_URL);
  const authEventDispatcher = injectDispatch(authEvents);
  const authStore = inject(AuthStore);

  const refreshToken = (): Observable<any> => {
    if (refreshTokenInProgress) {
      return new Observable(observer => {
        tokenRefreshed$.subscribe(() => {
          observer.next(undefined);
          observer.complete();
        });
      });
    }
    refreshTokenInProgress = true;

    return authService.refreshToken(authStore.refreshToken()).pipe(
      tap(() => {
        refreshTokenInProgress = false;
        tokenRefreshedSource.next(undefined);
      }),
      catchError((error) => {
        refreshTokenInProgress = false;
        return throwError(() => error);
      }));
  };

  const addAuthHeaders = (request: HttpRequest<unknown>): HttpRequest<unknown> => {
    return request.clone({
      setHeaders: {
        Authorization: authStore.idToken(),
      },
    });
  };

  if (!request.url.includes(apiUrl)) {
    return next(request);
  }

  if (authStore.isLoggedIn()) {
    const authorizedRequest = addAuthHeaders(request);
    return next(authorizedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          if (error.error.message === 'The incoming token has expired') {
            return refreshToken().pipe(
              switchMap(() => {
                return next(addAuthHeaders(request));
              }),
              catchError((error) => {
                authEventDispatcher.logOut();
                return throwError(() => error);
              }),
            );
          }
          authEventDispatcher.logOut();
        }
        return throwError(() => error);
      }));
  }

  return next(request);
};
