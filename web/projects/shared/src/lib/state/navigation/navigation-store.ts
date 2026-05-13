import { inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { signalStore } from '@ngrx/signals';
import { Events, withEventHandlers } from '@ngrx/signals/events';
import { navigationEvents } from './navigation-events';
import { tap } from 'rxjs';
import { authEvents } from '@household/shared-ui';

export const NavigationStore = signalStore({
  providedIn: 'root',
},
withEventHandlers(() => {
  const events = inject(Events);
  const router = inject(Router);
  const activatedRoute = inject(ActivatedRoute);

  return {
    changeCalendarWeek: events.on(navigationEvents.changeCalendarWeek).pipe(
      tap(({ payload }) => {
        router.navigate([], {
          relativeTo: activatedRoute,
          queryParams: payload,
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }),
    ),
    navigateToLoggedInHomepage: events.on(authEvents.logInCompleted, navigationEvents.loggedInHomepage).pipe(
      tap(() => {
        router.navigate(['/'], {
          replaceUrl: true,
        });
      }),
    ),
    loggedOut: events.on(authEvents.logOut, navigationEvents.loggedOutHomepage).pipe(
      tap(() => {
        router.navigate([
          '/',
          'login',
        ], {
          replaceUrl: true,
        });
      }),
    ),
  };
}),
);
