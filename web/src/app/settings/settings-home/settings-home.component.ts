import { Component, OnInit } from '@angular/core';
import { SettingsHairdressingComponent } from '@household/web/app/settings/settings-hairdressing/settings-hairdressing.component';
import { SettingsUsersComponent } from '@household/web/app/settings/settings-users/settings-users.component';
import { IsEditorDirective } from '@household/web/app/shared/directives/is-editor.directive';
import { IsHairdresserDirective } from '@household/web/app/shared/directives/is-hairdresser.directive';
import { ToolbarComponent } from '@household/web/app/shared/toolbar/toolbar.component';
import { settingApiActions } from '@household/web/state/setting/setting.actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'household-settings-home',
  imports: [
    ToolbarComponent,
    SettingsHairdressingComponent,
    SettingsUsersComponent,
    IsHairdresserDirective,
    IsEditorDirective,
  ],
  templateUrl: './settings-home.component.html',
  styleUrl: './settings-home.component.scss',
})
export class SettingsHomeComponent implements OnInit {

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(settingApiActions.listSettingsInitiated());
  }
}
