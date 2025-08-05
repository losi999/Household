import { Component, OnInit } from '@angular/core';
import { selectDuplicateDraftTransactionList } from '@household/web/state/import/import.selector';
import { ImportedTransaction } from '@household/web/types/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
@Component({
  selector: 'household-import-transactions-duplicate-list',
  standalone: false,  
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
