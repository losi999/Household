import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Calendar, Price } from '@household/shared/types/types';
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

  listCalendarDays(query: Calendar.DateRange) {
    return this.httpClient.get<Calendar.Day.Response[]>(`${environment.apiUrl}/hairdressing/v1/calendar/days`, {
      params: query,
    });
  }

  updateCalendarDay(day: Calendar.DayProp['day'], body: Calendar.Day.Request) {
    return this.httpClient.put(`${environment.apiUrl}/hairdressing/v1/calendar/days/${day}`, body);
  }

  deleteCalendarDay(day: Calendar.DayProp['day']) {
    return this.httpClient.delete(`${environment.apiUrl}/hairdressing/v1/calendar/days/${day}`);
  }

  createCalendarEntry(body: Calendar.Entry.Request) {
    return this.httpClient.post<Calendar.Entry.CalendarEntryId>(`${environment.apiUrl}/hairdressing/v1/calendar/entries`, body);
  }

  getCalendarEntry(calendarEntryId: Calendar.Entry.Id) {
    return this.httpClient.get<Calendar.Entry.Response>(`${environment.apiUrl}/hairdressing/v1/calendar/entries/${calendarEntryId}`);
  }

  updateCalendarEntry(calendarEntryId: Calendar.Entry.Id, body: Calendar.Entry.Request) {
    return this.httpClient.put<Calendar.Entry.CalendarEntryId>(`${environment.apiUrl}/hairdressing/v1/calendar/entries/${calendarEntryId}`, body);
  }

  deleteCalendarEntry(calendarEntryId: Calendar.Entry.Id) {
    return this.httpClient.delete(`${environment.apiUrl}/hairdressing/v1/calendar/entries/${calendarEntryId}`);
  }
}
