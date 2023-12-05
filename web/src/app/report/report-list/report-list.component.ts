import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Input, OnChanges } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { Transaction } from '@household/shared/types/types';

type GroupNode = {
  groupName: string
  currency: string;
  nestedGroups: GroupNode[];
  children: ReportNode[];
};

type ReportNode = Transaction.Report;

type FlatNode = (Pick<GroupNode, 'groupName' | 'currency'> | ReportNode) & {
  level: number;
  isExpandable: boolean;
};

export type GroupBy = 'year' | 'month' | 'day' | 'account' | 'project' | 'recipient' | 'category' | 'product';

const isGroupNode = (node: GroupNode | ReportNode): node is GroupNode => {
  return !!(node as GroupNode).children;
};

@Component({
  selector: 'household-report-list',
  templateUrl: './report-list.component.html',
  styleUrl: './report-list.component.scss',
})
export class ReportListComponent implements OnChanges {
  @Input() items: Transaction.Report[];
  @Input() groupBy: GroupBy[];

  dataSource: MatTreeFlatDataSource<GroupNode | ReportNode, FlatNode>;
  treeControl: FlatTreeControl<FlatNode>;
  private flattener: MatTreeFlattener<GroupNode | ReportNode, FlatNode>;

  constructor() { }

  ngOnChanges(): void {
    const map: {
      [groupKey: string]: GroupNode;
    } = {};

    const groups: (GroupBy | 'currency')[] = [
      'currency',
      ...this.groupBy,
    ];

    const fullTree = this.items.reduce<GroupNode[]>((accumulator, currentValue) => {
      let groupKey = '';
      let parentGroupKey = '';
      for (const k of groups) {
        let groupName: string;
        parentGroupKey = groupKey;
        switch (k) {
          case 'currency': {
            groupKey += currentValue.account.currency;
            groupName = '';
          }
            break;
          case 'project': {
            groupKey += currentValue.project?.projectId ?? 'Nincs projekt';
            groupName = currentValue.project?.name ?? 'Nincs projekt';
          }
            break;
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
            groupName = `${currentValue.category?.fullName} ${currentValue.product?.fullName}` ?? 'Nincs termék';
          } break;
          case 'account': {
            groupKey += currentValue.account.accountId;
            groupName = currentValue.account.name;
          } break;
        }

        let groupNode = map[groupKey];
        if (!groupNode) {
          groupNode = {
            currency: currentValue.account.currency,
            groupName,
            children: [],
            nestedGroups: [],
          };

          map[groupKey] = groupNode;

          if (parentGroupKey) {
            map[parentGroupKey].nestedGroups.push(groupNode);
          } else {
            accumulator.push(groupNode);
          }
        }
      }

      map[groupKey].children.push(currentValue);
      return accumulator;
    }, []);

    this.treeControl = new FlatTreeControl(
      (node) => node.level,
      () => true,
    );

    this.flattener = new MatTreeFlattener<GroupNode | ReportNode, FlatNode>(
      (node, level) => {
        if (isGroupNode(node)) {
          return {
            level,
            groupName: node.groupName,
            currency: node.currency,
            isExpandable: true,
          };
        }
        return {
          level,
          isExpandable: false,
          ...node,
        };
      },
      node => node.level,
      () => true,
      node => {
        if (isGroupNode(node)) {
          return node.children.length > 0 ? node.children : node.nestedGroups;
        }
        return undefined;
      },
    );

    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.flattener);
    this.dataSource.data = fullTree;
    this.treeControl.expandAll();
  }

  hasChild(_: number, node: FlatNode) {
    return node.isExpandable;
  }
}
