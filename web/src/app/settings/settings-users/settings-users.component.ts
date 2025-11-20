import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { User } from '@household/shared/types/types';
import { SettingsUsersListComponent } from '@household/web/app/settings/settings-users-list/settings-users-list.component';
import { userApiActions } from '@household/web/state/user/user.actions';
import { selectUsers } from '@household/web/state/user/user.selector';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'household-settings-users',
  imports: [
    MatFormFieldModule,
    MatButtonModule,
    SettingsUsersListComponent,
    AsyncPipe,
  ],
  templateUrl: './settings-users.component.html',
  styleUrl: './settings-users.component.scss',
})
export class SettingsUsersComponent implements OnInit {
  constructor(private store: Store) {}

  users: Observable<User.Response[]>;

  ngOnInit(): void {
    this.store.dispatch(userApiActions.listUsersInitiated());

    this.users = this.store.select(selectUsers);
  }

  addUser(email: string) {
    this.store.dispatch(userApiActions.createUserInitiated({
      email,
    }));
  }
}
