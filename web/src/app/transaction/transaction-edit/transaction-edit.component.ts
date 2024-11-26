import { Component, HostListener, OnDestroy, OnInit, OnChanges, SimpleChanges, AfterViewChecked, AfterViewInit, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { TransactionService } from '@household/web/services/transaction.service';
import { isInventoryCategory, isInvoiceCategory } from '@household/shared/common/type-guards';
import { DialogService } from '@household/web/app/shared/dialog.service';
import { Observable, skip, Subject, take, takeUntil, tap } from 'rxjs';
import { Dictionary } from '@household/shared/types/common';
import { selectProjects } from '@household/web/state/project/project.selector';
import { projectApiActions } from '@household/web/state/project/project.actions';
import { selectRecipients } from '@household/web/state/recipient/recipient.selector';
import { recipientApiActions } from '@household/web/state/recipient/recipient.actions';
import { Store } from '@ngrx/store';
import { selectCategories } from '@household/web/state/category/category.selector';
import { selectAccounts } from '@household/web/state/account/account.selector';
import { accountApiActions } from '@household/web/state/account/account.actions';
import { categoryApiActions } from '@household/web/state/category/category.actions';
import { productApiActions } from '@household/web/state/product/product.actions';
import { transactionApiActions } from '@household/web/state/transaction/transaction.actions';
import { selectIsInProgress } from '@household/web/state/progress/progress.selector';
import { selectDeferredTransactionList, selectTransaction } from '@household/web/state/transaction/transaction.selector';

type SplitFormGroup = FormGroup<{
  category: FormControl<Category.Response>;
  amount: FormControl<number>;
  description: FormControl<string>;
  project: FormControl<Project.Response>;
  inventory: FormControl<Transaction.Quantity & Transaction.Product<Product.Response>>;
  invoice: FormControl<Transaction.InvoiceNumber & Transaction.InvoiceDate<string>>;
  loanAccount: FormControl<Account.Response>;
  isSettled: FormControl<boolean>;
}>;

@Component({
  selector: 'household-transaction-edit',
  templateUrl: './transaction-edit.component.html',
  styleUrls: ['./transaction-edit.component.scss'],
  standalone: false,
})
export class TransactionEditComponent implements OnInit {
  // form: FormGroup<{
  //   issuedAt: FormControl<Date>;
  //   amount: FormControl<number>;
  //   account: FormControl<Account.Response>;
  //   loanAccount: FormControl<Account.Response>;
  //   isSettled: FormControl<boolean>;
  //   isTransfer: FormControl<boolean>;
  //   description: FormControl<string>;
  //   transferAccount: FormControl<Account.Response>;
  //   transferAmount: FormControl<number>;
  //   project: FormControl<Project.Response>;
  //   recipient: FormControl<Recipient.Response>;
  //   category: FormControl<Category.Response>;
  //   inventory: FormControl<Transaction.Quantity & Transaction.Product<Product.Response>>;
  //   invoice: FormControl<Transaction.InvoiceNumber & Transaction.InvoiceDate<string>>;
  //   splits: FormArray<SplitFormGroup>;
  //   payments: FormGroup<{
  //     [transactionId: Transaction.Id]: FormControl<number>;
  //   }>;
  // }>;
  transactionId: Transaction.Id;
  accountId: Account.Id;
  formType: string;
  transaction: Observable<Transaction.Response>;
  submit: Subject<void>;
  // deferredTransactions: Dictionary<Transaction.DeferredResponse> = {};

  accounts = this.store.select(selectAccounts);
  projects = this.store.select(selectProjects);
  recipients = this.store.select(selectRecipients);
  categories = this.store.select(selectCategories);
  isInProgress = this.store.select(selectIsInProgress);
  // availableDeferredTransactions: Observable<Transaction.DeferredResponse[]>;
  // get availableDeferredTransactions() {
  //   return this.store.select(selectDeferredTransactionList(Object.keys(this.form?.controls.payments.controls) as any));
  // }

  // get splitsSum(): number {
  //   return this.form.value.splits.reduce((accumulator, currentValue) => {
  //     return accumulator + currentValue.amount;
  //   }, 0);
  // }

  // get splitsDiff(): number {
  //   return this.form.value.amount - this.splitsSum;
  // }

  // get availableDeferredTransactions() {
  //   return this.store_.deferredTransactions.value.filter(t => !this.form.controls.payments.controls[t.transactionId]);
  // }

  constructor(
    private activatedRoute: ActivatedRoute,
    private store: Store,
    private dialogService: DialogService,
  ) {
    console.log('constructor');
    this.accountId = activatedRoute.snapshot.paramMap.get('accountId') as Account.Id;
    this.transactionId = activatedRoute.snapshot.paramMap.get('transactionId') as Transaction.Id;

    if (this.transactionId) {
      this.transaction = this.store.select(selectTransaction);
    }

    this.submit = new Subject();
  }

  @HostListener('window:keydown.meta.s', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    event.preventDefault();
    this.isInProgress.pipe(take(1)).subscribe((value) => {
      // if (!value) {
      //   this.onSubmit();
      // }
    });
  }

  // private createSplitFormGroup(split?: Transaction.SplitResponseItem | Transaction.DeferredResponse): SplitFormGroup {
  //   return new FormGroup({
  //     category: new FormControl(split?.category),
  //     amount: new FormControl(split?.amount ?? this.splitsDiff),
  //     description: new FormControl(split?.description),
  //     project: new FormControl(split?.project),
  //     loanAccount: new FormControl(null),
  //     isSettled: new FormControl(false),
  //     inventory: new FormControl({
  //       quantity: split?.quantity,
  //       product: split?.product,
  //     }),
  //     invoice: new FormControl({
  //       invoiceNumber: split?.invoiceNumber,
  //       billingEndDate: split?.billingEndDate,
  //       billingStartDate: split?.billingStartDate,
  //     }),
  //   });
  // }

  ngOnInit(): void {
    console.log('init');

    this.activatedRoute.paramMap.subscribe((params) => {
      this.formType = params.get('formType');
      console.log('params', this.formType);
    });

    // this.form = new FormGroup({
    //   issuedAt: new FormControl(new Date(), [Validators.required]),
    //   amount: new FormControl(null, [Validators.required]),
    //   account: new FormControl(null),
    //   loanAccount: new FormControl(null),
    //   isSettled: new FormControl(false),
    //   isTransfer: new FormControl(false),
    //   description: new FormControl(null),
    //   transferAccount: new FormControl(null),
    //   transferAmount: new FormControl(null),
    //   project: new FormControl(null),
    //   recipient: new FormControl(null),
    //   category: new FormControl(null),
    //   inventory: new FormControl(null),
    //   invoice: new FormControl(null),
    //   splits: new FormArray([]),
    //   payments: new FormGroup({}),
    // });

    // this.availableDeferredTransactions = this.store.select(selectDeferredTransactionList(Object.keys(this.form.controls.payments.controls) as any));

    // this.transaction?.pipe(skip(1), take(1)).subscribe((transaction) => {
    //   console.log('TR', transaction);
    //   this.form.patchValue({
    //     issuedAt: new Date(transaction.issuedAt),
    //     amount: transaction.amount,
    //     description: transaction.description,
    //   });

    //   switch(transaction.transactionType) {
    //     case 'payment': {
    //       this.form.patchValue({
    //         account: transaction.account,
    //         category: transaction.category,
    //         project: transaction.project,
    //         recipient: transaction.recipient,
    //         inventory: {
    //           product: transaction.product,
    //           quantity: transaction.quantity,
    //         },
    //         invoice: {
    //           invoiceNumber: transaction.invoiceNumber,
    //           billingEndDate: transaction.billingEndDate,
    //           billingStartDate: transaction.billingStartDate,
    //         },
    //       });
    //     } break;
    //     case 'deferred': {
    //       this.form.patchValue({
    //         account: transaction.payingAccount,
    //         loanAccount: transaction.ownerAccount,
    //         isSettled: transaction.isSettled,
    //         category: transaction.category,
    //         project: transaction.project,
    //         recipient: transaction.recipient,
    //         inventory: {
    //           product: transaction.product,
    //           quantity: transaction.quantity,
    //         },
    //         invoice: {
    //           invoiceNumber: transaction.invoiceNumber,
    //           billingEndDate: transaction.billingEndDate,
    //           billingStartDate: transaction.billingStartDate,
    //         },
    //       });
    //     } break;
    //     case 'reimbursement': {
    //       this.form.patchValue({
    //         account: transaction.payingAccount,
    //         loanAccount: transaction.ownerAccount,
    //         category: transaction.category,
    //         project: transaction.project,
    //         recipient: transaction.recipient,
    //         inventory: {
    //           product: transaction.product,
    //           quantity: transaction.quantity,
    //         },
    //         invoice: {
    //           invoiceNumber: transaction.invoiceNumber,
    //           billingEndDate: transaction.billingEndDate,
    //           billingStartDate: transaction.billingStartDate,
    //         },
    //       });
    //     } break;
    //     case 'transfer': {
    //       this.form.patchValue({
    //         isTransfer: true,
    //         account: transaction.account,
    //         transferAccount: transaction.transferAccount,
    //         transferAmount: transaction.transferAmount,
    //       });

    //     // transaction.payments?.forEach((payment) => {
    //     //   this.deferredTransactions[payment.transaction.transactionId] = payment.transaction;
    //     //   this.form.controls.payments.addControl(payment.transaction.transactionId, new FormControl(payment.amount));
    //     // });
    //     } break;
    //     case 'loanTransfer': {
    //       this.form.patchValue({
    //         isTransfer: true,
    //         account: transaction.account,
    //         transferAccount: transaction.transferAccount,
    //       });
    //     } break;
    //     case 'split': {
    //       this.form.patchValue({
    //         account: transaction.account,
    //         recipient: transaction.recipient,
    //       });

    //       transaction.splits?.forEach(s => {
    //         this.form.controls.splits.push(this.createSplitFormGroup(s));
    //       });

    //       transaction.deferredSplits?.forEach(s => {
    //         const formGroup = this.createSplitFormGroup(s);
    //         formGroup.patchValue({
    //           loanAccount: s.ownerAccount,
    //           isSettled: s.isSettled,
    //         });
    //         this.form.controls.splits.push(formGroup);
    //       });
    //     } break;
    //   }
    // });

    this.store.dispatch(accountApiActions.listAccountsInitiated());
    this.store.dispatch(categoryApiActions.listCategoriesInitiated());
    this.store.dispatch(productApiActions.listProductsInitiated());
    this.store.dispatch(projectApiActions.listProjectsInitiated());
    this.store.dispatch(recipientApiActions.listRecipientsInitiated());
    // this.store.dispatch(transactionApiActions.listDeferredTransactionsInitiated({
    //   isSettled: false,
    // }));

    // if (this.transactionId) {
    //   this.store.dispatch(transactionApiActions.getTransactionInitiated({
    //     transactionId: this.transactionId,
    //     accountId: this.accountId,
    //   }));
    // }

    // if (!this.transactionId) {
    //   this.accounts.pipe(take(2)).subscribe((value) => {
    //     const account = value.find(a => a.accountId === this.accountId);
    //     if (account) {
    //       this.form.patchValue({
    //         account,
    //       });
    //     }
    //   });
    // }

    // this.store_.deferredTransactions.pipe(takeUntil(this.destroyed)).subscribe((transactions) => {
    //   this.deferredTransactions = {
    //     ...this.deferredTransactions,
    //     ...transactions.reduce((accumulator, currentValue) => {
    //       return {
    //         ...accumulator,
    //         [currentValue.transactionId]: currentValue,
    //       };
    //     }, {}),
    //   };
    // });
  }

  // toDate(date: string) {
  //   return new Date(date);
  // }

  // deleteSplit(index: number) {
  //   this.form.controls.splits.removeAt(index);
  // }

  // addSplit() {
  //   this.form.controls.splits.insert(0, this.createSplitFormGroup());
  // }

  // addPayment(transactionId: Transaction.Id) {
  //   this.form.controls.payments.addControl(transactionId, new FormControl(0));
  // }

  // deletePayment(transactionId: Transaction.Id) {
  //   this.form.controls.payments.removeControl(transactionId);
  // }

  // createRecipient() {
  //   this.dialogService.openCreateRecipientDialog();
  // }

  // createProject() {
  //   this.dialogService.openCreateProjectDialog();
  // }

  // createCategory() {
  //   this.dialogService.openCreateCategoryDialog();
  // }

  onSubmit() {
    this.submit.next();
    // console.log(this.form);
    // if (this.form.invalid || this.form.value.amount === 0) {
    //   return;
    // }

    // if (this.form.value.isTransfer) {
    //   if (this.form.value.amount * this.form.value.transferAmount > 0) {
    //     return;
    //   }

    //   const payments = Object.entries(this.form.value.payments);

    //   const body: Transaction.TransferRequest = {
    //     accountId: this.form.value.account.accountId,
    //     amount: this.form.value.amount,
    //     description: this.form.value.description ?? undefined,
    //     issuedAt: this.form.value.issuedAt.toISOString(),
    //     transferAccountId: this.form.value.transferAccount.accountId,
    //     transferAmount: this.form.value.transferAmount ?? undefined,
    //     payments: payments.length > 0 ? payments.map(([
    //       transactionId,
    //       amount,
    //     ]) => {
    //       return {
    //         transactionId: transactionId as Transaction.Id,
    //         amount,
    //       };
    //     }) : undefined,
    //   };

    //   if (this.transactionId) {
    //   //   this.transactionService.updateTransferTransaction(this.transactionId, body).subscribe({
    //   //     next,
    //   //     error,
    //   //   });
    //   } else {
    //     this.store.dispatch(transactionApiActions.createTransferTransactionInitiated(body));
    //   }
    // } else if (this.form.value.splits.length > 0) {
    //   const body: Transaction.SplitRequest = {
    //     accountId: this.form.value.account.accountId,
    //     amount: this.form.value.amount,
    //     description: this.form.value.description ?? undefined,
    //     issuedAt: this.form.value.issuedAt.toISOString(),
    //     recipientId: this.form.value.recipient?.recipientId,
    //     splits: this.form.value.splits.map(s => ({
    //       amount: s.amount,
    //       categoryId: s.category?.categoryId,
    //       description: s.description ?? undefined,
    //       projectId: s.project?.projectId,
    //       productId: isInventoryCategory(s.category) && s.inventory ? s.inventory.product.productId : undefined,
    //       quantity: isInventoryCategory(s.category) && s.inventory ? s.inventory.quantity : undefined,
    //       invoiceNumber: isInvoiceCategory(s.category) && s.invoice ? s.invoice.invoiceNumber : undefined,
    //       billingEndDate: isInvoiceCategory(s.category) && s.invoice ? s.invoice.billingEndDate : undefined,
    //       billingStartDate: isInvoiceCategory(s.category) && s.invoice ? s.invoice.billingStartDate : undefined,
    //       loanAccountId: s.loanAccount?.accountId,
    //       isSettled: s.isSettled,
    //     })),
    //   };

    //   if (this.transactionId) {
    //   //   this.transactionService.updateSplitTransaction(this.transactionId, body).subscribe({
    //   //     next,
    //   //     error,
    //   //   });
    //   } else {
    //     this.store.dispatch(transactionApiActions.createSplitTransactionInitiated(body));
    //   }
    // } else {
    //   const body: Transaction.PaymentRequest = {
    //     accountId: this.form.value.account.accountId,
    //     amount: this.form.value.amount,
    //     description: this.form.value.description ?? undefined,
    //     issuedAt: this.form.value.issuedAt.toISOString(),
    //     recipientId: this.form.value.recipient?.recipientId,
    //     projectId: this.form.value.project?.projectId,
    //     categoryId: this.form.value.category?.categoryId,
    //     productId: isInventoryCategory(this.form.value.category) && this.form.value.inventory ? this.form.value.inventory.product.productId : undefined,
    //     quantity: isInventoryCategory(this.form.value.category) && this.form.value.inventory ? this.form.value.inventory.quantity : undefined,
    //     invoiceNumber: isInvoiceCategory(this.form.value.category) && this.form.value.invoice ? this.form.value.invoice.invoiceNumber : undefined,
    //     billingEndDate: isInvoiceCategory(this.form.value.category) && this.form.value.invoice ? this.form.value.invoice.billingEndDate : undefined,
    //     billingStartDate: isInvoiceCategory(this.form.value.category) && this.form.value.invoice ? this.form.value.invoice.billingStartDate : undefined,
    //     loanAccountId: this.form.value.loanAccount?.accountId,
    //     isSettled: this.form.value.isSettled,
    //   };

    //   if (this.transactionId) {
    //   //   this.transactionService.updatePaymentTransaction(this.transactionId, body).subscribe({
    //   //     next,
    //   //     error,
    //   //   });
    //   } else {
    //     this.store.dispatch(transactionApiActions.createPaymentTransactionInitiated(body));
    //   }
    // }

  }
}
