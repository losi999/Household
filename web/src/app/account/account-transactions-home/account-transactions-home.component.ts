import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Account } from '@household/shared/types/types';
import { skip } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { transactionApiActions } from '@household/web/state/transaction/transaction.actions';
import { transactionsPageSize } from '@household/web/app/constants';
import { selectTransactionList } from '@household/web/state/transaction/transaction.selector';

@Component({
  selector: 'household-account-transactions-home',
  templateUrl: './account-transactions-home.component.html',
  styleUrls: ['./account-transactions-home.component.scss'],
  standalone: false,
})
export class AccountTransactionsHomeComponent implements OnInit {
  accountId: Account.Id;
  transactions = this.store.select(selectTransactionList);
  page: number;

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private store: Store) {
  }

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
      'new',
      formType,
    ], {
      relativeTo: this.activatedRoute,
    });
  }

  get maximumItemCount(): number {
    return this.page * transactionsPageSize;
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.pipe(skip(1)).subscribe((value) => {
      this.page = value.page;

      this.store.dispatch(transactionApiActions.listTransactionsInitiated({
        accountId: this.accountId,
        pageNumber: this.page,
        pageSize: transactionsPageSize,
      }));
    });

    this.accountId = this.activatedRoute.snapshot.paramMap.get('accountId') as Account.Id;
    this.page = this.activatedRoute.snapshot.queryParams.page ?? 1;

    this.store.dispatch(transactionApiActions.listTransactionsInitiated({
      accountId: this.accountId,
      pageNumber: 1,
      pageSize: this.page * transactionsPageSize,
    }));
  }

  loadMore() {

    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams: {
          page: Number(this.activatedRoute.snapshot.queryParams.page ?? 1) + 1,
        },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      },
    );

  }
}
