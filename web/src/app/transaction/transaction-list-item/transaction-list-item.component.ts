import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Account, Category, Project, Recipient, Transaction } from '@household/shared/types/types';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'household-transaction-list-item',
  templateUrl: './transaction-list-item.component.html',
  styleUrl: './transaction-list-item.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => TransactionListItemComponent),
    },
  ],
})
export class TransactionListItemComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() transaction: Transaction.DeferredResponse;
  @Output() delete = new EventEmitter();

  account: Account.Response;
  recipient: Recipient.Response;
  category: Category.Response;
  project: Project.Response;
  originalRemainingAmount: number;

  amount: FormControl<number>;
  private destroyed = new Subject();

  constructor() { }

  ngOnInit(): void {
    this.amount = new FormControl(null);

    this.amount.valueChanges.pipe(takeUntil(this.destroyed)).subscribe((value) => {
      this.changed?.(value);
    });
  }

  ngOnDestroy(): void {
    this.destroyed.next(undefined);
    this.destroyed.complete();
  }

  get remainingAmount() {
    return this.originalRemainingAmount - this.amount.value;
  }

  changed: (value: number) => void;
  touched: () => void;
  isDisabled: boolean;

  writeValue(amount: any): void {
    this.originalRemainingAmount = amount + this.transaction?.remainingAmount;
    this.amount.setValue(amount);
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

  get date() {
    return new Date(this.transaction.issuedAt);
  }

  get showYear() {
    return this.date.getFullYear() !== (new Date()).getFullYear();
  }
}
