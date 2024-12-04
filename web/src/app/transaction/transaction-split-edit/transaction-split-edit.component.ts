import { Component, DestroyRef, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { toUndefined } from '@household/shared/common/utils';
import { Account, Project, Recipient, Category, Product, Transaction } from '@household/shared/types/types';
import { takeFirstDefined } from '@household/web/operators/take-first-defined';
import { toSplitResponse } from '@household/web/operators/to-split-response';
import { selectCategories } from '@household/web/state/category/category.selector';
import { selectGroupedProducts } from '@household/web/state/product/product.selector';
import { transactionApiActions } from '@household/web/state/transaction/transaction.actions';
import { selectTransaction } from '@household/web/state/transaction/transaction.selector';
import { Store } from '@ngrx/store';
import { Observable, withLatestFrom } from 'rxjs';

@Component({
  selector: 'household-transaction-split-edit',
  templateUrl: './transaction-split-edit.component.html',
  styleUrl: './transaction-split-edit.component.scss',
  standalone: false,
})
export class TransactionSplitEditComponent implements OnInit {
  @Input() submit: Observable<void>;

  form: FormGroup<{
    issuedAt: FormControl<Date>;
    amount: FormControl<number>;
    accountId: FormControl<Account.Id>;
    description: FormControl<string>;
    recipientId: FormControl<Recipient.Id>;
  }>;

  split: FormGroup<{
    amount: FormControl<number>;
    description: FormControl<string>;
    projectId: FormControl<Project.Id>;
    categoryId: FormControl<Category.Id>;
    productId: FormControl<Product.Id>;
    quantity: FormControl<number>;
    billingStartDate: FormControl<Date>;
    billingEndDate: FormControl<Date>;
    invoiceNumber: FormControl<string>;
    loanAccountId: FormControl<Account.Id>;
    isSettled: FormControl<boolean>;
  }>;
  categoryType: Category.CategoryType['categoryType'];

  private editingSplit: {
    split: Transaction.SplitRequestItem;
    index: number;
  };

  splits: Transaction.SplitRequestItem[] = [ ];
  get sumOfSplits() {
    return this.splits?.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.amount;
    }, 0);
  }

  constructor(public activatedRoute: ActivatedRoute, private destroyRef: DestroyRef, private store: Store) { }

  ngOnInit(): void {
    const accountId = this.activatedRoute.snapshot.paramMap.get('accountId') as Account.Id;
    const transactionId = this.activatedRoute.snapshot.paramMap.get('transactionId') as Transaction.Id;

    this.form = new FormGroup({
      issuedAt: new FormControl(new Date(), [Validators.required]),
      amount: new FormControl(null, [Validators.required]),
      accountId: new FormControl(accountId, [Validators.required]),
      description: new FormControl(),
      recipientId: new FormControl(),
    });

    if (transactionId) {
      this.store.select(selectTransaction).pipe(
        takeFirstDefined(),
        toSplitResponse(),
      )
        .subscribe((transaction) => {

          this.form.patchValue({
            amount: transaction.amount,
            accountId: transaction.account.accountId,
            description: transaction.description,
            issuedAt: new Date(transaction.issuedAt),
            recipientId: transaction.recipient?.recipientId,
          }, {
            emitEvent: false,
          });
        });
    }

    this.submit?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.form.markAllAsTouched();

      if (this.form.valid) {
        const { accountId, amount, issuedAt, description, recipientId } = this.form.getRawValue();

        const request: Transaction.SplitRequest = {
          accountId,
          amount,
          description: toUndefined(description),
          issuedAt: issuedAt.toISOString(),
          recipientId: toUndefined(recipientId),
          splits: this.splits,
        };

        if (transactionId) {
          this.store.dispatch(transactionApiActions.updateSplitTransactionInitiated({
            transactionId,
            request,
          }));
        } else {
          this.store.dispatch(transactionApiActions.createSplitTransactionInitiated(request));
        }
      }
    });
  }

  private createSplitForm(split?: Transaction.SplitRequestItem) {
    this.split = new FormGroup({
      amount: new FormControl(split?.amount ?? this.form.value.amount - this.sumOfSplits, [Validators.required]),
      description: new FormControl(split?.description),
      projectId: new FormControl(split?.projectId),
      categoryId: new FormControl(split?.categoryId),
      productId: new FormControl(split?.productId),
      quantity: new FormControl(split?.quantity),
      billingStartDate: new FormControl(new Date(split?.billingStartDate)),
      billingEndDate: new FormControl(new Date(split?.billingEndDate)),
      invoiceNumber: new FormControl(split?.invoiceNumber),
      loanAccountId: new FormControl(split?.loanAccountId),
      isSettled: new FormControl(split?.isSettled),
    });

    this.split.controls.productId.valueChanges.pipe(withLatestFrom(this.store.select(selectGroupedProducts))).subscribe(([
      productId,
      groupedProducts,
    ]) => {
      if (productId) {
        const categoryId = groupedProducts.find(g => g.products.some(p => p.productId === productId)).categoryId;
        if (this.split.value.categoryId !== categoryId) {
          this.split.patchValue({
            categoryId,
          });
        }
      }
    });

    this.split.controls.categoryId.valueChanges.pipe(
      withLatestFrom(this.store.select(selectCategories)),
    ).subscribe(([
      categoryId,
      categories,
    ]) => {
      if (categoryId) {
        this.categoryType = categories.find(c => c.categoryId === categoryId)?.categoryType;
      } else {
        this.categoryType = 'regular';
        this.split.patchValue({
          productId: null,
          quantity: 0,
        });
      }
    });
  }

  addNewSplit() {
    if (this.split) {
      if (this.split.valid) {
        const { amount, billingEndDate, billingStartDate, categoryId, description, invoiceNumber, productId, projectId, quantity, isSettled, loanAccountId } = this.split.getRawValue();

        const newSplitItem: Transaction.SplitRequestItem = {
          amount,
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
          categoryId: toUndefined(categoryId),
          description: toUndefined(description),
          isSettled: toUndefined(isSettled),
          loanAccountId: toUndefined(loanAccountId),
          projectId: toUndefined(projectId),
        };

        if (this.editingSplit) {
          this.splits.splice(this.editingSplit.index, 0, newSplitItem);

          this.editingSplit = null;
        } else {
          this.splits.push(newSplitItem);

        }

        if (this.sumOfSplits !== this.form.value.amount) {
          this.split.reset({
            amount: this.form.value.amount - this.sumOfSplits,
          });
        } else {
          this.split = undefined;
        }
      }
      return;
    }

    this.createSplitForm();
  }

  cancelSplit() {
    if (this.editingSplit) {
      this.splits.splice(this.editingSplit.index, 0, this.editingSplit.split);

      this.editingSplit = null;
    }

    this.split = null;
  }

  editSplit(index: number) {
    const split = this.splits.splice(index, 1)[0];

    this.editingSplit = {
      split,
      index,
    };

    this.createSplitForm(this.editingSplit.split);
  }

  deleteSplit(index: number) {
    this.splits.splice(index, 1);
  }
}
