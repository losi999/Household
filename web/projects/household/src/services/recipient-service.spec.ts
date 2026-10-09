import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { RecipientService } from './recipient-service';

describe('RecipientService', () => {
  const apiUrl = 'http://api.url';
  const baseUrl = `${apiUrl}/recipient/v1/recipients`;

  let service: RecipientService;
  let httpMock: HttpTestingController;

  const recipientId = testDataFactory.recipient.id();
  const recipient = testDataFactory.recipient.response();
  const request = testDataFactory.recipient.request();

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

    service = TestBed.inject(RecipientService);
    httpMock = TestBed.inject(HttpTestingController);
  };

  afterEach(() => {
    httpMock.verify();
  });

  describe('listRecipients', () => {
    it('should send a GET request and return the list', () => {
      setup();

      const next = vi.fn();
      service.listRecipients().subscribe(next);

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');

      req.flush([recipient]);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith([recipient]);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.listRecipients().subscribe({
        error,
      });

      httpMock.expectOne(baseUrl).flush('error', {
        status: 500,
        statusText: 'Internal Server Error',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(500);
    });
  });

  describe('createRecipient', () => {
    it('should send a POST request with the body and return the id', () => {
      setup();

      const next = vi.fn();
      const response = {
        recipientId, 
      };
      service.createRecipient(request).subscribe(next);

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);

      req.flush(response);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(response);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.createRecipient(request).subscribe({
        error,
      });

      httpMock.expectOne(baseUrl).flush('error', {
        status: 400,
        statusText: 'Bad Request',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(400);
    });
  });

  describe('updateRecipient', () => {
    it('should send a PUT request with the body to the recipient url', () => {
      setup();

      const next = vi.fn();
      service.updateRecipient(recipientId, request).subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}/${recipientId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);

      req.flush(null);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.updateRecipient(recipientId, request).subscribe({
        error,
      });

      httpMock.expectOne(`${baseUrl}/${recipientId}`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });

  describe('deleteRecipient', () => {
    it('should send a DELETE request to the recipient url', () => {
      setup();

      const next = vi.fn();
      service.deleteRecipient(recipientId).subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}/${recipientId}`);
      expect(req.request.method).toBe('DELETE');

      req.flush(null);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.deleteRecipient(recipientId).subscribe({
        error,
      });

      httpMock.expectOne(`${baseUrl}/${recipientId}`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });

  describe('mergeRecipients', () => {
    const sourceIds = [
      testDataFactory.recipient.id(),
      testDataFactory.recipient.id(),
    ];

    it('should send a POST request with the source ids to the merge url', () => {
      setup();

      const next = vi.fn();
      service.mergeRecipients(recipientId, sourceIds).subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}/${recipientId}/merge`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(sourceIds);

      req.flush(null);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.mergeRecipients(recipientId, sourceIds).subscribe({
        error,
      });

      httpMock.expectOne(`${baseUrl}/${recipientId}/merge`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });
});
