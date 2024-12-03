import { Component, Input, OnInit } from '@angular/core';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { selectAccountById } from '@household/web/state/account/account.selector';
import { selectCategoryById } from '@household/web/state/category/category.selector';
import { selectProductById } from '@household/web/state/product/product.selector';
import { selectProjectById } from '@household/web/state/project/project.selector';
import { Store } from '@ngrx/store';
import { filter, Observable, take } from 'rxjs';

export type TransactionShortDetails = Account.AccountId & Transaction.Amount & Category.CategoryId & Project.ProjectId & Recipient.RecipientId & Transaction.Description & Product.ProductId & Transaction.Quantity & Transaction.InvoiceNumber & Transaction.InvoiceDate<string>;

@Component({
  selector: 'household-transaction-short-details',
  standalone: false,
  templateUrl: './transaction-short-details.component.html',
  styleUrl: './transaction-short-details.component.scss',
})
export class TransactionShortDetailsComponent implements OnInit {
  @Input() currencyAccountId: Account.Id;
  @Input() details: TransactionShortDetails;

  currencyAccount: Observable<Account.Response>;
  project: Observable<Project.Response>;
  account: Observable<Account.Response>;
  category: Observable<Category.Response>;
  product: Observable<Product.Response>;

  constructor(private store: Store) { }

  ngOnInit(): void {
    this.currencyAccount = this.store.select(selectAccountById(this.currencyAccountId)).pipe(
      filter(x => !!x),
      take(1),
    );

    this.project = this.store.select(selectProjectById(this.details.projectId)).pipe(
      filter(x => !!x),
      take(1),
    );

    this.account = this.store.select(selectAccountById(this.details.accountId)).pipe(
      filter(x => !!x),
      take(1),
    );

    this.category = this.store.select(selectCategoryById(this.details.categoryId)).pipe(
      filter(x => !!x),
      take(1),
    );

    this.product = this.store.select(selectProductById(this.details.productId)).pipe(
      filter(x => !!x),
      take(1),
    );
  }
}
