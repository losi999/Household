import { Component, Input } from '@angular/core';
import { Transaction } from '@household/shared/types/types';
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
  standalone: false,
})
export class ReportListComponent {
  items = this.store.select(selectReport);
  @Input() groupBy: GroupBy[];
  childrenAccessor = (node: any) => node?.children ?? [];

  constructor(private store: Store) {}
}
