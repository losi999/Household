import { Component, Input } from '@angular/core';
import { Transaction } from '@household/shared/types/types';

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
  @Input() items: Transaction.Report[];
  @Input() groupBy: GroupBy[];
  childrenAccessor = (node: any) => node?.children ?? [];
}
