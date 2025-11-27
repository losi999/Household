import { Component, Input } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { Recipient } from '@household/shared/types/types';
import { RecipientListItemComponent } from '@household/web/app/recipient/recipient-list-item/recipient-list-item.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
@Component({
  selector: 'household-recipient-list',
  templateUrl: './recipient-list.component.html',
  styleUrls: ['./recipient-list.component.scss'],
  imports: [
    NgxSkeletonLoaderModule,
    MatListModule,
    RecipientListItemComponent,
  ],
})
export class RecipientListComponent {
  @Input() recipients: Recipient.Response[];

  constructor() {}
}
