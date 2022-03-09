import { Component, Input, OnInit } from '@angular/core';
import { Transaction } from '@household/shared/types/types';

@Component({
  selector: 'app-account-payment-transaction-list-item',
  templateUrl: './account-payment-transaction-list-item.component.html',
  styleUrls: ['./account-payment-transaction-list-item.component.scss']
})
export class AccountPaymentTransactionListItemComponent implements OnInit {
  @Input() transaction: Transaction.PaymentResponse;
  date: Date;
  title: string;

  constructor() { }

  ngOnInit(): void {
    this.title = [this.transaction.category?.fullName, this.transaction.project?.name].filter(x => !!x).join('/');
    this.date = new Date(this.transaction.issuedAt);
  }

}
