import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { TransactionService } from 'src/app/transaction/transaction.service';
import { isInventoryCategory, isInvoiceCategory } from '@household/shared/common/type-guards';
import { ProgressService } from 'src/app/shared/progress.service';
import { RecipientService } from 'src/app/recipient/recipient.service';
import { ProjectService } from 'src/app/project/project.service';
import { CategoryService } from 'src/app/category/category.service';
import { DialogService } from 'src/app/shared/dialog.service';
import { Subject, takeUntil } from 'rxjs';
import { Store } from 'src/app/store';
import { AccountService } from 'src/app/account/account.service';
import { Dictionary } from '@household/shared/types/common';

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
})
export class TransactionEditComponent implements OnInit, OnDestroy {
  private destroyed = new Subject();
  form: FormGroup<{
    issuedAt: FormControl<Date>;
    amount: FormControl<number>;
    account: FormControl<Account.Response>;
    loanAccount: FormControl<Account.Response>;
    isSettled: FormControl<boolean>;
    isTransfer: FormControl<boolean>;
    description: FormControl<string>;
    transferAccount: FormControl<Account.Response>;
    transferAmount: FormControl<number>;
    project: FormControl<Project.Response>;
    recipient: FormControl<Recipient.Response>;
    category: FormControl<Category.Response>;
    inventory: FormControl<Transaction.Quantity & Transaction.Product<Product.Response>>;
    invoice: FormControl<Transaction.InvoiceNumber & Transaction.InvoiceDate<string>>;
    splits: FormArray<SplitFormGroup>;
    payments: FormGroup<{
      [transactionId: Transaction.Id]: FormControl<number>;
    }>;
  }>;
  transactionId: Transaction.Id;
  accountId: Account.Id;
  transaction: Transaction.Response;
  deferredTransactions: Dictionary<Transaction.DeferredResponse> = {};

  get accounts(): Account.Response[] {
    return this.store.accounts.value;
  }
  get projects(): Project.Response[] {
    return this.store.projects.value;
  }
  get recipients(): Recipient.Response[] {
    return this.store.recipients.value;
  }
  get categories(): Category.Response[] {
    return this.store.categories.value;
  }

