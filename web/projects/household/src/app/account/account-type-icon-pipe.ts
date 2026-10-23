import { Pipe, PipeTransform } from '@angular/core';
import { AccountType } from '@household/shared/enums';
import { Responses } from '@household/shared/types/responses';

@Pipe({
  name: 'accountTypeIcon',
})
export class AccountTypeIconPipe implements PipeTransform {
  transform(account: Responses.AccountLean): string {
    switch (account.accountType) {
      case AccountType.BankAccount:
        return 'account_balance';
      case AccountType.Cash:
        return 'payments';
      case AccountType.CreditCard:
        return 'credit_card';
      case AccountType.Loan:
        return 'request_quote';
      case AccountType.Cafeteria:
        return 'restaurant';
    }
  }
}
