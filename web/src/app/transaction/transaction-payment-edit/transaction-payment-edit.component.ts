import { Component, DestroyRef, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Account, Category, Product, Project, Recipient } from '@household/shared/types/types';
import { selectCategories } from '@household/web/state/category/category.selector';
import { transactionApiActions } from '@household/web/state/transaction/transaction.actions';
import { Store } from '@ngrx/store';
import { Observable, withLatestFrom } from 'rxjs';

@Component({
  selector: 'household-transaction-payment-edit',
  templateUrl: './transaction-payment-edit.component.html',
  styleUrl: './transaction-payment-edit.component.scss',
  standalone: false,
})
export class TransactionPaymentEditComponent implements OnInit {
  @Input() submit: Observable<void>;

  form: FormGroup<{
    issuedAt: FormControl<Date>;
    amount: FormControl<number>;
    accountId: FormControl<Account.Id>;
    description: FormControl<string>;
    projectId: FormControl<Project.Id>;
    recipientId: FormControl<Recipient.Id>;
    categoryId: FormControl<Category.Id>;
    productId: FormControl<Product.Id>;
    quantity: FormControl<number>;
    billingStartDate: FormControl<Date>;
    billingEndDate: FormControl<Date>;
    invoiceNumber: FormControl<string>;
  }>;
  categoryType: Category.CategoryType['categoryType'];

  constructor(public activatedRoute: ActivatedRoute, private destroyRef: DestroyRef, private store: Store) {
  }

  ngOnInit(): void {
    const accountId = this.activatedRoute.snapshot.paramMap.get('accountId') as Account.Id;

    this.submit?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.form.markAllAsTouched();

      if (this.form.valid) {
        this.store.dispatch(transactionApiActions.createPaymentTransactionInitiated({
          accountId: this.form.value.accountId,
          amount: this.form.value.amount,
          description: this.form.value.description ?? undefined,
          issuedAt: this.form.value.issuedAt.toISOString(),
          categoryId: this.form.value.categoryId,
          recipientId: this.form.value.recipientId,
          projectId: this.form.value.projectId,
          productId: this.categoryType === 'inventory' ? this.form.value.productId : undefined,
          quantity: this.categoryType === 'inventory' ? this.form.value.quantity : undefined,
          billingEndDate: this.categoryType === 'invoice' ? this.form.value.billingEndDate?.toISOString().split('T')[0] : undefined,
          billingStartDate: this.categoryType === 'invoice' ? this.form.value.billingStartDate?.toISOString().split('T')[0] : undefined,
          invoiceNumber: this.categoryType === 'invoice' ? this.form.value.invoiceNumber : undefined,
          isSettled: false,
          loanAccountId: undefined,
        }));
      }
    });

    this.form = new FormGroup({
      issuedAt: new FormControl(new Date(), [Validators.required]),
      amount: new FormControl(null, [Validators.required]),
      accountId: new FormControl(accountId, [Validators.required]),
      description: new FormControl(),
      projectId: new FormControl(),
      recipientId: new FormControl(),
      categoryId: new FormControl(),
      productId: new FormControl(),
      quantity: new FormControl(),
      billingStartDate: new FormControl(),
      billingEndDate: new FormControl(),
      invoiceNumber: new FormControl(),
    });

    this.form.controls.categoryId.valueChanges.pipe(
      withLatestFrom(this.store.select(selectCategories)),
    ).subscribe(([
      categoryId,
      categories,
    ]) => {
      if (categoryId) {
        this.categoryType = categories.find(c => c.categoryId === categoryId)?.categoryType;
      } else {
        this.categoryType = 'regular';
      }
    });
  }
}
