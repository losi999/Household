import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Account, Transaction } from '@household/shared/types/types';
import { DialogService } from '@household/web/app/shared/dialog.service';
import { takeFirstDefined } from '@household/web/operators/take-first-defined';
import { transactionApiActions } from '@household/web/state/transaction/transaction.actions';
import { selectTransaction } from '@household/web/state/transaction/transaction.selector';
import { Store } from '@ngrx/store';
import { Observable, tap } from 'rxjs';

@Component({
  selector: 'household-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.scss'],
  standalone: false,
})
export class TransactionDetailsComponent implements OnInit {
  transaction: Observable<Transaction.Response>;
  formType: string;
  transactionId: Transaction.Id;

  constructor(private activatedRoute: ActivatedRoute, private store: Store, private router: Router, private dialogService: DialogService) { }

  @HostListener('window:keydown.meta.i', ['$event'])
  @HostListener('window:keydown.meta.p', ['$event'])
  @HostListener('window:keydown.meta.s', ['$event'])
  @HostListener('window:keydown.meta.x', ['$event'])
  @HostListener('window:keydown.meta.l', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    event.preventDefault();
    let formType: string;

    switch(event.key) {
      case 'i': formType = 'income'; break;
      case 'p': formType = 'payment'; break;
      case 's': formType = 'split'; break;
      case 'x': formType = 'transfer'; break;
      case 'l': formType = 'loan'; break;
    }

    this.router.navigate([
      '../..',
      'new',
      formType,
    ], {
      replaceUrl: true,
      relativeTo: this.activatedRoute,
    });
  }

  ngOnInit(): void {
    const accountId = this.activatedRoute.snapshot.paramMap.get('accountId') as Account.Id;
    this.transactionId = this.activatedRoute.snapshot.paramMap.get('transactionId') as Transaction.Id;

    this.store.dispatch(transactionApiActions.getTransactionInitiated({
      accountId,
      transactionId: this.transactionId,
    }));

    this.transaction = this.store.select(selectTransaction).pipe(
      takeFirstDefined(),
      tap((transaction) => {
        switch(transaction.transactionType) {
          case 'payment': this.formType = transaction.amount >= 0 ? 'income' : 'payment'; break;
          case 'deferred':
          case 'reimbursement': this.formType = 'loan'; break;
          case 'transfer':
          case 'loanTransfer': this.formType = 'transfer'; break;
          case 'split': this.formType = 'split'; break;
        }
      }));
  }

  delete() {
    this.dialogService.openDeleteTransactionDialog().afterClosed()
      .subscribe(shouldDelete => {
        if (shouldDelete) {
          this.store.dispatch(transactionApiActions.deleteTransactionInitiated({
            transactionId: this.transactionId,
          }));
          this.router.navigate(['../..'], {
            relativeTo: this.activatedRoute,
          });
        }
      });
  }
}
