import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Account, Transaction, Report } from '@household/shared/types/types';
import { Observable } from 'rxjs';
import { environment } from '@household/web/environments/environment';
import { transactionsPageSize } from '@household/web/app/constants';
import { Store } from '@household/web/app/store';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {

  constructor(private httpClient: HttpClient, private store: Store) { }

  listTransactionsByAccountId(accountId: Account.Id, pageNumber = 1, pageSize: number = transactionsPageSize): Observable<Transaction.Response[]> {
    return this.httpClient.get<Transaction.Response[]>(`${environment.apiUrl}${environment.transactionStage}v1/accounts/${accountId}/transactions`, {
      params: {
        pageSize: `${pageSize}`,
        pageNumber: `${pageNumber}`,
      },
    });
  }

  listDeferredTransactions(params: {
    isSettled: boolean;
    // transactionIds: Transaction.Id[];
  }): void {
    this.httpClient.get<Transaction.DeferredResponse[]>(`${environment.apiUrl}${environment.transactionStage}v1/transactions/deferred`, {
      params: {
        isSettled: params.isSettled,
        // transactionId: params.transactionIds,
      },
    }).subscribe({
      next: (response) => {
        this.store.deferredTransactions.next(response);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  getTransactionById(transactionId: Transaction.Id, accountId: Account.Id): Observable<Transaction.Response> {
    return this.httpClient.get<Transaction.Response>(`${environment.apiUrl}${environment.transactionStage}v1/accounts/${accountId}/transactions/${transactionId}`);
  }

  getTransactionReport(body: Report.Request): Observable<Transaction.Report[]> {
    return this.httpClient.post<Transaction.Report[]>(`${environment.apiUrl}${environment.transactionStage}v1/transactionReports`, body);
  }

  createPaymentTransaction(body: Transaction.PaymentRequest): Observable<Transaction.TransactionId> {
    return this.httpClient.post<Transaction.TransactionId>(`${environment.apiUrl}${environment.transactionStage}v1/transactions/payment`, body);
  }

  createSplitTransaction(body: Transaction.SplitRequest): Observable<Transaction.TransactionId> {
    return this.httpClient.post<Transaction.TransactionId>(`${environment.apiUrl}${environment.transactionStage}v1/transactions/split`, body);
  }

  createTransferTransaction(body: Transaction.TransferRequest): Observable<Transaction.TransactionId> {
    return this.httpClient.post<Transaction.TransactionId>(`${environment.apiUrl}${environment.transactionStage}v1/transactions/transfer`, body);
  }

  updatePaymentTransaction(transactionId: Transaction.Id, body: Transaction.PaymentRequest): Observable<Transaction.TransactionId> {
    return this.httpClient.put<Transaction.TransactionId>(`${environment.apiUrl}${environment.transactionStage}v1/transactions/${transactionId}/payment`, body);
  }

  updateSplitTransaction(transactionId: Transaction.Id, body: Transaction.SplitRequest): Observable<Transaction.TransactionId> {
    return this.httpClient.put<Transaction.TransactionId>(`${environment.apiUrl}${environment.transactionStage}v1/transactions/${transactionId}/split`, body);
  }

  updateTransferTransaction(transactionId: Transaction.Id, body: Transaction.TransferRequest): Observable<Transaction.TransactionId> {
    return this.httpClient.put<Transaction.TransactionId>(`${environment.apiUrl}${environment.transactionStage}v1/transactions/${transactionId}/transfer`, body);
  }

  deleteTransaction(transactionId: Transaction.Id): Observable<unknown> {
    return this.httpClient.delete(`${environment.apiUrl}${environment.transactionStage}v1/transactions/${transactionId}`);
  }
}
