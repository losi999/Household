import { Component, inject, signal } from '@angular/core';
import { FormField, form, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { ClearableInput } from '@household/shared-ui';
import { AccountType } from '@household/shared/enums';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';

export type AccountDialogData = Responses.Account;
export type AccountDialogResult = Requests.Account;

@Component({
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatButtonToggleModule,
    MatIconModule,
    ClearableInput,
    FormField,
  ],
  styleUrl: './account-dialog.scss',
  templateUrl: './account-dialog.html',
})
export class AccountDialog {
  private dialogRef = inject<MatDialogRef<AccountDialog, AccountDialogResult>>(MatDialogRef);
  public account = inject<AccountDialogData>(MAT_DIALOG_DATA);

  accountModel = signal<Requests.Account>({
    name: this.account?.name ?? '',
    currency: this.account?.currency ?? '',
    accountType: this.account?.accountType ?? AccountType.BankAccount,
  });

  accountForm = form(this.accountModel, (schemaPath) => {
    required(schemaPath.name, {
      message: 'Kötelező',
    });
    required(schemaPath.currency, {
      message: 'Kötelező',
    });
  });

  onSave() {
    Object.values(this.accountForm).forEach(field => {
      field().markAsTouched();
    });

    if (this.accountForm().valid()) {
      this.dialogRef.close({
        name: this.accountForm.name().value(),
        currency: this.accountForm.currency().value(),
        accountType: this.accountForm.accountType().value(),
      });
    }
  }
}
