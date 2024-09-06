import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn } from '@angular/router';
import { AuthService } from '@household/web/services/auth.service';

export const canActivate: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const result = route.data.requireLogin === authService.isLoggedIn;
  if (!result) {
    authService.redirect();
  }
  return result;
};

export const canMatch: CanMatchFn = (route) => {
  const authService = inject(AuthService);
  const result = route.data.requireLogin === authService.isLoggedIn;
  if (!result) {
    authService.redirect();
  }
  return result;
};
