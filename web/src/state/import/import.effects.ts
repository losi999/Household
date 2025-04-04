import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, EMPTY, exhaustMap, from, map, mergeMap, of, switchMap, tap, withLatestFrom } from 'rxjs';
import { TransactionService } from '@household/web/services/transaction.service';
import { importActions } from '@household/web/state/import/import.actions';
import { createReducer, Store } from '@ngrx/store';
import { selectDraftTransactionList } from '@household/web/state/import/import.selector';
import { notificationActions } from '@household/web/state/notification/notification.actions';
import { takeFirstDefined } from '@household/web/operators/take-first-defined';
import { progressActions } from '@household/web/state/progress/progress.actions';

@Injectable()
export class ImportEffects {
  constructor(private actions: Actions, private store: Store, private transactionService: TransactionService) {}

  importTransactions = createEffect(() => {
    return this.actions.pipe(
      ofType(importActions.importTransactions),
      switchMap(({ fileId, transactionIds }) => this.store.select(selectDraftTransactionList(fileId, transactionIds)).pipe(takeFirstDefined())),
      exhaustMap((value) => {
        console.log('ExMAP', value);

        let draftCount = 0;
        const actions = value.reduce((accumulator, currentValue) => {
          switch(currentValue.transactionType) {
            case 'payment': return [
              ...accumulator,
              importActions.importPaymentTransactionInitiated({
                transactionId: currentValue.transactionId,
                accountId: currentValue.account?.accountId,
                amount: currentValue.amount,
                categoryId: currentValue.category?.categoryId,
                description: currentValue.description ?? undefined,
                issuedAt: currentValue.issuedAt,
                loanAccountId: currentValue.loanAccount?.accountId,
                productId: undefined,
                isSettled: undefined,
                projectId: currentValue.project?.projectId,
                recipientId: currentValue.recipient?.recipientId,
                billingEndDate: undefined,
                billingStartDate: undefined,
                invoiceNumber: undefined,
                quantity: undefined,
              }),
            ];
            case 'transfer': return [
              ...accumulator,
              importActions.importTransferTransactionInitiated({
                transactionId: currentValue.transactionId,
                accountId: currentValue.account?.accountId,
                amount: currentValue.amount,
                description: currentValue.description ?? undefined,
                issuedAt: currentValue.issuedAt,
                payments: undefined,
                transferAccountId: currentValue.transferAccount?.accountId,
                transferAmount: undefined,
              }),
            ];
            case 'draft': {
              draftCount += 1;
              return accumulator;
            }
          }
        }, []);

        if (draftCount > 0) {
          actions.push(notificationActions.showMessage({
            message: `${draftCount} tranzakció hibás!`,
          }));
        }

        return of(...actions);
      }),
    );
  });

  importPaymentTransaction = createEffect(() => {
    return this.actions.pipe(
      ofType(importActions.importPaymentTransactionInitiated),
      mergeMap(({ type, transactionId, ...request }) => {
        return this.transactionService.updatePaymentTransaction(transactionId, request).pipe(
          map(({ transactionId }) => importActions.importPaymentTransactionCompleted({
            transactionId,
          })),
          catchError((error) => {
            console.log(error);
            let errorMessage = 'Hiba történt';
            if (error.error.body === 'data/amount must be < 0') {
              errorMessage = 'Kölcsön esetén az összegnek negatívnak kell lennie';
            }
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

  importTransferTransaction = createEffect(() => {
    return this.actions.pipe(
      ofType(importActions.importTransferTransactionInitiated),
      mergeMap(({ type, transactionId, ...request }) => {
        return this.transactionService.updateTransferTransaction(transactionId, request).pipe(
          map(({ transactionId }) => importActions.importPaymentTransactionCompleted({
            transactionId,
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

  // saveInLocalStorage = createEffect(() => {
  //   return this.actions.pipe(
  //     ofType(importActions.applyEditingFields),
  //     switchMap(() => this.store.select(selectModifiedTransactions)),
  //     tap((transactions) => {
  //       console.log('EFFE', transactions);
  //       localStorage.setItem('drafts', JSON.stringify(transactions));
  //     }),
  //   );
  // }, {
  //   dispatch: false,
  // });
}

