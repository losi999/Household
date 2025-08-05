import { Component, Input } from '@angular/core';

@Component({
  selector: 'household-transaction-details-row',
  standalone: false,  
  templateUrl: './transaction-details-row.component.html',
  styleUrl: './transaction-details-row.component.scss',
})
export class TransactionDetailsRowComponent {
  @Input() icon: string;
  @Input() text: string;
  @Input() textStyle: 'bold' | 'italic';
  @Input() rowColor: 'red' | 'green';
}
