import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn } from '@angular/router';
import { AuthService } from '@household/web/services/auth.service';
import { navigationActions } from '@household/web/state/navigation/navigation.actions';
import { Store } from '@ngrx/store';

export const unauthenticated: CanActivateFn = () => {
  const authService = inject(AuthService);
  if (!authService.isLoggedIn) {
    return true;
  }

  const store = inject(Store);
  store.dispatch(navigationActions.loggedInHomepage());
  return false;
};

export const authenticated: CanMatchFn = () => {
  const authService = inject(AuthService);
  if (authService.isLoggedIn) {
    return true;
  }

  const store = inject(Store);
  store.dispatch(navigationActions.loggedOutHomepage());
  return false;
};
