import { Component, DestroyRef, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Account } from '@household/shared/types/types';
import { selectAccounts } from '@household/web/state/account/account.selector';
import { transactionApiActions } from '@household/web/state/transaction/transaction.actions';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, withLatestFrom } from 'rxjs';

@Component({
  selector: 'household-transaction-transfer-edit',
  templateUrl: './transaction-transfer-edit.component.html',
  styleUrl: './transaction-transfer-edit.component.scss',
  standalone: false,
})
export class TransactionTransferEditComponent implements OnInit {
  @Input() submit: Observable<void>;

  isDownwardTransfer = true;
  isSameCurrency = true;

  form: FormGroup<{
    issuedAt: FormControl<Date>;
    amount: FormControl<number>;
    accountId: FormControl<Account.Id>;
    description: FormControl<string>;
    transferAccountId: FormControl<Account.Id>;
    transferAmount: FormControl<number>;
  }>;

  constructor(public activatedRoute: ActivatedRoute, private destroyRef: DestroyRef, private store: Store) {
  }

  ngOnInit(): void {
    const accountId = this.activatedRoute.snapshot.paramMap.get('accountId') as Account.Id;

    this.form = new FormGroup({
      issuedAt: new FormControl(new Date(), [Validators.required]),
      amount: new FormControl(null, [Validators.required]),
      accountId: new FormControl(accountId, [Validators.required]),
      description: new FormControl(),
      transferAccountId: new FormControl(null, [Validators.required]),
      transferAmount: new FormControl(null),
    });

    combineLatest([
      this.form.controls.accountId.valueChanges,
      this.form.controls.transferAccountId.valueChanges,
    ]).pipe(withLatestFrom(this.store.select(selectAccounts)))
      .subscribe(([
        [
          accountId,
          transferAccountId,
        ],
        accounts,
      ]) => {
        const account = accounts.find(a => a.accountId === accountId);
        const transferAccount = accounts.find(a => a.accountId === transferAccountId);

        this.isSameCurrency = !account || !transferAccount || account.currency === transferAccount.currency;
        this.form.controls.transferAmount.reset();

        if (!this.isSameCurrency) {
          this.form.controls.transferAmount.setValidators(Validators.required);
        } else {
          this.form.controls.transferAmount.removeValidators(Validators.required);
        }
      });

    this.submit?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.form.markAllAsTouched();

      if (this.form.valid) {
        this.store.dispatch(transactionApiActions.createTransferTransactionInitiated({
          accountId: this.form.value.accountId,
          amount: this.form.value.amount,
          description: this.form.value.description ?? undefined,
          issuedAt: this.form.value.issuedAt.toISOString(),
          transferAccountId: this.form.value.transferAccountId,
          payments: undefined,
          transferAmount: this.form.value.transferAmount ?? undefined,
        }));
      }
    });

  }

  inverseTransaction() {
    this.isDownwardTransfer = !this.isDownwardTransfer;
  }

}
