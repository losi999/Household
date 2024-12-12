import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { toUndefined } from '@household/shared/common/utils';
import { Account, Project, Recipient, Category, Product, Transaction } from '@household/shared/types/types';
import { takeFirstDefined } from '@household/web/operators/take-first-defined';
import { toLoanResponse } from '@household/web/operators/to-loan-response';
import { selectAccountById } from '@household/web/state/account/account.selector';
import { selectCategoryById } from '@household/web/state/category/category.selector';
import { messageActions } from '@household/web/state/message/message.actions';
import { selectCategoryIdOfProductId } from '@household/web/state/product/product.selector';
import { transactionApiActions } from '@household/web/state/transaction/transaction.actions';
import { selectTransaction } from '@household/web/state/transaction/transaction.selector';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { startWith, switchMap } from 'rxjs';

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
  currency: string;
  isDeferred: boolean;

  constructor(public activatedRoute: ActivatedRoute, private destroyRef: DestroyRef, private store: Store, private actions: Actions) {
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
            quantity: transaction.product ? transaction.quantity : null,
            recipientId: transaction.recipient?.recipientId,
          });
        });
    }

    this.actions.pipe(
      ofType(messageActions.submitTransactionEditForm),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      this.form.markAllAsTouched();

      console.log(this.form);

      if (this.form.valid) {
        const { accountId, amount, issuedAt, description, categoryId, recipientId, projectId, productId, quantity, billingEndDate, billingStartDate, invoiceNumber, isSettled, loanAccountId } = this.form.getRawValue();

        const request: Transaction.PaymentRequest = {
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

    this.form.controls.accountId.valueChanges.pipe(
      startWith(accountId),
      switchMap((accountId) => this.store.select(selectAccountById(accountId))),
      takeUntilDestroyed(this.destroyRef),
    )
      .subscribe((account) => {
        this.currency = account?.currency;
        this.isDeferred = account?.accountType !== 'loan';
      });

    this.form.controls.productId.valueChanges.pipe(
      switchMap((productId) => this.store.select(selectCategoryIdOfProductId(productId))),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((categoryId) => {
      if (categoryId) {
        if (this.form.value.categoryId !== categoryId) {
          this.form.patchValue({
            categoryId,
          });
        }
        this.form.controls.quantity.addValidators(Validators.required);
      } else {
        this.form.controls.quantity.removeValidators(Validators.required);
        this.form.controls.quantity.reset();
      }
    });

    this.form.controls.categoryId.valueChanges.pipe(
      switchMap((categoryId) => this.store.select(selectCategoryById(categoryId))),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((category) => {
      if (category) {
        this.categoryType = category.categoryType;
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
