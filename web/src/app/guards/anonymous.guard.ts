import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AnonymousGuard implements CanActivate, CanLoad {
  constructor(private authService: AuthService) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const result = route.data.requireLogin === this.authService.isLoggedIn;
    if (!result) {
      this.authService.redirect();
    }
    return result;
  }
  canLoad(route: Route): boolean {
    const result = route.data.requireLogin === this.authService.isLoggedIn;
    if (!result) {
      this.authService.redirect();
    }
    return result;
  }
}
