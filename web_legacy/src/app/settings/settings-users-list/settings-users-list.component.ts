import { Component, Input } from '@angular/core';
import { User } from '@household/shared/types/types';

@Component({
  selector: 'household-settings-users-list',
  standalone: false,  
  templateUrl: './settings-users-list.component.html',
  styleUrl: './settings-users-list.component.scss',
})
export class SettingsUsersListComponent {
  @Input() users: User.Response[];
}
