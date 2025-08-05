import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '@household/shared/types/types';
import { environment } from '@household/web/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  constructor(private httpClient: HttpClient) { }

  listUsers(): Observable<User.Response[]> {
    return this.httpClient.get<User.Response[]>(`${environment.apiUrl}/user/v1/users`);
  }

  createUser(body: User.Request) {
    return this.httpClient.post(`${environment.apiUrl}/user/v1/users`, body);
  }

  deleteUser({ email }: User.Request) {
    return this.httpClient.delete(`${environment.apiUrl}/user/v1/users/${email}`);
  }

  addUserToGroup({ email, group }: User.Email & User.Group) {
    return this.httpClient.post(`${environment.apiUrl}/user/v1/users/${email}/groups/${group}`, undefined);
  }

  removeUserFromGroup({ email, group }: User.Email & User.Group) {
    return this.httpClient.delete(`${environment.apiUrl}/user/v1/users/${email}/groups/${group}`);
  }
}
