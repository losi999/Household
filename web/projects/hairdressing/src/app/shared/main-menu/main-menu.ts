import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { Store } from '@ngrx/store';
import { authActions } from '@household/shared-ui';

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
  private store = inject(Store);

  logOut() {
    this.store.dispatch(authActions.logOut());    
  }
}
