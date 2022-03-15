import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Account, Category, Project, Recipient, Transaction } from '@household/shared/types/types';
import { Observable } from 'rxjs';
import { AccountService } from 'src/app/account/account.service';
import { CategoryService } from 'src/app/category/category.service';
import { ProjectService } from 'src/app/project/project.service';
import { RecipientService } from 'src/app/recipient/recipient.service';
import { TransactionService } from 'src/app/transaction/transaction.service';

@Component({
  selector: 'app-transaction-edit',
  templateUrl: './transaction-edit.component.html',
  styleUrls: ['./transaction-edit.component.scss']
})
export class TransactionEditComponent implements OnInit {
  form: FormGroup;
  transaction: Transaction.Response;
  transactionId: Transaction.IdType;
  accountId: Account.IdType;

  get accounts(): Observable<Account.Response[]> {
    return this.accountService.accounts;
  }

  get transferAccounts(): Observable<Account.Response[]> {
    return this.accountService.accounts;
  }

  get projects(): Observable<Project.Response[]> {
    return this.projectService.projects;
  }

  get recipients(): Observable<Recipient.Response[]> {
    return this.recipientService.recipients;
  }

  get categories(): Observable<Category.Response[]> {
    return this.categoryService.categories;
  }

  get splits() {
    return this.form.controls.splits as FormArray;
  }

  get splitsSum(): number {
    return this.splits.value.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.amount;
    }, 0);
  }

  get splitsDiff(): number {
    return this.form.value.amount - this.splitsSum;
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private transactionService: TransactionService,
    private accountService: AccountService,
    private projectService: ProjectService,
    private recipientService: RecipientService,
    private categoryService: CategoryService) { }

  ngOnInit(): void {
    this.accountId = this.activatedRoute.snapshot.paramMap.get('accountId') as Account.IdType;
    this.transactionId = this.activatedRoute.snapshot.paramMap.get('transactionId') as Transaction.IdType;

    this.accountService.listAccounts();
    this.projectService.listProjects();
    this.recipientService.listRecipients();
    this.categoryService.listCategories();

    if (this.accountId) {
      if (this.transactionId) {
        // edit
      } else {
        // new for account
      }
    } else {
      // new
    }

    this.form = new FormGroup({
      issuedAt: new FormControl(null, Validators.required),
      amount: new FormControl(),
      account: new FormControl(),
      isTransfer: new FormControl(),
      description: new FormControl(),
      transferAccount: new FormControl(),
      project: new FormControl(),
      recipient: new FormControl(),
      category: new FormControl(),
      splits: new FormArray([]),
    });



    this.transactionService.getTransactionById(this.transactionId, this.accountId).subscribe((transaction) => {
      this.transaction = transaction;
      // console.log(transaction);

      const issuedAt = new Date(transaction.issuedAt);
      switch (transaction.transactionType) {
        case 'transfer': {
          this.form.patchValue({
            issuedAt,
            amount: transaction.amount,
            account: transaction.account,
            description: transaction.description,
            isTransfer: true,
            transferAccount: transaction.transferAccount,
          });
        } break;
        case 'payment': {
          this.form.patchValue({
            issuedAt,
            amount: transaction.amount,
            account: transaction.account,
            description: transaction.description,
            isTransfer: false,
            project: transaction.project ?? null,
            category: transaction.category ?? null,
            recipient: transaction.recipient ?? null,
          });
        } break;
        case 'split': {
          this.form.patchValue({
            issuedAt,
            amount: transaction.amount,
            account: transaction.account.accountId,
            description: transaction.description,
            isTransfer: false,
            recipient: transaction.recipient?.recipientId ?? null,
          });

          // transaction.splits.forEach((s) => {
          //   this.splits.push(new FormGroup({
          //     category: new FormControl(s.category),
          //     amount: new FormControl(s.amount),
          //     description: new FormControl(s.description),
          //     project: new FormControl(s.project),
          //   }))
          // })
        } break;
      }
    });
  }

  deleteSplit(index: number) {
    this.splits.removeAt(index);
  }

  addSplit() {
    this.splits.push(new FormGroup({
      category: new FormControl(),
      amount: new FormControl(this.splitsDiff),
      description: new FormControl(),
      project: new FormControl(),
    }))
  }

  onSubmit() {
    console.log(this.form.value);
  }
}
