import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, mergeMap, of } from 'rxjs';
import { userApiActions } from '@household/web/state/user/user.actions';
import { UserService } from '@household/web/services/user.service';
import { progressActions } from '@household/web/state/progress/progress.actions';
import { notificationActions } from '@household/web/state/notification/notification.actions';

@Injectable()
export class UserEffects {
  constructor(private actions: Actions, private userService: UserService) {}

  loadUsers = createEffect(() => {
    return this.actions.pipe(
      ofType(userApiActions.listUsersInitiated),
      exhaustMap(() => {
        return this.userService.listUsers().pipe(
          map((users) => userApiActions.listUsersCompleted({
            users,
          })),
          catchError(() => {
            return of(progressActions.processFinished(),
              notificationActions.showMessage({
                message: 'Hiba történt',
              }),
            );
          }),
        );
      }),
    );
  });

  createUser = createEffect(() => {
    return this.actions.pipe(
      ofType(userApiActions.createUserInitiated),
      mergeMap(({ type, ...request }) => {
        return this.userService.createUser(request).pipe(
          map(() => userApiActions.createUserCompleted(request)),
          catchError((error) => {
            let errorMessage: string;
            switch(error.error?.message) {
              case 'An account with the given email already exists.': {
                errorMessage = 'E-mail cím foglalt!';
              } break;
              default: {
                errorMessage = 'Hiba történt';
              }
            }
            return of(progressActions.processFinished(),
              notificationActions.showMessage({
                message: errorMessage,
              }),
            );
          }),
        );
      }),
    );
  });

  deleteUser = createEffect(() => {
    return this.actions.pipe(
      ofType(userApiActions.deleteUserInitiated),
      mergeMap(({ type, ...request }) => {
        return this.userService.deleteUser(request).pipe(
          map(() => userApiActions.deleteUserCompleted(request)),
          catchError((error) => {
            let errorMessage: string;
            switch(error.error?.message) {
              default: {
                errorMessage = 'Hiba történt';
              }
            }
            return of(progressActions.processFinished(),
              notificationActions.showMessage({
                message: errorMessage,
              }),
            );
          }),
        );
      }),
    );
  });

  addUserToGroup = createEffect(() => {
    return this.actions.pipe(
      ofType(userApiActions.addUserToGroupInitiated),
      mergeMap(({ email, group }) => {
        return this.userService.addUserToGroup({
          email,
          group,
        }).pipe(
          map(() => userApiActions.addUserToGroupCompleted({
            email,
            group,
          })),
          catchError((error) => {
            let errorMessage: string;
            switch(error.error?.message) {
              default: {
                errorMessage = 'Hiba történt';
              }
            }
            return of(progressActions.processFinished(),
              notificationActions.showMessage({
                message: errorMessage,
              }),
            );
          }),
        );
      }),
    );
  });

  removeUserFromGroup = createEffect(() => {
    return this.actions.pipe(
      ofType(userApiActions.removeUserFromGroupInitiated),
      mergeMap(({ email, group }) => {
        return this.userService.removeUserFromGroup({
          email,
          group,
        }).pipe(
          map(() => userApiActions.removeUserFromGroupCompleted({
            email,
            group,
          })),
          catchError((error) => {
            let errorMessage: string;
            switch(error.error?.message) {
              default: {
                errorMessage = 'Hiba történt';
              }
            }
            return of(progressActions.processFinished(),
              notificationActions.showMessage({
                message: errorMessage,
              }),
            );
          }),
        );
      }),
    );
  });
}

