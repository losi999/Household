import { Component } from '@angular/core';
import { MainMenu } from '@household/app/shared/main-menu/main-menu';
import { Toolbar } from '@household/app/shared/toolbar/toolbar';

@Component({
  imports: [Toolbar],
  selector: 'household-dashboard-home',
  styleUrl: './dashboard-home.scss',
  templateUrl: './dashboard-home.html',
})
export class DashboardHome {
  mainMenu = MainMenu;
}
