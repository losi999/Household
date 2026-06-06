import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from '@household/shared-ui';
import { Calendar } from '@household/shared/types/types';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private httpClient = inject(HttpClient);
  private apiUrl = inject(API_URL);

  listCalendarDays(query: Calendar.DateRange) {
    return this.httpClient.get<Calendar.Day.Response[]>(`${this.apiUrl}/calendar/v1/days`, {
      params: query,
    });
  }

  updateCalendarDay(day: Calendar.DayProp['day'], body: Calendar.Day.Request) {
    return this.httpClient.put(`${this.apiUrl}/calendar/v1/days/${day}`, body);
  }

  deleteCalendarDay(day: Calendar.DayProp['day']) {
    return this.httpClient.delete(`${this.apiUrl}/calendar/v1/days/${day}`);
  }

  createCalendarEntry(body: Calendar.Entry.Request) {
    return this.httpClient.post<Calendar.Entry.CalendarEntryId>(`${this.apiUrl}/calendar/v1/entries`, body);
  }

  getCalendarEntry(calendarEntryId: Calendar.Entry.Id) {
    return this.httpClient.get<Calendar.Entry.Response>(`${this.apiUrl}/calendar/v1/entries/${calendarEntryId}`);
  }

  updateCalendarEntry(calendarEntryId: Calendar.Entry.Id, body: Calendar.Entry.Request) {
    return this.httpClient.put<Calendar.Entry.CalendarEntryId>(`${this.apiUrl}/calendar/v1/entries/${calendarEntryId}`, body);
  }

  deleteCalendarEntry(calendarEntryId: Calendar.Entry.Id) {
    return this.httpClient.delete(`${this.apiUrl}/calendar/v1/entries/${calendarEntryId}`);
  }

  resolveCalendarWorkEntry(calendarEntryId: Calendar.Entry.Id, body: Calendar.Entry.ResolutionRequest) {
    return this.httpClient.post(`${this.apiUrl}/calendar/v1/entries/${calendarEntryId}/resolution`, body);
  }
}
