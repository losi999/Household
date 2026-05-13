import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  get openedSnackBar() {
    return this.snackBar._openedSnackBarRef;
  }

  showNotification(message: string) {
    this.snackBar.open(message, 'Ok', {
      duration: 5000,
      verticalPosition: 'top',
    });
  }
}
