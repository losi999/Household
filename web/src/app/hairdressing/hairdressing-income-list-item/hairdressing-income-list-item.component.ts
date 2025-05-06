import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Transaction } from '@household/shared/types/types';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { hairdressingActions } from '@household/web/state/hairdressing/hairdressing.actions';
import { Store } from '@ngrx/store';

const SPLITS_DELIMITER = ', ';

@Component({
  selector: 'household-hairdressing-income-list-item',
  standalone: false,
  templateUrl: './hairdressing-income-list-item.component.html',
  styleUrl: './hairdressing-income-list-item.component.scss',
})
export class HairdressingIncomeListItemComponent implements OnInit, OnChanges {
  @Input() day: Date;
  @Input() currency: string;
  amount: number;
  @Input() transaction: Transaction.Report;

  splits: number[];
  partialAmount: FormControl<number>;

  constructor(private store: Store) {

  }

  private initialState() {
    this.amount = this.transaction?.amount;
    if (this.transaction) {
      this.splits = this.transaction.description?.split(SPLITS_DELIMITER).map(s => Number(s)) ?? [this.transaction.amount];
    } else {
      this.splits = [];
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.transaction) {
      this.initialState();
    }
  }

  ngOnInit(): void {
    this.partialAmount = new FormControl(null);
    this.splits = [ ];
  }

  private calculateAmount() {
    this.amount = this.splits.reduce((acc, curr) => acc + curr, 0);
  }

  add () {
    this.partialAmount.markAsTouched();
    if (this.partialAmount.value) {
      this.splits.push(this.partialAmount.value);
      this.partialAmount.reset();
      this.calculateAmount();
    }
  }

  cancel() {
    this.initialState();
  }

  remove(index: number) {
    this.splits = this.splits.toSpliced(index, 1);
    this.calculateAmount();
  }

  delete() {
    this.store.dispatch(dialogActions.deleteIncome({
      transactionId: this.transaction.transactionId,
      day: this.day,
    }));
  }

  save() {
    this.add();
    if (this.transaction) {
      this.store.dispatch(hairdressingActions.updateIncomeInitiated({
        issuedAt: new Date(this.day.getFullYear(), this.day.getMonth(), this.day.getDate(), 19, 0, 0).toISOString(),
        amount: this.amount,
        description: this.splits.join(SPLITS_DELIMITER),
        transactionId: this.transaction.transactionId,
      }));
    } else {
      this.store.dispatch(hairdressingActions.saveIncomeInitiated({
        issuedAt: new Date(this.day.getFullYear(), this.day.getMonth(), this.day.getDate(), 19, 0, 0).toISOString(),
        amount: this.amount,
        description: this.splits.join(SPLITS_DELIMITER),
      }));
    }
  }
}
