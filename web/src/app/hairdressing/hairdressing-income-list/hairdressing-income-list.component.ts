import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Transaction } from '@household/shared/types/types';
import { Moment } from 'moment';

@Component({
  selector: 'household-hairdressing-income-list',
  standalone: false,
  templateUrl: './hairdressing-income-list.component.html',
  styleUrl: './hairdressing-income-list.component.scss',
})
export class HairdressingIncomeListComponent implements OnChanges {
  @Input() transactions: Transaction.Report[];
  @Input() currency: string;
  @Input() date: Moment;

  transactionMap: {
    [day: number]: Transaction.Report;
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.transactions) {
      this.transactionMap = this.transactions?.reduce((accumulator, currentValue) => {
        const day = new Date(currentValue.issuedAt).getDate();

        return {
          ...accumulator,
          [day]: currentValue,
        };
      }, {});
    }
  }
}
