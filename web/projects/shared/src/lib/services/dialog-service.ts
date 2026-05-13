import { inject, Injectable } from '@angular/core';
import { ConfirmationDialog } from '../confirmation-dialog/confirmation-dialog';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private dialog = inject(MatDialog);

  openConfirmationDialog(data: {title: string; 
    content?: string}): Observable<boolean> {
    return this.dialog.open(ConfirmationDialog, {
      data,
      disableClose: true,
    }).afterClosed();
  }
}
