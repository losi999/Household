import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { notificationActions } from '@household/web/state/notification/notification.action';
import { concatMap, map, of, tap } from 'rxjs';
import { NotificationService } from '@household/web/app/shared/notification.service';

@Injectable()
export class NotificationEffects {
  constructor(private actions: Actions, private notificationService: NotificationService) {}

  showError = createEffect(() => {
    return this.actions.pipe(
      ofType(notificationActions.showError),
      concatMap(message => {
        const currentSnackBar = this.notificationService.openedSnackBar;
        if (currentSnackBar) {
          return currentSnackBar.afterDismissed().pipe(map(() => message));
        }
        return of(message);

      }),
      tap(({ message }) => {
        this.notificationService.showNotification(message);
      }),
    );
  }, {
    dispatch: false,
  });

}