import { Component, OnInit } from '@angular/core';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { fileApiActions } from '@household/web/state/file/file.actions';
import { selectFiles } from '@household/web/state/file/file.selector';
import { Store } from '@ngrx/store';

@Component({
  selector: 'household-import-home',
  standalone: false,
  templateUrl: './import-home.component.html',
  styleUrl: './import-home.component.scss',
})
export class ImportHomeComponent implements OnInit {
  files = this.store.select(selectFiles);

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(fileApiActions.listFilesInitiated());
  }

  upload() {
    this.store.dispatch(dialogActions.importFile());
  }
}
