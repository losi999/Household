import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Calendar } from '@household/shared/types/types';
import { environment } from '@household/web/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {

  constructor(private httpClient: HttpClient) { }

  listCalendarDays(query: Calendar.DateRange) {
    return this.httpClient.get<Calendar.Day.Response[]>(`${environment.apiUrl}/calendar/v1/days`, {
      params: query,
    });
  }

  updateCalendarDay(day: Calendar.DayProp['day'], body: Calendar.Day.Request) {
    return this.httpClient.put(`${environment.apiUrl}/calendar/v1/days/${day}`, body);
  }

  deleteCalendarDay(day: Calendar.DayProp['day']) {
    return this.httpClient.delete(`${environment.apiUrl}/calendar/v1/days/${day}`);
  }

  createCalendarEntry(body: Calendar.Entry.Request) {
    return this.httpClient.post<Calendar.Entry.CalendarEntryId>(`${environment.apiUrl}/calendar/v1/entries`, body);
  }

  getCalendarEntry(calendarEntryId: Calendar.Entry.Id) {
    return this.httpClient.get<Calendar.Entry.Response>(`${environment.apiUrl}/calendar/v1/entries/${calendarEntryId}`);
  }

  updateCalendarEntry(calendarEntryId: Calendar.Entry.Id, body: Calendar.Entry.Request) {
    return this.httpClient.put<Calendar.Entry.CalendarEntryId>(`${environment.apiUrl}/calendar/v1/entries/${calendarEntryId}`, body);
  }

  deleteCalendarEntry(calendarEntryId: Calendar.Entry.Id) {
    return this.httpClient.delete(`${environment.apiUrl}/calendar/v1/entries/${calendarEntryId}`);
  }

  payCalendarWorkEntry(calendarEntryId: Calendar.Entry.Id, body: Calendar.Entry.PaymentRequest) {
    return this.httpClient.post(`${environment.apiUrl}/calendar/v1/entries/${calendarEntryId}/payment`, body);
  }
}
