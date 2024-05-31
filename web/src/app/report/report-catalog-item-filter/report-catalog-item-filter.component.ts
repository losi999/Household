import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Input, OnChanges, OnDestroy, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { Subject, takeUntil } from 'rxjs';

type FlatNode = Omit<DataSource, 'children'> & {
  level: number;
  children: string[];
};

type DataSource = {
  key: string;
  value: string;
  children: DataSource[];
};

export type ReportCatalogItemFilterValue<I = string> = {
  include: boolean;
  items: I[];
};

@Component({
  selector: 'household-report-catalog-item-filter',
  templateUrl: './report-catalog-item-filter.component.html',
  styleUrl: './report-catalog-item-filter.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => ReportCatalogItemFilterComponent),
    },
  ],
})
export class ReportCatalogItemFilterComponent implements OnInit, OnDestroy, OnChanges, ControlValueAccessor {
  @Input() items: any[];
  @Input() displayPropertyName: string;
  @Input() keyPropertyName: string;
  @Input() parentPropertyName: string;

  changed: (value: ReportCatalogItemFilterValue) => void;
  touched: () => void;
  isDisabled: boolean;

  filter: FormControl<string>;
  include: FormControl<boolean>;
  selectionList: FormGroup<{
    [key: string]: FormControl<boolean>;
  }>;

  dataSource: MatTreeFlatDataSource<DataSource, FlatNode>;
  treeControl: FlatTreeControl<FlatNode>;

  private destroyed = new Subject();
  private map: {[key: string]: DataSource} = {};
  private flattener: MatTreeFlattener<DataSource, FlatNode>;
  private fullTree: DataSource[];
  private value: ReportCatalogItemFilterValue;

  private setDataSource (data: DataSource[]) {
    this.dataSource.data = data;
    this.treeControl.expandAll();
  }

  private collectChildrenRecursive(children: DataSource[]): string[] {
    return children.flatMap(c => {
      return [
        c.key,
        ...this.collectChildrenRecursive(c.children),
      ];
    });
  }

  private reduceTree(nodes: DataSource[], inputValue: string): DataSource[] {
    return nodes.reduce<DataSource[]>((accumulator, currentValue) => {
      if (currentValue.value.toLowerCase().includes(inputValue)) {
        return [
          ...accumulator,
          currentValue,
        ];
      }

      const reducedChildren = this.reduceTree(currentValue.children, inputValue);

      if (reducedChildren.length > 0) {
        return [
          ...accumulator,
          {
            ...currentValue,
            children: reducedChildren,
          },
        ];
      }

      return accumulator;
    }, []);
  }

  ngOnInit(): void {
    this.value = {
      include: true,
      items: [],
    };

    this.filter = new FormControl();

    this.filter.valueChanges.pipe(takeUntil(this.destroyed)).subscribe((value) => {
      const lowercased = value?.toLowerCase() ?? '';
      const filteredTree = this.reduceTree(this.fullTree, lowercased);

      this.setDataSource(filteredTree);
    });

    this.include = new FormControl(true);

    this.include.valueChanges.pipe(takeUntil(this.destroyed)).subscribe((value) => {
      this.value.include = value;

      this.changed?.(this.value.items?.length > 0 ? this.value : null);
    });
  }

  ngOnDestroy(): void {
    this.destroyed.next(undefined);
    this.destroyed.complete();
  }

  ngOnChanges(): void {
    this.selectionList = new FormGroup(this.items.reduce((accumulator, currentValue) => {
      return {
        ...accumulator,
        [currentValue[this.keyPropertyName]]: new FormControl(),
      };
    }, {}));

    this.selectionList.valueChanges.pipe(takeUntil(this.destroyed)).subscribe((value) => {
      const selectedItems = Object.entries(value).filter((e) => e[1])
        .map(e => e[0]);

      this.value.items = selectedItems;

      this.changed?.(this.value.items?.length > 0 ? this.value : null);
    });
    this.fullTree = this.items.reduce<DataSource[]>((accumulator, currentValue) => {
      const newNodes: DataSource[] = [];
      let parentKey: string;

      if (typeof currentValue[this.parentPropertyName] === 'string') {
        const catNode: DataSource = {
          key: undefined,
          value: currentValue[this.parentPropertyName],
          children: [],
        };

        if (!this.map[catNode.value]) {
          this.map[catNode.value] = catNode;
          newNodes.push(catNode);
        }
        parentKey = currentValue[this.parentPropertyName];
      } else {
        parentKey = currentValue[this.parentPropertyName]?.[this.keyPropertyName];
      }

      const node: DataSource = {
        key: currentValue[this.keyPropertyName],
        value: currentValue[this.displayPropertyName],
        children: [],
      };

      this.map[currentValue[this.keyPropertyName]] = node;

      if (currentValue[this.parentPropertyName]) {
        this.map[parentKey].children.push(node);
      } else {
        newNodes.push(node);
      }

      return [
        ...accumulator,
        ...newNodes,
      ];
    }, []);

    this.treeControl = new FlatTreeControl(
      (node) => node.level,
      () => true,
    );

    this.flattener = new MatTreeFlattener<DataSource, FlatNode>(
      (node, level) => {
        return {
          key: node.key,
          value: node.value,
          level: level,
          children: this.collectChildrenRecursive(node.children),
        };
      },
      (node) => node.level,
      () => true,
      (node) => node.children,
    );

    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.flattener);

    this.setDataSource(this.fullTree);
  }

  markAll(check: boolean, node?: FlatNode) {
    const nodesToCheck = node?.children ?? this.flattener.flattenNodes(this.dataSource.data).map(n => n.key);

    const selectedValues = nodesToCheck.reduce((accumulator, currentValue) => {
      if (currentValue) {
        return {
          ...accumulator,
          [currentValue]: check,
        };
      }
      return accumulator;
    }, {});

    this.selectionList.patchValue(selectedValues);
  }

  clearFilter() {
    this.filter.reset();
  }

  hasKey(_index: number, node: FlatNode) {
    return node.key;
  }

  writeValue(obj: any): void {

  }

  registerOnChange(fn: any): void {
    this.changed = fn;
  }

  registerOnTouched(fn: any): void {
    this.touched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }
}
