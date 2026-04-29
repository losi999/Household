import { Component, Input, OnInit } from '@angular/core';
import { UserType } from '@household/shared/enums';
import { User } from '@household/shared/types/types';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { selectUserGroupIsInProgress } from '@household/web/state/progress/progress.selector';
import { userApiActions } from '@household/web/state/user/user.actions';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'household-settings-users-list-item',
  standalone: false,  
  templateUrl: './settings-users-list-item.component.html',
  styleUrl: './settings-users-list-item.component.scss',
})
export class SettingsUsersListItemComponent implements OnInit {
  @Input() user: User.Response;
  groupMap: {[userType in UserType]: {
    label: string;
    isDisabled: Observable<boolean>
  }};
  
  constructor(private store: Store) {}

  ngOnInit(): void {
    this.groupMap = {
      editor: {
        label: 'Szerkesztő',
        isDisabled: this.store.select(selectUserGroupIsInProgress({
          email: this.user.email,
          group: UserType.Editor,
        })),
      },
      hairdresser: {
        label: 'Fodrász',
        isDisabled: this.store.select(selectUserGroupIsInProgress({
          email: this.user.email,
          group: UserType.Hairdresser,
        })),
      },
    };
  }

  toggleGroup(userType: UserType, checked: boolean) {
    if (checked) {
      this.store.dispatch(userApiActions.addUserToGroupInitiated({
        email: this.user.email,
        group: userType,
      }));
    } else {
      this.store.dispatch(userApiActions.removeUserFromGroupInitiated({
        email: this.user.email,
        group: userType,
      }));
    }
  }

  deleteUser() {
    this.store.dispatch(dialogActions.deleteUser({
      email: this.user.email,
    }));
  }
}
