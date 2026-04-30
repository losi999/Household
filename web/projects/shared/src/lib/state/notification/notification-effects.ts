import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatMap, map, of, tap } from 'rxjs';
import { NotificationService, notificationActions } from '@household/shared-ui';

@Injectable()
export class NotificationEffects {
  private actions = inject(Actions);
  private notificationService = inject(NotificationService);

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
