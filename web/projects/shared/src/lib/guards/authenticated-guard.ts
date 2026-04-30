import { inject } from '@angular/core/primitives/di';
import { CanMatchFn } from '@angular/router';
import { AuthService, navigationActions } from '@household/shared-ui';
import { Store } from '@ngrx/store';

export const authenticatedGuard: CanMatchFn = (route) => {
  const authService = inject(AuthService);
  if (authService.isLoggedIn && authService.hasUserType(route.data?.['requiredUserType'])) {
    return true;
  }

  const store = inject(Store);
  store.dispatch(navigationActions.loggedOutHomepage());
  return false;
};
