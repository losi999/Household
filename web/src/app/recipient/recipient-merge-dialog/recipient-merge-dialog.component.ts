import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Recipient } from '@household/shared/types/types';

export type RecipientMergeDialogData = Recipient.Response[];
export type RecipientMergeDialogResult = Recipient.Id[];

@Component({
  selector: 'app-recipient-merge-dialog',
  templateUrl: './recipient-merge-dialog.component.html',
  styleUrls: ['./recipient-merge-dialog.component.scss'],
})
export class RecipientMergeDialogComponent implements OnInit {
  form: FormGroup;

  constructor(private dialogRef: MatDialogRef<RecipientMergeDialogComponent, RecipientMergeDialogResult>,
    @Inject(MAT_DIALOG_DATA) public recipients: RecipientMergeDialogData) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      sourceRecipients: new FormControl(null),
    });
  }

  save() {
    this.dialogRef.close(this.form.value.sourceRecipients);
  }
}
