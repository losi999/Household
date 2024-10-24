import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, groupBy, map, mergeMap, of, tap } from 'rxjs';
import { transactionApiActions } from '@household/web/state/transaction/transaction.actions';
import { TransactionService } from '@household/web/services/transaction.service';
import { progressActions } from '@household/web/state/progress/progress.actions';
import { notificationActions } from '@household/web/state/notification/notification.action';
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

  //   updateTransaction = createEffect(() => {
  //     return this.actions.pipe(
  //       ofType(transactionApiActions.updateTransactionInitiated),
  //       groupBy(({ transactionId }) => transactionId),
  //       mergeMap((value) => {
  //         return value.pipe(exhaustMap(({ type, transactionId, ...request }) => {
  //           return this.transactionService.updateTransaction(transactionId, request).pipe(
  //             map(({ transactionId }) => transactionApiActions.updateTransactionCompleted({
  //               transactionId,
  //               ...request,
  //             })),
  //             catchError((error) => {
  //               let errorMessage: string;
  //               switch(error.error?.message) {
  //                 case 'Duplicate transaction name': {
  //                   errorMessage = `Projekt (${request.name}) már létezik!`;
  //                 } break;
  //                 default: {
  //                   errorMessage = 'Hiba történt';
  //                 }
  //               }
  //               return of(progressActions.processFinished(),
  //                 notificationActions.showMessage({
  //                   message: errorMessage,
  //                 }),
  //               );
  //             }),
  //           );
  //         }));

  //       }),
  //     );
  //   });

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

