import { Component, Input } from '@angular/core';

@Component({
  selector: 'household-hairdressing-income-list-item',
  standalone: false,

  templateUrl: './hairdressing-income-list-item.component.html',
  styleUrl: './hairdressing-income-list-item.component.scss',
})
export class HairdressingIncomeListItemComponent {
  @Input() currency: string;
  @Input() day: Date;
  @Input() amount: number;

}
