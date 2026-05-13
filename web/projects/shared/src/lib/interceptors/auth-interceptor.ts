import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_URL, AuthService } from '@household/shared-ui';
import { catchError, Observable, Subject, switchMap, tap, throwError } from 'rxjs';

const createAuthInterceptor = (): HttpInterceptorFn => {
  const authService = inject(AuthService);
  const apiUrl = inject(API_URL);

  let refreshTokenInProgress = false;
  const tokenRefreshedSource = new Subject();
  const tokenRefreshed$ = tokenRefreshedSource.asObservable();

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

    return authService.refreshToken().pipe(
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
        Authorization: authService.idToken,
      },
    });
  };

  return (request, next) => {

    if (!request.url.includes(apiUrl)) {
      return next(request);
    }

    if (authService.isLoggedIn) {
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
                  authService.logout();
                  return throwError(() => error);
                }),
              );
            }
            authService.logout();
          }
          return throwError(() => error);
        }));
    }

    return next(request);
  };
};

export const authInterceptor: HttpInterceptorFn = (request, next) => createAuthInterceptor()(request, next);
