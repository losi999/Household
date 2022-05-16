import { Component, HostListener, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Account, Category, Project, Recipient, Transaction } from '@household/shared/types/types';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { TransactionService } from 'src/app/transaction/transaction.service';
import { isInventoryCategory, isInvoiceCategory, isPaymentTransaction, isSplitTransaction, isTransferTransaction } from '@household/shared/common/type-guards';

@Component({
  selector: 'app-transaction-edit',
  templateUrl: './transaction-edit.component.html',
  styleUrls: ['./transaction-edit.component.scss'],
})
export class TransactionEditComponent implements OnInit {
  form: FormGroup;
  transactionId: Transaction.IdType;
  accountId: Account.IdType;
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
  get project(): Project.Response { return this.form.value.project; }
  get recipient(): Recipient.Response { return this.form.value.recipient; }
  get category(): Category.Response { return this.form.value.category; }
  get invoice(): Transaction.Invoice<string>['invoice'] { return this.form.value.invoice; }
  get inventory(): Transaction.Inventory['inventory'] { return this.form.value.inventory; }

  get splits(): Transaction.SplitResponseItem[] { return this.form.value.splits; }

  constructor(
    private activatedRoute: ActivatedRoute,
    private transactionService: TransactionService,
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
      amount: new FormControl(split?.amount),
      description: new FormControl(split?.description),
      project: new FormControl(split?.project),
      inventory: new FormControl(isInventoryCategory(split?.category) ? split.inventory : null),
      invoice: new FormControl(isInvoiceCategory(split?.category) ? split.invoice : null),
    });
  }

  ngOnInit(): void {
    this.accountId = this.activatedRoute.snapshot.paramMap.get('accountId') as Account.IdType;
    this.transactionId = this.activatedRoute.snapshot.paramMap.get('transactionId') as Transaction.IdType;
    this.transaction = this.activatedRoute.snapshot.data.transaction;
    this.accounts = this.activatedRoute.snapshot.data.accounts;
    this.transferAccounts = this.activatedRoute.snapshot.data.accounts;
    this.projects = this.activatedRoute.snapshot.data.projects;
    this.recipients = this.activatedRoute.snapshot.data.recipients;
    this.categories = this.activatedRoute.snapshot.data.categories;
    const account = this.accounts.find(a => a.accountId === this.accountId);

    this.form = new FormGroup({
      issuedAt: new FormControl(this.transaction ? new Date(this.transaction.issuedAt) : new Date(), [Validators.required]),
      amount: new FormControl(this.transaction?.amount, [Validators.required]),
      account: new FormControl(this.transaction?.account ?? account, [Validators.required]),
      isTransfer: new FormControl(isTransferTransaction(this.transaction)),
      description: new FormControl(this.transaction?.description),
      transferAccount: new FormControl(isTransferTransaction(this.transaction) ? this.transaction.transferAccount : null),
      project: new FormControl(isPaymentTransaction(this.transaction) ? this.transaction.project : null),
      recipient: new FormControl(!isTransferTransaction(this.transaction) ? this.transaction?.recipient : null),
      category: new FormControl(isPaymentTransaction(this.transaction) ? this.transaction.category : null),
      inventory: new FormControl(isPaymentTransaction(this.transaction) && isInventoryCategory(this.transaction?.category) ? this.transaction.inventory : null),
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

  onSubmit() {
    const next = () => {
      this.router.navigate([
        '/accounts',
        this.account.accountId,
      ]);
    };

    const error = (error) => {
      console.error(error);
    };

    if (this.form.invalid || this.amount === 0) {
      return;
    }

    if (this.form.value.isTransfer) {
      const body: Transaction.TransferRequest = {
        accountId: this.account.accountId,
        amount: this.amount,
        description: this.description ?? undefined,
        issuedAt: this.issuedAt.toISOString(),
        transferAccountId: this.transferAccount.accountId,
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
            inventory: isInventoryCategory(s.category) ? s.inventory : undefined,
            invoice: isInvoiceCategory(s.category) ? s.invoice : undefined,
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
          inventory: isInventoryCategory(this.category) ? this.inventory : undefined,
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
