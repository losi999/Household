import { patchState, signalStore, withComputed, withHooks, withState } from '@ngrx/signals';
import { withAuthEvents } from './with-auth-events';
import { UserType } from '@aws-sdk/client-cognito-identity-provider';
import { withAuthReducer } from './with-auth-reducer';
import { computed, inject } from '@angular/core';
import { AuthService, authEvents, notificationEvents, authApiEvents } from '@household/shared-ui';
import { withEventHandlers, Events } from '@ngrx/signals/events';
import { jwtDecode } from 'jwt-decode';
import { exhaustMap, map, catchError, tap } from 'rxjs';

export type AuthState = {
  idToken: string;
  refreshToken: string;
  userTypes: UserType[]
};

export const AuthStore = signalStore({
  providedIn: 'root',
},
withState<AuthState>({
  idToken: undefined,
  refreshToken: undefined,
  userTypes: [],
}),
withHooks({
  onInit(store) {
    patchState(store, {
      idToken: localStorage.getItem('idToken'),
      refreshToken: localStorage.getItem('refreshToken'),
      userTypes: (localStorage.getItem('userTypes')?.split(',') ?? []) as UserType[],
    });
  },
}),
withAuthEvents(),
// withEventHandlers((store) => {
//   const events = inject(Events); 
//   const authService = inject(AuthService);

//   return {
//     login: events.on(authEvents.logInInitiated).pipe(
//       exhaustMap(({ payload: { email, password, requiredUserType } }) => {
//         return authService.login({
//           email,
//           password,
//           requiredUserType,
//         }).pipe(
//           map((data) => authEvents.tokensRetrieved(data)),
//           catchError((error) => {
//             let errorMessage: string;
//             switch(error.error?.message) {
//               case 'User does not have the required user type': {
//                 errorMessage = 'Nincs jogosultságod ehhez az oldalhoz!';
//                 break;
//               }
//               case 'Incorrect email or password': {
//                 errorMessage = 'Hibás felhasználónév vagy jelszó';
//                 break;
//               }
//               default: {
//                 errorMessage = 'Hiba történt';
//               }
//             }
          
//             return [notificationEvents.showMessage(errorMessage)];
//           }),
//         );
//       }),
//     ),
//     storeTokens: events.on(authEvents.tokensRetrieved).pipe(
//       exhaustMap(({ payload: { idToken, refreshToken } }) => {
          
//         localStorage.setItem('idToken', idToken);
//         localStorage.setItem('refreshToken', refreshToken);
//         localStorage.setItem('userTypes', jwtDecode<{ 'cognito:groups'?: string[] }>(idToken)['cognito:groups']?.join(',') ?? '');
//         return [authEvents.logInCompleted()];
//       }),
//     ),
//     logOut: events.on(authEvents.logOut).pipe(
//       tap(() => {
//         console.log('log out');
//         localStorage.clear();
//       }),
//     ),
//     refreshToken: events.on(authApiEvents.refreshTokenInitiated).pipe(
//       exhaustMap(() => {
//         return authService.refreshToken(store.refreshToken());
//       }),
//     ),
//     // confirmUser = createEffect(() => {
//     //   return this.actions.pipe(
//     //     ofType(authActions.confirmUserInitiated),
//     //     exhaustMap(({ email, password, temporaryPassword }) => {
//     //       return this.authService.confirmUser(email, {
//     //         temporaryPassword,
//     //         password,
//     //       }).pipe(
//     //         map(() => authActions.confirmUserCompleted()),
//     //         catchError(() => {
//     //           return of(progressActions.processFinished(),
//     //             notificationActions.showMessage({
//     //               message: 'Hibás felhasználónév vagy jelszó',
//     //             }),
//     //           );
//     //         }),
//     //       );
//     //     }),
//     //   );
//     // });
//   };
// }),
withAuthReducer(),
withComputed((store) => {
  return {
    isLoggedIn: computed(() => {
      return !!store.idToken();
    }),
  };
}),
);
