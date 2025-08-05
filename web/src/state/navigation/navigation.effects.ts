import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs';
import { transactionApiActions } from '@household/web/state/transaction/transaction.actions';
import { Router } from '@angular/router';
import { authActions } from '@household/web/state/auth/auth.actions';
import { navigationActions } from '@household/web/state/navigation/navigation.actions';

@Injectable()
export class NavigationEffects {
  constructor(private actions: Actions, private router: Router) {}

  navigateToTransactionDetails = createEffect(() => {
    return this.actions.pipe(
      ofType(transactionApiActions.createPaymentTransactionCompleted, transactionApiActions.createSplitTransactionCompleted, transactionApiActions.createTransferTransactionCompleted, transactionApiActions.updatePaymentTransactionCompleted, transactionApiActions.updateSplitTransactionCompleted, transactionApiActions.updateTransferTransactionCompleted),
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

  navigateToTransactionListOfAccount = createEffect(() => {
    return this.actions.pipe(
      ofType(navigationActions.transactionListOfAccount),
      tap(({ accountId }) => {
        this.router.navigate([
          '/accounts',
          accountId,
        ], {
          replaceUrl: true,
        });
      }),
    );
  }, {
    dispatch: false,
  });

  navigateToLoggedInHomepage = createEffect(() => {
    return this.actions.pipe(
      ofType(authActions.logInCompleted, navigationActions.loggedInHomepage),
      tap(() => {
        this.router.navigate(['/'], {
          replaceUrl: true,
        });
      }),
    );
  }, {
    dispatch: false,
  });

  loggedOut = createEffect(() => {
    return this.actions.pipe(
      ofType(authActions.logOut, navigationActions.loggedOutHomepage),
      tap(() => {
        this.router.navigate([
          '/',
          'login',
        ], {
          replaceUrl: true,
        });
      }),
    );
  }, {
    dispatch: false,
  });

  confirmedUser = createEffect(() => {
    return this.actions.pipe(
      ofType(authActions.confirmUserCompleted),
      tap(() => {
        this.router.navigate([
          '/',
          'login',
        ], {
          replaceUrl: true,
        });
      }),
    );
  }, {
    dispatch: false,
  });
}

