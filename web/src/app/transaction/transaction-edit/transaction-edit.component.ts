import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { TransactionService } from 'src/app/transaction/transaction.service';
import { isInventoryCategory, isInvoiceCategory, isPaymentTransaction, isSplitTransaction, isTransferTransaction } from '@household/shared/common/type-guards';
import { ProgressService } from 'src/app/shared/progress.service';
import { RecipientService } from 'src/app/recipient/recipient.service';
import { ProjectService } from 'src/app/project/project.service';
import { CategoryService } from 'src/app/category/category.service';
import { DialogService } from 'src/app/shared/dialog.service';
import { Subject, takeUntil } from 'rxjs';
import { Store } from 'src/app/store';
import { AccountService } from 'src/app/account/account.service';

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
    isTransfer: FormControl<boolean>;
    description: FormControl<string>;
    transferAccount: FormControl<Account.Response>;
    transferAmount: FormControl<number>;
    project: FormControl<Project.Response>;
    recipient: FormControl<Recipient.Response>;
    category: FormControl<Category.Response>;
    inventory: FormControl<Transaction.Quantity & Transaction.Product<Product.Response>>;
    invoice: FormControl<Transaction.InvoiceNumber & Transaction.InvoiceDate<string>>;
    splits: FormArray<FormGroup<{
      category: FormControl<Category.Response>;
      amount: FormControl<number>;
      description: FormControl<string>;
      project: FormControl<Project.Response>;
      inventory: FormControl<Transaction.Quantity & Transaction.Product<Product.Response>>;
      invoice: FormControl<Transaction.InvoiceNumber & Transaction.InvoiceDate<string>>;
    }>>;
  }>;
  transactionId: Transaction.Id;
  accountId: Account.Id;
  transaction: Transaction.Response;
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

  get isTransfer(): boolean {
    return this.form.value.isTransfer;
  }

  get isPayment(): boolean {
    return !this.isTransfer && this.form.value.splits?.length === 0;
  }

  get isSplit(): boolean {
    return !this.isTransfer && this.form.value.splits?.length > 0;
  }

  isCategoryType(categoryType: Category.CategoryType['categoryType'], splitIndex?: number): boolean {
    return (splitIndex >= 0 ? this.form.value.splits[splitIndex].category : this.form.value.category)?.categoryType === categoryType;
  }

  constructor(
    private activatedRoute: ActivatedRoute,
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
    recipientService.listRecipients();
    categoryService.listCategories();
    projectService.listProjects();
    accountService.listAccounts();
  }

  @HostListener('window:keydown.meta.s', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    event.preventDefault();
    this.onSubmit();
  }

  private createSplitFormGroup(split?: Transaction.SplitResponseItem): FormGroup {
    return new FormGroup({
      category: new FormControl(split?.category),
      amount: new FormControl(split?.amount ?? this.splitsDiff),
      description: new FormControl(split?.description),
      project: new FormControl(split?.project),
      inventory: new FormControl(isInventoryCategory(split?.category) ? {
        quantity: split.quantity,
        product: split.product,
      } : null),
      invoice: new FormControl(isInvoiceCategory(split?.category) ? {
        invoiceNumber: split.invoiceNumber,
        billingEndDate: split.billingEndDate,
        billingStartDate: split.billingStartDate,
      } : null),
    });
  }

  ngOnDestroy(): void {
    this.destroyed.next(undefined);
    this.destroyed.complete();
  }

  ngOnInit(): void {
    this.accountId = this.activatedRoute.snapshot.paramMap.get('accountId') as Account.Id;
    this.transactionId = this.activatedRoute.snapshot.paramMap.get('transactionId') as Transaction.Id;
    this.transaction = this.activatedRoute.snapshot.data.transaction;

    this.form = new FormGroup({
      issuedAt: new FormControl(this.transaction ? new Date(this.transaction.issuedAt) : new Date(), [Validators.required]),
      amount: new FormControl(this.transaction?.amount, [Validators.required]),
      account: new FormControl(this.transaction?.account, [Validators.required]),
      isTransfer: new FormControl(isTransferTransaction(this.transaction)),
      description: new FormControl(this.transaction?.description),
      transferAccount: new FormControl(isTransferTransaction(this.transaction) ? this.transaction.transferAccount : null),
      transferAmount: new FormControl(isTransferTransaction(this.transaction) ? this.transaction.transferAmount : null),
      project: new FormControl(isPaymentTransaction(this.transaction) ? this.transaction.project : null),
      recipient: new FormControl(!isTransferTransaction(this.transaction) ? this.transaction?.recipient : null),
      category: new FormControl(isPaymentTransaction(this.transaction) ? this.transaction.category : null),
      inventory: new FormControl(isPaymentTransaction(this.transaction) && isInventoryCategory(this.transaction?.category) ? {
        quantity: this.transaction.quantity,
        product: this.transaction.product,
      } : undefined),
      invoice: new FormControl(isPaymentTransaction(this.transaction) && isInvoiceCategory(this.transaction?.category) ? {
        invoiceNumber: this.transaction.invoiceNumber,
        billingEndDate: this.transaction.billingEndDate,
        billingStartDate: this.transaction.billingStartDate,
      } : null),
      splits: new FormArray(isSplitTransaction(this.transaction) ? this.transaction.splits.map(s => this.createSplitFormGroup(s)) : []),
    });

    this.store.accounts.pipe(takeUntil(this.destroyed)).subscribe((accounts) => {
      const account = accounts.find(a => a.accountId === this.accountId);
      this.form.patchValue({
        account,
      });
    });
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

      const body: Transaction.TransferRequest = {
        accountId: this.form.value.account.accountId,
        amount: this.form.value.amount,
        description: this.form.value.description ?? undefined,
        issuedAt: this.form.value.issuedAt.toISOString(),
        transferAccountId: this.form.value.transferAccount.accountId,
        transferAmount: this.form.value.transferAmount ?? undefined,
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
    } else {
      if (this.form.value.splits.length > 0) {
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
}
