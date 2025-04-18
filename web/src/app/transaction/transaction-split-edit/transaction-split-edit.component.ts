import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { createDate, toUndefined } from '@household/shared/common/utils';
import { Account, Project, Recipient, Category, Product, Transaction } from '@household/shared/types/types';
import { takeFirstDefined } from '@household/web/operators/take-first-defined';
import { toSplitResponse } from '@household/web/operators/to-split-response';
import { selectAccountById } from '@household/web/state/account/account.selector';
import { selectCategoryOfProductId } from '@household/web/state/product/product.selector';
import { transactionApiActions } from '@household/web/state/transaction/transaction.actions';
import { selectTransaction } from '@household/web/state/transaction/transaction.selector';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { switchMap } from 'rxjs';
import { isDeferredTransactionResponse } from '@household/shared/common/type-guards';
import { accountApiActions } from '@household/web/state/account/account.actions';
import { categoryApiActions } from '@household/web/state/category/category.actions';
import { productApiActions } from '@household/web/state/product/product.actions';
import { projectApiActions } from '@household/web/state/project/project.actions';
import { recipientApiActions } from '@household/web/state/recipient/recipient.actions';

type SplitFormGroup = FormGroup<{
  amount: FormControl<number>;
  description: FormControl<string>;
  project: FormControl<Project.Response>;
  category: FormControl<Category.Response>;
  product: FormControl<Product.Response>;
  quantity: FormControl<number>;
  billingStartDate: FormControl<Date>;
  billingEndDate: FormControl<Date>;
  invoiceNumber: FormControl<string>;
  loanAccount: FormControl<Account.Response>;
  isSettled: FormControl<boolean>;
  isSaved: FormControl<boolean>;
  transactionId: FormControl<Transaction.Id>;
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
    account: FormControl<Account.Response>;
    description: FormControl<string>;
    recipient: FormControl<Recipient.Response>;
    splits: FormArray<SplitFormGroup>
  }>;

  showErrors = false;

  private splitsBackup = [];

  get isAllSplitSaved() {
    return this.form?.value.splits.every(s => s.isSaved);
  }

  constructor(public activatedRoute: ActivatedRoute, private destroyRef: DestroyRef, private store: Store, private actions: Actions) { }

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
      description: new FormControl(),
      recipient: new FormControl(),
      splits: new FormArray([], [
        Validators.required,
        Validators.minLength(2),
        (array) => {
          return array.value.every(s => s.isSaved) ? null : {
            pendingSplit: true,
          };
        },
      ]),
    },
    [
      (group) => {
        const sum = group.value.splits.reduce((accumulator, currentValue) => accumulator + currentValue.amount, 0);
        return !group.value.amount || sum === group.value.amount ? null : {
          sumOfSplits: true,
        };
      },
    ]);

    if (this.transactionId) {
      this.store.dispatch(transactionApiActions.getTransactionInitiated({
        accountId,
        transactionId: this.transactionId,
      }));

      this.store.select(selectTransaction).pipe(
        takeFirstDefined(),
        toSplitResponse(),
      )
        .subscribe((transaction) => {
          this.form.patchValue({
            amount: transaction.amount,
            account: transaction.account,
            description: transaction.description,
            issuedAt: new Date(transaction.issuedAt),
            recipient: transaction.recipient,
          }, {
            emitEvent: false,
          });

          transaction.splits.forEach((s) => {
            this.form.controls.splits.push(this.createSplitForm(s));
          });

          transaction.deferredSplits.forEach((s) => {
            this.form.controls.splits.push(this.createSplitForm(s));
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
  }

  saveSplit(splitGroup: SplitFormGroup) {
    splitGroup.markAllAsTouched();
    if (splitGroup.valid) {
      splitGroup.patchValue({
        isSaved: true,
      });
    }
  }

  private createSplitForm(splitResponse?: Transaction.SplitResponseItem | Transaction.DeferredResponse) {
    const sum = this.form.value.splits.reduce((accumulator, currentValue) => {
      return currentValue.isSaved ? accumulator + currentValue.amount : accumulator;
    }, 0);
    const split: SplitFormGroup = new FormGroup({
      amount: new FormControl(splitResponse?.amount ?? (this.form.value.amount - sum || null), [Validators.required]),
      description: new FormControl(splitResponse?.description),
      project: new FormControl(splitResponse?.project),
      category: new FormControl(splitResponse?.category),
      product: new FormControl(splitResponse?.product),
      quantity: new FormControl(splitResponse?.quantity),
      billingStartDate: new FormControl(createDate(splitResponse?.billingStartDate)),
      billingEndDate: new FormControl(createDate(splitResponse?.billingEndDate)),
      invoiceNumber: new FormControl(splitResponse?.invoiceNumber),
      loanAccount: new FormControl(isDeferredTransactionResponse(splitResponse) ? splitResponse.ownerAccount : null),
      isSettled: new FormControl(isDeferredTransactionResponse(splitResponse) ? splitResponse.isSettled : false),
      transactionId: new FormControl(isDeferredTransactionResponse(splitResponse) ? splitResponse.transactionId : null),
      isSaved: new FormControl(!!splitResponse),
    });

    split.controls.product.valueChanges.pipe(
      switchMap((product) => this.store.select(selectCategoryOfProductId(product?.productId))),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((category) => {
      if (category) {
        if (split.value.category?.categoryId !== category.categoryId) {
          split.patchValue({
            category,
          });
        }
        split.controls.quantity.addValidators(Validators.required);
      } else {
        split.controls.quantity.removeValidators(Validators.required);
        split.controls.quantity.reset();
      }
    });

    split.controls.category.valueChanges.subscribe((category) => {
      if (category?.categoryType !== 'inventory') {
        split.controls.product.reset();
        split.controls.quantity.reset();
      }

      if (category?.categoryType !== 'invoice') {
        split.controls.billingEndDate.reset();
        split.controls.billingStartDate.reset();
        split.controls.invoiceNumber.reset();
      }
    });

    return split;
  }

  addNewSplit() {
    this.form.controls.splits.push(this.createSplitForm());
  }

  editSplit(splitGroup: SplitFormGroup, index: number) {
    this.splitsBackup[index] = splitGroup.getRawValue();
    splitGroup.patchValue({
      isSaved: false,
    });
  }

  cancelSplit(splitGroup: SplitFormGroup, index: number) {
    const splitToRestore = this.splitsBackup[index];
    if (splitToRestore) {
      splitGroup.patchValue(splitToRestore);
      this.splitsBackup.splice(index, 1);
    } else {
      this.deleteSplit(index);
    }
  }

  deleteSplit(index: number) {
    this.form.controls.splits.removeAt(index);
  }

  save() {
    this.form.markAllAsTouched();

    console.log(this.form);

    if (this.form.valid) {
      const { account, amount, issuedAt, description, recipient, splits } = this.form.getRawValue();

      const request: Transaction.SplitRequest = {
        accountId: account.accountId,
        amount,
        description: toUndefined(description),
        issuedAt: issuedAt.toISOString(),
        recipientId: recipient?.recipientId,
        loans: splits.filter(s => s.loanAccount).map(s => ({
          amount: s.amount,
          categoryId: s.category?.categoryId,
          projectId: s.project?.projectId,
          loanAccountId: s.loanAccount?.accountId,
          isSettled: s.isSettled,
          description: toUndefined(s.description),
          transactionId: toUndefined(s.transactionId), // TODO
          ...(s.category?.categoryType === 'invoice') ? {
            billingStartDate: s.billingStartDate ? new Date(s.billingStartDate.getTime() - s.billingStartDate.getTimezoneOffset() * 60000).toISOString()
              .split('T')[0] : undefined,
            billingEndDate: s.billingEndDate ? new Date(s.billingEndDate.getTime() - s.billingEndDate.getTimezoneOffset() * 60000).toISOString()
              .split('T')[0] : undefined,
            invoiceNumber: toUndefined(s.invoiceNumber),
          } : {
            billingEndDate: undefined,
            billingStartDate: undefined,
            invoiceNumber: undefined,
          },
          ...(s.category?.categoryType === 'inventory' ? {
            productId: s.product?.productId,
            quantity: toUndefined(s.quantity),
          } : {
            productId: undefined,
            quantity: undefined,
          }),
        })),
        splits: splits.filter(s => !s.loanAccount).map(s => ({
          amount: s.amount,
          categoryId: s.category?.categoryId,
          projectId: s.project?.projectId,
          description: toUndefined(s.description),
          transactionId: toUndefined(s.transactionId),
          ...(s.category?.categoryType === 'invoice') ? {
            billingStartDate: s.billingStartDate ? new Date(s.billingStartDate.getTime() - s.billingStartDate.getTimezoneOffset() * 60000).toISOString()
              .split('T')[0] : undefined,
            billingEndDate: s.billingEndDate ? new Date(s.billingEndDate.getTime() - s.billingEndDate.getTimezoneOffset() * 60000).toISOString()
              .split('T')[0] : undefined,
            invoiceNumber: toUndefined(s.invoiceNumber),
          } : {
            billingEndDate: undefined,
            billingStartDate: undefined,
            invoiceNumber: undefined,
          },
          ...(s.category?.categoryType === 'inventory' ? {
            productId: s.product?.productId,
            quantity: toUndefined(s.quantity),
          } : {
            productId: undefined,
            quantity: undefined,
          }),
        })),
      };

      if (this.transactionId) {
        this.store.dispatch(transactionApiActions.updateSplitTransactionInitiated({
          transactionId: this.transactionId,
          request,
        }));
      } else {
        this.store.dispatch(transactionApiActions.createSplitTransactionInitiated(request));
      }
    }
    this.showErrors = true;
  }
}
