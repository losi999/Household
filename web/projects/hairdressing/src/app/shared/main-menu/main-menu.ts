import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { authEvents } from '@household/shared-ui';
import { injectDispatch } from '@ngrx/signals/events';

@Component({
  selector: 'hairdressing-main-menu',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    RouterModule,
    MatDividerModule,
  ],
  templateUrl: './main-menu.html',
  styleUrl: './main-menu.scss',
})
export class MainMenu {
  private authEvents = injectDispatch(authEvents);

  logOut() {
    this.authEvents.logOut();    
  }
}
