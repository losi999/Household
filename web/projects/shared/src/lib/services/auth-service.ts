import { inject, Injectable } from '@angular/core';
import { Auth } from '@household/shared/types/types';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { API_URL, authEvents } from '@household/shared-ui';
import { injectDispatch } from '@ngrx/signals/events';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private httpClient = inject(HttpClient);
  private apiUrl = inject(API_URL);
  private authEventDispatcher = injectDispatch(authEvents);

  login(request: Auth.Login.Request) {
    return this.httpClient.post<Auth.Login.Response>(`${this.apiUrl}/user/v1/login`, request);
  }

  refreshToken(refreshToken: string) {
    const request: Auth.RefreshToken.Request = {
      refreshToken,
    };
    return this.httpClient.post<Auth.RefreshToken.Response>(`${this.apiUrl}/user/v1/refreshToken`, request).pipe(
      tap((data: Auth.RefreshToken.Response) => {
        this.authEventDispatcher.tokensRetrieved({
          idToken: data.idToken,
          refreshToken,
        });
      }));
  }
}
