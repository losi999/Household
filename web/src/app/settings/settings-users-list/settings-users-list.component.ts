import { Component, Input } from '@angular/core';
import { User } from '@household/shared/types/types';
import { SettingsUsersListItemComponent } from '@household/web/app/settings/settings-users-list-item/settings-users-list-item.component';

@Component({
  selector: 'household-settings-users-list',
  imports: [SettingsUsersListItemComponent],  
  templateUrl: './settings-users-list.component.html',
  styleUrl: './settings-users-list.component.scss',
})
export class SettingsUsersListComponent {
  @Input() users: User.Response[];
}
