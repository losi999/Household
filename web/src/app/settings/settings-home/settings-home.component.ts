import { Component, OnInit } from '@angular/core';
import { settingApiActions } from '@household/web/state/setting/setting.actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'household-settings-home',
  standalone: false,
  templateUrl: './settings-home.component.html',
  styleUrl: './settings-home.component.scss',
})
export class SettingsHomeComponent implements OnInit {

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(settingApiActions.listSettingsInitiated());
  }
}
