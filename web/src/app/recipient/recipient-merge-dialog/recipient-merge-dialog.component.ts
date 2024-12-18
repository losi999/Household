import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Recipient } from '@household/shared/types/types';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { recipientApiActions } from '@household/web/state/recipient/recipient.actions';
import { selectRecipients } from '@household/web/state/recipient/recipient.selector';

export type RecipientMergeDialogData = Recipient.Id;

@Component({
  selector: 'household-recipient-merge-dialog',
  templateUrl: './recipient-merge-dialog.component.html',
  styleUrls: ['./recipient-merge-dialog.component.scss'],
  standalone: false,
})
export class RecipientMergeDialogComponent implements OnInit {
  form: FormGroup<{
    sourceRecipients: FormControl<Recipient.Id[]>
  }>;

  constructor(private dialogRef: MatDialogRef<RecipientMergeDialogComponent, void>,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public targetRecipientId: RecipientMergeDialogData) { }

  recipients = this.store.select(selectRecipients).pipe(map(recipients => recipients.filter(p => p.recipientId !== this.targetRecipientId)));

  ngOnInit(): void {
    this.form = new FormGroup({
      sourceRecipients: new FormControl(null),
    });
  }

  save() {
    this.store.dispatch(recipientApiActions.mergeRecipientsInitiated({
      sourceRecipientIds: this.form.value.sourceRecipients,
      targetRecipientId: this.targetRecipientId,
    }));

    this.dialogRef.close();
  }
}
