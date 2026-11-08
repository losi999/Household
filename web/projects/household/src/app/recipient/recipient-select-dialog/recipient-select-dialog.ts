import { Component, computed, inject, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { ClearableInput } from '@household/shared-ui';
import { search } from '@household/shared/common/utils';
import { Responses } from '@household/shared/types/responses';
import { Searchable } from '@household/shared/types/common';
import { RecipientStore } from '@household/state/recipient/recipient-store';

export type RecipientSelectDialogData = Searchable<Responses.Recipient>[];
export type RecipientSelectDialogResult = Responses.Recipient;

@Component({
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatListModule,
    ClearableInput,
  ],
  styleUrl: './recipient-select-dialog.scss',
  templateUrl: './recipient-select-dialog.html',
})
export class RecipientSelectDialog {
  private dialogRef = inject<MatDialogRef<RecipientSelectDialog, RecipientSelectDialogResult>>(MatDialogRef);
  public data = inject<RecipientSelectDialogData>(MAT_DIALOG_DATA);
  private recipientStore = inject(RecipientStore);

  searchValue = model<string>('');

  selectableRecipients = computed(() => {
    const recipientList = this.data ?? this.recipientStore.recipientList();

    if (!this.searchValue()) {
      return recipientList;
    }

    return recipientList.filter((recipient) => {
      return search(recipient, this.searchValue());
    });
  });

  onSelect(recipient: Responses.Recipient) {
    this.dialogRef.close(recipient);
  }
}
