import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { File, Transaction } from '@household/shared/types/types';
import { accountApiActions } from '@household/web/state/account/account.actions';
import { categoryApiActions } from '@household/web/state/category/category.actions';
import { importActions } from '@household/web/state/import/import.actions';
import { selectDraftTransactionList } from '@household/web/state/import/import.selector';
import { notificationActions } from '@household/web/state/notification/notification.actions';
import { projectApiActions } from '@household/web/state/project/project.actions';
import { recipientApiActions } from '@household/web/state/recipient/recipient.actions';
import { transactionApiActions } from '@household/web/state/transaction/transaction.actions';
import { FormGroupify, ImportedTransaction, TransactionImportUpdatableFields } from '@household/web/types/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

type FieldName = keyof TransactionImportUpdatableFields;

@Component({
  selector: 'household-import-transactions-home',
  standalone: false,

  templateUrl: './import-transactions-home.component.html',
  styleUrl: './import-transactions-home.component.scss',
})
export class ImportTransactionsHomeComponent implements OnInit {
  transactions: Observable<ImportedTransaction[]>;

  selectedTransactions: FormControl<Transaction.Id[]>;
  editingFields: FormGroup<FormGroupify<TransactionImportUpdatableFields>>;

  fieldVisibility: {
    [field in FieldName]?: boolean;
  };
  fileId: File.Id;

  constructor(private activatedRoute: ActivatedRoute, private store: Store) {}

  ngOnInit(): void {
    this.fieldVisibility = {
      account: true,
    };
    this.selectedTransactions = new FormControl();
    this.editingFields = new FormGroup({
      account: new FormControl(),
      project: new FormControl(),
      category: new FormControl(),
      recipient: new FormControl(),
      description: new FormControl(),
      transferAccount: new FormControl(),
      loanAccount: new FormControl(),
    });

    this.fileId = this.activatedRoute.snapshot.paramMap.get('fileId') as File.Id;

    this.transactions = this.store.select(selectDraftTransactionList(this.fileId));

    this.store.dispatch(transactionApiActions.listDraftTransactionsInitiated({
      fileId: this.fileId,
    }));
    this.store.dispatch(accountApiActions.listAccountsInitiated());
    this.store.dispatch(projectApiActions.listProjectsInitiated());
    this.store.dispatch(recipientApiActions.listRecipientsInitiated());
    this.store.dispatch(categoryApiActions.listCategoriesInitiated());
  }

  get anyFieldVisible() {
    return Object.values(this.fieldVisibility).some(v => v);
  }

  toggleField(fieldName: FieldName) {
    this.fieldVisibility[fieldName] = !this.fieldVisibility[fieldName];

    switch(fieldName) {
      case 'loanAccount': {
        this.fieldVisibility.transferAccount = false;
      } break;
      case 'transferAccount': {
        this.fieldVisibility.loanAccount = false;
      }
    }
  }

  applyFields() {
    if (!this.selectedTransactions.value?.length) {
      this.store.dispatch(notificationActions.showMessage({
        message: 'Nincs tranzakció kiválasztva',
      }));
      return;
    }

    this.store.dispatch(importActions.applyEditingFields({
      fileId: this.fileId,
      transactionIds: this.selectedTransactions.value,
      updatedValues: Object.entries(this.fieldVisibility).reduce((accumulator, [
        key,
        value,
      ]) => {
        if (value) {
          return {
            ...accumulator,
            [key]: this.editingFields.value[key],
          };
        }

        return accumulator;
      }, {}),
    }));

    this.cancel();
    this.selectedTransactions.reset();
  }

  cancel() {
    Object.keys(this.fieldVisibility).forEach((key) => {
      this.fieldVisibility[key] = false;
    });

    this.editingFields.reset();
  }

  save() {
    console.log('save', this.selectedTransactions.value);

    this.store.dispatch(importActions.importTransactions({
      fileId: this.fileId,
      transactionIds: this.selectedTransactions.value,
    }));
  }
}
