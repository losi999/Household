import { Component, Input, OnChanges } from '@angular/core';
import { TransactionType } from '@household/shared/enums';
import { Account, Transaction } from '@household/shared/types/types';

@Component({
  selector: 'household-transaction-details-loan',
  standalone: false,  
  templateUrl: './transaction-details-loan.component.html',
  styleUrl: './transaction-details-loan.component.scss',
})
export class TransactionDetailsLoanComponent implements OnChanges {
  @Input() transaction: Transaction.DeferredResponse | Transaction.ReimbursementResponse | Transaction.SplitResponse;
  @Input() viewingAccountId: Account.Id;
  @Input() repayment: number;

  loans: {
    [accountId: string]: {
      accountName: string;
      amount: number;
    };
  };
  remainingAmount: number;
  
  ngOnChanges(): void {
    if (this.transaction?.transactionType === TransactionType.Split) {
      this.loans = this.transaction.deferredSplits?.reduce((accumulator, currentValue) => {
        const key = currentValue.ownerAccount.accountId;
        if (!accumulator[key]) {
          accumulator[key] = {
            accountName: currentValue.ownerAccount.fullName,
            amount: 0,
          };
        }

        accumulator[key].amount += currentValue.remainingAmount ?? 0;

        return accumulator;
      }, {});
    }
  }
}
