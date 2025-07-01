import { Component, Input, OnInit } from '@angular/core';
import { TransactionType } from '@household/shared/enums';
import { Account, Transaction } from '@household/shared/types/types';

@Component({
  selector: 'household-transaction-details-loan',
  standalone: false,  
  templateUrl: './transaction-details-loan.component.html',
  styleUrl: './transaction-details-loan.component.scss',
})
export class TransactionDetailsLoanComponent implements OnInit {
  @Input() transaction: Transaction.DeferredResponse | Transaction.ReimbursementResponse | Transaction.SplitResponse;
  @Input() viewingAccountId: Account.Id;

  remainingAmount: number;
  ownerAccounts: string[];
  
  ngOnInit(): void {
    switch (this.transaction.transactionType) {
      case TransactionType.Deferred: {
        this.remainingAmount = this.transaction.remainingAmount;  
      } break;
      case TransactionType.Split: {
        this.remainingAmount = this.transaction.deferredSplits?.reduce((accumulator, currentValue) => {
          return accumulator + (currentValue.remainingAmount ?? 0);
        }, 0);
        this.ownerAccounts = [...new Set(this.transaction.deferredSplits?.map(s => s.ownerAccount.fullName))];
      }break;
    }
    
  }
}
