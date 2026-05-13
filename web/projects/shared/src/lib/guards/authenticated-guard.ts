import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { AuthService, navigationEvents } from '@household/shared-ui';
import { injectDispatch } from '@ngrx/signals/events';

export const authenticatedGuard: CanMatchFn = (route) => {
  const authService = inject(AuthService);
  if (authService.isLoggedIn && authService.hasUserType(route.data?.['requiredUserType'])) {
    return true;
  }

  const navigationEventsDispathcer = injectDispatch(navigationEvents);
  navigationEventsDispathcer.loggedOutHomepage();
  return false;
};
