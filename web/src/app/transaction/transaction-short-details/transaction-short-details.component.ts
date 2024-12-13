import { Component, Input } from '@angular/core';
import { Account, Category, Product, Project, Recipient } from '@household/shared/types/types';

@Component({
  selector: 'household-transaction-short-details',
  standalone: false,
  templateUrl: './transaction-short-details.component.html',
  styleUrl: './transaction-short-details.component.scss',
})
export class TransactionShortDetailsComponent {
  @Input() currency: string;
  @Input() transferColor: 'red' | 'green';

  @Input() amount: number;
  @Input() remainingAmount: number;
  @Input() description: string;
  @Input() quantity: number;
  @Input() invoiceNumber: string;
  @Input() billingStartDate: string;
  @Input() billingEndDate: string;

  @Input() payingAccount: Account.Response;
  @Input() ownerAccount: Account.Response;
  @Input() givingAccount: Account.Response;
  @Input() receivingAccount: Account.Response;
  @Input() category: Category.Response;
  @Input() project: Project.Response;
  @Input() product: Product.Response;
  @Input() recipient: Recipient.Response;

  constructor() { }
}
