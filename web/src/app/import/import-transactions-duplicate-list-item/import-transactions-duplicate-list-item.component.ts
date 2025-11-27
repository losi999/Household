import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { Transaction } from '@household/shared/types/types';
import { TransactionDetailsCategoryComponent } from '@household/web/app/transaction/transaction-details-category/transaction-details-category.component';
import { TransactionDetailsDescriptionComponent } from '@household/web/app/transaction/transaction-details-description/transaction-details-description.component';
import { TransactionDetailsInventoryComponent } from '@household/web/app/transaction/transaction-details-inventory/transaction-details-inventory.component';
import { TransactionDetailsInvoiceComponent } from '@household/web/app/transaction/transaction-details-invoice/transaction-details-invoice.component';
import { TransactionDetailsLoanComponent } from '@household/web/app/transaction/transaction-details-loan/transaction-details-loan.component';
import { TransactionDetailsProjectComponent } from '@household/web/app/transaction/transaction-details-project/transaction-details-project.component';
import { TransactionDetailsRecipientComponent } from '@household/web/app/transaction/transaction-details-recipient/transaction-details-recipient.component';
import { TransactionDetailsRowComponent } from '@household/web/app/transaction/transaction-details-row/transaction-details-row.component';
import { TransactionDetailsTransferComponent } from '@household/web/app/transaction/transaction-details-transfer/transaction-details-transfer.component';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { importActions } from '@household/web/state/import/import.actions';
import { ImportedTransaction } from '@household/web/types/common';
import { Store } from '@ngrx/store';

@Component({
  selector: 'household-import-transactions-duplicate-list-item',
  imports: [
    DatePipe,
    TransactionDetailsDescriptionComponent,
    NgClass,
    DecimalPipe,
    MatButtonModule,
    TransactionDetailsLoanComponent,
    TransactionDetailsRowComponent,
    TransactionDetailsRecipientComponent,
    TransactionDetailsCategoryComponent,
    TransactionDetailsInventoryComponent,
    TransactionDetailsInvoiceComponent,
    TransactionDetailsProjectComponent,
    TransactionDetailsTransferComponent,
    TransactionDetailsDescriptionComponent,
    MatDividerModule,
  ],  
  templateUrl: './import-transactions-duplicate-list-item.component.html',
  styleUrl: './import-transactions-duplicate-list-item.component.scss',
})
export class ImportTransactionsDuplicateListItemComponent implements OnInit {
  @Input() transaction: ImportedTransaction;
  showYear: boolean;

  constructor(private store: Store) { }

  ngOnInit(): void {
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
