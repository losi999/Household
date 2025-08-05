import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { notificationActions } from '@household/web/state/notification/notification.actions';
import { concatMap, map, of, tap } from 'rxjs';
import { NotificationService } from '@household/web/services/notification.service';

@Injectable()
export class NotificationEffects {
  constructor(private actions: Actions, private notificationService: NotificationService) {}

  showMessage = createEffect(() => {
    return this.actions.pipe(
      ofType(notificationActions.showMessage),
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
