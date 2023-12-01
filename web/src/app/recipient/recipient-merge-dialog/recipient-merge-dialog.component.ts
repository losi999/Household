import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Recipient } from '@household/shared/types/types';
import { Observable } from 'rxjs';
import { RecipientService } from 'src/app/recipient/recipient.service';
import { Store } from 'src/app/store';

export type RecipientMergeDialogData = Recipient.Id;

@Component({
  selector: 'household-recipient-merge-dialog',
  templateUrl: './recipient-merge-dialog.component.html',
  styleUrls: ['./recipient-merge-dialog.component.scss'],
})
export class RecipientMergeDialogComponent implements OnInit {
  form: FormGroup<{
    sourceRecipients: FormControl<Recipient.Id[]>
  }>;

  constructor(private dialogRef: MatDialogRef<RecipientMergeDialogComponent, void>,
    private recipientService: RecipientService,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public targetRecipientId: RecipientMergeDialogData) { }

  get recipients(): Observable<Recipient.Response[]> {
    return this.store.recipients.asObservable();
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      sourceRecipients: new FormControl(null),
    });
  }

  save() {
    this.recipientService.mergeRecipients(this.targetRecipientId, this.form.value.sourceRecipients);

    this.dialogRef.close();
  }
}
