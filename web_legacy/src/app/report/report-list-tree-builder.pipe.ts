import { Pipe, PipeTransform } from '@angular/core';
import { Transaction } from '@household/shared/types/types';
import { GroupBy, ReportListTreeNode } from '@household/web/app/report/report-list/report-list.component';

@Pipe({
  name: 'reportListTreeBuilder',
  standalone: false,
})
export class ReportListTreeBuilderPipe implements PipeTransform {

  transform(items: Transaction.Report[], groupBy: GroupBy[]): ReportListTreeNode[] {
    const map: {
      [groupKey: string]: ReportListTreeNode;
    } = {};

    const groups: (GroupBy | 'currency')[] = [
      'currency',
      ...groupBy,
    ];

    const tree = items.reduce<ReportListTreeNode[]>((accumulator, currentValue) => {
      let groupKey = '';
      let parentGroupKey = '';

      groups.forEach((g) => {
        let groupName: string;
        parentGroupKey = groupKey;
        switch (g) {
          case 'currency': {
            groupKey += currentValue.account.currency;
            groupName = '';
          } break;
          case 'project': {
            groupKey += currentValue.project?.projectId ?? 'Nincs projekt';
            groupName = currentValue.project?.name ?? 'Nincs projekt';
          } break;
          case 'category': {
            groupKey += currentValue.category?.categoryId ?? 'Nincs kategória';
            groupName = currentValue.category?.fullName ?? 'Nincs kategória';
          } break;
          case 'recipient': {
            groupKey += currentValue.recipient?.recipientId ?? 'Nincs partner';
            groupName = currentValue.recipient?.name ?? 'Nincs partner';
          } break;
          case 'product': {
            groupKey += currentValue.product?.productId ?? 'Nincs termék';
            groupName = currentValue.product ? `${currentValue.category.fullName} - ${currentValue.product.fullName}` : 'Nincs termék';
          } break;
          case 'account': {
            groupKey += currentValue.account.accountId;
            groupName = currentValue.account.fullName;
          } break;
        }

        let groupNode = map[groupKey];
        if (!groupNode) {
          groupNode = {
            currency: currentValue.account.currency,
            groupName,
            children: [],
            amount: 0,
          };

          map[groupKey] = groupNode;

          if (parentGroupKey) {
            const parentNode = map[parentGroupKey];
            const index = parentNode.children.findIndex((n: ReportListTreeNode) => groupNode.groupName.localeCompare(n.groupName) < 0);
            if (index < 0) {
              parentNode.children.push(groupNode);
            } else {
              parentNode.children.splice(index, 0, groupNode);
            }
          } else {
            accumulator.push(groupNode);
          }
        }

        groupNode.amount += currentValue.amount;
      });
      map[groupKey].children.push(currentValue);

      return accumulator;
    }, []);

    return tree;
  }

}
