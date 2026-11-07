import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { PriceService } from './price-service';

describe('PriceService', () => {
  const apiUrl = 'http://api.url';
  const baseUrl = `${apiUrl}/price/v1/prices`;

  let service: PriceService;
  let httpMock: HttpTestingController;

  const priceId = testDataFactory.price.id();
  const price = testDataFactory.price.response();
  const request = testDataFactory.price.request();

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

    service = TestBed.inject(PriceService);
    httpMock = TestBed.inject(HttpTestingController);
  };

  afterEach(() => {
    httpMock.verify();
  });

  describe('listPrices', () => {
    it('should send a GET request to the url', () => {
      setup();

      const next = vi.fn();
      service.listPrices().subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}`);
      expect(req.request.method).toBe('GET');

      req.flush([price]);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith([price]);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.listPrices().subscribe({
        error, 
      });

      httpMock.expectOne(`${baseUrl}`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });

  describe('createPrice', () => {
    it('should send a POST request to the url', () => {
      setup();

      const next = vi.fn();
      service.createPrice(request).subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);

      req.flush({
        priceId, 
      });

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith({
        priceId, 
      });
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.createPrice(request).subscribe({
        error, 
      });

      httpMock.expectOne(`${baseUrl}`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });

  describe('updatePrice', () => {
    it('should send a PUT request to the url', () => {
      setup();

      const next = vi.fn();
      service.updatePrice(priceId, request).subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}/${priceId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);

      req.flush(null);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.updatePrice(priceId, request).subscribe({
        error, 
      });

      httpMock.expectOne(`${baseUrl}/${priceId}`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });

  describe('deletePrice', () => {
    it('should send a DELETE request to the url', () => {
      setup();

      const next = vi.fn();
      service.deletePrice(priceId).subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}/${priceId}`);
      expect(req.request.method).toBe('DELETE');

      req.flush(null);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.deletePrice(priceId).subscribe({
        error, 
      });

      httpMock.expectOne(`${baseUrl}/${priceId}`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });
});
