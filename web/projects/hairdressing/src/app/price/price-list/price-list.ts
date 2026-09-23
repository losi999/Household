import { Component, input } from '@angular/core';
import { PriceListItem } from '@hairdressing/app/price/price-list-item/price-list-item';
import { Responses } from '@household/shared/types/responses';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'hairdressing-price-list',
  imports: [
    PriceListItem,
    MatListModule,
  ],
  templateUrl: './price-list.html',
  styleUrl: './price-list.scss',
})
export class PriceList {
  prices = input.required<Responses.Price[]>();
}
