import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs';
import { transactionApiActions } from '@household/web/state/transaction/transaction.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { authActions } from '@household/web/state/auth/auth.actions';
import { navigationActions } from '@household/web/state/navigation/navigation.actions';
import { calendarApiActions } from '@household/web/state/calendar/calendar.actions';

@Injectable()
export class NavigationEffects {
  constructor(private actions: Actions, private router: Router, private activatedRoute: ActivatedRoute) {}

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

  navigateToCalendarHome = createEffect(() => {
    return this.actions.pipe(
      ofType(calendarApiActions.createCalendarEntryCompleted),
      tap(() => {
        if (this.activatedRoute.snapshot.queryParamMap.keys.length === 0) {
          return; 
        }
        
        this.router.navigate([
          '/hairdressing',
          'calendar',
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

