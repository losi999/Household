import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@household/web/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HairdressingService {

  constructor(private httpClient: HttpClient) { }
  
}
