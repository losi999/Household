import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Account } from '@household/shared/types/types';
import { accountApiActions } from '@household/web/state/account/account.actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'household-account-balance-calculator',
  standalone: false,
  templateUrl: './account-balance-calculator.component.html',
  styleUrl: './account-balance-calculator.component.scss',
})
export class AccountBalanceCalculatorComponent implements OnInit {
  quantities = [
    20000,
    10000,
    5000,
    2000,
    1000,
    500,
    200,
    100,
    50,
    20,
    10,
    5,
  ];

  form: FormGroup<{
    [q: number]: FormControl<number>
  }>;
  newBalance = 0;
  accountId: Account.Id;

  constructor(private activatedRoute: ActivatedRoute, private store: Store, private router: Router) {

  }

  ngOnInit(): void {
    this.accountId = this.activatedRoute.snapshot.paramMap.get('accountId') as Account.Id;
    this.store.dispatch(accountApiActions.getAccountInitiated({
      accountId: this.accountId,
    }));

    this.form = new FormGroup(this.quantities.reduce((accumulator, currentValue) => {
      return {
        ...accumulator,
        [currentValue]: new FormControl(null),
      };
    }, {}));

    this.form.valueChanges.subscribe((value) => {
      this.newBalance = Object.entries(value).reduce((accumulator, [
        amount,
        count,
      ]) => {
        return accumulator + Number(amount) * count;
      }, 0);
    });
  }
}
