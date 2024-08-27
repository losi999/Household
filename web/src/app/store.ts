import { Injectable } from '@angular/core';
import { Account, Category, Product, Transaction } from '@household/shared/types/types';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Store {
  deferredTransactions: BehaviorSubject<Transaction.DeferredResponse[]>;

  constructor() {
    this.deferredTransactions = new BehaviorSubject([]);
  }
}
