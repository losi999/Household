import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Transaction } from '@household/shared/types/types';
import { ImportFilterPipe } from '@household/web/app/import/import-filter.pipe';
import { ImportTransactionsEditListItemComponent } from '@household/web/app/import/import-transactions-edit-list-item/import-transactions-edit-list-item.component';
import { ClearableInputComponent } from '@household/web/app/shared/clearable-input/clearable-input.component';

@Component({
  selector: 'household-import-transactions-edit-list',
  imports: [
    ClearableInputComponent,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    ImportTransactionsEditListItemComponent,
    ImportFilterPipe,
  ],  
  templateUrl: './import-transactions-edit-list.component.html',
  styleUrl: './import-transactions-edit-list.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImportTransactionsEditListComponent),
      multi: true,
    },
  ],
})
export class ImportTransactionsEditListComponent implements OnInit, ControlValueAccessor {
  @Input() transactions: Transaction.DraftResponse[];

  selectedItems: FormControl<Transaction.Id[]>;

  changed: (value: Transaction.Id[]) => void;
  touched: () => void;
  isDisabled: boolean;

  constructor(private importFilter: ImportFilterPipe) {

  }

  ngOnInit(): void {
    this.selectedItems = new FormControl([]);

    this.selectedItems.valueChanges.subscribe((value) => {
      this.changed?.(value);
    });
  }

  selectAll(filterValue: string) {
    const transactions = filterValue ? this.importFilter.transform(this.transactions, filterValue) : this.transactions;

    this.selectedItems.setValue(transactions.map(t => t.transactionId));
  }

  deselectAll() {
    this.selectedItems.setValue([]);
  }

  writeValue(value: Transaction.Id[]): void {
    this.selectedItems.setValue(value, {
      emitEvent: false,
    });
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
