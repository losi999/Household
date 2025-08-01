import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Transaction } from '@household/shared/types/types';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { hairdressingActions } from '@household/web/state/hairdressing/hairdressing.actions';
import { Store } from '@ngrx/store';

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
  splitsDelimiter = ', ';
  isInProgress: boolean;
  partialAmount: FormControl<number>;

  constructor(private store: Store) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.transaction) {
      this.partialAmount?.reset();
      this.isInProgress = false;
    }
  }

  ngOnInit(): void {
    this.partialAmount = new FormControl(null);
  }

  get issuedAt() {
    return new Date(this.day.getFullYear(), this.day.getMonth(), this.day.getDate(), 19, 0, 0).toISOString();
  }

  add () {
    this.partialAmount.markAsTouched();
    if (this.partialAmount.value) {    
      if (this.transaction) {
        this.isInProgress = true;
        this.store.dispatch(hairdressingActions.updateIncomeInitiated({
          issuedAt: this.issuedAt,
          amount: this.transaction.amount + this.partialAmount.value,
          description: `${this.transaction.description}${this.splitsDelimiter}${this.partialAmount.value}`,
          transactionId: this.transaction.transactionId,
        }));
      } else {
        this.store.dispatch(hairdressingActions.saveIncomeInitiated({
          issuedAt: this.issuedAt,
          amount: this.partialAmount.value,
          description: `${this.partialAmount.value}`,
        }));
      }
    }
  }

  remove(index: number) {
    const splits = this.transaction.description.split(this.splitsDelimiter);
    const partialAmount = Number(splits.splice(index, 1)[0]);

    if (splits.length > 0) {
      this.store.dispatch(hairdressingActions.updateIncomeInitiated({
        transactionId: this.transaction.transactionId,
        issuedAt: this.issuedAt,
        amount: this.transaction.amount - partialAmount,
        description: splits.join(this.splitsDelimiter),
      }));
    } else {
      this.store.dispatch(dialogActions.deleteIncome({
        transactionId: this.transaction.transactionId,
        day: this.day,
      }));
    }
  }
}
