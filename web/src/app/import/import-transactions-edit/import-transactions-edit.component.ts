import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Transaction } from '@household/shared/types/types';
import { accountApiActions } from '@household/web/state/account/account.actions';
import { categoryApiActions } from '@household/web/state/category/category.actions';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { importActions } from '@household/web/state/import/import.actions';
import { selectDraftTransactionList } from '@household/web/state/import/import.selector';
import { notificationActions } from '@household/web/state/notification/notification.actions';
import { projectApiActions } from '@household/web/state/project/project.actions';
import { recipientApiActions } from '@household/web/state/recipient/recipient.actions';
import { FormGroupify, ImportedTransaction, TransactionImportUpdatableFields } from '@household/web/types/common';
import { Store } from '@ngrx/store';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Observable } from 'rxjs';

type FieldName = keyof TransactionImportUpdatableFields;

@Component({
  selector: 'household-import-transactions-edit',
  standalone: false,
  templateUrl: './import-transactions-edit.component.html',
  styleUrl: './import-transactions-edit.component.scss',
})
export class ImportTransactionsEditComponent implements OnInit {
  @ViewChild('toolbarButtons', {
    static: true,
  }) toolbarButtons: TemplateRef<any>;

  transactions: Observable<ImportedTransaction[]>;

  selectedTransactions: FormControl<Transaction.Id[]>;
  editingFields: FormGroup<FormGroupify<TransactionImportUpdatableFields>>;

  fieldVisibility: {
    [field in FieldName]?: boolean;
  };
  isSmallScreen: boolean;

  constructor(private store: Store, private breakpointObserver: BreakpointObserver) {
    this.breakpointObserver.observe(['(max-width: 639px)']).subscribe((result) => {
      this.isSmallScreen = result.matches;
    });
  }

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

    this.transactions = this.store.select(selectDraftTransactionList());

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
        this.fieldVisibility.recipient = false;
        this.fieldVisibility.category = false;
        this.fieldVisibility.project = false;
        this.fieldVisibility.loanAccount = false;
      } break;
      case 'category':
      case 'project':
      case 'recipient': {
        this.fieldVisibility.transferAccount = false;
      } break;
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
  }

  cancel() {
    Object.keys(this.fieldVisibility).forEach((key) => {
      this.fieldVisibility[key] = false;
    });

    this.editingFields.reset();
  }

  save() {
    this.store.dispatch(importActions.importTransactions({
      transactionIds: this.selectedTransactions.value,
    }));
  }

  delete() {
    this.store.dispatch(dialogActions.deleteDraftTransactions({
      transactionIds: this.selectedTransactions.value,
    }));
  }
}
