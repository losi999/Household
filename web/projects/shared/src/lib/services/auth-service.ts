import { inject, Injectable } from '@angular/core';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
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

  login(request: Requests.Login) {
    return this.httpClient.post<Responses.Login>(`${this.apiUrl}/user/v1/login`, request);
  }

  refreshToken(request: Requests.RefreshToken) {
    return this.httpClient.post<Responses.RefreshToken>(`${this.apiUrl}/user/v1/refreshToken`, request).pipe(
      tap((data: Responses.RefreshToken) => {
        this.authEventDispatcher.tokensRetrieved({
          idToken: data.idToken,
          refreshToken: request.refreshToken,
        });
      }));
  }
}
