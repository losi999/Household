import { Component, DestroyRef, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { toUndefined } from '@household/shared/common/utils';
import { Account, Project, Recipient, Category, Product, Transaction } from '@household/shared/types/types';
import { takeFirstDefined } from '@household/web/operators/take-first-defined';
import { toLoanResponse } from '@household/web/operators/to-loan-response';
import { selectAccountById } from '@household/web/state/account/account.selector';
import { selectCategories } from '@household/web/state/category/category.selector';
import { selectGroupedProducts } from '@household/web/state/product/product.selector';
import { transactionApiActions } from '@household/web/state/transaction/transaction.actions';
import { selectTransaction } from '@household/web/state/transaction/transaction.selector';
import { Store } from '@ngrx/store';
import { merge, mergeMap, Observable, withLatestFrom } from 'rxjs';

@Component({
  selector: 'household-transaction-loan-edit',
  templateUrl: './transaction-loan-edit.component.html',
  styleUrl: './transaction-loan-edit.component.scss',
  standalone: false,
})
export class TransactionLoanEditComponent implements OnInit {
  @Input() submit: Observable<void>;

  form: FormGroup<{
    issuedAt: FormControl<Date>;
    amount: FormControl<number>;
    accountId: FormControl<Account.Id>;
    loanAccountId: FormControl<Account.Id>;
    isSettled: FormControl<boolean>;
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

  account: Observable<Account.Response>;

  constructor(public activatedRoute: ActivatedRoute, private destroyRef: DestroyRef, private store: Store) {
  }

  ngOnInit(): void {
    const accountId = this.activatedRoute.snapshot.paramMap.get('accountId') as Account.Id;
    const transactionId = this.activatedRoute.snapshot.paramMap.get('transactionId') as Transaction.Id;

    this.form = new FormGroup({
      issuedAt: new FormControl(new Date(), [Validators.required]),
      amount: new FormControl(null, [Validators.required]),
      accountId: new FormControl(accountId, [Validators.required]),
      loanAccountId: new FormControl(null, [Validators.required]),
      isSettled: new FormControl(false),
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

    if (transactionId) {
      this.store.select(selectTransaction).pipe(
        takeFirstDefined(),
        toLoanResponse(),
      )
        .subscribe((transaction) => {
          this.categoryType = transaction.category?.categoryType ?? 'regular';

          this.form.patchValue({
            amount: transaction.amount,
            accountId: transaction.payingAccount.accountId,
            isSettled: transaction.isSettled,
            loanAccountId: transaction.ownerAccount?.accountId,
            billingEndDate: new Date(transaction.billingEndDate),
            billingStartDate: new Date(transaction.billingStartDate),
            categoryId: transaction.category?.categoryId,
            description: transaction.description,
            invoiceNumber: transaction.invoiceNumber,
            issuedAt: new Date(transaction.issuedAt),
            productId: transaction.product?.productId,
            projectId: transaction.project?.projectId,
            quantity: transaction.quantity,
            recipientId: transaction.recipient?.recipientId,
          }, {
            emitEvent: false,
          });

        });
    }

    this.submit?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.form.markAllAsTouched();
      const { accountId, amount, issuedAt, description, categoryId, recipientId, projectId, productId, quantity, billingEndDate, billingStartDate, invoiceNumber, isSettled, loanAccountId } = this.form.getRawValue();

      if (this.form.valid) {
        const request: Transaction.PaymentRequest = {
          accountId,
          amount,
          description: toUndefined(description),
          issuedAt: issuedAt.toISOString(),
          categoryId: toUndefined(categoryId),
          recipientId: toUndefined(recipientId),
          projectId: toUndefined(projectId),
          productId: this.categoryType === 'inventory' ? toUndefined(productId) : undefined,
          quantity: this.categoryType === 'inventory' ? toUndefined(quantity) : undefined,
          billingEndDate: this.categoryType === 'invoice' ? billingEndDate?.toISOString().split('T')[0] : undefined,
          billingStartDate: this.categoryType === 'invoice' ? billingStartDate?.toISOString().split('T')[0] : undefined,
          invoiceNumber: this.categoryType === 'invoice' ? toUndefined(invoiceNumber) : undefined,
          isSettled,
          loanAccountId,
        };

        if(transactionId) {
          this.store.dispatch(transactionApiActions.updatePaymentTransactionInitiated({
            transactionId,
            request,
          }));
        } else {
          this.store.dispatch(transactionApiActions.createPaymentTransactionInitiated(request));
        }
      }
    });

    this.account = merge(
      this.store.select(selectAccountById(accountId)).pipe(takeFirstDefined()),
      this.form.controls.accountId.valueChanges.pipe(
        mergeMap((accountId) => this.store.select(selectAccountById(accountId))),
      ),
    );

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
