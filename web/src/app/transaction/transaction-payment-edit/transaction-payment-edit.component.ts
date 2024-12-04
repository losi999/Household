import { Component, DestroyRef, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Account, Category, Product, Project, Recipient } from '@household/shared/types/types';
import { selectCategories } from '@household/web/state/category/category.selector';
import { selectGroupedProducts } from '@household/web/state/product/product.selector';
import { transactionApiActions } from '@household/web/state/transaction/transaction.actions';
import { Store } from '@ngrx/store';
import { toUndefined } from '@household/shared/common/utils';
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
      console.log(this.form);

      if (this.form.valid) {
        const { accountId, amount, issuedAt, description, categoryId, recipientId, projectId, productId, quantity, billingEndDate, billingStartDate, invoiceNumber } = this.form.getRawValue();

        this.store.dispatch(transactionApiActions.createPaymentTransactionInitiated({
          accountId,
          amount,
          description: toUndefined(description),
          issuedAt: issuedAt.toISOString(),
          categoryId: toUndefined(categoryId),
          recipientId: toUndefined(recipientId),
          projectId: toUndefined(projectId),
          ...(this.categoryType === 'inventory' ? {
            productId: toUndefined(productId),
            quantity: toUndefined(quantity),
          } : {
            productId: undefined,
            quantity: undefined,
          }),
          ...(this.categoryType === 'invoice') ? {
            billingStartDate: new Date(billingStartDate.getTime() - billingStartDate.getTimezoneOffset() * 60000).toISOString()
              .split('T')[0],
            billingEndDate: new Date(billingEndDate.getTime() - billingEndDate.getTimezoneOffset() * 60000).toISOString()
              .split('T')[0],
            invoiceNumber: toUndefined(invoiceNumber),
          } : {
            billingEndDate: undefined,
            billingStartDate: undefined,
            invoiceNumber: undefined,
          },
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

    this.form.controls.productId.valueChanges.pipe(withLatestFrom(this.store.select(selectGroupedProducts))).subscribe(([
      productId,
      groupedProducts,
    ]) => {
      if (productId) {
        const categoryId = groupedProducts.find(g => g.products.some(p => p.productId === productId)).categoryId;
        if (this.form.value.categoryId !== categoryId) {
          this.form.patchValue({
            categoryId,
          });
        }
      }
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
        this.form.patchValue({
          productId: null,
          quantity: 0,
        });
      }
    });
  }
}
