import { Component, Input, OnInit } from '@angular/core';
import { Account, Category, Product, Project, Recipient } from '@household/shared/types/types';
import { takeFirstDefined } from '@household/web/operators/take-first-defined';
import { selectAccountById } from '@household/web/state/account/account.selector';
import { selectCategoryById } from '@household/web/state/category/category.selector';
import { selectProductById } from '@household/web/state/product/product.selector';
import { selectProjectById } from '@household/web/state/project/project.selector';
import { selectRecipientById } from '@household/web/state/recipient/recipient.selector';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'household-transaction-short-details',
  standalone: false,
  templateUrl: './transaction-short-details.component.html',
  styleUrl: './transaction-short-details.component.scss',
})
export class TransactionShortDetailsComponent implements OnInit {
  @Input() currency: Account.Id;
  @Input() transferColor: 'red' | 'green';

  @Input() amount: number;
  @Input() remainingAmount: number;
  @Input() description: string;
  @Input() quantity: number;
  @Input() invoiceNumber: string;
  @Input() billingStartDate: string;
  @Input() billingEndDate: string;

  @Input() payingAccount: Account.Id;
  @Input() ownerAccount: Account.Id;
  @Input() givingAccount: Account.Id;
  @Input() receivingAccount: Account.Id;
  @Input() category: Category.Id;
  @Input() project: Project.Id;
  @Input() product: Product.Id;
  @Input() recipient: Recipient.Id;

  currencyAccount$: Observable<Account.Response>;
  project$: Observable<Project.Response>;
  payingAccount$: Observable<Account.Response>;
  ownerAccount$: Observable<Account.Response>;
  givingAccount$: Observable<Account.Response>;
  receivingAccount$: Observable<Account.Response>;
  category$: Observable<Category.Response>;
  product$: Observable<Product.Response>;
  recipient$: Observable<Recipient.Response>;

  constructor(private store: Store) { }

  ngOnInit(): void {
    if (this.currency) {
      this.currencyAccount$ = this.store.select(selectAccountById(this.currency)).pipe(takeFirstDefined());
    }

    if (this.project) {
      this.project$ = this.store.select(selectProjectById(this.project)).pipe(takeFirstDefined());
    }

    if (this.payingAccount) {
      this.payingAccount$ = this.store.select(selectAccountById(this.payingAccount)).pipe(takeFirstDefined());
    }

    if (this.ownerAccount) {
      this.ownerAccount$ = this.store.select(selectAccountById(this.ownerAccount)).pipe(takeFirstDefined());
    }

    if (this.givingAccount) {
      this.givingAccount$ = this.store.select(selectAccountById(this.givingAccount)).pipe(takeFirstDefined());
    }

    if (this.receivingAccount) {
      this.receivingAccount$ = this.store.select(selectAccountById(this.receivingAccount)).pipe(takeFirstDefined());
    }

    if (this.category) {
      this.category$ = this.store.select(selectCategoryById(this.category)).pipe(takeFirstDefined());
    }

    if (this.product) {
      this.product$ = this.store.select(selectProductById(this.product)).pipe(takeFirstDefined());
    }

    if (this.recipient) {
      this.recipient$ = this.store.select(selectRecipientById(this.recipient)).pipe(takeFirstDefined());
    }
  }
}
