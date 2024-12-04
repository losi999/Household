import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, mergeMap, of } from 'rxjs';
import { transactionApiActions } from '@household/web/state/transaction/transaction.actions';
import { TransactionService } from '@household/web/services/transaction.service';
import { progressActions } from '@household/web/state/progress/progress.actions';
import { notificationActions } from '@household/web/state/notification/notification.actions';
import { Router } from '@angular/router';

@Injectable()
export class TransactionEffects {
  constructor(private actions: Actions, private transactionService: TransactionService, private router: Router) {}

  loadTransactions = createEffect(() => {
    return this.actions.pipe(
      ofType(transactionApiActions.listTransactionsInitiated),
      exhaustMap(({
        accountId,
        pageNumber,
        pageSize,
      }) => {
        return this.transactionService.listTransactionsByAccountId(accountId, pageNumber, pageSize).pipe(
          map((transactions) => transactions.length === 0 && pageNumber === 1 ? notificationActions.showMessage({
            message: 'Ezen a számlán nincsen tranzakció',
          }) : transactionApiActions.listTransactionsCompleted({
            transactions,
            pageNumber,
            pageSize,
          })),
          catchError(() => {
            return of(progressActions.processFinished(),
              notificationActions.showMessage({
                message: 'Hiba történt',
              }),
            );
          }),
        );
      }),
    );
  });

  loadDeferredTransactions = createEffect(() => {
    return this.actions.pipe(
      ofType(transactionApiActions.listDeferredTransactionsInitiated),
      exhaustMap(({
        isSettled,
      }) => {
        return this.transactionService.listDeferredTransactions({
          isSettled,
        }).pipe(
          map((transactions) => transactionApiActions.listDeferredTransactionsCompleted({
            transactions,
          })),
          catchError(() => {
            return of(progressActions.processFinished(),
              notificationActions.showMessage({
                message: 'Hiba történt',
              }),
            );
          }),
        );
      }),
    );
  });

  getTransaction = createEffect(() => {
    return this.actions.pipe(
      ofType(transactionApiActions.getTransactionInitiated),
      exhaustMap(({
        accountId,
        transactionId,
      }) => {
        return this.transactionService.getTransactionById(transactionId, accountId).pipe(
          map((transaction) => transactionApiActions.getTransactionCompleted(transaction)),
          catchError(() => {
            return of(progressActions.processFinished(),
              notificationActions.showMessage({
                message: 'Hiba történt',
              }),
            );
          }),
        );
      }),
    );
  });

  createPaymentTransaction = createEffect(() => {
    return this.actions.pipe(
      ofType(transactionApiActions.createPaymentTransactionInitiated),
      mergeMap(({ type, ...request }) => {
        return this.transactionService.createPaymentTransaction(request).pipe(
          map(({ transactionId }) => transactionApiActions.createPaymentTransactionCompleted({
            transactionId,
            ...request,
          })),
          catchError((error) => {
            console.log(error);
            const errorMessage = 'Hiba történt';
            return of(progressActions.processFinished(),
              notificationActions.showMessage({
                message: errorMessage,
              }),
            );
          }),
        );
      }),
    );
  });

  updatetePaymentTransaction = createEffect(() => {
    return this.actions.pipe(
      ofType(transactionApiActions.updatePaymentTransactionInitiated),
      mergeMap(({ transactionId, request }) => {
        return this.transactionService.updatePaymentTransaction(transactionId, request).pipe(
          map(({ transactionId }) => transactionApiActions.updatePaymentTransactionCompleted({
            transactionId,
            ...request,
          })),
          catchError((error) => {
            console.log(error);
            const errorMessage = 'Hiba történt';
            return of(progressActions.processFinished(),
              notificationActions.showMessage({
                message: errorMessage,
              }),
            );
          }),
        );
      }),
    );
  });

  createSplitTransaction = createEffect(() => {
    return this.actions.pipe(
      ofType(transactionApiActions.createSplitTransactionInitiated),
      mergeMap(({ type, ...request }) => {
        return this.transactionService.createSplitTransaction(request).pipe(
          map(({ transactionId }) => transactionApiActions.createSplitTransactionCompleted({
            transactionId,
            ...request,
          })),
          catchError((error) => {
            console.log(error);
            const errorMessage = 'Hiba történt';
            return of(progressActions.processFinished(),
              notificationActions.showMessage({
                message: errorMessage,
              }),
            );
          }),
        );
      }),
    );
  });

  updateSplitTransaction = createEffect(() => {
    return this.actions.pipe(
      ofType(transactionApiActions.updateSplitTransactionInitiated),
      mergeMap(({ transactionId, request }) => {
        return this.transactionService.updateSplitTransaction(transactionId, request).pipe(
          map(({ transactionId }) => transactionApiActions.updateSplitTransactionCompleted({
            transactionId,
            ...request,
          })),
          catchError((error) => {
            console.log(error);
            const errorMessage = 'Hiba történt';
            return of(progressActions.processFinished(),
              notificationActions.showMessage({
                message: errorMessage,
              }),
            );
          }),
        );
      }),
    );
  });

  createTransferTransaction = createEffect(() => {
    return this.actions.pipe(
      ofType(transactionApiActions.createTransferTransactionInitiated),
      mergeMap(({ type, ...request }) => {
        return this.transactionService.createTransferTransaction(request).pipe(
          map(({ transactionId }) => transactionApiActions.createTransferTransactionCompleted({
            transactionId,
            ...request,
          })),
          catchError((error) => {
            console.log(error);
            const errorMessage = 'Hiba történt';
            return of(progressActions.processFinished(),
              notificationActions.showMessage({
                message: errorMessage,
              }),
            );
          }),
        );
      }),
    );
  });

  updateTransferTransaction = createEffect(() => {
    return this.actions.pipe(
      ofType(transactionApiActions.updateTransferTransactionInitiated),
      mergeMap(({ transactionId, request }) => {
        return this.transactionService.updateTransferTransaction(transactionId, request).pipe(
          map(({ transactionId }) => transactionApiActions.updateTransferTransactionCompleted({
            transactionId,
            ...request,
          })),
          catchError((error) => {
            console.log(error);
            const errorMessage = 'Hiba történt';
            return of(progressActions.processFinished(),
              notificationActions.showMessage({
                message: errorMessage,
              }),
            );
          }),
        );
      }),
    );
  });

  deleteTransaction = createEffect(() => {
    return this.actions.pipe(
      ofType(transactionApiActions.deleteTransactionInitiated),
      mergeMap(({ transactionId }) => {
        return this.transactionService.deleteTransaction(transactionId).pipe(
          map(() => transactionApiActions.deleteTransactionCompleted({
            transactionId,
          })),
          catchError(() => {
            return of(transactionApiActions.deleteTransactionFailed({
              transactionId,
            }), progressActions.processFinished(),
            notificationActions.showMessage({
              message: 'Hiba történt',
            }),
            );
          }),
        );
      }),
    );
  });
}

