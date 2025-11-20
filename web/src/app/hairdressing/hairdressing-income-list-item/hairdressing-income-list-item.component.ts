import { DatePipe } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Transaction } from '@household/shared/types/types';
import { AmountInputComponent } from '@household/web/app/shared/amount-input/amount-input.component';
import { hairdressingActions } from '@household/web/state/hairdressing/hairdressing.actions';
import { Store } from '@ngrx/store';
import { SplitPipe } from '@household/web/app/shared/pipes/split.pipe';

@Component({
  selector: 'household-hairdressing-income-list-item',
  imports: [
    MatExpansionModule,
    DatePipe,
    AmountInputComponent,
    ReactiveFormsModule,
    MatIconModule,
    MatChipsModule,
    SplitPipe,
  ],
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
      this.store.dispatch(hairdressingActions.deleteIncomeInitiated({
        transactionId: this.transaction.transactionId,
      }));
    }
  }
}
