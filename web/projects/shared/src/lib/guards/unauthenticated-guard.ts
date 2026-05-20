import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthStore, navigationEvents } from '@household/shared-ui';
import { injectDispatch } from '@ngrx/signals/events';

export const unauthenticatedGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  
  if (!authStore.isLoggedIn()) {
    return true;
  }

  const navigationEventsDispathcer = injectDispatch(navigationEvents);
  navigationEventsDispathcer.loggedInHomepage();
  return false;
};
