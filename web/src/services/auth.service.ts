import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@household/shared/types/types';
import { Observable } from 'rxjs';
import { environment } from '@household/web/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(private httpClient: HttpClient, private router: Router) { }

  get idToken(): string {
    return localStorage.getItem('idToken');
  }

  get isLoggedIn(): boolean {
    return !!this.idToken;
  }

  redirect(): void {
    if (this.isLoggedIn) {
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  public login(request: Auth.Login.Request): Observable<unknown> {
    return this.httpClient.post<Auth.Login.Response>(`${environment.apiUrl}${environment.authStage}v1/login`, request).pipe(
      map((data) => {
        localStorage.setItem('idToken', data.idToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        this.redirect();
      }),
    );
  }

  public refreshToken(): Observable<unknown> {
    const request: Auth.RefreshToken.Request = {
      refreshToken: localStorage.getItem('refreshToken'),
    };
    return this.httpClient.post<Auth.RefreshToken.Response>(`${environment.apiUrl}${environment.authStage}v1/refreshToken`, request).pipe(map((data) => {
      localStorage.setItem('idToken', data.idToken);
    }));
  }

  public logout() {
    localStorage.clear();
    this.redirect();
  }

}
