import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { File } from '@household/shared/types/types';
import { fileApiActions } from '@household/web/state/file/file.actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'household-import-file-upload-form',
  standalone: false,
  templateUrl: './import-file-upload-form.component.html',
  styleUrl: './import-file-upload-form.component.scss',
})
export class ImportFileUploadFormComponent implements OnInit {
  form: FormGroup<{
    fileType: FormControl<File.FileType['fileType']>,
    file: FormControl<any>;
  }>;

  constructor(private dialogRef: MatDialogRef<ImportFileUploadFormComponent, void>, private store: Store) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      fileType: new FormControl(null, [Validators.required]),
      file: new FormControl(null, [Validators.required]),
    });
  }

  fileSelected(event: Event) {
    this.form.patchValue({
      file: (event.target as HTMLInputElement).files[0],
    });
  }

  upload() {
    if (this.form.invalid) {
      return;
    }

    this.store.dispatch(fileApiActions.uploadImportFileInitiated({
      fileType: this.form.value.fileType,
      timezone: 'Europe/Budapest',
      file: this.form.value.file,
    }));

    this.dialogRef.close();
  }

}
