import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Account, Transaction } from '@household/shared/types/types';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  constructor(private httpClient: HttpClient) { }

  getTransactionById(transactionId: Transaction.IdType, accountId: Account.IdType): Observable<Transaction.Response> {
    return this.httpClient.get<Transaction.Response>(`${environment.apiUrl}${environment.transactionStage}v1/accounts/${accountId}/transactions/${transactionId}`);
  }
}
