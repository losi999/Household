import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { CalendarService } from './calendar-service';

describe('CalendarService', () => {
  const apiUrl = 'http://api.url';
  const baseUrl = `${apiUrl}/calendar/v1`;

  let service: CalendarService;
  let httpMock: HttpTestingController;

  const query = {
    dateFrom: testDataFactory.calendar.day.pastDay(),
    dateTo: testDataFactory.calendar.day.futureDay(),
  };
  const day = testDataFactory.calendar.day.futureDay();
  const days = [testDataFactory.calendar.day.response.regular()];
  const dayRequest = testDataFactory.calendar.day.request.workday();
  const entryId = testDataFactory.calendar.entry.id();
  const entry = testDataFactory.calendar.entry.response.work();
  const entryRequest = testDataFactory.calendar.entry.request.work();
  const resolutionRequest = testDataFactory.calendar.entry.resolution.request();

  const setup = () => {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: API_URL,
          useValue: apiUrl,
        },
      ],
    });

    service = TestBed.inject(CalendarService);
    httpMock = TestBed.inject(HttpTestingController);
  };

  afterEach(() => {
    httpMock.verify();
  });

  describe('listCalendarDays', () => {
    it('should send a GET request to the url', () => {
      setup();

      const next = vi.fn();
      service.listCalendarDays(query).subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}/days?dateFrom=${query.dateFrom}&dateTo=${query.dateTo}`);
      expect(req.request.method).toBe('GET');

      req.flush(days);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(days);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.listCalendarDays(query).subscribe({
        error, 
      });

      httpMock.expectOne(`${baseUrl}/days?dateFrom=${query.dateFrom}&dateTo=${query.dateTo}`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });

  describe('updateCalendarDay', () => {
    it('should send a PUT request to the url', () => {
      setup();

      const next = vi.fn();
      service.updateCalendarDay(day, dayRequest).subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}/days/${day}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(dayRequest);

      req.flush(null);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.updateCalendarDay(day, dayRequest).subscribe({
        error, 
      });

      httpMock.expectOne(`${baseUrl}/days/${day}`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });

  describe('deleteCalendarDay', () => {
    it('should send a DELETE request to the url', () => {
      setup();

      const next = vi.fn();
      service.deleteCalendarDay(day).subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}/days/${day}`);
      expect(req.request.method).toBe('DELETE');

      req.flush(null);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.deleteCalendarDay(day).subscribe({
        error, 
      });

      httpMock.expectOne(`${baseUrl}/days/${day}`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });

  describe('createCalendarEntry', () => {
    it('should send a POST request to the url', () => {
      setup();

      const next = vi.fn();
      service.createCalendarEntry(entryRequest).subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}/entries`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(entryRequest);

      req.flush({
        calendarEntryId: entryId, 
      });

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith({
        calendarEntryId: entryId, 
      });
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.createCalendarEntry(entryRequest).subscribe({
        error, 
      });

      httpMock.expectOne(`${baseUrl}/entries`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });

  describe('getCalendarEntry', () => {
    it('should send a GET request to the url', () => {
      setup();

      const next = vi.fn();
      service.getCalendarEntry(entryId).subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}/entries/${entryId}`);
      expect(req.request.method).toBe('GET');

      req.flush(entry);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(entry);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.getCalendarEntry(entryId).subscribe({
        error, 
      });

      httpMock.expectOne(`${baseUrl}/entries/${entryId}`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });

  describe('updateCalendarEntry', () => {
    it('should send a PUT request to the url', () => {
      setup();

      const next = vi.fn();
      service.updateCalendarEntry(entryId, entryRequest).subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}/entries/${entryId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(entryRequest);

      req.flush(null);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.updateCalendarEntry(entryId, entryRequest).subscribe({
        error, 
      });

      httpMock.expectOne(`${baseUrl}/entries/${entryId}`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });

  describe('deleteCalendarEntry', () => {
    it('should send a DELETE request to the url', () => {
      setup();

      const next = vi.fn();
      service.deleteCalendarEntry(entryId).subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}/entries/${entryId}`);
      expect(req.request.method).toBe('DELETE');

      req.flush(null);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.deleteCalendarEntry(entryId).subscribe({
        error, 
      });

      httpMock.expectOne(`${baseUrl}/entries/${entryId}`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });

  describe('resolveCalendarWorkEntry', () => {
    it('should send a POST request to the url', () => {
      setup();

      const next = vi.fn();
      service.resolveCalendarWorkEntry(entryId, resolutionRequest).subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}/entries/${entryId}/resolution`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(resolutionRequest);

      req.flush(null);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.resolveCalendarWorkEntry(entryId, resolutionRequest).subscribe({
        error, 
      });

      httpMock.expectOne(`${baseUrl}/entries/${entryId}/resolution`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });
});
