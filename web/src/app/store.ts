import { Injectable } from '@angular/core';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Store {
  projects: BehaviorSubject<Project.Response[]>;
  accounts: BehaviorSubject<Account.Response[]>;
  account: BehaviorSubject<Account.Response>;
  accountsByOwner: BehaviorSubject<{[owner: string]: Account.Response[]}>;
  recipients: BehaviorSubject<Recipient.Response[]>;
  categories: BehaviorSubject<Category.Response[]>;
  inventoryCategories: BehaviorSubject<Category.Response[]>;
  deferredTransactions: BehaviorSubject<Transaction.DeferredResponse[]>;
  products: BehaviorSubject<{
    [categoryId: Category.Id]: Product.Response[];
  }>;

  constructor() {
    this.projects = new BehaviorSubject([]);
    this.recipients = new BehaviorSubject([]);
    this.categories = new BehaviorSubject([]);
    this.accounts = new BehaviorSubject([]);
    this.accountsByOwner = new BehaviorSubject({});
    this.inventoryCategories = new BehaviorSubject([]);
    this.products = new BehaviorSubject({});
    this.account = new BehaviorSubject(null);
    this.deferredTransactions = new BehaviorSubject([]);

    this.accounts.subscribe((accounts) => {
      const grouped = accounts.reduce<{[owner: string]: Account.Response[]}>((accumulator, currentValue) => {
        return {
          ...accumulator,
          [currentValue.owner]: [
            ...(accumulator[currentValue.owner] ?? []),
            currentValue,
          ],
        };
      }, {});
      this.accountsByOwner.next(grouped);
    });

    this.categories.subscribe((categories) => {
      this.inventoryCategories.next(categories.filter(c => c.categoryType === 'inventory'));
    });

    this.inventoryCategories.subscribe((categories) => {
      this.products.next(categories.reduce((accumulator, currentValue) => {
        return {
          ...accumulator,
          [currentValue.categoryId]: currentValue.products,
        };
      }, {}));
    });
  }
}
