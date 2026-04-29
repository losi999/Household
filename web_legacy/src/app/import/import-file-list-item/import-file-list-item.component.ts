import { Component, Input, OnInit } from '@angular/core';
import { File } from '@household/shared/types/types';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { selectFileIsInProgress } from '@household/web/state/progress/progress.selector';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'household-import-file-list-item',
  standalone: false,
  templateUrl: './import-file-list-item.component.html',
  styleUrl: './import-file-list-item.component.scss',
})
export class ImportFileListItemComponent implements OnInit {
  @Input() file: File.Response;

  isDisabled: Observable<boolean>;

  constructor(private store: Store) {

  }

  ngOnInit(): void {
    this.isDisabled = this.store.select(selectFileIsInProgress(this.file.fileId));
  }

  delete(e: Event) {
    e.preventDefault();
    e.stopImmediatePropagation();
    this.store.dispatch(dialogActions.deleteFile(this.file));
  }
}
