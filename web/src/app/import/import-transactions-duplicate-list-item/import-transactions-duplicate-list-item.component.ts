import { Component, Input, OnInit } from '@angular/core';
import { Transaction } from '@household/shared/types/types';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { importActions } from '@household/web/state/import/import.actions';
import { ImportedTransaction } from '@household/web/types/common';
import { Store } from '@ngrx/store';

@Component({
  selector: 'household-import-transactions-duplicate-list-item',
  standalone: false,  
  templateUrl: './import-transactions-duplicate-list-item.component.html',
  styleUrl: './import-transactions-duplicate-list-item.component.scss',
})
export class ImportTransactionsDuplicateListItemComponent implements OnInit {
  @Input() transaction: ImportedTransaction;
  showYear: boolean;

  constructor(private store: Store) { }

  ngOnInit(): void {
    // this.isDisabled = this.store.select(selectTransactionIsInProgress(this.file.fileId));
    this.showYear = !this.transaction.issuedAt.startsWith(new Date().getFullYear()
      .toString());
  }

  deleteDraft() {
    this.store.dispatch(dialogActions.deleteTransaction({
      transactionId: this.transaction.transactionId,
    }));
  }

  deduplicateDraft(duplicateTransactionId: Transaction.Id) {
    this.store.dispatch(importActions.deduplicateDraftTransaction({
      transactionId: this.transaction.transactionId,
      duplicateTransactionId,
    }));
  }
}
