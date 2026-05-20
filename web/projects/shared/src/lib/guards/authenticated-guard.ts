import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { AuthStore, navigationEvents } from '@household/shared-ui';
import { injectDispatch } from '@ngrx/signals/events';

export const authenticatedGuard: CanMatchFn = (route) => {
  const authStore = inject(AuthStore);
  if (authStore.isLoggedIn() && authStore.userTypes().includes(route.data?.['requiredUserType'])) {
    return true;
  }

  const navigationEventsDispathcer = injectDispatch(navigationEvents);
  navigationEventsDispathcer.loggedOutHomepage();
  return false;
};
