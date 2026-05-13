import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService, navigationEvents } from '@household/shared-ui';
import { injectDispatch } from '@ngrx/signals/events';

export const unauthenticatedGuard: CanActivateFn = () => {
  const authService = inject(AuthService);

  if (!authService.isLoggedIn) {
    return true;
  }
  const navigationEventsDispathcer = injectDispatch(navigationEvents);
  navigationEventsDispathcer.loggedInHomepage();
  return false;
};
