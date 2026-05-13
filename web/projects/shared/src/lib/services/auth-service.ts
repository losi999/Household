import { inject, Injectable } from '@angular/core';
import { Auth } from '@household/shared/types/types';
import { HttpClient } from '@angular/common/http';
import { UserType } from '@household/shared/enums';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userTypes: UserType[] = [];
  private httpClient = inject(HttpClient);
  private router = inject(Router);

  get idToken(): string {
    return localStorage.getItem('idToken') ?? '';
  }

  get isLoggedIn(): boolean {
    return !!this.idToken;
  }  

  hasUserType(userType: UserType) {
    if (!userType) {
      return true;
    }

    if (this.userTypes.length === 0) {
      this.userTypes = (localStorage.getItem('userTypes')?.split(',') ?? []) as UserType[];
    }
    return this.userTypes.includes(userType);
  }

  login(request: Auth.Login.Request) {
    return this.httpClient.post<Auth.Login.Response>('https://local-householdapi.losi999.hu/user/v1/login', request);
  }

  refreshToken(): Observable<unknown> {
    const request: Auth.RefreshToken.Request = {
      refreshToken: localStorage.getItem('refreshToken') ?? '',
    };
    return this.httpClient.post<Auth.RefreshToken.Response>('https://local-householdapi.losi999.hu/user/v1/refreshToken', request).pipe(map((data) => {
      localStorage.setItem('idToken', data.idToken);
    }));
  }
  
  redirect(): void {
    if (this.isLoggedIn) {
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['/login']);
    }
  }
  
  public logout() {
    localStorage.clear();
    this.redirect();
  }
}
