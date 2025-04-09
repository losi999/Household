import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { createDate, toUndefined } from '@household/shared/common/utils';
import { Account, Project, Recipient, Category, Product, Transaction } from '@household/shared/types/types';
import { takeFirstDefined } from '@household/web/operators/take-first-defined';
import { toLoanResponse } from '@household/web/operators/to-loan-response';
import { accountApiActions } from '@household/web/state/account/account.actions';
import { selectAccountById } from '@household/web/state/account/account.selector';
import { categoryApiActions } from '@household/web/state/category/category.actions';
import { productApiActions } from '@household/web/state/product/product.actions';
import { selectCategoryOfProductId } from '@household/web/state/product/product.selector';
import { projectApiActions } from '@household/web/state/project/project.actions';
import { recipientApiActions } from '@household/web/state/recipient/recipient.actions';
import { transactionApiActions } from '@household/web/state/transaction/transaction.actions';
import { selectTransaction } from '@household/web/state/transaction/transaction.selector';
import { Store } from '@ngrx/store';
import { switchMap } from 'rxjs';

@Component({
  selector: 'household-transaction-loan-edit',
  templateUrl: './transaction-loan-edit.component.html',
  styleUrl: './transaction-loan-edit.component.scss',
  standalone: false,
})
export class TransactionLoanEditComponent implements OnInit {
  form: FormGroup<{
    issuedAt: FormControl<Date>;
    amount: FormControl<number>;
    account: FormControl<Account.Response>;
    loanAccount: FormControl<Account.Response>;
    isSettled: FormControl<boolean>;
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

  constructor(public activatedRoute: ActivatedRoute, private destroyRef: DestroyRef, private store: Store) {
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
      amount: new FormControl(null, [Validators.required]),
      account: new FormControl(null, [Validators.required]),
      loanAccount: new FormControl(null, [Validators.required]),
      isSettled: new FormControl(false),
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
        toLoanResponse(),
      )
        .subscribe((transaction) => {
          this.form.patchValue({
            amount: transaction.amount,
            account: transaction.payingAccount,
            isSettled: transaction.isSettled,
            loanAccount: transaction.ownerAccount,
            billingEndDate: createDate(transaction.billingEndDate),
            billingStartDate: createDate(transaction.billingStartDate),
            category: transaction.category,
            description: transaction.description,
            invoiceNumber: transaction.invoiceNumber,
            issuedAt: new Date(transaction.issuedAt),
            product: transaction.product,
            project: transaction.project,
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
        if (this.form.value.category?.categoryId !== category?.categoryId) {
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
    console.log('submit loan');
    this.form.markAllAsTouched();

    console.log(this.form);

    if (this.form.valid) {
      const { account, amount, issuedAt, description, category, recipient, project, product, quantity, billingEndDate, billingStartDate, invoiceNumber, isSettled, loanAccount } = this.form.getRawValue();

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
        isSettled,
        loanAccountId: loanAccount?.accountId,
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
