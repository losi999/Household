import { inject } from '@angular/core';
import { AuthService, notificationEvents } from '@household/shared-ui';
import { signalStoreFeature } from '@ngrx/signals';
import { Events, withEventHandlers } from '@ngrx/signals/events';
import { authEvents } from './auth-events';
import { exhaustMap, map, catchError, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

export const withAuthEvents = () => {
  return signalStoreFeature(
    withEventHandlers(() => {
      const events = inject(Events); 
      const authService = inject(AuthService);

      return {
        login: events.on(authEvents.logInInitiated).pipe(
          exhaustMap(({ payload: { email, password, requiredUserType } }) => {
            return authService.login({
              email,
              password,
              requiredUserType,
            }).pipe(
              map((data) => authEvents.tokensRetrieved(data)),
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
          
                return [notificationEvents.showMessage(errorMessage)];
              }),
            );
          }),
        ),
        storeTokens: events.on(authEvents.tokensRetrieved).pipe(
          exhaustMap(({ payload: { idToken, refreshToken } }) => {
          
            localStorage.setItem('idToken', idToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('userTypes', jwtDecode<{ 'cognito:groups'?: string[] }>(idToken)['cognito:groups']?.join(',') ?? '');
            return [authEvents.logInCompleted()];
          }),
        ),
        logOut: events.on(authEvents.logOut).pipe(
          tap(() => {
            localStorage.clear();
            authService.userTypes = [];
          }),
        ),
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
      };
    }),
  );
};
