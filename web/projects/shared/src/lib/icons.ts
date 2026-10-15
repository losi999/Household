import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [MatIconModule],
  selector: 'shared-home-icon',
  template: '<mat-icon>home</mat-icon>',
})
export class HomeIcon {}

@Component({
  imports: [MatIconModule],
  selector: 'shared-settings-icon',
  template: '<mat-icon>settings</mat-icon>',
})
export class SettingsIcon {}

@Component({
  imports: [MatIconModule],
  selector: 'shared-logout-icon',
  template: '<mat-icon>logout</mat-icon>',
})
export class LogoutIcon {}
