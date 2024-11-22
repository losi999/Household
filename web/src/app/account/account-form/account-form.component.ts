import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Account } from '@household/shared/types/types';
import { Store } from '@ngrx/store';
import { accountApiActions } from '@household/web/state/account/account.actions';

export type AccountFormData = Account.Response;

type AccountTypeMap = {
  key: Account.AccountType['accountType'];
  value: string;
};

@Component({
  selector: 'household-account-form',
  templateUrl: './account-form.component.html',
  styleUrls: ['./account-form.component.scss'],
  standalone: false,
})
export class AccountFormComponent implements OnInit {
  form: FormGroup<{
    name: FormControl<string>;
    accountType: FormControl<AccountTypeMap>;
    currency: FormControl<string>;
    owner: FormControl<string>;
  }>;
  accountTypes: {
    [id in Account.AccountType['accountType']]: string
  } = {
      bankAccount: 'Bankszámla',
      cafeteria: 'Cafeteria',
      cash: 'Készpénz',
      creditCard: 'Hitelkártya',
      loan: 'Kölcsön',
    };

  constructor(private dialogRef: MatDialogRef<AccountFormComponent, void>,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public account: AccountFormData) { }

  ngOnInit(): void {
    const accountType: AccountTypeMap = {
      key: this.account?.accountType,
      value: this.accountTypes[this.account?.accountType],
    };

    this.form = new FormGroup({
      name: new FormControl(this.account?.name, [Validators.required]),
      accountType: new FormControl(this.account ? accountType : null, [Validators.required]),
      currency: new FormControl(this.account?.currency, [Validators.required]),
      owner: new FormControl(this.account?.owner),
    });
  }

  save() {
    if (this.form.valid) {
      const request: Account.Request = {
        name: this.form.value.name,
        accountType: this.form.value.accountType.key,
        currency: this.form.value.currency,
        owner: this.form.value.owner,
      };

      if (this.account) {
        this.store.dispatch(accountApiActions.updateAccountInitiated({
          accountId: this.account.accountId,
          ...request,
        }));
      } else {
        this.store.dispatch(accountApiActions.createAccountInitiated(request));
      }

      this.dialogRef.close();
    }
  }

}
