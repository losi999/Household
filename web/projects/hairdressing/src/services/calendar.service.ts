import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Calendar } from '@household/shared/types/types';
// import { environment } from '@household/web/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {

  private httpClient = inject(HttpClient);

  listCalendarDays(query: Calendar.DateRange) {
    return this.httpClient.get<Calendar.Day.Response[]>('https://local-householdapi.losi999.hu/calendar/v1/days', {
      params: query,
    });
  }

  updateCalendarDay(day: Calendar.DayProp['day'], body: Calendar.Day.Request) {
    return this.httpClient.put(`https://local-householdapi.losi999.hu/calendar/v1/days/${day}`, body);
  }

  deleteCalendarDay(day: Calendar.DayProp['day']) {
    return this.httpClient.delete(`https://local-householdapi.losi999.hu/calendar/v1/days/${day}`);
  }

  createCalendarEntry(body: Calendar.Entry.Request) {
    return this.httpClient.post<Calendar.Entry.CalendarEntryId>('https://local-householdapi.losi999.hu/calendar/v1/entries', body);
  }

  getCalendarEntry(calendarEntryId: Calendar.Entry.Id) {
    return this.httpClient.get<Calendar.Entry.Response>(`https://local-householdapi.losi999.hu/calendar/v1/entries/${calendarEntryId}`);
  }

  updateCalendarEntry(calendarEntryId: Calendar.Entry.Id, body: Calendar.Entry.Request) {
    return this.httpClient.put<Calendar.Entry.CalendarEntryId>(`https://local-householdapi.losi999.hu/calendar/v1/entries/${calendarEntryId}`, body);
  }

  deleteCalendarEntry(calendarEntryId: Calendar.Entry.Id) {
    return this.httpClient.delete(`https://local-householdapi.losi999.hu/calendar/v1/entries/${calendarEntryId}`);
  }

  resolveCalendarWorkEntry(calendarEntryId: Calendar.Entry.Id, body: Calendar.Entry.ResolutionRequest) {
    return this.httpClient.post(`https://local-householdapi.losi999.hu/calendar/v1/entries/${calendarEntryId}/resolution`, body);
  }
}
