import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Transaction } from '@household/shared/types/types';
import { TransactionDetailsCategoryComponent } from '@household/web/app/transaction/transaction-details-category/transaction-details-category.component';
import { TransactionDetailsDescriptionComponent } from '@household/web/app/transaction/transaction-details-description/transaction-details-description.component';
import { TransactionDetailsLoanComponent } from '@household/web/app/transaction/transaction-details-loan/transaction-details-loan.component';
import { TransactionDetailsProjectComponent } from '@household/web/app/transaction/transaction-details-project/transaction-details-project.component';
import { TransactionDetailsRecipientComponent } from '@household/web/app/transaction/transaction-details-recipient/transaction-details-recipient.component';
import { TransactionDetailsRowComponent } from '@household/web/app/transaction/transaction-details-row/transaction-details-row.component';
import { TransactionDetailsTransferComponent } from '@household/web/app/transaction/transaction-details-transfer/transaction-details-transfer.component';
import { selectFileIsInProgress, selectTransactionIsInProgress } from '@household/web/state/progress/progress.selector';
import { ImportedTransaction } from '@household/web/types/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'household-import-transactions-edit-list-item',
  imports: [
    DatePipe,
    TransactionDetailsRowComponent,
    TransactionDetailsTransferComponent,
    TransactionDetailsLoanComponent,
    TransactionDetailsRecipientComponent,
    TransactionDetailsCategoryComponent,
    TransactionDetailsProjectComponent,
    TransactionDetailsDescriptionComponent,
    NgClass,
    DecimalPipe,
  ],  
  templateUrl: './import-transactions-edit-list-item.component.html',
  styleUrl: './import-transactions-edit-list-item.component.scss',
})
export class ImportTransactionsEditListItemComponent implements OnInit {
  @Input() transaction: ImportedTransaction;

  isDisabled: Observable<boolean>;
  showYear: boolean;

  constructor(private store: Store) {

  }

  ngOnInit(): void {
    // this.isDisabled = this.store.select(selectTransactionIsInProgress(this.file.fileId));
    this.showYear = !this.transaction.issuedAt.startsWith(new Date().getFullYear()
      .toString());
  }

}
