import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
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

  constructor(
    private activatedRoute: ActivatedRoute,
    private transactionService: TransactionService,
    private accountService: AccountService,
    private projectService: ProjectService,
    private recipientService: RecipientService,
    private categoryService: CategoryService) { }

  ngOnInit(): void {
    this.accountService.listAccounts();
    this.projectService.listProjects();
    this.recipientService.listRecipients();
    this.categoryService.listCategories();

    this.form = new FormGroup({
      issuedAt: new FormControl(),
      hour: new FormControl(),
      minute: new FormControl(),
      amount: new FormControl(),
      account: new FormControl(),
      isTransfer: new FormControl(),
      description: new FormControl(),
      transferAccount: new FormControl(),
      project: new FormControl(),
      recipient: new FormControl(),
      category: new FormControl(),
      // splits: new FormArray([]),
    });

    this.accountId = this.activatedRoute.snapshot.paramMap.get('accountId') as Account.IdType;
    this.transactionId = this.activatedRoute.snapshot.paramMap.get('transactionId') as Transaction.IdType;

    this.transactionService.getTransactionById(this.transactionId, this.accountId).subscribe((transaction) => {
      this.transaction = transaction;
      // console.log(transaction);

      const issuedAt = new Date(transaction.issuedAt);
      switch (transaction.transactionType) {
        case 'transfer': {
          this.form.setValue({
            issuedAt,
            hour: issuedAt.getHours(),
            minute: issuedAt.getMinutes(),
            amount: transaction.amount,
            account: transaction.account,
            description: transaction.description,
            isTransfer: true,
            transferAccount: transaction.transferAccount,
            project: null,
            category: null,
            recipient: null,
            // splits: null,
          });
        } break;
        case 'payment': {
          this.form.setValue({
            issuedAt,
            hour: issuedAt.getHours(),
            minute: issuedAt.getMinutes(),
            amount: transaction.amount,
            account: transaction.account,
            description: transaction.description,
            isTransfer: false,
            transferAccount: null,
            project: transaction.project ?? null,
            category: transaction.category ?? null,
            recipient: transaction.recipient ?? null,
            // splits: null,
          });
        } break;
        case 'split': {
          this.form.setValue({
            issuedAt,
            hour: issuedAt.getHours(),
            minute: issuedAt.getMinutes(),
            amount: transaction.amount,
            account: transaction.account,
            description: transaction.description,
            isTransfer: false,
            transferAccount: null,
            project: null,
            category: null,
            recipient: transaction.recipient ?? null,
            // splits: transaction.splits.map(s => new FormGroup({
            //   category: new FormControl(s.category),
            //   amount: new FormControl(s.amount),
            //   description: new FormControl(s.description),
            //   project: new FormControl(s.project),
            // }))
          });
        } break;
      }
    });
  }

  displayName(item: Account.Response | Project.Response | Recipient.Response) {
    return item?.name;
  }

  displayFullName(item: Category.Response) {
    return item?.fullName;
  }

  clearFormValue(controlName: string) {
    this.form.controls[controlName].reset();
  }

  onSubmit() {
    console.log(this.form);
  }
}
