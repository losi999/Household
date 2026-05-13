import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from '@household/shared-ui';
import { Price } from '@household/shared/types/types';

@Injectable({
  providedIn: 'root',
})
export class PriceService {
  private httpClient = inject(HttpClient);
  private apiUrl = inject(API_URL);

  listPrices() {
    return this.httpClient.get<Price.Response[]>(`${this.apiUrl}/price/v1/prices`);
  }
  
  createPrice(body: Price.Request) {
    return this.httpClient.post<Price.PriceId>(`${this.apiUrl}/price/v1/prices`, body);
  }
  
  updatePrice(priceId: Price.Id, body: Price.Request) {
    return this.httpClient.put<Price.PriceId>(`${this.apiUrl}/price/v1/prices/${priceId}`, body);
  }
  
  deletePrice(priceId: Price.Id) {
    return this.httpClient.delete(`${this.apiUrl}/price/v1/prices/${priceId}`);
  }
}
