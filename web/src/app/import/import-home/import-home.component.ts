import { Component } from '@angular/core';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'household-import-home',
  standalone: false,
  templateUrl: './import-home.component.html',
  styleUrl: './import-home.component.scss',
})
export class ImportHomeComponent {
  constructor(private store: Store) {}

  upload() {
    this.store.dispatch(dialogActions.importFile());
  }
}
