import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  imports: [
    MatButtonModule,
    MatDialogModule,
  ],
  templateUrl: './confirmation-dialog.html',
  styleUrls: ['./confirmation-dialog.scss'],
})
export class ConfirmationDialog {
  public data = inject<{
    title: string;
    content: string;
  }>(MAT_DIALOG_DATA);
}
