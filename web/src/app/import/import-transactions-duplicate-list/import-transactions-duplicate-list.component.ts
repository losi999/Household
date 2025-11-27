import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ImportTransactionsDuplicateListItemComponent } from '@household/web/app/import/import-transactions-duplicate-list-item/import-transactions-duplicate-list-item.component';
import { selectDuplicateDraftTransactionList } from '@household/web/state/import/import.selector';
import { ImportedTransaction } from '@household/web/types/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
@Component({
  selector: 'household-import-transactions-duplicate-list',
  imports: [
    ImportTransactionsDuplicateListItemComponent,
    AsyncPipe,
  ],  
  templateUrl: './import-transactions-duplicate-list.component.html',
  styleUrl: './import-transactions-duplicate-list.component.scss',
})
export class ImportTransactionsDuplicateListComponent implements OnInit {
  transactions: Observable<ImportedTransaction[]>;
    
  constructor(private store: Store) {
  }
  ngOnInit(): void {    
    this.transactions = this.store.select(selectDuplicateDraftTransactionList);
  }

}
