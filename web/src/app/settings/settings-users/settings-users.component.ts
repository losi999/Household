import { Component, OnInit } from '@angular/core';
import { User } from '@household/shared/types/types';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { userApiActions } from '@household/web/state/user/user.actions';
import { selectUsers } from '@household/web/state/user/user.selector';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'household-settings-users',
  standalone: false,
  templateUrl: './settings-users.component.html',
  styleUrl: './settings-users.component.scss',
})
export class SettingsUsersComponent implements OnInit {
  constructor(private store: Store) {}

  users: Observable<User.Response[]>;
  displayedColumns: string[] = [
    'email',
    'status',
    'actions',
  ];

  ngOnInit(): void {
    this.store.dispatch(userApiActions.listUsersInitiated());

    this.users = this.store.select(selectUsers);
  }

  addUser(email: string) {
    this.store.dispatch(userApiActions.createUserInitiated({
      email,
    }));
  }

  deleteUser({ email }: User.Response) {
    this.store.dispatch(dialogActions.deleteUser({
      email,
    }));
  }
}
