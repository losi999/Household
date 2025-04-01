import { Component, Input, OnInit } from '@angular/core';
import { Transaction } from '@household/shared/types/types';
import { selectFileIsInProgress, selectTransactionIsInProgress } from '@household/web/state/progress/progress.selector';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'household-import-transactions-list-item',
  standalone: false,

  templateUrl: './import-transactions-list-item.component.html',
  styleUrl: './import-transactions-list-item.component.scss',
})
export class ImportTransactionsListItemComponent implements OnInit {
  @Input() transaction: Transaction.DraftResponse;

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
