import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ImportFileListComponent } from '@household/web/app/import/import-file-list/import-file-list.component';
import { ToolbarComponent } from '@household/web/app/shared/toolbar/toolbar.component';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { fileApiActions } from '@household/web/state/file/file.actions';
import { selectFiles } from '@household/web/state/file/file.selector';
import { Store } from '@ngrx/store';

@Component({
  selector: 'household-import-home',
  imports: [
    ToolbarComponent,
    MatButtonModule,
    MatIconModule,
    ImportFileListComponent,
    AsyncPipe,
  ],
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
