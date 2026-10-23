import { Component, computed, inject, signal } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Api } from '@household/shared/types/api';
import { Responses } from '@household/shared/types/responses';
import { RecipientStore } from '@household/state/recipient/recipient-store';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

export type RecipientMergeDialogData = Responses.Recipient;
export type RecipientMergeDialogResult = {
  targetRecipientId: Api.Recipient.Id;
  sourceRecipientIds: Api.Recipient.Id[];
};

@Component({
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatChipsModule,
    MatListModule,
    MatIconModule,
  ],
  styleUrl: './recipient-merge-dialog.scss',
  templateUrl: './recipient-merge-dialog.html',
})
export class RecipientMergeDialog {
  private dialogRef = inject<MatDialogRef<RecipientMergeDialog, RecipientMergeDialogResult>>(MatDialogRef);
  public recipient = inject<RecipientMergeDialogData>(MAT_DIALOG_DATA);
  private recipientStore = inject(RecipientStore);

  selectedRecipients = signal<Responses.Recipient[]>([]);
  selectedRecipientIds = computed(() => {
    return this.selectedRecipients().map(p => p.recipientId);
  });

  recipients = computed(() => {
    return this.recipientStore.recipientList().filter(p => p.recipientId !== this.recipient.recipientId && !this.selectedRecipientIds().includes(p.recipientId));
  });

  onAddRecipient(recipient: Responses.Recipient) {
    this.selectedRecipients.update((previous) => {
      return [
        ...previous,
        recipient,
      ];
    });
  }

  onRemoveRecipient(recipient: Responses.Recipient) {
    this.selectedRecipients.update((previous) => {
      return previous.filter(p => p.recipientId !== recipient.recipientId);
    });
  }

  onSave() { 
    if (this.selectedRecipientIds().length > 0) {
      this.dialogRef.close({
        sourceRecipientIds: this.selectedRecipientIds(),
        targetRecipientId: this.recipient.recipientId,
      });
    }
  }
}
