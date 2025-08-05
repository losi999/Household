import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, combineLatest, exhaustMap, map, mergeMap, of, switchMap, take } from 'rxjs';
import { progressActions } from '@household/web/state/progress/progress.actions';
import { notificationActions } from '@household/web/state/notification/notification.actions';
import { hairdressingActions } from '@household/web/state/hairdressing/hairdressing.actions';
import { TransactionService } from '@household/web/services/transaction.service';
import { Store } from '@ngrx/store';
import { selectHairdressingIncomeAccountId, selectHairdressingIncomeCategoryId } from '@household/web/state/setting/setting.selector';
import { takeFirstDefined } from '@household/web/operators/take-first-defined';
import moment from 'moment';

@Injectable()
export class HairdressingEffects {
  constructor(private actions: Actions, private store: Store, private transactionService: TransactionService) {}

  loadIncome = createEffect(() => {
    return this.actions.pipe(
      ofType(hairdressingActions.listIncomeInitiated),
      mergeMap(({ date }) => {
        return combineLatest([
          this.store.select(selectHairdressingIncomeAccountId).pipe(takeFirstDefined()),
          this.store.select(selectHairdressingIncomeCategoryId).pipe(takeFirstDefined()),
        ]).pipe(
          take(1),
          switchMap(([
            accountId,
            categoryId,
          ]) => {
            const from = new Date(date.getFullYear(), date.getMonth(), 1);
            const to = new Date(date.getFullYear(), date.getMonth() + 1, 1);

            return this.transactionService.getTransactionReport([
              {
                filterType: 'account',
                include: true,
                items: [accountId],
              },
              {
                filterType: 'category',
                include: true,
                items: [categoryId],
              },
              {
                filterType: 'issuedAt',
                from: from.toISOString(),
                to: to.toISOString(),
                include: true,
              },
            ]).pipe(
              map((transactions) => {
                return hairdressingActions.listIncomeCompleted({
                  transactions,
                  month: moment(date).format('YYYY-MM'),
                });
              }),
              catchError(() => {
                return of(progressActions.processFinished(),
                  notificationActions.showMessage({
                    message: 'Hiba történt',
                  }),
                );
              }),
            );
          }));
      }),
    );
  });

  deleteIncome = createEffect(() => {
    return this.actions.pipe(
      ofType(hairdressingActions.deleteIncomeInitiated),
      mergeMap(({ transactionId }) => {
        return this.transactionService.deleteTransaction(transactionId).pipe(
          map(() => {
            return hairdressingActions.deleteIncomeCompleted({
              transactionId,
            });
          }),
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

  saveIncome = createEffect(() => {
    return this.actions.pipe(
      ofType(hairdressingActions.saveIncomeInitiated),
      exhaustMap(({ description, issuedAt, amount }) => {
        return combineLatest([
          this.store.select(selectHairdressingIncomeAccountId).pipe(takeFirstDefined()),
          this.store.select(selectHairdressingIncomeCategoryId).pipe(takeFirstDefined()),
        ]).pipe(
          take(1),
          switchMap(([
            accountId,
            categoryId,
          ]) => {
            return this.transactionService.createPaymentTransaction({
              amount,
              accountId: accountId,
              categoryId: categoryId,
              issuedAt,
              description,
              billingEndDate: undefined,
              billingStartDate: undefined,
              invoiceNumber: undefined,
              isSettled: undefined,
              loanAccountId: undefined,
              productId: undefined,
              projectId: undefined,
              quantity: undefined,
              recipientId: undefined,
            }).pipe(
              map(({ transactionId }) => {
                return hairdressingActions.saveIncomeCompleted({
                  transactionId,
                  description,
                  issuedAt,
                  amount,
                });
              }),
              catchError(() => {
                return of(progressActions.processFinished(),
                  notificationActions.showMessage({
                    message: 'Hiba történt',
                  }),
                );
              }),
            );
          }));
      }),
    );
  });

  updateIncome = createEffect(() => {
    return this.actions.pipe(
      ofType(hairdressingActions.updateIncomeInitiated),
      exhaustMap(({ description, issuedAt, amount, transactionId }) => {
        return combineLatest([
          this.store.select(selectHairdressingIncomeAccountId).pipe(takeFirstDefined()),
          this.store.select(selectHairdressingIncomeCategoryId).pipe(takeFirstDefined()),
        ]).pipe(
          take(1),
          switchMap(([
            accountId,
            categoryId,
          ]) => {
            return this.transactionService.updatePaymentTransaction(transactionId, {
              amount,
              accountId: accountId,
              categoryId: categoryId,
              issuedAt,
              description,
              billingEndDate: undefined,
              billingStartDate: undefined,
              invoiceNumber: undefined,
              isSettled: undefined,
              loanAccountId: undefined,
              productId: undefined,
              projectId: undefined,
              quantity: undefined,
              recipientId: undefined,
            }).pipe(
              map(({ transactionId }) => {
                return hairdressingActions.updateIncomeCompleted({
                  transactionId,
                  description,
                  issuedAt,
                  amount,
                });
              }),
              catchError(() => {
                return of(progressActions.processFinished(),
                  notificationActions.showMessage({
                    message: 'Hiba történt',
                  }),
                );
              }),
            );
          }));
      }),
    );
  });
}

