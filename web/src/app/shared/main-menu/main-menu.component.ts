import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { IsEditorDirective } from '@household/web/app/shared/is-editor.directive';
import { IsHairdresserDirective } from '@household/web/app/shared/is-hairdresser.directive';
import { authActions } from '@household/web/state/auth/auth.actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'household-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss'],
  imports: [
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    IsEditorDirective,
    IsHairdresserDirective,
  ],
})
export class MainMenuComponent {

  constructor(private store: Store) { }

  logOut() {
    this.store.dispatch(authActions.logOut());
  }
}
