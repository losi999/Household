import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Account, Transaction, Report, File } from '@household/shared/types/types';
import { Observable } from 'rxjs';
import { environment } from '@household/web/environments/environment';
import { transactionsPageSize } from '@household/web/constants';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {

  constructor(private httpClient: HttpClient) { }

  listTransactionsByAccountId(accountId: Account.Id, pageNumber = 1, pageSize: number = transactionsPageSize): Observable<Transaction.Response[]> {
    return this.httpClient.get<Transaction.Response[]>(`${environment.apiUrl}/transaction/v1/accounts/${accountId}/transactions`, {
      params: {
        pageSize: `${pageSize}`,
        pageNumber: `${pageNumber}`,
      },
    });
  }

  listTransactionsByFileId(fileId: File.Id): Observable<Transaction.DraftResponse[]> {
    return this.httpClient.get<Transaction.DraftResponse[]>(`${environment.apiUrl}/transaction/v1/files/${fileId}/transactions`);
  }

  listDeferredTransactions(): Observable<Transaction.DeferredResponse[]> {
    return this.httpClient.get<Transaction.DeferredResponse[]>(`${environment.apiUrl}/transaction/v1/transactions/deferred`);
  }

  getTransactionById(transactionId: Transaction.Id, accountId: Account.Id): Observable<Transaction.Response> {
    return this.httpClient.get<Transaction.Response>(`${environment.apiUrl}/transaction/v1/accounts/${accountId}/transactions/${transactionId}`);
  }

  getTransactionReport(body: Report.Request): Observable<Transaction.Report[]> {
    return this.httpClient.post<Transaction.Report[]>(`${environment.apiUrl}/transaction/v1/transactionReports`, body);
  }

  createPaymentTransaction(body: Transaction.PaymentRequest): Observable<Transaction.TransactionId> {
    return this.httpClient.post<Transaction.TransactionId>(`${environment.apiUrl}/transaction/v1/transactions/payment`, body);
  }

  createSplitTransaction(body: Transaction.SplitRequest): Observable<Transaction.TransactionId> {
    return this.httpClient.post<Transaction.TransactionId>(`${environment.apiUrl}/transaction/v1/transactions/split`, body);
  }

  createTransferTransaction(body: Transaction.TransferRequest): Observable<Transaction.TransactionId> {
    return this.httpClient.post<Transaction.TransactionId>(`${environment.apiUrl}/transaction/v1/transactions/transfer`, body);
  }

  updatePaymentTransaction(transactionId: Transaction.Id, body: Transaction.PaymentRequest): Observable<Transaction.TransactionId> {
    return this.httpClient.put<Transaction.TransactionId>(`${environment.apiUrl}/transaction/v1/transactions/${transactionId}/payment`, body);
  }

  updateSplitTransaction(transactionId: Transaction.Id, body: Transaction.SplitRequest): Observable<Transaction.TransactionId> {
    return this.httpClient.put<Transaction.TransactionId>(`${environment.apiUrl}/transaction/v1/transactions/${transactionId}/split`, body);
  }

  updateTransferTransaction(transactionId: Transaction.Id, body: Transaction.TransferRequest): Observable<Transaction.TransactionId> {
    return this.httpClient.put<Transaction.TransactionId>(`${environment.apiUrl}/transaction/v1/transactions/${transactionId}/transfer`, body);
  }

  deleteTransaction(transactionId: Transaction.Id): Observable<unknown> {
    return this.httpClient.delete(`${environment.apiUrl}/transaction/v1/transactions/${transactionId}`);
  }
}
