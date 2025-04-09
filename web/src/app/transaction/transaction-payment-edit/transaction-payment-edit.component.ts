import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { selectCategoryOfProductId } from '@household/web/state/product/product.selector';
import { transactionApiActions } from '@household/web/state/transaction/transaction.actions';
import { Store } from '@ngrx/store';
import { createDate, toUndefined } from '@household/shared/common/utils';
import { switchMap } from 'rxjs';
import { selectTransaction } from '@household/web/state/transaction/transaction.selector';
import { takeFirstDefined } from '@household/web/operators/take-first-defined';
import { toPaymentResponse } from '@household/web/operators/to-payment-response';
import { Actions } from '@ngrx/effects';
import { selectAccountById } from '@household/web/state/account/account.selector';
import { accountApiActions } from '@household/web/state/account/account.actions';
import { categoryApiActions } from '@household/web/state/category/category.actions';
import { productApiActions } from '@household/web/state/product/product.actions';
import { projectApiActions } from '@household/web/state/project/project.actions';
import { recipientApiActions } from '@household/web/state/recipient/recipient.actions';

@Component({
  selector: 'household-transaction-payment-edit',
  templateUrl: './transaction-payment-edit.component.html',
  styleUrl: './transaction-payment-edit.component.scss',
  standalone: false,
})
export class TransactionPaymentEditComponent implements OnInit {
  form: FormGroup<{
    issuedAt: FormControl<Date>;
    amount: FormControl<number>;
    account: FormControl<Account.Response>;
    description: FormControl<string>;
    project: FormControl<Project.Response>;
    recipient: FormControl<Recipient.Response>;
    category: FormControl<Category.Response>;
    product: FormControl<Product.Response>;
    quantity: FormControl<number>;
    billingStartDate: FormControl<Date>;
    billingEndDate: FormControl<Date>;
    invoiceNumber: FormControl<string>;
  }>;

  constructor(public activatedRoute: ActivatedRoute, private destroyRef: DestroyRef, private store: Store, private actions: Actions) {
  }

  transactionId: Transaction.Id;

  ngOnInit(): void {
    const accountId = this.activatedRoute.snapshot.paramMap.get('accountId') as Account.Id;
    this.transactionId = this.activatedRoute.snapshot.paramMap.get('transactionId') as Transaction.Id;

    this.store.dispatch(accountApiActions.listAccountsInitiated());
    this.store.dispatch(categoryApiActions.listCategoriesInitiated());
    this.store.dispatch(productApiActions.listProductsInitiated());
    this.store.dispatch(projectApiActions.listProjectsInitiated());
    this.store.dispatch(recipientApiActions.listRecipientsInitiated());

    this.form = new FormGroup({
      issuedAt: new FormControl(new Date(), [Validators.required]),
      amount: new FormControl(null, [ Validators.required]),
      account: new FormControl(null, [Validators.required]),
      description: new FormControl(),
      project: new FormControl(),
      recipient: new FormControl(),
      category: new FormControl(),
      product: new FormControl(),
      quantity: new FormControl(),
      billingStartDate: new FormControl(),
      billingEndDate: new FormControl(),
      invoiceNumber: new FormControl(),
    });

    if (this.transactionId) {
      this.store.dispatch(transactionApiActions.getTransactionInitiated({
        accountId,
        transactionId: this.transactionId,
      }));

      this.store.select(selectTransaction).pipe(
        takeFirstDefined(),
        toPaymentResponse(),
      )
        .subscribe((transaction) => {
          this.form.patchValue({
            amount: transaction.amount,
            account: transaction.account,
            billingEndDate: createDate(transaction.billingEndDate),
            billingStartDate: createDate(transaction.billingStartDate),
            category: transaction.category,
            description: transaction.description,
            invoiceNumber: transaction.invoiceNumber,
            issuedAt: new Date(transaction.issuedAt),
            project: transaction.project,
            product: transaction.product,
            quantity: transaction.product ? transaction.quantity : null,
            recipient: transaction.recipient,
          });
        });
    } else {
      this.store.select(selectAccountById(accountId)).pipe(takeFirstDefined())
        .subscribe((account) => {
          this.form.patchValue({
            account,
          });
        });
    }

    this.form.controls.product.valueChanges.pipe(
      switchMap((product) => this.store.select(selectCategoryOfProductId(product?.productId))),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((category) => {
      if (category) {
        if (this.form.value.category?.categoryId !== category.categoryId) {
          this.form.patchValue({
            category,
          });
        }
        this.form.controls.quantity.addValidators(Validators.required);
      } else {
        this.form.controls.quantity.removeValidators(Validators.required);
        this.form.controls.quantity.reset();
      }
    });

    this.form.controls.category.valueChanges.subscribe((category) => {
      if (category?.categoryType !== 'inventory') {
        this.form.controls.product.reset();
        this.form.controls.quantity.reset();
      }

      if (category?.categoryType !== 'invoice') {
        this.form.controls.billingEndDate.reset();
        this.form.controls.billingStartDate.reset();
        this.form.controls.invoiceNumber.reset();
      }
    });
  }

  save() {
    this.form.markAllAsTouched();

    console.log(this.form);

    if (this.form.valid) {
      const { account, amount, issuedAt, description, category, recipient, project, product, quantity, billingEndDate, billingStartDate, invoiceNumber } = this.form.getRawValue();

      const request: Transaction.PaymentRequest = {
        accountId: account.accountId,
        amount,
        description: toUndefined(description),
        issuedAt: issuedAt.toISOString(),
        categoryId: category?.categoryId,
        recipientId: recipient?.recipientId,
        projectId: project?.projectId,
        ...(category?.categoryType === 'inventory' ? {
          productId: product?.productId,
          quantity: toUndefined(quantity),
        } : {
          productId: undefined,
          quantity: undefined,
        }),
        ...(category?.categoryType === 'invoice') ? {
          billingStartDate: billingStartDate ? new Date(billingStartDate.getTime() - billingStartDate.getTimezoneOffset() * 60000).toISOString()
            .split('T')[0] : undefined,
          billingEndDate: billingEndDate ? new Date(billingEndDate.getTime() - billingEndDate.getTimezoneOffset() * 60000).toISOString()
            .split('T')[0] : undefined,
          invoiceNumber: toUndefined(invoiceNumber),
        } : {
          billingEndDate: undefined,
          billingStartDate: undefined,
          invoiceNumber: undefined,
        },
        isSettled: false,
        loanAccountId: undefined,
      };

      if (this.transactionId) {
        this.store.dispatch(transactionApiActions.updatePaymentTransactionInitiated({
          transactionId: this.transactionId,
          request,
        }));
      } else {
        this.store.dispatch(transactionApiActions.createPaymentTransactionInitiated(request));
      }
    }
  }
}
