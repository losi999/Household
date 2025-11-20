import { AsyncPipe, NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';
import { RouterLink } from '@angular/router';
import { Transaction } from '@household/shared/types/types';
import { ReportListTreeBuilderPipe } from '@household/web/app/report/report-list-tree-builder.pipe';
import { TransactionDetailsCategoryComponent } from '@household/web/app/transaction/transaction-details-category/transaction-details-category.component';
import { TransactionDetailsDescriptionComponent } from '@household/web/app/transaction/transaction-details-description/transaction-details-description.component';
import { TransactionDetailsInventoryComponent } from '@household/web/app/transaction/transaction-details-inventory/transaction-details-inventory.component';
import { TransactionDetailsInvoiceComponent } from '@household/web/app/transaction/transaction-details-invoice/transaction-details-invoice.component';
import { TransactionDetailsProjectComponent } from '@household/web/app/transaction/transaction-details-project/transaction-details-project.component';
import { TransactionDetailsRecipientComponent } from '@household/web/app/transaction/transaction-details-recipient/transaction-details-recipient.component';
import { TransactionDetailsRowComponent } from '@household/web/app/transaction/transaction-details-row/transaction-details-row.component';
import { selectReport } from '@household/web/state/transaction/transaction.selector';
import { Store } from '@ngrx/store';

export type GroupBy = 'year' | 'month' | 'day' | 'account' | 'project' | 'recipient' | 'category' | 'product';

export type ReportListTreeNode = {
  groupName: string;
  currency: string;
  amount: number;
  children: (ReportListTreeNode | Transaction.Report)[];
};

@Component({
  selector: 'household-report-list',
  templateUrl: './report-list.component.html',
  styleUrl: './report-list.component.scss',
  imports: [
    MatTreeModule,
    AsyncPipe,
    ReportListTreeBuilderPipe,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    TransactionDetailsRowComponent,
    TransactionDetailsRecipientComponent,
    TransactionDetailsCategoryComponent,
    TransactionDetailsInventoryComponent,
    TransactionDetailsInvoiceComponent,
    TransactionDetailsProjectComponent,
    TransactionDetailsDescriptionComponent,
    NgClass,
  ],
})
export class ReportListComponent {
  items = this.store.select(selectReport);
  @Input() groupBy: GroupBy[];
  childrenAccessor = (node: any) => node?.children ?? [];

  constructor(private store: Store) {}
}
