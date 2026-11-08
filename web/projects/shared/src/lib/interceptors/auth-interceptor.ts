import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_URL, authEvents, AuthService, AuthStore } from '@household/shared-ui';
import { injectDispatch } from '@ngrx/signals/events';
import { catchError, finalize, Observable, share, switchMap, throwError } from 'rxjs';

// The refresh in progress, shared by every call that gets 401 in the meantime, so they all see its result
let refreshTokenInProgress: Observable<unknown> | undefined;

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const apiUrl = inject(API_URL);
  const authEventDispatcher = injectDispatch(authEvents);
  const authStore = inject(AuthStore);

  const refreshToken = (): Observable<unknown> => {
    refreshTokenInProgress ??= authService.refreshToken({
      refreshToken: authStore.refreshToken(),
    }).pipe(
      finalize(() => {
        refreshTokenInProgress = undefined;
      }),
      share(),
    );

    return refreshTokenInProgress;
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

  if (request.url.endsWith('refreshToken')) {
    return next(request);
  }

  if (!authStore.isLoggedIn()) {
    return next(request);
  }

  const authorizedRequest = addAuthHeaders(request);
  return next(authorizedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      if (error.error.message !== 'The incoming token has expired') {
        authEventDispatcher.logOut();
        return throwError(() => error);
      }

      return refreshToken().pipe(
        switchMap(() => {
          return next(addAuthHeaders(request));
        }),
        catchError((error) => {
          authEventDispatcher.logOut();
          return throwError(() => error);
        }),
      );
    }));
};
