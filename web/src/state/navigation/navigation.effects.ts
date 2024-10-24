import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs';
import { transactionApiActions } from '@household/web/state/transaction/transaction.actions';
import { Router } from '@angular/router';

@Injectable()
export class NavigationEffects {
  constructor(private actions: Actions, private router: Router) {}

  navigateToTransactionDetails = createEffect(() => {
    return this.actions.pipe(
      ofType(transactionApiActions.createPaymentTransactionCompleted, transactionApiActions.createSplitTransactionCompleted, transactionApiActions.createTransferTransactionCompleted),
      tap(({ accountId, transactionId }) => {
        this.router.navigate([
          '/accounts',
          accountId,
          'transactions',
          transactionId,
        ], {
          replaceUrl: true,
        });
      }),
    );
  }, {
    dispatch: false,
  });
}

