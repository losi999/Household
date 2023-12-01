import { Component, Input, OnDestroy, OnInit, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ClearableInputComponent } from 'src/app/shared/clearable-input/clearable-input.component';
import { MatButtonModule } from '@angular/material/button';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule } from '@angular/material/tree';

type FlatNode = Omit<DataSource, 'children'> & {
  level: number;
};

type DataSource = {
  key: string;
  value: string;
  children: DataSource[];
};

@Component({
  selector: 'household-select-all-list',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatCheckboxModule,
    MatButtonModule,
    ReactiveFormsModule,
    ClearableInputComponent,
    MatTreeModule,
  ],
  templateUrl: './select-all-list.component.html',
  styleUrl: './select-all-list.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => SelectAllListComponent),
    },
  ],
})
export class SelectAllListComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() items: any[];
  @Input() displayPropertyName: string;
  @Input() keyPropertyName: string;
  @Input() parentPropertyName: string;

  changed: (value: any[]) => void;
  touched: () => void;
  isDisabled: boolean;

  filter: FormControl<string>;
  selectionList: FormGroup<{
    [key: string]: FormControl<boolean>;
  }>;

  dataSource: MatTreeFlatDataSource<DataSource, FlatNode>;
  treeControl: FlatTreeControl<FlatNode>;

  private destroyed = new Subject();
  private map: {[key: string]: DataSource} = {};

  private setDataSource (data: DataSource[]) {
    this.dataSource.data = data;
    this.treeControl.expandAll();
  }

  ngOnInit(): void {
    this.filter = new FormControl();
    this.selectionList = new FormGroup(this.items.reduce((accumulator, currentValue) => {
      return {
        ...accumulator,
        [currentValue[this.keyPropertyName]]: new FormControl(),
      };
    }, {}));

    this.filter.valueChanges.pipe(takeUntil(this.destroyed)).subscribe((value) => {
      const lowercased = value?.toLowerCase() ?? '';
      console.log(tree);
      this.setDataSource([tree[0]]);
      // this.shownItems = this.items.filter(i => i[this.displayPropertyName]?.toLowerCase().includes(lowercased));
    });

    this.selectionList.valueChanges.pipe(takeUntil(this.destroyed)).subscribe((value) => {
      const selectedItems = Object.entries(value).filter((e) => e[1])
        .map(e => e[0]);

      this.changed?.(selectedItems?.length > 0 ? selectedItems : null);
    });

    const tree = this.items.reduce<DataSource[]>((accumulator, currentValue) => {
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

    console.log(tree);

    this.treeControl = new FlatTreeControl(
      (node) => node.level,
      () => true,
    );

    this.dataSource = new MatTreeFlatDataSource(this.treeControl, new MatTreeFlattener(
      (node, level) => {
        return {
          key: node.key,
          value: node.value,
          level: level,
        };
      },
      (node) => node.level,
      () => true,
      (node) => node.children,
    ));

    this.setDataSource(tree);
  }
  ngOnDestroy(): void {
    this.destroyed.next(undefined);
    this.destroyed.complete();
  }

  markAll(check: boolean) {
    // const selectedValues = this.shownItems.reduce((accumulator, currentValue) => {
    //   return {
    //     ...accumulator,
    //     [currentValue[this.keyPropertyName]]: check,
    //   };
    // }, {});

    // this.selectionList.patchValue(selectedValues);
  }

  clearFilter() {
    this.filter.reset();
  }

  hasKey(index, node: FlatNode) {
    return !node.key;
  }

  writeValue(): void { }

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
