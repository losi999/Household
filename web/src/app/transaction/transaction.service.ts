import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Account, Transaction } from '@household/shared/types/types';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {

  constructor(private httpClient: HttpClient) { }

  getTransactionById(transactionId: Transaction.IdType, accountId: Account.IdType): Observable<Transaction.Response> {
    return this.httpClient.get<Transaction.Response>(`${environment.apiUrl}${environment.transactionStage}v1/accounts/${accountId}/transactions/${transactionId}`);
  }

  createPaymentTransaction(body: Transaction.PaymentRequest): Observable<unknown> {
    return this.httpClient.post(`${environment.apiUrl}${environment.transactionStage}v1/transactions/payment`, body);
  }

  createSplitTransaction(body: Transaction.SplitRequest): Observable<unknown> {
    return this.httpClient.post(`${environment.apiUrl}${environment.transactionStage}v1/transactions/split`, body);
  }

  createTransferTransaction(body: Transaction.TransferRequest): Observable<unknown> {
    return this.httpClient.post(`${environment.apiUrl}${environment.transactionStage}v1/transactions/transfer`, body);
  }

  updatePaymentTransaction(transactionId: Transaction.IdType, body: Transaction.PaymentRequest): Observable<unknown> {
    return this.httpClient.put(`${environment.apiUrl}${environment.transactionStage}v1/transactions/${transactionId}/payment`, body);
  }

  updateSplitTransaction(transactionId: Transaction.IdType, body: Transaction.SplitRequest): Observable<unknown> {
    return this.httpClient.put(`${environment.apiUrl}${environment.transactionStage}v1/transactions/${transactionId}/split`, body);
  }

  updateTransferTransaction(transactionId: Transaction.IdType, body: Transaction.TransferRequest): Observable<unknown> {
    return this.httpClient.put(`${environment.apiUrl}${environment.transactionStage}v1/transactions/${transactionId}/transfer`, body);
  }

  deleteTransaction(transactionId: Transaction.IdType): Observable<unknown> {
    return this.httpClient.delete(`${environment.apiUrl}${environment.transactionStage}v1/transactions/${transactionId}`);
  }
}
