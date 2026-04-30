import { inject, Injectable } from '@angular/core';
import { authActions, AuthService, notificationActions } from '@household/shared-ui';
// import { authActions } from '@household/web/state/auth/auth.actions';
// import { notificationActions } from '@household/web/state/notification/notification.actions';
// import { progressActions } from '@household/web/state/progress/progress.actions';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, EMPTY, exhaustMap, map, of, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable()
export class AuthEffects {
  private actions = inject(Actions);
  private authService = inject(AuthService);
  
  logIn = createEffect(() => {
    return this.actions.pipe(
      ofType(authActions.logInInitiated),
      exhaustMap(({ email, password, requiredUserType }) => {
        return this.authService.login({
          email,
          password,
          requiredUserType,
        }).pipe(
          map((data) => authActions.tokensRetrieved(data)),
          catchError((error) => {
            let errorMessage: string;
            switch(error.error?.message) {
              case 'User does not have the required user type': {
                errorMessage = 'Nincs jogosultságod ehhez az oldalhoz!';
                break;
              }
              case 'Incorrect email or password': {
                errorMessage = 'Hibás felhasználónév vagy jelszó';
                break;
              }
              default: {
                errorMessage = 'Hiba történt';
              }
            }

            return of(
              // progressActions.processFinished(),
              notificationActions.showMessage({
                message: errorMessage,
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
        localStorage.setItem('userTypes', jwtDecode<{ 'cognito:groups'?: string[] }>(idToken)['cognito:groups']?.join(',') ?? '');
        return of(authActions.logInCompleted());
      }),
    );
  });

  logOut = createEffect(() => {
    return this.actions.pipe(
      ofType(authActions.logOut),
      tap(() => {
        localStorage.clear();
        this.authService.userTypes = [];
      }),
    );
  }, {
    dispatch: false,
  });

  // confirmUser = createEffect(() => {
  //   return this.actions.pipe(
  //     ofType(authActions.confirmUserInitiated),
  //     exhaustMap(({ email, password, temporaryPassword }) => {
  //       return this.authService.confirmUser(email, {
  //         temporaryPassword,
  //         password,
  //       }).pipe(
  //         map(() => authActions.confirmUserCompleted()),
  //         catchError(() => {
  //           return of(progressActions.processFinished(),
  //             notificationActions.showMessage({
  //               message: 'Hibás felhasználónév vagy jelszó',
  //             }),
  //           );
  //         }),
  //       );
  //     }),
  //   );
  // });
}
