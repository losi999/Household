import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from '@household/shared-ui';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private httpClient = inject(HttpClient);
  private apiUrl = inject(API_URL);

  listCalendarDays(query: Api.Calendar.DateRange) {
    return this.httpClient.get<Responses.CalendarDay[]>(`${this.apiUrl}/calendar/v1/days`, {
      params: query,
    });
  }

  updateCalendarDay(day: Api.Calendar.Day['day'], body: Requests.CalendarDay) {
    return this.httpClient.put(`${this.apiUrl}/calendar/v1/days/${day}`, body);
  }

  deleteCalendarDay(day: Api.Calendar.Day['day']) {
    return this.httpClient.delete(`${this.apiUrl}/calendar/v1/days/${day}`);
  }

  createCalendarEntry(body: Requests.CalendarEntry) {
    return this.httpClient.post<Api.Calendar.Entry.CalendarEntryId>(`${this.apiUrl}/calendar/v1/entries`, body);
  }

  getCalendarEntry(calendarEntryId: Api.Calendar.Entry.Id) {
    return this.httpClient.get<Responses.CalendarEntry>(`${this.apiUrl}/calendar/v1/entries/${calendarEntryId}`);
  }

  updateCalendarEntry(calendarEntryId: Api.Calendar.Entry.Id, body: Requests.CalendarEntry) {
    return this.httpClient.put<Api.Calendar.Entry.CalendarEntryId>(`${this.apiUrl}/calendar/v1/entries/${calendarEntryId}`, body);
  }

  deleteCalendarEntry(calendarEntryId: Api.Calendar.Entry.Id) {
    return this.httpClient.delete(`${this.apiUrl}/calendar/v1/entries/${calendarEntryId}`);
  }

  resolveCalendarWorkEntry(calendarEntryId: Api.Calendar.Entry.Id, body: Requests.CalendarEntryResolution) {
    return this.httpClient.post(`${this.apiUrl}/calendar/v1/entries/${calendarEntryId}/resolution`, body);
  }
}
