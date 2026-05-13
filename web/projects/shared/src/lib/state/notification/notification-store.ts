
import { inject } from '@angular/core';
import { NotificationService } from '@household/shared-ui';
import { signalStore } from '@ngrx/signals';
import { Events, withEventHandlers } from '@ngrx/signals/events';
import { notificationEvents } from './notification-events';
import { concatMap, map, of, tap } from 'rxjs';

export const NotificationStore = signalStore({
  providedIn: 'root',
},
withEventHandlers(() => {
  const events = inject(Events); 
  const notificationService = inject(NotificationService);

  return {
    showMessage: events.on(notificationEvents.showMessage).pipe(
      concatMap((event) => {
        const currentSnackBar = notificationService.openedSnackBar;
        if (currentSnackBar) {
          return currentSnackBar.afterDismissed().pipe(map(() => event.payload));
        }
        return of(event.payload);
      }),
      tap<string>((message) => {
        notificationService.showNotification(message);
      }),
    ),
  };
}),
);
