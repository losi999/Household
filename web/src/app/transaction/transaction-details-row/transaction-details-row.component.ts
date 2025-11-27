import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'household-transaction-details-row',
  imports: [
    NgClass,
    MatIconModule,
  ],  
  templateUrl: './transaction-details-row.component.html',
  styleUrl: './transaction-details-row.component.scss',
})
export class TransactionDetailsRowComponent {
  @Input() icon: string;
  @Input() text: string;
  @Input() textStyle: 'bold' | 'italic';
  @Input() rowColor: 'red' | 'green';
}
