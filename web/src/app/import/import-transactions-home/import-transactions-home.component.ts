import { NgTemplateOutlet } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { File } from '@household/shared/types/types';
import { ImportTransactionsDuplicateListComponent } from '@household/web/app/import/import-transactions-duplicate-list/import-transactions-duplicate-list.component';
import { ImportTransactionsEditComponent } from '@household/web/app/import/import-transactions-edit/import-transactions-edit.component';
import { ToolbarComponent } from '@household/web/app/shared/toolbar/toolbar.component';
import { transactionApiActions } from '@household/web/state/transaction/transaction.actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'household-import-transactions-home',
  imports: [
    NgTemplateOutlet,
    ToolbarComponent,
    ImportTransactionsEditComponent,
    ImportTransactionsDuplicateListComponent,
    MatTabsModule,
  ],
  templateUrl: './import-transactions-home.component.html',
  styleUrl: './import-transactions-home.component.scss',
})
export class ImportTransactionsHomeComponent implements OnInit {
  selectedIndex = 0;

  fileId: File.Id;

  constructor(private activatedRoute: ActivatedRoute, private store: Store) {}

  ngOnInit(): void {
    this.fileId = this.activatedRoute.snapshot.paramMap.get('fileId') as File.Id;

    this.store.dispatch(transactionApiActions.listDraftTransactionsInitiated({
      fileId: this.fileId,
    }));
  }
}
