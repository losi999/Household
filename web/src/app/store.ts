import { Injectable } from '@angular/core';
import { Account, Category, Project, Recipient } from '@household/shared/types/types';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Store {
  projects: BehaviorSubject<Project.Response[]>;
  accounts: BehaviorSubject<Account.Response[]>;
  recipients: BehaviorSubject<Recipient.Response[]>;
  categories: BehaviorSubject<Category.Response[]>;

  constructor() {
    this.projects = new BehaviorSubject([]);
    this.recipients = new BehaviorSubject([]);
    this.categories = new BehaviorSubject([]);
    this.accounts = new BehaviorSubject([]);
  }
}
