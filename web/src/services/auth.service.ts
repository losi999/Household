import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@household/shared/types/types';
import { Observable } from 'rxjs';
import { environment } from '@household/web/environments/environment';
import { map } from 'rxjs/operators';
import { UserType } from '@household/shared/enums';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userTypes: UserType[];
  constructor(private httpClient: HttpClient, private router: Router) { }

  get idToken(): string {
    return localStorage.getItem('idToken');
  }

  get isLoggedIn(): boolean {
    return !!this.idToken;
  }

  hasUserType(userType: UserType) {
    if (!userType) {
      return true;
    }

    if (!this.userTypes) {
      this.userTypes = (localStorage.getItem('userTypes')?.split(',') ?? []) as UserType[];
    }
    return this.userTypes.includes(userType);
  }

  redirect(): void {
    if (this.isLoggedIn) {
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  login(request: Auth.Login.Request) {
    return this.httpClient.post<Auth.Login.Response>(`${environment.apiUrl}/user/v1/login`, request);
  }

  refreshToken(): Observable<unknown> {
    const request: Auth.RefreshToken.Request = {
      refreshToken: localStorage.getItem('refreshToken'),
    };
    return this.httpClient.post<Auth.RefreshToken.Response>(`${environment.apiUrl}/user/v1/refreshToken`, request).pipe(map((data) => {
      localStorage.setItem('idToken', data.idToken);
    }));
  }

  confirmUser(email: string, request: Auth.ConfirmUser.Request) {
    return this.httpClient.post(`${environment.apiUrl}/user/v1/users/${email}/confirm`, request);
  }

  public logout() {
    localStorage.clear();
    this.redirect();
  }

}
