import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Price } from '@household/shared/types/types';
import { environment } from '@household/web/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HairdressingService {

  constructor(private httpClient: HttpClient) { }

  listPrices() {
    return this.httpClient.get<Price.Response[]>(`${environment.apiUrl}/hairdressing/v1/prices`);
  }
  
  createPrice(body: Price.Request) {
    return this.httpClient.post<Price.PriceId>(`${environment.apiUrl}/hairdressing/v1/prices`, body);
  }
  
  updatePrice(priceId: Price.Id, body: Price.Request) {
    return this.httpClient.put<Price.PriceId>(`${environment.apiUrl}/hairdressing/v1/prices/${priceId}`, body);
  }
  
  deletePrice(priceId: Price.Id) {
    return this.httpClient.delete(`${environment.apiUrl}/hairdressing/v1/prices/${priceId}`);
  }
}
