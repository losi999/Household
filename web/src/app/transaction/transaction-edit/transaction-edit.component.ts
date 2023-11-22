import { Component, HostListener, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { TransactionService } from 'src/app/transaction/transaction.service';
import { isInventoryCategory, isInvoiceCategory, isPaymentTransaction, isSplitTransaction, isTransferTransaction } from '@household/shared/common/type-guards';
import { ProgressService } from 'src/app/shared/progress.service';
import { RecipientFormComponent, RecipientFormData, RecipientFormResult } from 'src/app/recipient/recipient-form/recipient-form.component';
import { RecipientService } from 'src/app/recipient/recipient.service';
import { ProjectFormComponent, ProjectFormData, ProjectFormResult } from 'src/app/project/project-form/project-form.component';
import { ProjectService } from 'src/app/project/project.service';
import { CategoryFormComponent, CategoryFormData, CategoryFormResult } from 'src/app/category/category-form/category-form.component';
import { CategoryService } from 'src/app/category/category.service';

@Component({
  selector: 'app-transaction-edit',
  templateUrl: './transaction-edit.component.html',
  styleUrls: ['./transaction-edit.component.scss'],
})
export class TransactionEditComponent implements OnInit {
  form: FormGroup;
  transactionId: Transaction.Id;
  accountId: Account.Id;
  transaction: Transaction.Response;
  accounts: Account.Response[];
  transferAccounts: Account.Response[];
  projects: Project.Response[];
  recipients: Recipient.Response[];
  categories: Category.Response[];

  get splitsArray() {
    return this.form.controls.splits as FormArray;
  }

  get splitsSum(): number {
    return this.splits.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.amount;
    }, 0);
  }

  get splitsDiff(): number {
    return this.form.value.amount - this.splitsSum;
  }

  get issuedAt(): Date { return this.form.value.issuedAt; }
  get amount(): number { return this.form.value.amount; }
  get account(): Account.Response { return this.form.value.account; }
  get isTransfer(): boolean { return this.form.value.isTransfer; }
  get description(): string { return this.form.value.description; }
  get transferAccount(): Account.Response { return this.form.value.transferAccount; }
  get transferAmount(): number { return this.form.value.transferAmount; }
  get project(): Project.Response { return this.form.value.project; }
  get recipient(): Recipient.Response { return this.form.value.recipient; }
  get category(): Category.Response { return this.form.value.category; }
  get invoice(): Transaction.Invoice<string>['invoice'] { return this.form.value.invoice ?? undefined; }
  get inventory(): Transaction.Inventory<Product.Response>['inventory'] { return this.form.value.inventory ?? undefined; }

  get splits(): Transaction.SplitResponseItem[] { return this.form.value.splits; }

  constructor(
    private activatedRoute: ActivatedRoute,
    private transactionService: TransactionService,
    private recipientService: RecipientService,
    private projectService: ProjectService,
    private categoryService: CategoryService,
    private progressService: ProgressService,
    private router: Router,
    public dialog: MatDialog
  ) { }

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
      inventory: new FormControl(isInventoryCategory(split?.category) ? split.inventory : null),
      invoice: new FormControl(isInvoiceCategory(split?.category) ? split.invoice : null),
    });
  }

  getProducts(categoryId: Category.Id): Product.Response[] {
    return this.categories.find(c => c.categoryId === categoryId).products;
  }

  ngOnInit(): void {
    this.accountId = this.activatedRoute.snapshot.paramMap.get('accountId') as Account.Id;
    this.transactionId = this.activatedRoute.snapshot.paramMap.get('transactionId') as Transaction.Id;
    this.transaction = this.activatedRoute.snapshot.data.transaction;
    this.accounts = this.activatedRoute.snapshot.data.accounts;
    this.transferAccounts = this.activatedRoute.snapshot.data.accounts;
    this.projects = this.activatedRoute.snapshot.data.projects;
    this.recipients = this.activatedRoute.snapshot.data.recipients;
    this.categories = this.activatedRoute.snapshot.data.categories;

    this.recipientService.refreshList.subscribe({
      next: () => {
        this.recipientService.listRecipients().subscribe((recipients) => {
          this.recipients = recipients
        })
      }
    })
    this.projectService.refreshList.subscribe({
      next: () => {
        this.projectService.listProjects().subscribe((projects) => {
          this.projects = projects
        })
      }
    })
    this.categoryService.refreshList.subscribe({
      next: () => {
        this.categoryService.listCategories().subscribe((categories) => {
          this.categories = categories
        })
      }
    })

    const account = this.accounts.find(a => a.accountId === this.accountId);

    this.form = new FormGroup({
      issuedAt: new FormControl(this.transaction ? new Date(this.transaction.issuedAt) : new Date(), [Validators.required]),
      amount: new FormControl(this.transaction?.amount, [Validators.required]),
      account: new FormControl(this.transaction?.account ?? account, [Validators.required]),
      isTransfer: new FormControl(isTransferTransaction(this.transaction)),
      description: new FormControl(this.transaction?.description),
      transferAccount: new FormControl(isTransferTransaction(this.transaction) ? this.transaction.transferAccount : null),
      transferAmount: new FormControl(isTransferTransaction(this.transaction) ? this.transaction.transferAmount : null),
      project: new FormControl(isPaymentTransaction(this.transaction) ? this.transaction.project : null),
      recipient: new FormControl(!isTransferTransaction(this.transaction) ? this.transaction?.recipient : null),
      category: new FormControl(isPaymentTransaction(this.transaction) ? this.transaction.category : null),
      inventory: new FormControl(isPaymentTransaction(this.transaction) && isInventoryCategory(this.transaction?.category) ? this.transaction.inventory : undefined),
      invoice: new FormControl(isPaymentTransaction(this.transaction) && isInvoiceCategory(this.transaction?.category) ? this.transaction.invoice : null),
      splits: new FormArray(isSplitTransaction(this.transaction) ? this.transaction.splits.map(s => this.createSplitFormGroup(s)) : []),
    });
  }

  deleteTransaction() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '250px',
      data: {
        title: 'Törölni akarod ezt a tranzakciót?',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.transactionService.deleteTransaction(this.transactionId).subscribe({
          next: () => {
            this.router.navigate([
              '/accounts',
              this.account.accountId,
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
    this.splitsArray.removeAt(index);
  }

  addSplit() {
    this.form.patchValue({
      isTransfer: false,
    });
    this.splitsArray.insert(0, this.createSplitFormGroup());
  }

  createRecipient() {
    const dialogRef = this.dialog.open<RecipientFormComponent, RecipientFormData, RecipientFormResult>(RecipientFormComponent);

    dialogRef.afterClosed().subscribe({
      next: (values) => {
        if (values) {
          this.recipientService.createRecipient(values);
        }
      },
    });
  }

  createProject() {
    const dialogRef = this.dialog.open<ProjectFormComponent, ProjectFormData, ProjectFormResult>(ProjectFormComponent);

    dialogRef.afterClosed().subscribe({
      next: (values) => {
        if (values) {
          this.projectService.createProject(values);
        }
      },
    });
  }

  createCategory() {
    const dialogRef = this.dialog.open<CategoryFormComponent, CategoryFormData, CategoryFormResult>(CategoryFormComponent, {
      data: {
        category: undefined,
        categories: this.categories,
      },
    });

    dialogRef.afterClosed().subscribe({
      next: (values) => {
        if (values) {
          this.categoryService.createCategory(values);
        }
      },
    });
  }

  onSubmit() {
    const next = (response: Transaction.TransactionId) => {
      this.router.navigate([
        '/accounts',
        this.account.accountId,
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

    if (this.form.invalid || this.amount === 0) {
      return;
    }

    if (this.form.value.isTransfer) {
      if (this.amount * this.transferAmount >= 0) {
        return;
      }

      const body: Transaction.TransferRequest = {
        accountId: this.account.accountId,
        amount: this.amount,
        description: this.description ?? undefined,
        issuedAt: this.issuedAt.toISOString(),
        transferAccountId: this.transferAccount.accountId,
        transferAmount: this.transferAmount,
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
          accountId: this.account.accountId,
          amount: this.amount,
          description: this.description ?? undefined,
          issuedAt: this.issuedAt.toISOString(),
          recipientId: this.recipient?.recipientId,
          splits: this.splits.map(s => ({
            amount: s.amount,
            categoryId: s.category?.categoryId,
            description: s.description ?? undefined,
            projectId: s.project?.projectId,
            inventory: isInventoryCategory(s.category) && s.inventory ? {
              productId: s.inventory.product.productId,
              quantity: s.inventory.quantity,
            } : undefined,
            invoice: isInvoiceCategory(s.category) && s.invoice ? s.invoice : undefined,
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
          accountId: this.account.accountId,
          amount: this.amount,
          description: this.description ?? undefined,
          issuedAt: this.issuedAt.toISOString(),
          recipientId: this.recipient?.recipientId,
          projectId: this.project?.projectId,
          categoryId: this.category?.categoryId,
          inventory: isInventoryCategory(this.category) && this.inventory ? {
            productId: this.inventory.product.productId,
            quantity: this.inventory.quantity,
          } : undefined,
          invoice: isInvoiceCategory(this.category) ? this.invoice : undefined,
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
