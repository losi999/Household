import { CanActivateFn } from '@angular/router';
import { AuthService, navigationActions } from '@household/shared-ui';
import { inject } from '@angular/core/primitives/di';
import { Store } from '@ngrx/store';

export const unauthenticatedGuard: CanActivateFn = () => {
  const authService = inject(AuthService);

  if (!authService.isLoggedIn) {
    return true;
  }
  const store = inject(Store);
  store.dispatch(navigationActions.loggedInHomepage());
  return false;
};
