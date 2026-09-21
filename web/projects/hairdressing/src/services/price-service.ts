import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from '@household/shared-ui';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';

@Injectable({
  providedIn: 'root',
})
export class PriceService {
  private httpClient = inject(HttpClient);
  private apiUrl = inject(API_URL);

  listPrices() {
    return this.httpClient.get<Responses.Price[]>(`${this.apiUrl}/price/v1/prices`);
  }
  
  createPrice(body: Requests.Price) {
    return this.httpClient.post<Api.Price.PriceId>(`${this.apiUrl}/price/v1/prices`, body);
  }
  
  updatePrice(priceId: Api.Price.Id, body: Requests.Price) {
    return this.httpClient.put<Api.Price.PriceId>(`${this.apiUrl}/price/v1/prices/${priceId}`, body);
  }
  
  deletePrice(priceId: Api.Price.Id) {
    return this.httpClient.delete(`${this.apiUrl}/price/v1/prices/${priceId}`);
  }
}
