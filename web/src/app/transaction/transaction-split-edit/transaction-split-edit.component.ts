import { Component, DestroyRef, isStandalone, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormControl, Validators, ValidatorFn, FormArray } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { toUndefined } from '@household/shared/common/utils';
import { Account, Project, Recipient, Category, Product, Transaction } from '@household/shared/types/types';
import { takeFirstDefined } from '@household/web/operators/take-first-defined';
import { toSplitResponse } from '@household/web/operators/to-split-response';
import { selectAccountById } from '@household/web/state/account/account.selector';
import { selectCategoryById } from '@household/web/state/category/category.selector';
import { messageActions } from '@household/web/state/message/message.actions';
import { selectCategoryIdOfProductId } from '@household/web/state/product/product.selector';
import { transactionApiActions } from '@household/web/state/transaction/transaction.actions';
import { selectTransaction } from '@household/web/state/transaction/transaction.selector';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { startWith, switchMap } from 'rxjs';

type SplitFormGroup = FormGroup<{
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
  isSaved: FormControl<boolean>;
}>;

@Component({
  selector: 'household-transaction-split-edit',
  templateUrl: './transaction-split-edit.component.html',
  styleUrl: './transaction-split-edit.component.scss',
  standalone: false,
})
export class TransactionSplitEditComponent implements OnInit {
  form: FormGroup<{
    issuedAt: FormControl<Date>;
    amount: FormControl<number>;
    accountId: FormControl<Account.Id>;
    description: FormControl<string>;
    recipientId: FormControl<Recipient.Id>;
    splits: FormArray<SplitFormGroup>
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
  currency: string;

  get sumOfSavedSplits() {
    return this.form?.value.splits?.reduce((accumulator, currentValue) => {
      return currentValue.isSaved ? accumulator + currentValue.amount : accumulator;
    }, 0);
  }

  get sumOfSplits() {
    return this.form?.value.splits?.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.amount;
    }, 0);
  }

  get isAllSplitSaved() {
    return this.form?.value.splits.every(s => s.isSaved);
  }

  constructor(public activatedRoute: ActivatedRoute, private destroyRef: DestroyRef, private store: Store, private actions: Actions) { }

  ngOnInit(): void {
    const accountId = this.activatedRoute.snapshot.paramMap.get('accountId') as Account.Id;
    const transactionId = this.activatedRoute.snapshot.paramMap.get('transactionId') as Transaction.Id;

    this.form = new FormGroup({
      issuedAt: new FormControl(new Date(), [Validators.required]),
      amount: new FormControl(null, [Validators.required]),
      accountId: new FormControl(accountId, [Validators.required]),
      description: new FormControl(),
      recipientId: new FormControl(),
      splits: new FormArray([], [
        Validators.required,
        Validators.minLength(2),
        (array) => {
          return array.value.every(s => s.isSaved) ? null : {
            pendingSplit: true,
          };
        },
        (array) => {
          const sum = array.value.reduce((accumulator, currentValue) => accumulator + currentValue.amount, 0);
          return !this.form?.value.amount || sum === this.form.value.amount ? null : {
            sumOfSplits: true,
          };
        },
      ]),
    });

    if (transactionId) {
      this.store.select(selectTransaction).pipe(
        takeFirstDefined(),
        toSplitResponse(),
      )
        .subscribe((transaction) => {
          console.log(transaction);

          // this.splits = [
          //   ...transaction.splits.map<Transaction.SplitRequestItem>(s => ({
          //     amount: s.amount,
          //     billingEndDate: s.billingEndDate,
          //     billingStartDate: s.billingStartDate,
          //     categoryId: s.category?.categoryId,
          //     description: s.description,
          //     invoiceNumber: s.invoiceNumber,
          //     isSettled: undefined,
          //     loanAccountId: undefined,
          //     productId: s.product?.productId,
          //     projectId: s.project?.projectId,
          //     quantity: s.quantity,
          //   })),
          //   ...transaction.deferredSplits.map<Transaction.SplitRequestItem>(s => ({
          //     amount: s.amount,
          //     billingEndDate: s.billingEndDate,
          //     billingStartDate: s.billingStartDate,
          //     categoryId: s.category?.categoryId,
          //     description: s.description,
          //     invoiceNumber: s.invoiceNumber,
          //     isSettled: s.isSettled,
          //     loanAccountId: s.ownerAccount.accountId,
          //     productId: s.product?.productId,
          //     projectId: s.project?.projectId,
          //     quantity: s.quantity,
          //   })),
          // ];

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

    this.actions.pipe(
      ofType(messageActions.submitTransactionEditForm),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      this.form.markAllAsTouched();
      console.log(this.form);
      console.log(this.form.valid);
      if (this.form.valid) {
        const { accountId, amount, issuedAt, description, recipientId, splits } = this.form.getRawValue();

        const request: Transaction.SplitRequest = {
          accountId,
          amount,
          description: toUndefined(description),
          issuedAt: issuedAt.toISOString(),
          recipientId: toUndefined(recipientId),
          splits: splits.map(s => ({
            amount: s.amount,
            categoryId: toUndefined(s.categoryId),
            projectId: toUndefined(s.projectId),
            loanAccountId: toUndefined(s.loanAccountId),
            isSettled: s.isSettled,
            description: s.description,
            invoiceNumber: s.invoiceNumber,
            billingEndDate: s.billingEndDate.toISOString(),
            billingStartDate: s.billingStartDate.toISOString(),
            productId: s.productId,
            quantity: s.quantity,
          })),
          // splits: this.splits,
        };

        console.log(request);

        return;
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

    this.form.controls.accountId.valueChanges.pipe(
      startWith(accountId),
      switchMap((accountId) => this.store.select(selectAccountById(accountId))),
      takeUntilDestroyed(this.destroyRef),
    )
      .subscribe((account) => {
        this.currency = account?.currency;
      });
  }

  saveSplit(splitGroup: SplitFormGroup) {
    splitGroup.markAllAsTouched();

    if (splitGroup.valid) {
      splitGroup.patchValue({
        isSaved: true,
      });
    }
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

    this.split.controls.productId.valueChanges.pipe(
      switchMap((productId) => this.store.select(selectCategoryIdOfProductId(productId))),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((categoryId) => {
      if (categoryId) {
        if (this.split.value.categoryId !== categoryId) {
          this.split.patchValue({
            categoryId,
          });
        }
        this.split.controls.quantity.addValidators(Validators.required);
      } else {
        this.split.controls.quantity.removeValidators(Validators.required);
        this.split.controls.quantity.reset();
      }
    });

    this.split.controls.categoryId.valueChanges.pipe(
      switchMap((categoryId) => this.store.select(selectCategoryById(categoryId))),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((category) => {
      if (category) {
        this.categoryType = category.categoryType;
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
    this.form.controls.splits.push(new FormGroup({
      amount: new FormControl(this.form.value.amount - this.sumOfSavedSplits, [Validators.required]),
      description: new FormControl(),
      projectId: new FormControl(),
      categoryId: new FormControl(),
      productId: new FormControl(),
      quantity: new FormControl(),
      billingStartDate: new FormControl(),
      billingEndDate: new FormControl(),
      invoiceNumber: new FormControl(),
      loanAccountId: new FormControl(),
      isSettled: new FormControl(),
      isSaved: new FormControl(false),
    }));
  }

  cancelSplit(index: number) {
    this.form.controls.splits.removeAt(index);
  }

  editSplit(splitGroup: SplitFormGroup) {
    splitGroup.patchValue({
      isSaved: false,
    });
  }

  deleteSplit(index: number) {
    this.form.controls.splits.removeAt(index);
  }
}
