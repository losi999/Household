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
  @Input() currencyAccountId: Account.Id;
  @Input() currency: string;

  @Input() accountIcon: 'arrow_left_alt' | 'arrow_right_alt' | 'forward' | 'reply_all';
  @Input() accountIconColor: 'red' | 'green';

  @Input() amount: number;
  @Input() description: string;
  @Input() quantity: number;
  @Input() invoiceNumber: string;
  @Input() billingStartDate: string;
  @Input() billingEndDate: string;

  @Input() accountId: Account.Id;
  @Input() categoryId: Category.Id;
  @Input() projectId: Project.Id;
  @Input() productId: Product.Id;
  @Input() recipientId: Recipient.Id;

  @Input() accountName: string;
  @Input() categoryName: string;
  @Input() projectName: string;
  @Input() productName: string;
  @Input() recipientName: string;

  currencyAccount: Observable<Account.Response>;
  project: Observable<Project.Response>;
  account: Observable<Account.Response>;
  category: Observable<Category.Response>;
  product: Observable<Product.Response>;
  recipient: Observable<Recipient.Response>;

  constructor(private store: Store) { }

  ngOnInit(): void {
    if (this.currencyAccountId) {
      this.currencyAccount = this.store.select(selectAccountById(this.currencyAccountId)).pipe(takeFirstDefined());
    }

    if (this.projectId) {
      this.project = this.store.select(selectProjectById(this.projectId)).pipe(takeFirstDefined());
    }

    if (this.accountId) {
      this.account = this.store.select(selectAccountById(this.accountId)).pipe(takeFirstDefined());
    }

    if (this.categoryId) {
      this.category = this.store.select(selectCategoryById(this.categoryId)).pipe(takeFirstDefined());
    }

    if (this.productId) {
      this.product = this.store.select(selectProductById(this.productId)).pipe(takeFirstDefined());
    }

    if (this.recipientId) {
      this.recipient = this.store.select(selectRecipientById(this.recipientId)).pipe(takeFirstDefined());
    }
  }
}
