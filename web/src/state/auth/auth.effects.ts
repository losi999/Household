import { Injectable } from '@angular/core';
import { AuthService } from '@household/web/services/auth.service';
import { authActions } from '@household/web/state/auth/auth.actions';
import { notificationActions } from '@household/web/state/notification/notification.actions';
import { progressActions } from '@household/web/state/progress/progress.actions';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, tap } from 'rxjs';

@Injectable()
export class AuthEffects {
  constructor(private actions: Actions, private authService: AuthService) {}

  logIn = createEffect(() => {
    return this.actions.pipe(
      ofType(authActions.logInInitiated),
      exhaustMap(({ email, password }) => {
        return this.authService.login({
          email,
          password,
        }).pipe(
          map((data) => authActions.tokensRetrieved(data)),
          catchError(() => {
            return of(progressActions.processFinished(),
              notificationActions.showMessage({
                message: 'Hibás felhasználónév vagy jelszó',
              }),
            );
          }),
        );
      }),
    );
  });

  storeTokens = createEffect(() => {
    return this.actions.pipe(
      ofType(authActions.tokensRetrieved),
      exhaustMap(({ idToken, refreshToken }) => {
        localStorage.setItem('idToken', idToken);
        localStorage.setItem('refreshToken', refreshToken);
        return of(authActions.logInCompleted());
      }),
    );
  });

  logOut = createEffect(() => {
    return this.actions.pipe(
      ofType(authActions.logOut),
      tap(() => {
        localStorage.clear();
      }),
    );
  }, {
    dispatch: false,
  });

  confirmUser = createEffect(() => {
    return this.actions.pipe(
      ofType(authActions.confirmUserInitiated),
      exhaustMap(({ email, password, temporaryPassword }) => {
        return this.authService.confirmUser(email, {
          temporaryPassword,
          password,
        }).pipe(
          map(() => authActions.confirmUserCompleted()),
          catchError(() => {
            return of(progressActions.processFinished(),
              notificationActions.showMessage({
                message: 'Hibás felhasználónév vagy jelszó',
              }),
            );
          }),
        );
      }),
    );
  });
}
