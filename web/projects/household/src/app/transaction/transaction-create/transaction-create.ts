import { Component, effect, inject, signal } from '@angular/core';
import { Toolbar } from '@household/app/shared/toolbar/toolbar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { form, required, FormField } from '@angular/forms/signals';
import { JsonPipe } from '@angular/common';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatButtonModule } from '@angular/material/button';
import { Responses } from '@household/shared/types/responses';
import { AccountStore } from '@household/state/account/account-store';
import { ActivatedRoute } from '@angular/router';
import { Api } from '@household/shared/types/api';
import { IconText, AmountInput } from '@household/shared-ui';
import { AccountTypeIconPipe } from '@household/app/account/account-type-icon-pipe';
import { MatIconModule } from '@angular/material/icon';
import { injectDispatch } from '@ngrx/signals/events';
import { accountEvents } from '@household/state/account/account-events';
import { entries } from '@household/shared/common/utils';
import { MatMenuModule } from '@angular/material/menu';
import { AccountType } from '@household/shared/enums';

type AccountsModel = {
  account: Responses.Account;
  transferAccount: Responses.Account;
  loanAccount: Responses.Account;
};

@Component({
  imports: [
    Toolbar,
    MatStepperModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatTimepickerModule,
    MatInputModule,
    FormField,
    JsonPipe,
    MatButtonModule,
    IconText,
    AccountTypeIconPipe,
    MatIconModule,
    MatMenuModule,
    AmountInput,
  ],
  selector: 'household-transaction-create',
  styleUrl: './transaction-create.scss',
  templateUrl: './transaction-create.html',
})
export class TransactionCreate {
  private readonly accountStore = inject(AccountStore);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly accountEvents = injectDispatch(accountEvents);
  
  private readonly accountId = this.activatedRoute.snapshot.paramMap.get('accountId') as Api.Account.Id;
  private accountSelectionType: keyof AccountsModel;

  issuedAtModel = signal<{
    date: Date;
    time: Date;
  }>({
    date: new Date(),
    time: new Date(),
  });

  issuedAtForm = form(this.issuedAtModel, (schemaPath) => {
    required(schemaPath.date, {
      message: 'Kötelező',
    });
    required(schemaPath.time, {
      message: 'Kötelező',
    });
  });

  accountsModel = signal<AccountsModel>({
    account: null,
    loanAccount: null,
    transferAccount: null,
  });

  accountsForm = form(this.accountsModel, (schemaPath) => {
    required(schemaPath.account, {
      message: 'Kötelező',
    });
  });

  amountModel = signal<{
    amount: number;
    transferAmount: number;}>({
    amount: 0,
    transferAmount: 0,
  });

  amountForm = form(this.amountModel, (schemaPath) => {
    required(schemaPath.amount, {
      message: 'Kötelező',
    });
  });

  constructor() {
    effect(() => {
      const account = this.accountStore.accountList().find(a => a.accountId === this.accountId);

      this.accountsModel.update((prev) => {
        return {
          ...prev,
          account,
          transferAccount: this.accountStore.accountList().find(a => a.accountId === '66616ad66061da10f6474220'),
        };
      });
    });

    effect(() => {
      const selectedAccount = this.accountStore.pendingAccount();

      if (selectedAccount) {
        this.accountsModel.update((prev) => {
          return {
            ...prev,
            [this.accountSelectionType]: selectedAccount,
          };
        });
      }
    });
  }

  onSelectAccount(type: keyof AccountsModel) {
    this.accountSelectionType = type;
    
    switch(type) {
      case 'loanAccount': {
        const isPayingAccountLoan = this.accountsForm().value().account.accountType === AccountType.Loan;

        this.accountEvents.selectAccount(this.accountStore.accountList().filter(a => {
          
          return ((a.accountType === AccountType.Loan) !== isPayingAccountLoan) && a.currency === this.accountsForm().value().account.currency;
        }));
      } break;
      case 'transferAccount': {
        this.accountEvents.selectAccount(this.accountStore.accountList().filter(a => {
          return a.accountId !== this.accountsForm().value().account.accountId;
        }));
      } break;
      case 'account': {
        const loanAccount = this.accountsForm().value().loanAccount;
        const isLoanAccountLoanType = loanAccount?.accountType === AccountType.Loan;

        this.accountEvents.selectAccount(this.accountStore.accountList().filter(a => {
          if (!loanAccount) {
            return a.accountId !== this.accountsForm().value().transferAccount?.accountId;
          }

          return ((a.accountType === AccountType.Loan) !== isLoanAccountLoanType && a.currency === loanAccount.currency);          
        }));
      } break;
    }
  }

  onRemoveAccount(type: keyof AccountsModel) {
    this.accountsModel.update((prev) => {
      return {
        ...prev,
        [type]: null,
      };
    });
  }

  onSwitchAccounts() {
    this.accountsModel.update((prev) => {
      if (prev.loanAccount) {
        return {
          account: prev.loanAccount,
          loanAccount: prev.account,
          transferAccount: undefined,
        };
      }
      if (prev.transferAccount) {
        return {
          account: prev.transferAccount,
          transferAccount: prev.account,
          loanAccount: undefined,
        };
      }

      return prev;
    });
  }
}
