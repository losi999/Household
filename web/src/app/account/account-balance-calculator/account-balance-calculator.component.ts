import { DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Account } from '@household/shared/types/types';
import { ToolbarComponent } from '@household/web/app/shared/toolbar/toolbar.component';
import { accountApiActions } from '@household/web/state/account/account.actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'household-account-balance-calculator',
  imports: [
    ToolbarComponent,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    ReactiveFormsModule,
    DecimalPipe,
    MatFormFieldModule,
    MatInputModule,
  ],
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

  constructor(private activatedRoute: ActivatedRoute, private store: Store) {

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
