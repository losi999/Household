import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Transaction } from '@household/shared/types/types';

@Component({
  selector: 'household-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.scss'],
})
export class TransactionDetailsComponent implements OnInit {
  transaction: Transaction.Response;
  issuedAt: Date;

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    // this.transaction = this.activatedRoute.snapshot.data.transaction;
    // this.issuedAt = new Date(this.transaction.issuedAt);
  }
}
