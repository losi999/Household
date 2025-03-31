import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { FileService } from '@household/web/services/file.service';
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
    fileType: FormControl<string>,
  }>;

  constructor(private dialogRef: MatDialogRef<ImportFileUploadFormComponent, void>, private store: Store, private fileService: FileService, private httpClient: HttpClient) {}
  file;
  ngOnInit(): void {
    this.form = new FormGroup({
      fileType: new FormControl(null, [Validators.required]),
    });
  }

  fileSelected(event: Event) {
    console.log(event);
    this.file = (event.target as HTMLInputElement).files[0];
    // this.form.patchValue({
    //   file,
    // });
  }

  upload() {
    console.log('UPLOAD', this.form.value);
    this.fileService.createFileUploadUrl().subscribe(({ fileId, url }) => {
      console.log(url);
      this.httpClient.put(url, this.file).subscribe((resp) => {
        console.log('response', resp);
      });
    });
    // this.store.dispatch(fileApiActions.createFileUploadURLInitiated(undefined));
  }

}