  get splitsSum(): number {
    return this.form.value.splits.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.amount;
    }, 0);
  }

  get splitsDiff(): number {
    return this.form.value.amount - this.splitsSum;
  }

  get availableDeferredTransactions() {
    return this.store.deferredTransactions.value.filter(t => !this.form.controls.payments.controls[t.transactionId]);
  }

  constructor(
    activatedRoute: ActivatedRoute,
    private store: Store,
    private transactionService: TransactionService,
    accountService: AccountService,
    recipientService: RecipientService,
    projectService: ProjectService,
    categoryService: CategoryService,
    private progressService: ProgressService,
    private router: Router,
    private dialogService: DialogService,
  ) {
    this.accountId = activatedRoute.snapshot.paramMap.get('accountId') as Account.Id;
    this.transactionId = activatedRoute.snapshot.paramMap.get('transactionId') as Transaction.Id;
    this.transaction = activatedRoute.snapshot.data.transaction;

    recipientService.listRecipients();
    categoryService.listCategories();
    projectService.listProjects();
    accountService.listAccounts();
    transactionService.listDeferredTransactions({
      isSettled: false,
    });
  }

  @HostListener('window:keydown.meta.s', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    event.preventDefault();
    this.onSubmit();
  }

  private createSplitFormGroup(split?: Transaction.SplitResponseItem | Transaction.DeferredResponse): SplitFormGroup {
    return new FormGroup({
      category: new FormControl(split?.category),
      amount: new FormControl(split?.amount ?? this.splitsDiff),
      description: new FormControl(split?.description),
      project: new FormControl(split?.project),
      loanAccount: new FormControl(null),
      isSettled: new FormControl(false),
      inventory: new FormControl({
        quantity: split?.quantity,
        product: split?.product,
      }),
      invoice: new FormControl({
        invoiceNumber: split?.invoiceNumber,
        billingEndDate: split?.billingEndDate,
        billingStartDate: split?.billingStartDate,
      }),
    });
  }

  ngOnDestroy(): void {
    this.destroyed.next(undefined);
    this.destroyed.complete();
  }

  ngOnInit(): void {
    this.store.deferredTransactions.pipe(takeUntil(this.destroyed)).subscribe((transactions) => {
      this.deferredTransactions = {
        ...this.deferredTransactions,
        ...transactions.reduce((accumulator, currentValue) => {
          return {
            ...accumulator,
            [currentValue.transactionId]: currentValue,
          };
        }, {}),
      };
    });

    this.form = new FormGroup({
      issuedAt: new FormControl(this.transaction ? new Date(this.transaction.issuedAt) : new Date(), [Validators.required]),
      amount: new FormControl(this.transaction?.amount, [Validators.required]),
      account: new FormControl(null),
      loanAccount: new FormControl(null),
      isSettled: new FormControl(false),
      isTransfer: new FormControl(false),
      description: new FormControl(this.transaction?.description),
      transferAccount: new FormControl(null),
      transferAmount: new FormControl(null),
      project: new FormControl(null),
      recipient: new FormControl(null),
      category: new FormControl(null),
      inventory: new FormControl(null),
      invoice: new FormControl(null),
      splits: new FormArray([]),
      payments: new FormGroup({}),
    });

    switch (this.transaction?.transactionType) {
      case 'payment': {
        this.form.patchValue({
          account: this.transaction.account,
          category: this.transaction.category,
          project: this.transaction.project,
          recipient: this.transaction.recipient,
          inventory: {
            product: this.transaction.product,
            quantity: this.transaction.quantity,
          },
          invoice: {
            invoiceNumber: this.transaction.invoiceNumber,
            billingEndDate: this.transaction.billingEndDate,
            billingStartDate: this.transaction.billingStartDate,
          },
        });
      } break;
      case 'deferred': {
        this.form.patchValue({
          account: this.transaction.payingAccount,
          loanAccount: this.transaction.ownerAccount,
          isSettled: this.transaction.isSettled,
          category: this.transaction.category,
          project: this.transaction.project,
          recipient: this.transaction.recipient,
          inventory: {
            product: this.transaction.product,
            quantity: this.transaction.quantity,
          },
          invoice: {
            invoiceNumber: this.transaction.invoiceNumber,
            billingEndDate: this.transaction.billingEndDate,
            billingStartDate: this.transaction.billingStartDate,
          },
        });
      } break;
      case 'reimbursement': {
        this.form.patchValue({
          account: this.transaction.payingAccount,
          loanAccount: this.transaction.ownerAccount,
          category: this.transaction.category,
          project: this.transaction.project,
          recipient: this.transaction.recipient,
          inventory: {
            product: this.transaction.product,
            quantity: this.transaction.quantity,
          },
          invoice: {
            invoiceNumber: this.transaction.invoiceNumber,
            billingEndDate: this.transaction.billingEndDate,
            billingStartDate: this.transaction.billingStartDate,
          },
        });
      } break;
      case 'transfer': {
        this.form.patchValue({
          isTransfer: true,
          account: this.transaction.account,
          transferAccount: this.transaction.transferAccount,
          transferAmount: this.transaction.transferAmount,
        });

        this.transaction.payments?.forEach((payment) => {
          this.deferredTransactions[payment.transaction.transactionId] = payment.transaction;
          this.form.controls.payments.addControl(payment.transaction.transactionId, new FormControl(payment.amount));
        });
      } break;
      case 'loanTransfer': {
        this.form.patchValue({
          isTransfer: true,
          account: this.transaction.account,
          transferAccount: this.transaction.transferAccount,
        });
      } break;
      case 'split': {
        this.form.patchValue({
          account: this.transaction.account,
          recipient: this.transaction.recipient,
        });

        this.transaction.splits?.forEach(s => {
          this.form.controls.splits.push(this.createSplitFormGroup(s));
        });

        this.transaction.deferredSplits?.forEach(s => {
          const formGroup = this.createSplitFormGroup(s);
          formGroup.patchValue({
            loanAccount: s.ownerAccount,
            isSettled: s.isSettled,
          });
          this.form.controls.splits.push(formGroup);
        });
      }
    }

    if (!this.transaction) {
      this.store.accounts.pipe(takeUntil(this.destroyed)).subscribe((accounts) => {
        const account = accounts.find(a => a.accountId === this.accountId);
        this.form.patchValue({
          account,
        });
      });
    }
  }

  toDate(date: string) {
    return new Date(date);
  }

  deleteTransaction() {
    this.dialogService.openDeleteTransactionDialog().afterClosed()
      .subscribe(result => {
        if (result) {
          this.transactionService.deleteTransaction(this.transactionId).subscribe({
            next: () => {
              this.router.navigate([
                '/accounts',
                this.form.value.account.accountId,
              ]);
            },
            error: (error) => {
              console.error(error);
            },
          });
        }
      });
  }

  deleteSplit(index: number) {
    this.form.controls.splits.removeAt(index);
  }

  addSplit() {
    this.form.controls.splits.insert(0, this.createSplitFormGroup());
  }

  addPayment(transactionId: Transaction.Id) {
    this.form.controls.payments.addControl(transactionId, new FormControl(0));
  }

  deletePayment(transactionId: Transaction.Id) {
    this.form.controls.payments.removeControl(transactionId);
  }

  createRecipient() {
    this.dialogService.openCreateRecipientDialog();
  }

  createProject() {
    this.dialogService.openCreateProjectDialog();
  }

  createCategory() {
    this.dialogService.openCreateCategoryDialog();
  }

  onSubmit() {
    const next = (response: Transaction.TransactionId) => {
      this.router.navigate([
        '/accounts',
        this.form.value.account.accountId,
        'transactions',
        this.transactionId ?? response.transactionId,
      ], {
        replaceUrl: true,
      });
    };

    const error = (error) => {
      console.error(error);
      alert(JSON.stringify(error, null, 2));
      this.progressService.processFinished();
    };

    if (this.form.invalid || this.form.value.amount === 0) {
      return;
    }

    if (this.form.value.isTransfer) {
      if (this.form.value.amount * this.form.value.transferAmount > 0) {
        return;
      }

      const payments = Object.entries(this.form.value.payments);

      const body: Transaction.TransferRequest = {
        accountId: this.form.value.account.accountId,
        amount: this.form.value.amount,
        description: this.form.value.description ?? undefined,
        issuedAt: this.form.value.issuedAt.toISOString(),
        transferAccountId: this.form.value.transferAccount.accountId,
        transferAmount: this.form.value.transferAmount ?? undefined,
        payments: payments.length > 0 ? payments.map(([
          transactionId,
          amount,
        ]) => {
          return {
            transactionId: transactionId as Transaction.Id,
            amount,
          };
        }) : undefined,
      };

      if (this.transactionId) {
        this.transactionService.updateTransferTransaction(this.transactionId, body).subscribe({
          next,
          error,
        });
      } else {
        this.transactionService.createTransferTransaction(body).subscribe({
          next,
          error,
        });
      }
    } else if (this.form.value.splits.length > 0) {
      const body: Transaction.SplitRequest = {
        accountId: this.form.value.account.accountId,
        amount: this.form.value.amount,
        description: this.form.value.description ?? undefined,
        issuedAt: this.form.value.issuedAt.toISOString(),
        recipientId: this.form.value.recipient?.recipientId,
        splits: this.form.value.splits.map(s => ({
          amount: s.amount,
          categoryId: s.category?.categoryId,
          description: s.description ?? undefined,
          projectId: s.project?.projectId,
          productId: isInventoryCategory(s.category) && s.inventory ? s.inventory.product.productId : undefined,
          quantity: isInventoryCategory(s.category) && s.inventory ? s.inventory.quantity : undefined,
          invoiceNumber: isInvoiceCategory(s.category) && s.invoice ? s.invoice.invoiceNumber : undefined,
          billingEndDate: isInvoiceCategory(s.category) && s.invoice ? s.invoice.billingEndDate : undefined,
          billingStartDate: isInvoiceCategory(s.category) && s.invoice ? s.invoice.billingStartDate : undefined,
          loanAccountId: s.loanAccount?.accountId,
          isSettled: s.isSettled,
        })),
      };

      if (this.transactionId) {
        this.transactionService.updateSplitTransaction(this.transactionId, body).subscribe({
          next,
          error,
        });
      } else {
        this.transactionService.createSplitTransaction(body).subscribe({
          next,
          error,
        });
      }
    } else {
      const body: Transaction.PaymentRequest = {
        accountId: this.form.value.account.accountId,
        amount: this.form.value.amount,
        description: this.form.value.description ?? undefined,
        issuedAt: this.form.value.issuedAt.toISOString(),
        recipientId: this.form.value.recipient?.recipientId,
        projectId: this.form.value.project?.projectId,
        categoryId: this.form.value.category?.categoryId,
        productId: isInventoryCategory(this.form.value.category) && this.form.value.inventory ? this.form.value.inventory.product.productId : undefined,
        quantity: isInventoryCategory(this.form.value.category) && this.form.value.inventory ? this.form.value.inventory.quantity : undefined,
        invoiceNumber: isInvoiceCategory(this.form.value.category) && this.form.value.invoice ? this.form.value.invoice.invoiceNumber : undefined,
        billingEndDate: isInvoiceCategory(this.form.value.category) && this.form.value.invoice ? this.form.value.invoice.billingEndDate : undefined,
        billingStartDate: isInvoiceCategory(this.form.value.category) && this.form.value.invoice ? this.form.value.invoice.billingStartDate : undefined,
        loanAccountId: this.form.value.loanAccount?.accountId,
        isSettled: this.form.value.isSettled,
      };

      if (this.transactionId) {
        this.transactionService.updatePaymentTransaction(this.transactionId, body).subscribe({
          next,
          error,
        });
      } else {
        this.transactionService.createPaymentTransaction(body).subscribe({
          next,
          error,
        });
      }
    }

  }
}
