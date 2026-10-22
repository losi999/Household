import { Component, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Toolbar } from '@household/app/shared/toolbar/toolbar';
import { TransactionList } from '@household/app/transaction/transaction-list/transaction-list';
import { Api } from '@household/shared/types/api';
import { AccountStore } from '@household/state/account/account-store';
import { transactionApiEvents } from '@household/state/transaction/transaction-events';
import { TransactionStore } from '@household/state/transaction/transaction-store';
import { injectDispatch } from '@ngrx/signals/events';
import { distinctUntilChanged, map } from 'rxjs';

const TRANSACTION_PAGE_SIZE = 25;

@Component({
  imports: [
    Toolbar,
    MatIconModule,
    MatButtonModule,
    TransactionList,
    RouterLink,
  ],
  selector: 'household-transaction-home',
  styleUrl: './transaction-home.scss',
  templateUrl: './transaction-home.html',
})
export class TransactionHome {
  private readonly title = inject(Title);
  readonly transactionStore = inject(TransactionStore);
  private readonly accountStore = inject(AccountStore);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly transactionApiEvents = injectDispatch(transactionApiEvents);
  private readonly router = inject(Router);

  readonly accountId = this.activatedRoute.snapshot.paramMap.get('accountId') as Api.Account.Id;

  private loadedPage: number;

  constructor() {
    effect(() => {
      const account = this.accountStore.accountList().find(a => a.accountId === this.accountId);
      
      this.title.setTitle(account?.name ?? 'Tranzakciók');
    });

    this.activatedRoute.queryParamMap.pipe(
      map((params) => {
        const page = Number.parseInt(params.get('page'), 10);

        return page >= 1 ? page : 1;
      }),
      distinctUntilChanged(),
      takeUntilDestroyed(),
    ).subscribe((page) => {
      if (!this.loadedPage) {
        // The page is loaded, everything up to the page in the url is needed
        this.transactionApiEvents.listTransactionsByAccountInitiated({
          accountId: this.accountId,
          pageNumber: 1,
          pageSize: page * TRANSACTION_PAGE_SIZE,
        });
        this.loadedPage = page;
      } else if (page > this.loadedPage) {
        // The page in the url was increased, only that page is missing
        this.transactionApiEvents.listTransactionsByAccountInitiated({
          accountId: this.accountId,
          pageNumber: page,
          pageSize: TRANSACTION_PAGE_SIZE,
        });
        this.loadedPage = page;
      }
    });
  }

  onLoadMore() {
    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams: {
          page: this.loadedPage + 1,
        },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      },
    );
  }
}
