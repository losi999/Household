import { Component, Input, OnChanges, OnDestroy, OnInit, ViewChild, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, FormRecord, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatTree } from '@angular/material/tree';
import { combineLatest, startWith, Subject } from 'rxjs';

export interface Node {
  id?: string;
  name: string;
  children?: Node[];
}

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
  standalone: false,
})
export class ReportCatalogItemFilterComponent implements OnInit, OnDestroy, OnChanges, ControlValueAccessor {
  childrenAccessor = (node: Node) => node?.children ?? [];

  hasChild = (_: number, node: Node) => {
    console.log('hasChild', _, node);
    return !!node.children && node.children.length > 0;
  };
  @ViewChild('tree') tree: MatTree<any>;

  @Input() items: Node[];
  filteredItems: Node[];

  changed: (value: ReportCatalogItemFilterValue) => void;
  touched: () => void;
  isDisabled: boolean;

  include: FormControl<boolean>;
  filter: FormControl<string>;
  selectionList: FormRecord;

  private destroyed = new Subject();

  constructor() {
    this.selectionList = new FormRecord({});
  }

  filterSelectionList = (items: Node[], inputValue: string) => {
    return items.reduce<Node[]>((accumulator, currentValue) => {
      if (currentValue.name.toLowerCase().includes(inputValue)) {
        return [
          ...accumulator,
          currentValue,
        ];

      }
      const filteredChildren = this.filterSelectionList(currentValue.children ?? [], inputValue);

      if (filteredChildren.length > 0) {
        return [
          ...accumulator,
          {
            ...currentValue,
            children: filteredChildren,
          },
        ];
      }

      return accumulator;
    }, []);
  };

  ngOnInit(): void {
    console.log('init');
    this.include = new FormControl(true);
    this.filter = new FormControl();

    this.filter.valueChanges.subscribe((value) => {
      console.log(value);
      if (!value) {
        this.filteredItems = this.items;
      } else {
        this.filteredItems = this.filterSelectionList(this.items, value);
      }
    });

    combineLatest([
      this.selectionList.valueChanges,
      this.include.valueChanges.pipe(startWith(true)),
    ]).subscribe(([
      selection,
      include,
    ]) => {
      const selectedItems = Object.entries(selection).filter((e) => e[1])
        .map(e => e[0]);

      this.changed?.(selectedItems.length > 0 ? {
        include,
        items: selectedItems,
      } : null);
    });
  }

  ngOnDestroy(): void {
    this.destroyed.next(undefined);
    this.destroyed.complete();
  }

  createSelectionListControls(items: Node[]) {
    items.forEach((item) => {
      if (item.id) {
        this.selectionList.addControl(item.id, new FormControl<boolean>(false), {
          emitEvent: false,
        });
      }

      this.createSelectionListControls(item.children ?? []);
    });
  }

  ngOnChanges(): void {
    console.log('changes');
    this.filteredItems = this.items;
    this.tree?.expandAll();
    this.createSelectionListControls(this.items);
  }

  collectChildrenNodes(node: Node) {
    return [
      node.id,
      ...node.children?.flatMap(n => this.collectChildrenNodes(n)) ?? [],
    ];
  }

  markAll(check: boolean, node?: Node) {

    const nodesToCheck = (node?.children ?? this.filteredItems).flatMap(n => this.collectChildrenNodes(n));

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

  writeValue(): void {

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
