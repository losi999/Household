import { Component, Input } from '@angular/core';
import { Transaction } from '@household/shared/types/types';

@Component({
  selector: 'household-import-transactions-list',
  standalone: false,
  templateUrl: './import-transactions-list.component.html',
  styleUrl: './import-transactions-list.component.scss',
})
export class ImportTransactionsListComponent {
  @Input() transactions: Transaction.DraftResponse[];

}
