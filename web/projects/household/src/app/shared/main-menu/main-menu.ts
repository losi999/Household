import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { authEvents } from '@household/shared-ui';
import { injectDispatch } from '@ngrx/signals/events';
import { IsEditor } from '@household/app/shared/directives/is-editor';

@Component({
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    RouterModule,
    MatDividerModule,
    IsEditor,
  ],
  selector: 'household-main-menu',
  styleUrl: './main-menu.scss',
  templateUrl: './main-menu.html',
})
export class MainMenu {
  private authEvents = injectDispatch(authEvents);

  logOut() {
    this.authEvents.logOut();    
  }
}
