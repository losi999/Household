import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { File } from '@household/shared/types/types';
import { transactionApiActions } from '@household/web/state/transaction/transaction.actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'household-import-transactions-home',
  standalone: false,
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
